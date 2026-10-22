#!/usr/bin/env python3
"""Análisis de las dimensiones ecológica y detección (ADR-098)."""
import argparse
import json
from pathlib import Path

from comun import escribir_json, leer_jsonl


def cargar(paths, evidencia=False, reemplazos=(), filas_reemplazadas=None):
    rows = []
    for path in paths:
        rs = leer_jsonl(path)
        meta = path.parent / 'tanda.json'
        if meta.exists():
            tanda = json.loads(meta.read_text(encoding='utf-8'))
            if tanda.get('protocolo_oraculo') == 'MED-9c' or tanda.get('regla_acceso_web') == 'ADR-094':
                from corregir_ecologica import validar_tanda
                try:
                    sustituto = rs[0].get('aislamiento_final_sustituto') if rs else None
                    controles = ([Path(sustituto)] if isinstance(sustituto, str) and sustituto and
                                 all(r.get('aislamiento_final_sustituto') == sustituto for r in rs) else [])
                    validar_tanda(path.parent, Path(__file__).resolve().parents[1] / 'ecologica/respuestas-ecologica.json',
                                  controles_finales_sustitutos=controles)
                except (KeyError, OSError, ValueError, TypeError):
                    for r in rs:
                        r.update(fallo_preparacion=True, resultado=None)
            for r in rs:
                for k in ('k', 'fase', 'ensayo', 'recorte_declarado', 'dimension', 'sonda', 'hash_sonda'):
                    if k in tanda:
                        r.setdefault(k, tanda[k])
        if evidencia:
            for r in rs:
                r['_directorio_registro'] = str(path.parent.resolve())
        rows.extend(rs)
    campos = ('dimension', 'ejecutor', 'modelo', 'brazo', 'condicion', 'caso',
              'repeticion', 'ensayo', 'fuera_del_arbol')
    def clave(r):
        return tuple(bool(r.get(k)) if k in ('ensayo', 'fuera_del_arbol') else
                     r.get(k, 'atribucion' if k == 'dimension' else None) for k in campos)
    sustituidas = set()
    for path in reemplazos:
        for nueva in cargar([path], evidencia=evidencia):
            key = clave(nueva)
            indices = [i for i, r in enumerate(rows) if clave(r) == key]
            if len(indices) != 1 or key in sustituidas:
                raise ValueError(f'Reemplazo sin original único o repetido: {key}')
            i = indices[0]
            if not rows[i].get('registro_incompleto'):
                raise ValueError(f'Reemplazo de fila completa no permitido: {key}')
            if filas_reemplazadas is not None:
                filas_reemplazadas.append(dict(archivo_reemplazo=str(path), original=rows[i], reemplazo=nueva))
            rows[i] = nueva
            sustituidas.add(key)
    return rows



def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('registros', nargs='+', type=Path)
    parser.add_argument('--dimension', choices=['ecologica', 'deteccion'], required=True)
    parser.add_argument('--complemento', nargs='+', type=Path, default=[], help='Registros corregidos de la otra dimensión para la rama de respaldo.')
    parser.add_argument('--reemplazo', action='append', type=Path, default=[], help='Sustituir filas incompletas; se puede repetir.')
    parser.add_argument('--destino', type=Path, required=True)
    args = parser.parse_args()
    filas_reemplazadas = []
    try:
        rows = cargar(args.registros, reemplazos=args.reemplazo,
                      filas_reemplazadas=filas_reemplazadas)
    except ValueError as exc:
        parser.error(str(exc))
    from analizar_ecologica import analizar_med9, markdown_med9
    datos = analizar_med9(rows, args.dimension, cargar(args.complemento))
    datos['filas_reemplazadas'] = filas_reemplazadas
    args.destino.mkdir(parents=True, exist_ok=True)
    escribir_json(args.destino / 'analisis.json', datos)
    (args.destino / 'informe.md').write_text(markdown_med9(datos), encoding='utf-8')
    print(f'informe.md y analisis.json en {args.destino}')


if __name__ == '__main__':
    main()
