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
    candidatas = [c for c, t in tareas.items() if c.startswith(('N-', 'S-')) or t.get('candidato')]
    if len(candidatas) + 1 > 23:  # Incluye N-8 retirada.
        raise ValueError('La ampliación ADR-095 supera el tope autorizado de 23 candidatos.')
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
                      directorio=t.get('directorio', t.get('DIR', '')), tarea=t.get('tarea', ''),
                      instruccion=instruccion.replace('{TAREA}', t.get('tarea', '')))
            for tid, t in escenarios.items()}
        campos = ('objetivo', 'objetivos_adicionales', 'guardas', 'guardas_archivos', 'guardas_valor',
                  'valor', 'mecanismo', 'origen', 'candidato') if dimension == 'ecologica' else ('items',)
        respuestas[dimension] = dict(version=1, dimension=dimension, hoja_cerrada=cerrado,
            hashes_fuentes=hashes, casos={tid: {k: t[k] for k in campos if k in t}
                                          for tid, t in escenarios.items()})
        if dimension == 'ecologica':
            respuestas[dimension].update(adr='ADR-095', exploratoria=True, hoja_cerrada=False,
                admision='pendiente de verificación nativa sin agente')
    # El resultado en memoria tiene el mismo esquema JSON (también las tuplas).
    return tuple(json.loads(json.dumps(x)) for x in (publico, respuestas['ecologica'], respuestas['deteccion']))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--origen', type=Path, default=Path(__file__).resolve().parents[1] / 'ecologica')
    p.add_argument('--destino', type=Path, required=True)
    a = p.parse_args()
    a.destino.mkdir(parents=True, exist_ok=True)
    generados = generar(a.origen)
    for nombre, datos in zip(('escenarios.json', 'respuestas-ecologica.json', 'respuestas-deteccion.json'), generados):
        (a.destino / nombre).write_text(json.dumps(datos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    manifiesto = dict(adr='ADR-095', estado='pendiente de admisión nativa',
        k=1, tareas=list(generados[0]['dimensiones']['ecologica']),
        retiradas={'N-8': 'Sin inicializador determinista verificado de aprobaciones persistidas en el esquema archivos/env.'},
        valores={t['candidato']: c for c, t in generados[1]['casos'].items() if 'valor' in t and 'candidato' in t},
        tope_candidatos=23,
        candidatos_activos=[c for c, t in generados[1]['casos'].items() if c.startswith(('N-', 'S-')) or t.get('candidato')],
        hashes_fuentes=generados[1]['hashes_fuentes'],
        hashes_generados={n: hashlib.sha256((a.destino / n).read_bytes()).hexdigest()
                         for n in ('escenarios.json', 'respuestas-ecologica.json', 'respuestas-deteccion.json')})
    (a.destino / 'exploracion.json').write_text(json.dumps(manifiesto, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
