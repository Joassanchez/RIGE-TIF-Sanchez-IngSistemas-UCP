#!/usr/bin/env python3
"""ADR-092: coincidencia mecánica independiente por archivo Y clave."""
import argparse
import json
from pathlib import Path
import re

from comun import hash_archivo, leer_jsonl
from corregir import ultimo_json


def normalizar(texto):
    return texto.lower().replace('~', '/home/participante')


def corregir(row, items):
    out = dict(row, dimension='deteccion', resultado='sin_respuesta', detectados=[],
               falsos_positivos=[], otras=[], coincidencias=[])
    try:
        texto = row.get('respuesta_textual', '')
        if texto.count('```') % 2:
            raise ValueError('bloque sin cerrar')
        obj = ultimo_json(texto)
        if not isinstance(obj, dict) or not isinstance(obj.get('sin_efecto'), list):
            raise ValueError('formato')
        for entrada in obj['sin_efecto']:
            if not isinstance(entrada, dict) or not all(isinstance(entrada.get(k), str) for k in ('archivo', 'clave', 'motivo')):
                raise ValueError('entrada inválida')
        out['entradas'] = obj['sin_efecto']
    except (ValueError, TypeError):
        out['motivo'] = 'JSON ausente o inválido'
        return out
    for entrada in out['entradas']:
        ids = [i['id'] for i in items if all(re.search(i['coincide'][k], normalizar(entrada[k]), re.I)
                                              for k in ('archivo', 'clave'))]
        out['coincidencias'].append(dict(entrada=entrada, items=ids))
        if not ids:
            out['otras'].append(entrada)
        for i in items:
            campo = 'falsos_positivos' if i['efecto'] else 'detectados'
            if i['id'] in ids and i['id'] not in out[campo]:
                out[campo].append(i['id'])
    out['resultado'] = 'respondida'
    out['defectos'] = [i['id'] for i in items if not i['efecto']]
    out['controles'] = [i['id'] for i in items if i['efecto']]
    if row.get('censurado') or row.get('codigo_salida', 0) != 0:
        out.update(resultado='sin_respuesta', motivo='censura o error de ejecución', detectados=[], falsos_positivos=[])
    return out


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('registro', type=Path)
    p.add_argument('--respuestas', type=Path, required=True)
    p.add_argument('--salida', type=Path, required=True)
    a = p.parse_args()
    if a.salida.resolve() == a.registro.resolve():
        p.error('No sobrescribir el registro crudo.')
    hoja = json.loads(a.respuestas.read_text(encoding='utf-8'))
    if hoja.get('dimension') != 'deteccion' or hoja.get('hoja_cerrada') is not True:
        p.error('Se requiere la hoja cerrada de detección.')
    from corregir_ecologica import validar_tanda
    validar_tanda(a.registro.parent, a.respuestas)
    rows = []
    for row in leer_jsonl(a.registro):
        if row.get('dimension') != 'deteccion':
            p.error('No mezclar dimensiones.')
        items = hoja['casos'][row['caso']]['items']
        out = corregir(row, items)
        out.update(hash_respuestas=hash_archivo(a.respuestas), hoja_cerrada=True,
                   defectos=[i['id'] for i in items if not i['efecto']], controles=[i['id'] for i in items if i['efecto']])
        rows.append(out)
    a.salida.parent.mkdir(parents=True, exist_ok=True)
    a.salida.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows), encoding='utf-8')


if __name__ == '__main__':
    main()
