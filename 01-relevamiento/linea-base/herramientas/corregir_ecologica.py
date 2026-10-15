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


def valor(agente, campo):
    v = agente.get(campo)
    return f"{v['providerID']}/{v['modelID']}" if campo == 'model' and isinstance(v, dict) else v


def observar_captura(agentes, regla):
    """Evaluador estático para contraste y fixtures; no reemplaza la ejecución."""
    if 'valor' in regla:
        ag, campo, _ = regla['valor']
        return {'objetivo': valor(agentes[ag], campo), 'guardas': {}}
    def decision(s):
        return decidir(agentes[s[0]]['permission'], s[1], s[2])
    return {'objetivo': decision(regla['objetivo']),
            'guardas': {clave(g): decision(g) for g in regla['guardas']}}


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
            estados[0]['guardas'] = {k: antes[ag].get(k) for k in diferencias}
            estados[1]['guardas'] = {k: despues[ag].get(k) for k in diferencias}
        else:
            esperado = regla['objetivo'][3]
            estados = []
            for momento, estatico in zip(('antes', 'despues'), estaticos):
                def ejecutada(s):
                    key = clave(s)
                    dato = oraculo[momento][key]
                    v = dato['decision']
                    if v not in ('allow', 'ask', 'deny'):
                        raise ValueError(f'Oráculo indeterminado: {key}')
                    debug = decidir((antes if momento == 'antes' else despues)[s[0]]['permission'], s[1], s[2])
                    if v != debug:
                        out['discrepancia_oraculo'].append(dict(momento=momento, sonda=key, ejecucion=v, debug=debug))
                    return v
                estados.append(dict(objetivo=ejecutada(regla['objetivo']),
                                    guardas={clave(g): ejecutada(g) for g in regla['guardas']}))
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
    except (ValueError, TypeError):
        out.update(resultado='sin_respuesta', motivo='formato')
        return out
    if row.get('censurado') or row.get('codigo_salida', 0) != 0 or (not obj['hecho'] and not obj['cambios'] and obj['impedimento'].strip()):
        out.update(resultado='sin_respuesta', motivo='censura, error o negativa')
    if row.get('fallo_preparacion'):
        out.update(resultado=None, motivo='preparación incompleta')
    return out


def capturas(root, intento):
    return [{p.stem[7:]: json.loads(p.read_text(encoding='utf-8'))
             for p in (root / intento[k]).glob('agente-*.json')}
            for k in ('captura_antes', 'captura_despues')]


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('registro', type=Path)
    p.add_argument('--respuestas', type=Path, required=True)
    p.add_argument('--salida', type=Path, required=True)
    a = p.parse_args()
    if a.salida.resolve() == a.registro.resolve():
        p.error('No sobrescribir el registro crudo.')
    hoja = json.loads(a.respuestas.read_text(encoding='utf-8'))
    if hoja.get('dimension') != 'ecologica' or hoja.get('hoja_cerrada') is not True:
        p.error('Se requiere la hoja cerrada ecológica.')
    rows = []
    for row in leer_jsonl(a.registro):
        if row.get('dimension') != 'ecologica':
            p.error('No mezclar dimensiones.')
        intento = row['intentos'][-1]
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
                previo = corregir(row, hoja['casos'][row['caso']], ai, di, oi)
                if previo.get('fallo_preparacion') or previo.get('estado_antes') != out.get('estado_antes'):
                    out.update(fallo_preparacion=True, resultado=None, motivo='capturas/oráculo incompletos o base distinta entre intentos')
                discrepancias.extend(dict(d, intento=i.get('intento')) for d in previo['discrepancia_oraculo'])
            except (KeyError, OSError, ValueError):
                out.update(fallo_preparacion=True, resultado=None, motivo='evidencia incompleta en un intento')
        out['discrepancia_oraculo'] = discrepancias
        out.update(hash_respuestas=hash_archivo(a.respuestas), hoja_cerrada=hoja['hoja_cerrada'])
        rows.append(out)
    a.salida.parent.mkdir(parents=True, exist_ok=True)
    a.salida.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows), encoding='utf-8')


if __name__ == '__main__':
    main()
