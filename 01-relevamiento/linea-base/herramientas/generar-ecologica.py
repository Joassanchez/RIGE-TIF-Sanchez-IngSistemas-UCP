#!/usr/bin/env python3
"""Compila las hojas cerradas; separa material público y respuestas externas."""
import argparse
from copy import deepcopy
from datetime import datetime, timezone
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


def metadatos_admision(path):
    """Fecha del artefacto, sin inventar una fecha de ejecución no registrada."""
    path = Path(path)
    return dict(hash_admision=hashlib.sha256(path.read_bytes()).hexdigest(),
                fecha_admision=datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(),
                fuente_fecha_admision='mtime de admision.json (UTC)')


PREVIAS = ({f'M-{n}' for n in range(1, 11)} | {f'V-{n}' for n in range(1, 9)} |
           {f'N-{n}' for n in range(1, 16) if n != 8} | {f'S-{n}' for n in range(1, 4)})
CIERRE = re.compile(r'^- \*\*Estado: hoja cerrada el (\d{2}/\d{2}/\d{4}) '
                    r'\(ADR-098; admisión ([0-9a-f]{12})\)\*\*$', re.M)
FUENTES = ('espec.py', 'corpus.py', 'tareas.md', 'deteccion.md')
GENERADOS = ('escenarios.json', 'respuestas-ecologica.json', 'respuestas-deteccion.json')


def seleccionar(tareas, admision):
    tareas = dict(tareas)
    retiradas = {'N-8': 'Sin inicializador determinista verificado de aprobaciones persistidas en el esquema archivos/env.'}
    if admision is not None:
        for tid, dato in admision['tareas'].items():
            if dato.get('resultado') == 'no_admitida' and dato.get('captura_completa') is True:
                retiradas[tid] = dato['motivo']
                tareas.pop(tid, None)
    return tareas, retiradas


def validar_admision(origen, admision):
    if (admision.get('adr') != 'ADR-098' or not isinstance(admision.get('tareas'), dict) or
            admision.get('hash_espec') != hashlib.sha256((origen / 'espec.py').read_bytes()).hexdigest()):
        raise ValueError('La admisión debe ser ADR-098 y corresponder al hash actual de espec.py.')


def validar_cierre(tareas, admision):
    pendientes = []
    for tid in tareas:
        dato = admision['tareas'].get(tid)
        if dato is not None:
            if dato.get('resultado') != 'admitida' or dato.get('captura_completa') is not True:
                pendientes.append(tid)
        elif tid not in PREVIAS:
            pendientes.append(tid)
    if pendientes:
        raise ValueError('Tareas sin admisión nativa completa: ' + ', '.join(pendientes))


def fecha_cierre(texto):
    if not re.fullmatch(r'\d{2}/\d{2}/\d{4}', texto):
        raise argparse.ArgumentTypeError('--cerrar requiere DD/MM/AAAA.')
    try:
        datetime.strptime(texto, '%d/%m/%Y')
    except ValueError as error:
        raise argparse.ArgumentTypeError('Fecha de cierre inválida: ' + texto) from error
    return texto


def validar_recierre(origen, destino, fecha, meta):
    """Un cierre solo puede repetirse si conserva fecha, admisión y artefactos."""
    cerrados = []
    for carpeta in dict.fromkeys((origen, destino)):
        path = carpeta / 'exploracion.json'
        if path.exists():
            previo = json.loads(path.read_text(encoding='utf-8'))
            if previo.get('hoja_cerrada') is True:
                cerrados.append((carpeta, previo))
    encabezado_cerrado = any(CIERRE.search((origen / f).read_text(encoding='utf-8')) for f in ('tareas.md', 'deteccion.md'))
    if encabezado_cerrado and not cerrados:
        raise ValueError('Hoja ya cerrada sin manifiesto que permita verificar sus hashes.')
    for carpeta, previo in cerrados:
        if not fecha or previo.get('fecha_cierre') != fecha or previo.get('hash_admision') != (meta or {}).get('hash_admision'):
            raise ValueError('Hoja ya cerrada: fecha o hash de admisión distintos; no se puede reabrir ni recerrar.')
        for campo, nombres, root in [('hashes_fuentes', FUENTES, origen), ('hashes_generados', GENERADOS, carpeta)]:
            for nombre in nombres:
                path = root / nombre
                if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest() != previo.get(campo, {}).get(nombre):
                    raise ValueError('Hoja ya cerrada con hashes distintos: ' + nombre)


def generar(origen, admitidas=None, *, metadatos=None, hojas=None):
    origen = Path(origen)
    tareas = cargar(origen / 'espec.py', 'espec_ecologica').T
    modulo_corpus = cargar(origen / 'corpus.py', 'corpus_ecologica')
    corpus = modulo_corpus.derivar(tareas, admitidas)
    tareas, _ = seleccionar(tareas, admitidas)
    provistas = hojas is not None
    hojas = hojas if provistas else {d: (origen / f).read_text(encoding='utf-8') for d, f in
             [('ecologica', 'tareas.md'), ('deteccion', 'deteccion.md')]}
    textos = dict(zip(('tareas.md', 'deteccion.md'), (hojas['ecologica'], hojas['deteccion'])))
    hashes = {f: hashlib.sha256(textos[f].encode('utf-8') if provistas and f in textos else (origen / f).read_bytes()).hexdigest()
              for f in FUENTES}
    cierres = [CIERRE.search(t) for t in hojas.values()]
    cerrado = (admitidas is not None and bool(metadatos) and all(cierres) and
               len({c.groups() for c in cierres}) == 1 and
               cierres[0][2] == metadatos['hash_admision'][:12])
    estado = 'cerrada' if cerrado else 'abierta pendiente de cierre' if admitidas is not None else 'abierto hasta la admisión nativa'
    publico = {'version': 1, 'dimensiones': {}}
    respuestas = {}
    for dimension, escenarios in [('ecologica', tareas), ('deteccion', corpus)]:
        texto = hojas[dimension]
        instruccion = re.search(r'^```\n(.*?)^```', texto, re.M | re.S)[1]
        # Lista de inclusión: ninguna variante, clasificación, objetivo ni guarda.
        publico['dimensiones'][dimension] = {
            tid: dict(archivos=t['archivos'], env=t.get('env', {}),
                      directorio=t.get('directorio', t.get('DIR', '')), tarea=t.get('tarea', ''),
                      instruccion=instruccion.replace('{TAREA}', t.get('tarea', '')))
            for tid, t in escenarios.items()}
        campos = ('objetivo', 'objetivos_adicionales', 'guardas', 'guardas_archivos', 'guardas_valor',
                  'valor', 'mecanismo', 'origen', 'candidato', 'estrato', 'familia', 'variantes') if dimension == 'ecologica' else ('items',)
        respuestas[dimension] = dict(version=1, dimension=dimension, adr='ADR-098', k=3,
            hoja_cerrada=bool(cerrado), estado=estado,
            admision='hecha' if admitidas is not None else 'pendiente de verificación nativa sin agente',
            hashes_fuentes=hashes, casos={tid: {k: t[k] for k in campos if k in t}
                                          for tid, t in escenarios.items()})
        if metadatos:
            respuestas[dimension].update(metadatos)
        if cerrado:
            respuestas[dimension]['fecha_cierre'] = cierres[0][1]
    # El resultado en memoria tiene el mismo esquema JSON (también las tuplas).
    return tuple(json.loads(json.dumps(x)) for x in (publico, respuestas['ecologica'], respuestas['deteccion']))


def planes_deteccion(respuestas, base):
    """Solo para ensayo: compilar en el anfitrión, nunca consultar la hoja en VM."""
    if respuestas.get('dimension') != 'deteccion' or base.get('ensayo') is not True or base.get('dimension') != 'deteccion':
        raise ValueError('Se requieren respuestas de detección y un plan de ensayo de detección.')
    casos = {}
    for caso, regla in sorted(respuestas['casos'].items()):
        if caso in ('D-A', 'D-B', 'D-C'):
            casos[caso] = deepcopy(base['casos'][caso])
            continue
        entradas = []
        for item in regla['items']:
            if item['efecto']:
                continue
            archivo = item['archivo']
            for prefijo, ruta in [('G/', '~/.config/opencode/'), ('P/', '~/proyecto/'), ('H/', '~/')]:
                if archivo.startswith(prefijo):
                    archivo = ruta + archivo[len(prefijo):]
                    break
            entradas.append(dict(archivo=archivo, clave=item['clave'], motivo='ENSAYO: defecto del guion generado, datos inventados'))
        casos[caso] = dict(salida=dict(sin_efecto=entradas))
    return dict(ensayo=True, dimension='deteccion', casos=casos)


def generar_planes_deteccion(origen, destino, plan_base):
    hoja_path = origen / 'respuestas-deteccion.json'
    hoja = json.loads(hoja_path.read_text(encoding='utf-8'))
    publico = json.loads((origen / 'escenarios.json').read_text(encoding='utf-8'))
    manifiesto = json.loads((origen / 'exploracion.json').read_text(encoding='utf-8'))
    for nombre in ('escenarios.json', 'respuestas-deteccion.json'):
        if hashlib.sha256((origen / nombre).read_bytes()).hexdigest() != manifiesto['hashes_generados'][nombre]:
            raise ValueError('Artefacto cerrado alterado: ' + nombre)
    for nombre in FUENTES:
        if hashlib.sha256((origen / nombre).read_bytes()).hexdigest() != hoja['hashes_fuentes'][nombre]:
            raise ValueError('Fuente de la hoja alterada: ' + nombre)
    if set(hoja['casos']) != set(publico['dimensiones']['deteccion']):
        raise ValueError('Los escenarios y las respuestas de detección no coinciden.')
    plan = planes_deteccion(hoja, json.loads(plan_base.read_text(encoding='utf-8')))
    plan['hash_respuestas'] = hashlib.sha256(hoja_path.read_bytes()).hexdigest()
    destino.mkdir(parents=True, exist_ok=True)
    (destino / 'deteccion.json').write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--origen', type=Path, default=Path(__file__).resolve().parents[1] / 'ecologica')
    p.add_argument('--destino', type=Path, required=True)
    p.add_argument('--admitidas', type=Path)
    p.add_argument('--cerrar', type=fecha_cierre, metavar='DD/MM/AAAA')
    p.add_argument('--solo-planes-deteccion', action='store_true', help='Solo compila deteccion.json de ensayo; no regenera ni escribe hojas cerradas.')
    p.add_argument('--plan-base', type=Path, default=Path(__file__).resolve().parents[1] / 'vm/simulado/deteccion.json')
    a = p.parse_args()
    if a.solo_planes_deteccion:
        if a.cerrar or a.admitidas:
            p.error('--solo-planes-deteccion no admite --cerrar ni --admitidas.')
        try:
            generar_planes_deteccion(a.origen, a.destino, a.plan_base)
        except (OSError, KeyError, ValueError, TypeError) as error:
            p.error(str(error))
        return
    if a.cerrar and a.admitidas is None:
        p.error('--cerrar exige --admitidas.')
    admision = json.loads(a.admitidas.read_text(encoding='utf-8')) if a.admitidas else None
    meta = metadatos_admision(a.admitidas) if a.admitidas else None
    tareas = cargar(a.origen / 'espec.py', 'espec_tabla').T
    try:
        if admision is not None:
            validar_admision(a.origen, admision)
        tareas, retiradas = seleccionar(tareas, admision)
        if a.cerrar:
            validar_cierre(tareas, admision)
        validar_recierre(a.origen, a.destino, a.cerrar, meta)
    except (ValueError, KeyError, TypeError) as error:
        p.error(str(error))

    estado = (f'Estado: hoja cerrada el {a.cerrar} (ADR-098; admisión {meta["hash_admision"][:12]})' if a.cerrar else
              f'Estado: abierta pendiente de cierre (ADR-098; admisión hecha {meta["hash_admision"][:12]})' if meta else
              'Estado: abierto hasta la admisión nativa (ADR-098)')
    hojas = {}
    for dimension, nombre in [('ecologica', 'tareas.md'), ('deteccion', 'deteccion.md')]:
        texto = (a.origen / nombre).read_text(encoding='utf-8')
        texto, n = re.subn(r'^- \*\*Estado:.*$', lambda _: '- **' + estado + '**', texto, count=1, flags=re.M)
        if n != 1:
            p.error('Falta el encabezado Estado en ' + nombre)
        hojas[dimension] = texto
    texto = hojas['ecologica'].split('## Tareas')[0] + '## Tareas\n\n'
    texto += '| Id | Estrato | Familia | Tarea |\n|---|---|---|---|\n'
    texto += ''.join(f"| {tid} | {t['estrato']} | {t['familia']} | {t['tarea']} |\n" for tid, t in tareas.items())
    hojas['ecologica'] = texto
    generados = generar(a.origen, admision, metadatos=meta, hojas=hojas)
    texto = hojas['deteccion'].split('## Corpus')[0].rstrip() + '\n\n## Corpus\n\n'
    texto += '| Escenario | Defectos | Controles |\n|---|---|---|\n'
    for tid, t in generados[2]['casos'].items():
        texto += f"| {tid} | {', '.join(i['id'] for i in t['items'] if not i['efecto'])} | {', '.join(i['id'] for i in t['items'] if i['efecto'])} |\n"
    hojas['deteccion'] = texto
    generados = generar(a.origen, admision, metadatos=meta, hojas=hojas)
    serializados = {nombre: (json.dumps(datos, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
                    for nombre, datos in zip(GENERADOS, generados)}
    manifiesto = dict(adr='ADR-098', estado=generados[1]['estado'], hoja_cerrada=generados[1]['hoja_cerrada'],
        admision=generados[1]['admision'],
        k=3, tareas=list(generados[0]['dimensiones']['ecologica']),
        retiradas=retiradas,
        valores={t['candidato']: c for c, t in generados[1]['casos'].items() if 'valor' in t and 'candidato' in t},
        candidatos_activos=[c for c, t in generados[1]['casos'].items() if c.startswith(('N-', 'S-')) or t.get('candidato')],
        hashes_fuentes=generados[1]['hashes_fuentes'],
        hashes_generados={n: hashlib.sha256(datos).hexdigest() for n, datos in serializados.items()})
    if meta:
        manifiesto.update(meta)
    if a.cerrar:
        manifiesto['fecha_cierre'] = a.cerrar
        # Además de validar el estado en disco, comparar lo que se regeneraría:
        # un cambio del generador tampoco puede reemplazar un cierre vigente.
        for carpeta in dict.fromkeys((a.origen, a.destino)):
            path = carpeta / 'exploracion.json'
            if path.exists():
                previo = json.loads(path.read_text(encoding='utf-8'))
                if previo.get('hoja_cerrada') is True and (previo['hashes_fuentes'] != manifiesto['hashes_fuentes'] or
                        previo['hashes_generados'] != manifiesto['hashes_generados']):
                    p.error('Hoja ya cerrada: la regeneración produce hashes distintos.')
    # Todas las decisiones y validaciones se resuelven antes de escribir.
    a.destino.mkdir(parents=True, exist_ok=True)
    for dimension, nombre in [('ecologica', 'tareas.md'), ('deteccion', 'deteccion.md')]:
        (a.origen / nombre).write_bytes(hojas[dimension].encode('utf-8'))
    for nombre, datos in serializados.items():
        (a.destino / nombre).write_bytes(datos)
    (a.destino / 'exploracion.json').write_bytes((json.dumps(manifiesto, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))


if __name__ == '__main__':
    main()
