#!/usr/bin/env python3
"""Une registros parciales compatibles, conservando filas y tandas de origen."""
import argparse
import json
from pathlib import Path

from comun import CASOS, escribir_json, leer_jsonl

IDENTIDAD = ('ejecutor', 'modelo', 'brazo', 'condicion', 'fase', 'ensayo')
CONGELADOS = ('k', 'semilla', 'hash_instruccion', 'hash_ejecutor', 'hash_hoja',
              'hash_tarifas', 'hash_catalogo')


def unir_med9(registros, casos_esperados=None):
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
        if meta.get('regla_acceso_web') == 'ADR-094':
            from corregir_ecologica import validar_tanda
            validar_tanda(registro.parent, Path(__file__).resolve().parents[1] / 'ecologica/respuestas-ecologica.json')
        if meta['dimension'] == 'ecologica':
            from corregir_ecologica import validar_tanda
            # La validación externa conserva su hoja en el anfitrión.
            validar_tanda(registro.parent, Path(__file__).resolve().parents[1] / 'ecologica/respuestas-ecologica.json')
            if meta.get('protocolo_oraculo') != 'MED-9c':
                raise ValueError('No unir versiones distintas del oráculo ecológico.')
        if type(meta['k']) is not int or meta['k'] < 1:
            raise ValueError('k debe ser un entero positivo.')
        if referencia is None:
            referencia = meta.copy()
        casos = (CONTRASTE if meta['fuera_del_arbol'] else ECO) if meta['dimension'] == 'ecologica' else DET
        if casos_esperados is not None:
            if (not casos_esperados or len(set(casos_esperados)) != len(casos_esperados)
                    or not set(casos_esperados) <= set(casos)):
                raise ValueError('Casos esperados inválidos para la dimensión/modalidad.')
            casos = casos_esperados
        seleccion = {tuple(par) for par in meta['orden']}
        encontrados = set()
        for fila in leer_jsonl(registro):
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


def unir(registros, casos_esperados=None):
    if registros:
        meta = json.loads((Path(registros[0]).parent / 'tanda.json').read_text(encoding='utf-8'))
        if meta.get('dimension') in ('ecologica', 'deteccion'):
            return unir_med9(registros, casos_esperados)
    if casos_esperados is not None:
        raise ValueError('--casos solo está disponible para la unión MED-9.')
    referencia = None
    filas, vistos, fuentes = [], set(), []
    for registro in map(Path, registros):
        meta = json.loads((registro.parent / 'tanda.json').read_text(encoding='utf-8'))
        for campo in IDENTIDAD + CONGELADOS:
            if campo not in meta or meta[campo] is None:
                raise ValueError(f'{registro}: falta {campo} en tanda.json.')
            if referencia is not None and meta[campo] != referencia[campo]:
                raise ValueError(f'{registro}: difiere {campo}; no unir tandas incompatibles.')
        k = meta['k']
        if type(k) is not int or k < 1:
            raise ValueError(f'{registro}: k debe ser un entero positivo.')
        if referencia is None:
            referencia = meta.copy()
        fuentes.append({'registro': str(registro.resolve()), 'tanda': meta.get('tanda'),
                        'hash_arnes': meta.get('hash_arnes')})
        for fila in leer_jsonl(registro):
            for campo in ('ejecutor', 'modelo', 'brazo', 'condicion', 'k'):
                if fila.get(campo) != meta[campo]:
                    raise ValueError(f'{registro}: fila incompatible con {campo} de tanda.json.')
            # hash_instruccion de la fila incluye la pregunta del caso; el de
            # tanda.json congela la plantilla común y es el que se compara.
            for campo in ('fase', 'ensayo', 'hash_ejecutor'):
                if campo in fila and fila[campo] != meta[campo]:
                    raise ValueError(f'{registro}: fila incompatible con {campo} de tanda.json.')
            caso, repeticion = fila.get('caso'), fila.get('repeticion')
            if caso not in CASOS or type(repeticion) is not int or not 1 <= repeticion <= k:
                raise ValueError(f'{registro}: par caso/repetición inválido.')
            par = (caso, repeticion)
            if par in vistos:
                raise ValueError(f'Par repetido: {caso}:{repeticion}; no se deduplica evidencia.')
            vistos.add(par)
            filas.append(fila)
    if referencia is None:
        raise ValueError('Se requiere al menos un registro.')
    faltantes = [(c, r) for c in CASOS for r in range(1, referencia['k'] + 1) if (c, r) not in vistos]
    referencia.update(orden=[(r['caso'], r['repeticion']) for r in filas],
                      registros_origen=fuentes, pares_faltantes=faltantes)
    # El manifiesto unido no atribuye el inicio de todas las filas a una sola tanda.
    referencia.pop('inicio', None)
    referencia.pop('pares', None)
    return filas, referencia, faltantes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('registros', nargs='+', type=Path)
    parser.add_argument('--salida', required=True, type=Path)
    parser.add_argument('--casos', help='Selección explícita MED-9; exige todos sus pares caso × k.')
    args = parser.parse_args()
    try:
        filas, meta, faltantes = unir(args.registros, args.casos.split(',') if args.casos is not None else None)
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
    total = len(filas) if meta.get('union_med9') else 24 * meta['k']
    print(f'{len(filas)} filas de {total}; {len(faltantes)} pares faltantes.')
    if faltantes:
        print('Faltan: ' + ','.join(f'{c}:{r}' for c, r in faltantes))


if __name__ == '__main__':
    main()
