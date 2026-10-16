#!/usr/bin/env python3
"""Admite MED-11 solo con base, correcta e ingenuas confirmadas por ejecución."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'herramientas'))
from corregir_ecologica import corregir, esperado_objetivo


def leer_captura(carpeta):
    datos = {f.stem[7:]: json.loads(f.read_text(encoding='utf-8')) for f in carpeta.glob('agente-*.json')}
    if (carpeta / 'archivos.json').exists():
        datos['__archivos__'] = json.loads((carpeta / 'archivos.json').read_text(encoding='utf-8'))
    if not all(isinstance(dato, dict) for dato in datos.values()):
        raise ValueError('Formato de captura inválido.')
    return datos


def evaluar(tareas, root):
    filas = []
    candidatas = {tid: t for tid, t in tareas.items() if tid.startswith(('N-', 'S-')) or 'candidato' in t}
    casos = list(candidatas)
    if (root / 'captura.json').exists():
        casos = json.loads((root / 'captura.json').read_text(encoding='utf-8'))['casos']
        if (not isinstance(casos, list) or not casos or not all(isinstance(c, str) for c in casos)
                or len(set(casos)) != len(casos) or not set(casos) <= candidatas.keys()):
            raise ValueError('Selección de captura inválida.')
    for tid in casos:
        t = candidatas[tid]
        def error_captura(variante, motivo):
            filas.append(dict(tarea=tid, candidato=t.get('candidato', tid),
                tipo='valor' if 'valor' in t else 'permiso', variante=variante,
                resultado='error de captura', motivo=motivo))
        error_tarea = root / tid / 'error.txt'
        if error_tarea.exists():
            error_captura('tarea', error_tarea.read_text(encoding='utf-8'))
            continue
        capturas, oraculos = {}, {}
        for variante in ['base', *t['variantes']]:
            carpeta = root / tid / variante
            try:
                if (carpeta / 'error.txt').exists():
                    raise ValueError((carpeta / 'error.txt').read_text(encoding='utf-8'))
                oraculos[variante] = json.loads((carpeta / 'oraculo.json').read_text(encoding='utf-8'))
                if not isinstance(oraculos[variante], dict):
                    raise ValueError('Formato de oráculo inválido.')
                capturas[variante] = leer_captura(carpeta)
            except (OSError, ValueError, TypeError) as error:
                error_captura(variante, str(error))
        if 'base' not in capturas:
            continue  # Ninguna variante puede contrastarse sin una base válida.
        for variante in t['variantes']:
            if variante not in capturas:
                continue
            r = corregir(dict(caso=tid, respuesta_textual='{"hecho":true,"cambios":[],"impedimento":""}'),
                t, capturas['base'], capturas[variante], dict(antes=oraculos['base'], despues=oraculos[variante]))
            if r.get('fallo_preparacion'):
                error_captura(variante, f'Evidencia incompleta: {r.get("motivo")}')
                continue
            if r['estado_antes']['objetivo'] == esperado_objetivo(t):
                raise ValueError(f'{tid}: objetivo ya cumplido en base')
            valido = r['resultado'] == 'correcta' if variante == 'correcta' else (
                r['resultado'] == 'sin_efecto' or bool(r['colaterales']))
            if not valido:
                raise ValueError(f'{tid}/{variante}: no reproduce el contraste: {r}')
            filas.append(dict(tarea=tid, candidato=t.get('candidato', tid),
                tipo='valor' if 'valor' in t else 'permiso', variante=variante,
                **{k: r[k] for k in ('resultado', 'objetivo_alcanzado', 'colaterales', 'estado_antes', 'estado_despues', 'discrepancia_oraculo')}))
    return filas


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('capturas', type=Path)
    a = p.parse_args()
    # Una evaluación fallida nunca deja una admisión anterior aparentemente vigente.
    admision = a.capturas / 'admision.json'
    if admision.exists():
        admision.replace(a.capturas / f'admision-anterior-{os.getpid()}.json')
    spec = importlib.util.spec_from_file_location('med11', ROOT / 'ecologica/espec.py')
    m = importlib.util.module_from_spec(spec)
    sys.dont_write_bytecode = True
    spec.loader.exec_module(m)
    filas = evaluar(m.T, a.capturas)
    errores = [r for r in filas if r['resultado'] == 'error de captura']
    hashes = {str(f.relative_to(a.capturas)): hashlib.sha256(f.read_bytes()).hexdigest()
              for f in sorted(a.capturas.rglob('*')) if f.is_file() and
              (f.suffix == '.json' or f.name == 'error.txt') and not f.name.startswith('admision')}
    salida = dict(adr='ADR-095', valido=not errores, filas=filas, errores_captura=errores, hashes_evidencia=hashes,
        hash_espec=hashlib.sha256((ROOT / 'ecologica/espec.py').read_bytes()).hexdigest())
    admision.write_text(json.dumps(salida, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for r in filas:
        print(r['tarea'], r['variante'], r['resultado'])
    return int(bool(errores))


if __name__ == '__main__':
    sys.exit(main())
