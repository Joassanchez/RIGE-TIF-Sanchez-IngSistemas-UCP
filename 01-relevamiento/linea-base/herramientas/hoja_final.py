"""Compilación externa de MED-19, sin escribir en la hoja cerrada."""
from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import shlex

ROOT = Path(__file__).resolve().parents[1]


def cargar(path):
    spec = importlib.util.spec_from_file_location('fuente_med19', path)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def huella(tarea):
    return hashlib.sha256(json.dumps(tarea, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def llamada_ensayo(permiso, sujeto):
    if permiso in ('read', 'edit', 'write'):
        ruta = '/home/participante/proyecto/' + sujeto
        if permiso == 'read':
            return dict(herramienta='read', argumentos=dict(filePath=ruta), objetivo=True)
        return dict(herramienta='write', argumentos=dict(filePath=ruta, content='ENSAYO MED-19\n'), objetivo=True)
    if permiso == 'external_directory':
        return dict(herramienta='read', argumentos=dict(filePath=sujeto.removesuffix('*') + 'notas.md'), objetivo=True)
    if permiso == 'webfetch':
        return dict(herramienta='webfetch', argumentos=dict(url=sujeto, format='text'), objetivo=True)
    if permiso == 'skill':
        return dict(herramienta='skill', argumentos=dict(name=sujeto), objetivo=True)
    if permiso == 'bash':
        return dict(herramienta='bash', argumentos=dict(command=sujeto, description='ENSAYO MED-19'), objetivo=True)
    raise ValueError('Herramienta de ensayo no definida: ' + permiso)


def generar(destino, admisiones=(), cerrar=None):
    destino = Path(destino).resolve()
    cerrada = ROOT / 'ecologica'
    if destino == cerrada.resolve() or destino.is_relative_to(cerrada.resolve()) and destino != cerrada / 'final':
        raise ValueError('La hoja final solo puede escribirse en ecologica/final o fuera de ecologica.')
    gen = cargar(ROOT / 'herramientas/generar-ecologica.py')
    tareas = cargar(cerrada / 'final/espec_final.py').T
    publico = json.loads((cerrada / 'escenarios.json').read_text(encoding='utf-8'))
    respuesta = json.loads((cerrada / 'respuestas-ecologica.json').read_text(encoding='utf-8'))
    for campo in ('hash_admision', 'fecha_admision', 'fuente_fecha_admision', 'fecha_cierre'):
        respuesta.pop(campo, None)
    # Conservar exactamente el conjunto admitido histórico, sin reintroducir retiradas.
    tareas = {c: t for c, t in tareas.items() if c in publico['dimensiones']['ecologica'] or c.startswith('R-')}
    instruccion = re.search(r'^```\n(.*?)^```', (cerrada / 'tareas.md').read_text(encoding='utf-8'), re.M | re.S)[1]
    for c, t in tareas.items():
        if c.startswith('R-'):
            publico['dimensiones']['ecologica'][c] = dict(archivos=t['archivos'], env=t.get('env', {}), directorio='', tarea=t['tarea'], sondas_publicas='archivos',
                                                       instruccion=instruccion.replace('{TAREA}', t['tarea']))
        campos = set(respuesta['casos'].get(c, {})) if not c.startswith('R-') else set(t) - {'archivos', 'tarea', 'env', 'directorio'}
        respuesta['casos'][c] = {k: deepcopy(t[k]) for k in sorted(campos)}
    respuesta.update(hoja='final', hoja_cerrada=False, estado='final pendiente de admisión nativa',
        admision='por tarea', huellas_tareas={c: huella(t) for c, t in tareas.items()})
    respuesta['hashes_fuentes'] = dict(respuesta['hashes_fuentes'],
        espec_final=hashlib.sha256((cerrada / 'final/espec_final.py').read_bytes()).hexdigest())
    procedencia, retiradas = [], {}
    if cerrar:
        if not admisiones:
            raise ValueError('El cierre final requiere raíces de admisión')
        from verificar_base_ecologica import cargar_admisiones, exigir_tarea, referencia_correcta
        indice, procedencia = cargar_admisiones(admisiones, respuesta)
        for c in list(tareas):
            if c not in indice:
                raise ValueError('Tarea final sin admisión coincidente: ' + c)
            admision = indice[c][1]
            dato = admision['tareas'][c]
            if c.startswith('R-') and dato.get('resultado') == 'no_admitida' and dato.get('captura_completa') is True:
                retiradas[c] = dato['motivo']
                del tareas[c], respuesta['casos'][c], respuesta['huellas_tareas'][c], publico['dimensiones']['ecologica'][c]
                continue
            exigir_tarea(admision, c)
            if 'objetivo' in tareas[c]:
                referencia_correcta(indice, c)
        respuesta.update(hoja_cerrada=True, estado='final cerrada', fecha_cierre=cerrar, admisiones=procedencia)
    encabezado = (cerrada / 'tareas.md').read_text(encoding='utf-8').split('## Tareas')[0]
    estado = 'hoja final cerrada el ' + cerrar if cerrar else 'hoja final; admisión nativa por tarea antes de medir'
    encabezado = re.sub(r'^- \*\*Estado:.*$', '- **Estado: ' + estado + ' (MED-19)**', encabezado, flags=re.M)
    textos = {'tareas.md': encabezado +
              '## Tareas\n\n| Id | Tarea |\n|---|---|\n' + ''.join(f"| {c} | {t['tarea']} |\n" for c, t in tareas.items()),
              'deteccion.md': (cerrada / 'deteccion.md').read_text(encoding='utf-8')}
    datos = {'escenarios.json': publico, 'respuestas-ecologica.json': respuesta}
    serializados = {n: (json.dumps(d, ensure_ascii=False, indent=2) + '\n').encode() for n, d in datos.items()}
    serializados.update({n: t.encode() for n, t in textos.items()})
    serializados['respuestas-deteccion.json'] = (cerrada / 'respuestas-deteccion.json').read_bytes()
    # Planes sintéticos externos: no copiar respuestas/especificaciones a la VM.
    planes = {'ensayo': True, 'dimension': 'ecologica', 'casos': {}}
    for c, t in tareas.items():
        plan = dict(archivos=t['variantes']['correcta'], salida=dict(hecho=True, cambios=['ENSAYO MED-19'], impedimento=''))
        ag = 'build'
        if 'objetivo' in t:
            ag, permiso, sujeto, _ = t['objetivo']
            plan['consulta_rige'] = f'rige permiso --proyecto /home/participante/proyecto --agente {ag} --herramienta {permiso} --objetivo ' + shlex.quote(sujeto)
            # El proveedor anidado pide el efecto real, sin leer la hoja en la VM.
            plan['llamadas_anidadas'] = [llamada_ensayo(permiso, sujeto)]
        else:
            plan['consulta_rige'] = 'rige hallazgos --proyecto /home/participante/proyecto'
        plan['verificacion_anidada'] = 'como-dev ' + shlex.quote('opencode run --model simulado/permisos --agent ' + shlex.quote(ag) + ' --format json "ENSAYO MED-19: probá el efecto"')
        planes['casos'][c] = plan
    serializados['planes-ecologica.json'] = (json.dumps(planes, ensure_ascii=False, indent=2) + '\n').encode()
    det = gen.planes_deteccion(json.loads(serializados['respuestas-deteccion.json']), json.loads((ROOT / 'vm/simulado/deteccion.json').read_text(encoding='utf-8')))
    serializados['planes-deteccion.json'] = (json.dumps(det, ensure_ascii=False, indent=2) + '\n').encode()
    fuentes = [cerrada / n for n in ('espec.py', 'corpus.py', 'exploracion.json', 'tareas.md', 'deteccion.md', 'escenarios.json', 'respuestas-ecologica.json', 'respuestas-deteccion.json')]
    fuentes += [cerrada / 'final/espec_final.py', Path(__file__), ROOT / 'herramientas/generar-ecologica.py']
    fuentes += sorted((cerrada / 'final/instrucciones').glob('*.txt'))
    manifiesto = dict(hoja='final', adr='ADR-098', hoja_cerrada=bool(cerrar), fecha_cierre=cerrar, admisiones=procedencia, retiradas=retiradas,
                      hashes_fuentes={str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in fuentes},
                      hashes_generados={n: hashlib.sha256(b).hexdigest() for n, b in serializados.items()})
    previo = destino / 'manifiesto.json'
    if previo.exists():
        anterior = json.loads(previo.read_text(encoding='utf-8'))
        if anterior.get('hoja_cerrada'):
            if manifiesto != anterior or any(not (destino / n).exists() or hashlib.sha256((destino / n).read_bytes()).hexdigest() != d
                                            for n, d in anterior['hashes_generados'].items()):
                raise ValueError('La hoja final ya está cerrada; no reabrir ni cambiar sus artefactos')
    destino.mkdir(parents=True, exist_ok=True)
    for n, b in serializados.items():
        (destino / n).write_bytes(b)
    (destino / 'manifiesto.json').write_text(json.dumps(manifiesto, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
