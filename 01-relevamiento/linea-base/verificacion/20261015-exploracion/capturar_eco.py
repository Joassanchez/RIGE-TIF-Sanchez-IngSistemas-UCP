#!/usr/bin/env python3
"""Verificación nativa MED-11 sin agente de pago. Ejecutar solo en contenedor nuevo."""
import argparse
from copy import deepcopy
import importlib.util
import hashlib
import json
import os
from pathlib import Path
import sys
from types import SimpleNamespace
import traceback

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'vm/simulado'))
import ecologica as arnes


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--salida', type=Path, required=True)
    p.add_argument('--casos', help='Ids de tarea separados por comas; por defecto todos los candidatos activos.')
    a = p.parse_args()
    a.salida = a.salida.resolve()
    if a.salida.exists():
        p.error('La salida debe ser nueva; conservar la evidencia anterior.')
    spec = importlib.util.spec_from_file_location('med11_espec', ROOT / 'ecologica/espec.py')
    modulo = importlib.util.module_from_spec(spec)
    sys.dont_write_bytecode = True
    spec.loader.exec_module(modulo)
    tareas = {tid: t for tid, t in modulo.T.items() if tid.startswith(('N-', 'S-')) or 'candidato' in t}
    casos = list(tareas) if a.casos is None else [c.strip() for c in a.casos.split(',')]
    if not casos or len(set(casos)) != len(casos) or not set(casos) <= tareas.keys():
        p.error('--casos requiere ids activos, sin vacíos ni duplicados.')
    a.salida.mkdir(parents=True)
    errores = []
    manifiesto = dict(casos=casos, errores=errores,
        hash_espec=hashlib.sha256((ROOT / 'ecologica/espec.py').read_bytes()).hexdigest())
    arnes.guardar(a.salida / 'captura.json', manifiesto)
    h = SimpleNamespace(BASE=Path('/opt/linea-base'),
        PATRON_ENTORNO=r'# >>> entorno local >>>\n.*?# <<< entorno local <<<\n?')
    os.environ.update(OPENCODE_DISABLE_AUTOUPDATE='1', OPENCODE_DISABLE_MODELS_FETCH='1')
    def registrar_error(tid, variante, carpeta):
        carpeta.mkdir(parents=True, exist_ok=True)
        path = carpeta / 'error.txt'
        path.write_text(traceback.format_exc(), encoding='utf-8')
        errores.append(dict(tarea=tid, variante=variante, archivo=path.relative_to(a.salida).as_posix()))
        arnes.guardar(a.salida / 'captura.json', manifiesto)
        print(tid, variante, 'error de captura:', path, file=sys.stderr, flush=True)

    for tid in casos:
        tarea = tareas[tid]
        try:
            variantes = [('base', {}), *tarea['variantes'].items()]
        except Exception:
            registrar_error(tid, 'tarea', a.salida / tid)
            continue
        for variante, cambios in variantes:
            carpeta = a.salida / tid / variante
            try:
                carpeta.mkdir(parents=True)
                sondas = list(dict.fromkeys(tuple(s[:3]) for s in
                    [tarea['objetivo'], *tarea.get('objetivos_adicionales', []), *tarea['guardas']])) if 'objetivo' in tarea else []
                escenario = dict(archivos={**tarea['archivos'], **cambios},
                    env={'OPENCODE_DISABLE_AUTOUPDATE': '1', 'OPENCODE_DISABLE_MODELS_FETCH': '1', **tarea.get('env', {})},
                    directorio=tarea.get('directorio', ''), tarea=tarea['tarea'])
                os.chdir('/tmp')  # preparar reconstruye el proyecto.
                arnes.preparar(deepcopy(escenario), h, sondas)
                agentes = sorted({s[0] for s in sondas}) if sondas else [tarea['valor'][0]]
                captura = arnes.capturar(carpeta / 'captura', 'nativa', agentes, escenario['directorio'])
                for path in captura.glob('agente-*.json'):
                    (carpeta / path.name).write_bytes(path.read_bytes())
                (carpeta / 'archivos.json').write_bytes((captura / 'archivos.json').read_bytes())
                datos = arnes.oraculo(carpeta / 'captura', 'ejecucion', sondas, escenario['directorio'], h) if sondas else {}
                arnes.guardar(carpeta / 'oraculo.json', datos)
                print(tid, variante, 'capturada', flush=True)
            except Exception:
                registrar_error(tid, variante, carpeta)
    return int(bool(errores))


if __name__ == '__main__':
    sys.exit(main())
