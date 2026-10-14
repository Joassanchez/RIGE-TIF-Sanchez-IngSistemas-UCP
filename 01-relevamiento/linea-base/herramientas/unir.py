#!/usr/bin/env python3
"""Une registros parciales compatibles, conservando filas y tandas de origen."""
import argparse
import json
from pathlib import Path

from comun import CASOS, escribir_json, leer_jsonl

IDENTIDAD = ('ejecutor', 'modelo', 'brazo', 'condicion', 'fase', 'ensayo')
CONGELADOS = ('k', 'semilla', 'hash_instruccion', 'hash_ejecutor', 'hash_hoja',
              'hash_tarifas', 'hash_catalogo')


def unir(registros):
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
    args = parser.parse_args()
    try:
        filas, meta, faltantes = unir(args.registros)
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
    print(f'{len(filas)} filas de {24 * meta["k"]}; {len(faltantes)} pares faltantes.')
    if faltantes:
        print('Faltan: ' + ','.join(f'{c}:{r}' for c, r in faltantes))


if __name__ == '__main__':
    main()
