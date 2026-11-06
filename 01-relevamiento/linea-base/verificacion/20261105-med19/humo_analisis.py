#!/usr/bin/env python3
"""Humo del análisis sobre copias reetiquetadas; no produce una medición."""
import argparse
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]


def main():
    print('NO ES UNA MEDICIÓN: humo con copias de ensayo reetiquetadas.', flush=True)
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--ensayo', type=Path, required=True)
    p.add_argument('--base', type=Path, required=True)
    p.add_argument('--admision', type=Path, required=True)
    p.add_argument('--destino', type=Path, required=True)
    a = p.parse_args()
    # Un destino nuevo evita mezclar humos y sobrescribir entradas por accidente.
    if a.destino.resolve() == a.ensayo.resolve() or a.destino.resolve().is_relative_to(a.ensayo.resolve()):
        p.error('El destino debe estar fuera del ensayo')
    fuentes = sorted(a.ensayo.glob('*/unida/corregido.jsonl'))
    if not fuentes:
        p.error('No hay filas de ensayo en */unida/corregido.jsonl')
    a.destino.mkdir(parents=True, exist_ok=False)
    copias = []
    for fuente in fuentes:
        tanda = fuente.parents[1].name
        filas = []
        for linea in fuente.read_text(encoding='utf-8').splitlines():
            if not linea.strip():
                continue
            r = json.loads(linea)
            if r['brazo'] == 'LB' or (tanda == 'eco-sin_rige' and not r['caso'].startswith('R-')):
                continue
            filas.append(dict(r, ensayo=False, modelo='openai/gpt-6.1-sol', k=3))
        if filas:
            copia = a.destino / 'copias' / tanda / 'unida/corregido.jsonl'
            copia.parent.mkdir(parents=True)
            copia.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in filas), encoding='utf-8')
            copias.append(str(copia))
    return subprocess.run([sys.executable, '-B', str(ROOT / 'herramientas/analizar_final.py'),
        '--base', str(a.base), '--admision', str(a.admision), '--finales', *copias,
        '--destino', str(a.destino / 'analisis')]).returncode


if __name__ == '__main__':
    sys.exit(main())
