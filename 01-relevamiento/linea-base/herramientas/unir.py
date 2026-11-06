#!/usr/bin/env python3
"""Une registros parciales compatibles, conservando filas y tandas de origen."""
import argparse
import json
from pathlib import Path

from comun import escribir_json, leer_jsonl

def unir_med9(registros, casos_esperados=None, respuestas=None):
    """Fragmentos de una misma tanda; exige todos los pares y preserva evidencia."""
    from analizar_ecologica import ECO, DET, CONTRASTE
    campos = ('tanda', 'dimension', 'ejecutor', 'modelo', 'brazo', 'condicion', 'ensayo',
              'fuera_del_arbol', 'k', 'limite', 'semilla', 'hash_ejecutor', 'hash_hoja',
              'hash_tarifas', 'hash_catalogo', 'hashes_entradas', 'hash_arnes', 'hash_extension',
              'hash_binario', 'hash_plan_ensayo', 'exclusiones_hash')
    referencia, filas, vistos, fuentes = None, [], set(), []
    for registro in map(Path, registros):
        meta = json.loads((registro.parent / 'tanda.json').read_text(encoding='utf-8'))
        if meta.get('dimension') not in ('ecologica', 'deteccion'):
            raise ValueError('Unión MED-9 requiere ecológica o detección.')
        for campo in campos:
            if campo not in meta or (referencia is not None and referencia[campo] != meta[campo]):
                raise ValueError(f'{registro}: falta o difiere {campo}.')
        if (registro.parent / 'DETENCION.txt').exists():
            raise ValueError(f'{registro}: tanda detenida/inválida.')
        if referencia is not None and referencia.get('regla_acceso_web') != meta.get('regla_acceso_web'):
            raise ValueError('No mezclar reglas de acceso web.')
        if referencia is not None and referencia.get('hash_plan_anidado') != meta.get('hash_plan_anidado'):
            raise ValueError('No mezclar planes de verificación anidada.')
        hoja_dir = Path(__file__).resolve().parents[1] / ('ecologica/final' if meta.get('hoja') == 'final' else 'ecologica')
        ruta_respuestas = respuestas or hoja_dir / ('respuestas-' + meta['dimension'] + '.json')
        if meta.get('hoja') == 'final' and meta['brazo'] in ('indicado', 'disponible'):
            for campo in ('hash_rige', 'etiqueta_rige', 'hash_wrapper_rige'):
                if not meta.get(campo) or referencia is not None and referencia.get(campo) != meta[campo]:
                    raise ValueError('Falta o difiere ' + campo)
        if referencia is not None and referencia.get('hoja', 'cerrada') != meta.get('hoja', 'cerrada'):
            raise ValueError('No mezclar hojas.')
        if meta.get('regla_acceso_web') == 'ADR-094':
            from corregir_ecologica import validar_tanda
            validar_tanda(registro.parent, ruta_respuestas)
        if meta['dimension'] == 'ecologica':
            from corregir_ecologica import validar_tanda
            # La validación externa conserva su hoja en el anfitrión.
            validar_tanda(registro.parent, ruta_respuestas)
            if meta.get('protocolo_oraculo') != 'MED-9c':
                raise ValueError('No unir versiones distintas del oráculo ecológico.')
        if type(meta['k']) is not int or meta['k'] < 1:
            raise ValueError('k debe ser un entero positivo.')
        if referencia is None:
            referencia = meta.copy()
        casos = (CONTRASTE if meta['fuera_del_arbol'] else ECO) if meta['dimension'] == 'ecologica' else DET
        if meta.get('hoja') == 'final':
            casos = tuple(json.loads(ruta_respuestas.read_text(encoding='utf-8'))['casos'])
            if meta['fuera_del_arbol']:
                casos = tuple(c for c in casos if c.startswith('M-'))
        if casos_esperados is not None:
            if (not casos_esperados or len(set(casos_esperados)) != len(casos_esperados)
                    or not set(casos_esperados) <= set(casos)):
                raise ValueError('Casos esperados inválidos para la dimensión/modalidad.')
            casos = casos_esperados
        seleccion = {tuple(par) for par in meta['orden']}
        encontrados = set()
        for fila in leer_jsonl(registro):
            if 'hash_respuestas' in fila:
                from comun import hash_archivo
                if fila['hash_respuestas'] != hash_archivo(ruta_respuestas):
                    raise ValueError('Fila corregida con otra hoja de respuestas.')
            for campo in ('tanda', 'dimension', 'ejecutor', 'modelo', 'brazo', 'condicion', 'ensayo', 'fuera_del_arbol', 'k', 'hash_ejecutor'):
                if fila.get(campo) != meta[campo]:
                    raise ValueError(f'{registro}: fila incompatible con {campo}.')
            c, r = fila.get('caso'), fila.get('repeticion')
            if c not in casos or type(r) is not int or not 1 <= r <= meta['k'] or (c, r) not in seleccion:
                raise ValueError(f'{registro}: par caso/repetición ajeno al fragmento.')
            if (c, r) in vistos:
                raise ValueError(f'Par repetido: {c}:{r}; no se deduplica evidencia.')
            vistos.add((c, r))
            encontrados.add((c, r))
            # Una unión no mueve los crudos: hacer sus referencias resolubles
            # también si el corrector se ejecuta DESPUÉS de unir.
            fila['_directorio_registro'] = str(registro.parent.resolve())
            for intento in fila.get('intentos', []):
                for campo in ('captura_antes', 'captura_despues', 'configuracion_despues', 'oraculo', 'oraculo_base', 'archivo_evidencia', 'anidado'):
                    if campo in intento:
                        intento[campo] = str((registro.parent / intento[campo]).resolve())
            filas.append(fila)
        if encontrados != seleccion:
            raise ValueError(f'{registro}: fragmento incompleto respecto de su orden.')
        fuentes.append(dict(registro=str(registro.resolve()), tanda=meta['tanda'],
                            base_verificada=meta.get('base_verificada')))
    if referencia is None:
        raise ValueError('Se requiere al menos un registro.')
    esperados = {(c, r) for c in casos for r in range(1, referencia['k'] + 1)}
    if vistos != esperados:
        raise ValueError('Pares incompletos: ' + ','.join(f'{c}:{r}' for c, r in sorted(esperados - vistos)))
    referencia.update(orden=[[r['caso'], r['repeticion']] for r in filas], registros_origen=fuentes, pares_faltantes=[])
    for campo in ('inicio', 'pares', 'casos', 'base_verificada', 'preparar_base'):
        referencia.pop(campo, None)
    referencia['union_med9'] = True
    return filas, referencia, []


def unir(registros, casos_esperados=None, respuestas=None):
    return unir_med9(registros, casos_esperados, respuestas)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('registros', nargs='+', type=Path)
    parser.add_argument('--respuestas', type=Path, help='Hoja seleccionada, conservada en el anfitrión.')
    parser.add_argument('--salida', required=True, type=Path)
    parser.add_argument('--casos', help='Selección explícita MED-9; exige todos sus pares caso × k.')
    args = parser.parse_args()
    try:
        filas, meta, faltantes = unir(args.registros, args.casos.split(',') if args.casos is not None else None, args.respuestas)
        manifiesto = args.salida.parent / 'tanda.json'
        if args.salida.name == 'tanda.json':
            raise ValueError('El registro de salida debe ser distinto de tanda.json.')
        if args.salida.exists() or manifiesto.exists():
            raise ValueError('La salida y su tanda.json deben ser nuevos; elegir otra carpeta.')
    except (ValueError, OSError) as error:
        parser.error(str(error))
    args.salida.parent.mkdir(parents=True, exist_ok=True)
    # Se preserva tanda en cada fila: identifica su evidencia y adjudicación.
    meta['tanda'] = args.salida.parent.name
    args.salida.write_text(''.join(json.dumps(r, ensure_ascii=False, allow_nan=False) + '\n' for r in filas), encoding='utf-8')
    escribir_json(manifiesto, meta)
    total = len(filas)
    print(f'{len(filas)} filas de {total}; {len(faltantes)} pares faltantes.')
    if faltantes:
        print('Faltan: ' + ','.join(f'{c}:{r}' for c, r in faltantes))


if __name__ == '__main__':
    main()
