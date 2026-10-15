#!/usr/bin/env python3
"""Compila las hojas cerradas; separa material público y respuestas externas."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys


def cargar(path, nombre):
    spec = importlib.util.spec_from_file_location(nombre, path)
    modulo = importlib.util.module_from_spec(spec)
    # Las fuentes cerradas son solo lectura, incluso su carpeta de bytecode.
    previo = sys.dont_write_bytecode
    try:
        sys.dont_write_bytecode = True
        spec.loader.exec_module(modulo)
    finally:
        sys.dont_write_bytecode = previo
    return modulo


def generar(origen):
    origen = Path(origen)
    tareas = cargar(origen / 'espec.py', 'espec_ecologica').T
    corpus = cargar(origen / 'corpus.py', 'corpus_ecologica').E
    hojas = {d: (origen / f).read_text(encoding='utf-8') for d, f in
             [('ecologica', 'tareas.md'), ('deteccion', 'deteccion.md')]}
    hashes = {f: hashlib.sha256((origen / f).read_bytes()).hexdigest()
              for f in ('espec.py', 'corpus.py', 'tareas.md', 'deteccion.md')}
    publico = {'version': 1, 'dimensiones': {}}
    respuestas = {}
    for dimension, escenarios in [('ecologica', tareas), ('deteccion', corpus)]:
        texto = hojas[dimension]
        instruccion = re.search(r'^```\n(.*?)^```', texto, re.M | re.S)[1]
        cerrado = True if 'hoja cerrada el' in texto.lower() else None
        # Lista de inclusión: ninguna variante, clasificación, objetivo ni guarda.
        publico['dimensiones'][dimension] = {
            tid: dict(archivos=t['archivos'], env=t.get('env', {}),
                      directorio=t.get('DIR', ''), tarea=t.get('tarea', ''),
                      instruccion=instruccion.replace('{TAREA}', t.get('tarea', '')))
            for tid, t in escenarios.items()}
        campos = ('objetivo', 'guardas', 'valor') if dimension == 'ecologica' else ('items',)
        respuestas[dimension] = dict(version=1, dimension=dimension, hoja_cerrada=cerrado,
            hashes_fuentes=hashes, casos={tid: {k: t[k] for k in campos if k in t}
                                          for tid, t in escenarios.items()})
    # El resultado en memoria tiene el mismo esquema JSON (también las tuplas).
    return tuple(json.loads(json.dumps(x)) for x in (publico, respuestas['ecologica'], respuestas['deteccion']))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--origen', type=Path, default=Path(__file__).resolve().parents[1] / 'ecologica')
    p.add_argument('--destino', type=Path, required=True)
    a = p.parse_args()
    a.destino.mkdir(parents=True, exist_ok=True)
    for nombre, datos in zip(('escenarios.json', 'respuestas-ecologica.json', 'respuestas-deteccion.json'), generar(a.origen)):
        (a.destino / nombre).write_text(json.dumps(datos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
