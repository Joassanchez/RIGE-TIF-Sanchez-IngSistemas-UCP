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


def admision_registrada(origen):
    """Resuelve la admisión del manifiesto por contenido, sin sembrar por defecto.

    El manifiesto histórico registra un hash, no una ubicación. Buscar solo en
    la evidencia local y rechazar una referencia ausente o de otra especificación.
    """
    origen = Path(origen)
    manifiesto = json.loads((origen / 'exploracion.json').read_text(encoding='utf-8'))
    digest = manifiesto.get('hash_admision')
    if digest is None:
        return None
    for path in sorted((origen.parent / 'verificacion').rglob('admision.json')):
        if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            continue
        datos = json.loads(path.read_text(encoding='utf-8'))
        if (datos.get('adr') != 'ADR-098' or
                datos.get('hash_espec') != hashlib.sha256((origen / 'espec.py').read_bytes()).hexdigest()):
            raise ValueError('La admisión registrada corresponde a otra especificación.')
        return path
    raise ValueError('No se encuentra la admisión registrada por hash_admision.')


def generar(origen, admitidas=None):
    origen = Path(origen)
    tareas = cargar(origen / 'espec.py', 'espec_ecologica').T
    modulo_corpus = cargar(origen / 'corpus.py', 'corpus_ecologica')
    corpus = modulo_corpus.derivar(tareas, admitidas)
    if admitidas:
        for tid, dato in admitidas.get('tareas', {}).items():
            if dato.get('resultado') == 'no_admitida' and dato.get('captura_completa') is True and tid in tareas:
                tareas.pop(tid)
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
                  'valor', 'mecanismo', 'origen', 'candidato', 'estrato', 'familia', 'variantes') if dimension == 'ecologica' else ('items',)
        respuestas[dimension] = dict(version=1, dimension=dimension, hoja_cerrada=cerrado,
            hashes_fuentes=hashes, casos={tid: {k: t[k] for k in campos if k in t}
                                          for tid, t in escenarios.items()})
        if dimension == 'ecologica':
            respuestas[dimension].update(adr='ADR-098', k=3, hoja_cerrada=False,
                estado='abierto hasta la admisión nativa', admision='pendiente de verificación nativa sin agente')
    # El resultado en memoria tiene el mismo esquema JSON (también las tuplas).
    return tuple(json.loads(json.dumps(x)) for x in (publico, respuestas['ecologica'], respuestas['deteccion']))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--origen', type=Path, default=Path(__file__).resolve().parents[1] / 'ecologica')
    p.add_argument('--destino', type=Path, required=True)
    p.add_argument('--admitidas', type=Path)
    a = p.parse_args()
    admision = json.loads(a.admitidas.read_text(encoding='utf-8')) if a.admitidas else None
    if admision and (admision.get('adr') != 'ADR-098' or admision.get('hash_espec') != hashlib.sha256((a.origen / 'espec.py').read_bytes()).hexdigest()):
        p.error('La admisión debe ser ADR-098 y corresponder al hash actual de espec.py.')
    tareas = cargar(a.origen / 'espec.py', 'espec_tabla').T
    if admision:
        tareas = {c: t for c, t in tareas.items() if not (admision.get('tareas', {}).get(c, {}).get('resultado') == 'no_admitida' and admision['tareas'][c].get('captura_completa') is True)}
    path = a.origen / 'tareas.md'
    texto = path.read_text(encoding='utf-8').split('## Tareas')[0] + '## Tareas\n\n'
    texto += '| Id | Estrato | Familia | Tarea |\n|---|---|---|---|\n'
    texto += ''.join(f"| {tid} | {t['estrato']} | {t['familia']} | {t['tarea']} |\n" for tid, t in tareas.items())
    path.write_text(texto, encoding='utf-8')
    a.destino.mkdir(parents=True, exist_ok=True)
    generados = generar(a.origen, admision)
    path = a.origen / 'deteccion.md'
    texto = path.read_text(encoding='utf-8').split('## Corpus')[0].rstrip() + '\n\n## Corpus\n\n'
    texto += '| Escenario | Defectos | Controles |\n|---|---|---|\n'
    for tid, t in generados[2]['casos'].items():
        texto += f"| {tid} | {', '.join(i['id'] for i in t['items'] if not i['efecto'])} | {', '.join(i['id'] for i in t['items'] if i['efecto'])} |\n"
    path.write_text(texto, encoding='utf-8')
    generados = generar(a.origen, admision)
    for nombre, datos in zip(('escenarios.json', 'respuestas-ecologica.json', 'respuestas-deteccion.json'), generados):
        (a.destino / nombre).write_text(json.dumps(datos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    manifiesto = dict(adr='ADR-098', estado='abierto hasta la admisión nativa', hoja_cerrada=False,
        k=3, tareas=list(generados[0]['dimensiones']['ecologica']),
        retiradas={'N-8': 'Sin inicializador determinista verificado de aprobaciones persistidas en el esquema archivos/env.'},
        valores={t['candidato']: c for c, t in generados[1]['casos'].items() if 'valor' in t and 'candidato' in t},
        candidatos_activos=[c for c, t in generados[1]['casos'].items() if c.startswith(('N-', 'S-')) or t.get('candidato')],
        hashes_fuentes=generados[1]['hashes_fuentes'],
        hashes_generados={n: hashlib.sha256((a.destino / n).read_bytes()).hexdigest()
                         for n in ('escenarios.json', 'respuestas-ecologica.json', 'respuestas-deteccion.json')})
    if admision:
        manifiesto['hash_admision'] = hashlib.sha256(a.admitidas.read_bytes()).hexdigest()
        for c, v in admision.get('tareas', {}).items():
            if v.get('resultado') == 'no_admitida' and v.get('captura_completa') is True:
                manifiesto['retiradas'][c] = v['motivo']
    (a.destino / 'exploracion.json').write_text(json.dumps(manifiesto, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
