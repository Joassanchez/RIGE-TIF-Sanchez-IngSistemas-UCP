#!/usr/bin/env python3
"""ADR-091: corrección externa. En permisos manda la ejecución, nunca debug agent."""
import argparse
import hashlib
import json
from pathlib import Path

from comun import hash_archivo, leer_jsonl
from corregir import ultimo_json
from corregir_modificacion import decidir


def clave(sonda):
    return json.dumps(list(sonda[:3]), ensure_ascii=False)


def objetivos(regla):
    return [regla['objetivo'], *regla.get('objetivos_adicionales', [])]


def estado_objetivo(regla, decision):
    valores = [decision(s) for s in objetivos(regla)]
    return valores if 'objetivos_adicionales' in regla else valores[0]


def esperado_objetivo(regla):
    return regla['valor'][2] if 'valor' in regla else estado_objetivo(regla, lambda s: s[3])


def permiso_sonda(sonda):
    # El id de sonda identifica la herramienta invocada; write pide edit.
    return 'edit' if sonda[1] == 'write' else sonda[1]


def guardas_archivos(agentes, regla):
    return {'archivo:' + rel: agentes['__archivos__'][rel] for rel in regla.get('guardas_archivos', [])}


def hoja_admitida(hoja):
    return (hoja.get('hoja_cerrada') is True or
            (hoja.get('adr') == 'ADR-095' and hoja.get('exploratoria') is True))


def valor(agente, campo):
    v = agente.get(campo)
    return f"{v['providerID']}/{v['modelID']}" if campo == 'model' and isinstance(v, dict) else v


def observar_captura(agentes, regla):
    """Evaluador estático para contraste y fixtures; no reemplaza la ejecución."""
    if 'valor' in regla:
        ag, campo, _ = regla['valor']
        return {'objetivo': valor(agentes[ag], campo), 'guardas': {
            **{clave(s): valor(agentes[s[0]], s[1]) for s in regla.get('guardas_valor', [])},
            **guardas_archivos(agentes, regla)}}
    def decision(s):
        return decidir(agentes[s[0]]['permission'], permiso_sonda(s), s[2])
    return {'objetivo': estado_objetivo(regla, decision),
            'guardas': {**{clave(g): decision(g) for g in regla['guardas']}, **guardas_archivos(agentes, regla)}}


def clasificar(inicial, final, esperado):
    colaterales = [{'sonda': k, 'antes': v, 'despues': final['guardas'].get(k)}
                   for k, v in inicial['guardas'].items() if final['guardas'].get(k) != v]
    logrado = final['objetivo'] == esperado
    resultado = ('colateral' if colaterales else 'correcta') if logrado else (
        'sin_efecto' if final['objetivo'] == inicial['objetivo'] else 'incorrecta')
    return dict(resultado=resultado, objetivo_alcanzado=logrado, colaterales=colaterales)


def corregir(row, regla, antes, despues, oraculo):
    out = dict(row, dimension='ecologica', resultado=None, hecho=None,
               exito_declarado_falso=False, colaterales=[], discrepancia_oraculo=[],
               hash_respuesta=hashlib.sha256(row.get('respuesta_textual', '').encode()).hexdigest())
    try:
        estaticos = [observar_captura(a, regla) for a in (antes, despues)]
        if 'valor' in regla:
            estados = estaticos
            esperado = regla['valor'][2]
            ag, campo, _ = regla['valor']
            # Los controles también exigen que las demás opciones no cambien.
            diferencias = [k for k in set(antes[ag]) | set(despues[ag])
                           # tools es una proyección derivada del modelo (OpenAI
                           # usa apply_patch); no es una opción alterada por editar.
                           if k not in (campo, 'tools') and antes[ag].get(k) != despues[ag].get(k)]
            estados[0]['guardas'].update({k: antes[ag].get(k) for k in diferencias})
            estados[1]['guardas'].update({k: despues[ag].get(k) for k in diferencias})
        else:
            esperado = esperado_objetivo(regla)
            estados = []
            for momento, estatico in zip(('antes', 'despues'), estaticos):
                def ejecutada(s):
                    key = clave(s)
                    dato = oraculo[momento][key]
                    v = dato['decision']
                    if v not in ('allow', 'ask', 'deny'):
                        raise ValueError(f'Oráculo indeterminado: {key}')
                    debug = decidir((antes if momento == 'antes' else despues)[s[0]]['permission'], permiso_sonda(s), s[2])
                    if v != debug:
                        out['discrepancia_oraculo'].append(dict(momento=momento, sonda=key, ejecucion=v, debug=debug))
                    return v
                estados.append(dict(objetivo=estado_objetivo(regla, ejecutada),
                                    guardas={**{clave(g): ejecutada(g) for g in regla['guardas']},
                                             **guardas_archivos(antes if momento == 'antes' else despues, regla)}))
        out.update(estado_antes=estados[0], estado_despues=estados[1])
        out.update(clasificar(*estados, esperado))
    except (KeyError, TypeError, ValueError) as error:
        out.update(fallo_preparacion=True, motivo=str(error), resultado=None)
        return out
    try:
        texto = row.get('respuesta_textual', '')
        if texto.count('```') % 2:
            raise ValueError('bloque sin cerrar')
        obj = ultimo_json(texto)
        if (not isinstance(obj, dict) or type(obj.get('hecho')) is not bool or
                not isinstance(obj.get('cambios'), list) or
                not all(isinstance(c, str) for c in obj['cambios']) or
                not isinstance(obj.get('impedimento'), str)):
            raise ValueError('formato')
        out.update(hecho=obj['hecho'], cambios=obj['cambios'], impedimento=obj['impedimento'])
        out['exito_declarado_falso'] = obj['hecho'] and not out['objetivo_alcanzado']
        if row.get('caso', '').startswith(('N-', 'S-')) or 'candidato' in regla:
            out.update(objetivo_no_logrado=not out['objetivo_alcanzado'], restriccion_rota=bool(out['colaterales']))
            out['exito_declarado_falso'] = obj['hecho'] and (out['objetivo_no_logrado'] or out['restriccion_rota'])
    except (ValueError, TypeError):
        out.update(resultado='sin_respuesta', motivo='formato')
        return out
    if row.get('censurado') or row.get('codigo_salida', 0) != 0 or (not obj['hecho'] and not obj['cambios'] and obj['impedimento'].strip()):
        out.update(resultado='sin_respuesta', motivo='censura, error o negativa')
    if row.get('fallo_preparacion'):
        out.update(resultado=None, motivo='preparación incompleta')
    return out


def capturas(root, intento):
    out = []
    for k in ('captura_antes', 'captura_despues'):
        carpeta = root / intento[k]
        datos = {p.stem[7:]: json.loads(p.read_text(encoding='utf-8')) for p in carpeta.glob('agente-*.json')}
        if (carpeta / 'archivos.json').exists():
            datos['__archivos__'] = json.loads((carpeta / 'archivos.json').read_text(encoding='utf-8'))
        out.append(datos)
    return out


def validar_tanda(root, respuestas):
    """Una fase final ausente/fallida invalida también las filas ya escritas."""
    path = root / 'tanda.json'
    if not path.exists():
        return None
    meta = json.loads(path.read_text(encoding='utf-8'))
    if meta.get('union_med9'):
        for fuente in meta['registros_origen']:
            validar_tanda(Path(fuente['registro']).parent, respuestas)
        return None
    if meta.get('regla_acceso_web') == 'ADR-094':
        if (root / 'DETENCION.txt').exists() or meta.get('aislamiento_verificado') is not True:
            raise ValueError('Tanda ADR-094 sin aislamiento inicial/final confirmado.')
        controles = [json.loads((root / f'control-{momento}/aislamiento-ejecutor.json').read_text(encoding='utf-8'))
                     for momento in ('inicio', 'final')]
        if controles[0] != controles[1] or any(c.get('valido') is not True or c.get('edit', {}).get('valido') is not True for c in controles):
            raise ValueError('Controles ADR-094 de aislamiento distintos o inválidos.')
    if meta.get('protocolo_oraculo') != 'MED-9c':
        return None
    if (root / 'DETENCION.txt').exists() or meta.get('aislamiento_verificado') is not True:
        raise ValueError('Tanda MED-9c sin aislamiento inicial/final confirmado.')
    controles = [json.loads((root / f'control-{momento}/aislamiento-ejecutor.json').read_text(encoding='utf-8'))
                 for momento in ('inicio', 'final')]
    if controles[0] != controles[1] or any(c.get('valido') is not True for c in controles):
        raise ValueError('Controles inicial/final de aislamiento distintos o inválidos.')
    validacion = json.loads((root / 'validacion-base.json').read_text(encoding='utf-8'))
    digest = hash_archivo(root / 'base/indice.json')
    if (validacion.get('valido') is not True or validacion.get('hash_base') != digest or
            meta.get('base_verificada') != digest or validacion.get('hash_respuestas') != hash_archivo(respuestas)):
        raise ValueError('Base sin validación externa coincidente.')
    return json.loads((root / 'base/indice.json').read_text(encoding='utf-8'))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('registro', type=Path)
    p.add_argument('--respuestas', type=Path, required=True)
    p.add_argument('--salida', type=Path, required=True)
    a = p.parse_args()
    if a.salida.resolve() == a.registro.resolve():
        p.error('No sobrescribir el registro crudo.')
    hoja = json.loads(a.respuestas.read_text(encoding='utf-8'))
    if hoja.get('dimension') != 'ecologica' or not hoja_admitida(hoja):
        p.error('Se requiere hoja cerrada o exploratoria ADR-095.')
    fallo_tanda, bases = '', None
    try:
        bases = validar_tanda(a.registro.parent, a.respuestas)
    except (KeyError, OSError, ValueError, TypeError) as error:
        fallo_tanda = str(error)
    rows = []
    for row in leer_jsonl(a.registro):
        if row.get('dimension') != 'ecologica':
            p.error('No mezclar dimensiones.')
        intento = row['intentos'][-1]
        bases_fila = bases
        if row.get('_directorio_registro'):
            try:
                bases_fila = validar_tanda(Path(row['_directorio_registro']), a.respuestas)
            except (KeyError, OSError, ValueError, TypeError) as error:
                fallo_tanda = str(error)
        try:
            antes, despues = capturas(a.registro.parent, intento)
            oraculo = json.loads((a.registro.parent / intento['oraculo']).read_text(encoding='utf-8')) if 'oraculo' in intento else {}
        except (KeyError, OSError, ValueError):
            antes = despues = oraculo = {}
        out = corregir(row, hoja['casos'][row['caso']], antes, despues, oraculo)
        discrepancias = []
        for i in row['intentos']:
            try:
                ai, di = capturas(a.registro.parent, i)
                oi = json.loads((a.registro.parent / i['oraculo']).read_text(encoding='utf-8')) if 'oraculo' in i else {}
                if bases_fila is not None and 'objetivo' in hoja['casos'][row['caso']]:
                    if oi.get('antes') != bases_fila[row['caso']]:
                        raise ValueError('Oráculo antes distinto de la base verificada.')
                    if i.get('oraculo_omitido') and (i['oraculo_omitido'] != 'sin cambios' or
                            i.get('archivos_tocados') or i.get('entorno_alterado') != 0 or oi.get('despues') != oi['antes'] or
                            not i.get('hash_antes') or i['hash_antes'] != i.get('hash_despues') or
                            any(i.get('control_omision_oraculo', {}).get(campo) is not True for campo in
                                ('hash_escenario_igual', 'archivos_inicio_iguales', 'inventario_home_igual', 'inventario_home_comparable'))):
                        raise ValueError('Omisión del oráculo sin prueba de ausencia de cambios.')
                previo = corregir(row, hoja['casos'][row['caso']], ai, di, oi)
                if previo.get('fallo_preparacion') or previo.get('estado_antes') != out.get('estado_antes'):
                    out.update(fallo_preparacion=True, resultado=None, motivo='capturas/oráculo incompletos o base distinta entre intentos')
                discrepancias.extend(dict(d, intento=i.get('intento')) for d in previo['discrepancia_oraculo'])
            except (KeyError, OSError, ValueError):
                out.update(fallo_preparacion=True, resultado=None, motivo='evidencia incompleta en un intento')
        out['discrepancia_oraculo'] = discrepancias
        if fallo_tanda:
            out.update(fallo_preparacion=True, resultado=None, motivo=fallo_tanda)
        out.update(hash_respuestas=hash_archivo(a.respuestas), hoja_cerrada=hoja['hoja_cerrada'])
        rows.append(out)
    a.salida.parent.mkdir(parents=True, exist_ok=True)
    a.salida.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows), encoding='utf-8')


if __name__ == '__main__':
    main()
