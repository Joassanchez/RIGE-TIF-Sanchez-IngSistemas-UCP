"""Prepara entradas verificables para docker cp, sin ejecutar Docker."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
ENVOLTORIO = '''#!/bin/bash
set -euo pipefail
printf -v cmd '%q ' /opt/rige/rige "$@"
exec como-dev "$cmd"
'''


def preparar(destino, brazo, binario=None, etiqueta=None):
    destino = Path(destino)
    if destino.exists():
        raise ValueError('El directorio de entradas debe ser nuevo')
    con = brazo in ('indicado', 'disponible')
    if con and (not binario or not Path(binario).is_file() or not etiqueta):
        raise ValueError('Faltan RIGE_BINARIO y RIGE_ETIQUETA para el brazo con RIGE')
    entradas = destino / 'arnes'
    entradas.mkdir(parents=True)
    shutil.copyfile(ROOT / 'vm/medir.sh', entradas / 'medir.sh')
    shutil.copytree(ROOT / 'vm/simulado', entradas / 'simulado', ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    shutil.copytree(ROOT / 'ecologica/final/instrucciones', entradas / 'instrucciones-final')
    for dimension in ('ecologica', 'deteccion'):
        shutil.copyfile(ROOT / f'ecologica/final/planes-{dimension}.json', entradas / f'simulado/final-{dimension}.json')
    # Un checkout de Windows puede tener CRLF: normalizar solo el código de
    # la copia para Linux, antes de calcular hashes. No tocar instrucciones,
    # planes, fuentes originales ni el binario.
    for path in entradas.rglob('*'):
        if path.is_file() and path.suffix in ('.sh', '.py', '.mjs'):
            path.write_bytes(path.read_bytes().replace(b'\r\n', b'\n'))
    inventario = dict(archivos={p.relative_to(entradas).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                              for p in sorted(entradas.rglob('*')) if p.is_file()})
    if con:
        shutil.copyfile(binario, destino / 'rige-binario')
        envoltorio = ENVOLTORIO.encode('utf-8').replace(b'\r\n', b'\n')
        (destino / 'rige-wrapper').write_bytes(envoltorio)
        inventario['rige'] = dict(hash_rige=hashlib.sha256(Path(binario).read_bytes()).hexdigest(), etiqueta_rige=etiqueta,
                                 hash_wrapper_rige=hashlib.sha256(envoltorio).hexdigest())
    path = entradas / 'entradas-final.json'
    path.write_bytes((json.dumps(inventario, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
    return hashlib.sha256(path.read_bytes()).hexdigest()


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--destino', type=Path, required=True)
    p.add_argument('--brazo', choices=['LB', 'sin_rige', 'indicado', 'disponible', 'probar'], required=True)
    p.add_argument('--binario', type=Path)
    p.add_argument('--etiqueta')
    a = p.parse_args()
    try:
        print(preparar(a.destino, a.brazo, a.binario, a.etiqueta))
    except (ValueError, OSError) as error:
        p.error(str(error))
