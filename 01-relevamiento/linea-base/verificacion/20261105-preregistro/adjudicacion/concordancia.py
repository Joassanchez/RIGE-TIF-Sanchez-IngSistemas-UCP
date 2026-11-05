#!/usr/bin/env python3
"""Concordancia entre la adjudicación manual del autor y la firmada (CRITERIO-muestra.md).

Uso: python -B concordancia.py <planilla.xlsx> <clave-muestra.csv> <carpeta adjudicación> [--salida <archivo.md>]
Se corre cuando la planilla está completa; rechaza una planilla con filas sin adjudicar.
"""
import argparse
import csv
from collections import Counter, defaultdict
from pathlib import Path

from openpyxl import load_workbook

CATEGORIAS = ('correcta', 'parcial', 'incorrecta')
UMBRAL = 0.85


def acuerdo(pares):
    return sum(a == b for a, b in pares) / len(pares)


def kappa(pares):
    """Kappa de Cohen; None si el azar esperado es 1 (una sola categoría en ambos)."""
    n, po = len(pares), acuerdo(pares)
    a, b = Counter(x for x, _ in pares), Counter(y for _, y in pares)
    pe = sum(a[c] * b[c] for c in CATEGORIAS) / (n * n)
    return None if pe == 1 else (po - pe) / (1 - pe)


def ac1(pares):
    """AC1 de Gwet, con las tres categorías posibles."""
    n, po = len(pares), acuerdo(pares)
    q = len(CATEGORIAS)
    a, b = Counter(x for x, _ in pares), Counter(y for _, y in pares)
    pi = [(a[c] + b[c]) / (2 * n) for c in CATEGORIAS]
    pe = sum(p * (1 - p) for p in pi) / (q - 1)
    return (po - pe) / (1 - pe)


def leer_planilla(ruta):
    ws = load_workbook(ruta, data_only=True)['Adjudicación']
    filas = {}
    for fila in ws.iter_rows(min_row=2, values_only=True):
        codigo, resultado, motivo = fila[0], fila[6], fila[7]
        resultado = (resultado or '').strip().lower()
        if resultado not in CATEGORIAS:
            raise SystemExit(f'{codigo}: falta adjudicar o el valor no es válido ({resultado!r}).')
        filas[codigo] = dict(autor=resultado, motivo=motivo or '')
    return filas


def leer_firmada(carpeta):
    filas = {}
    for nombre in ('adjudicaciones-LB-principal-sol.csv', 'adjudicaciones-LB-charles-sol.csv'):
        with open(Path(carpeta) / nombre, encoding='utf-8', newline='') as f:
            for fila in csv.DictReader(f):
                filas[fila['id']] = fila
    return filas


def error(valor):
    return valor != 'correcta'


def analizar(planilla, clave, firmada):
    datos = []
    for fila in clave:
        previa = firmada[fila['id']]
        if previa['hash_respuesta'] != fila['hash_respuesta']:
            raise SystemExit(f"{fila['codigo']}: el hash de la respuesta no coincide.")
        datos.append(dict(fila, autor=planilla[fila['codigo']]['autor'], motivo_autor=planilla[fila['codigo']]['motivo'],
                          firmada=previa['resultado']))
    if len(datos) != len(planilla):
        raise SystemExit('La planilla y la clave no tienen las mismas filas.')
    salida = dict(total=resumen(datos), filas=datos, discrepancias=[d for d in datos if d['autor'] != d['firmada']])
    salida['estratos'] = {e: resumen([d for d in datos if d['estrato'] == e]) for e in sorted({d['estrato'] for d in datos})}
    salida['cambios_de_caso'] = cambios_de_caso(datos, firmada)
    salida['extender_a_las_restantes'] = salida['total']['acuerdo'] < UMBRAL
    return salida


def resumen(datos):
    pares = [(d['autor'], d['firmada']) for d in datos]
    return dict(n=len(pares), acuerdo=acuerdo(pares), kappa=kappa(pares), ac1=ac1(pares), matriz=Counter(pares))


def cambios_de_caso(datos, firmada):
    """Caso con error en al menos 2 de 3 repeticiones, antes y con los valores del autor.

    Las repeticiones sin revisión manual no figuran en estos archivos: cuentan como
    correctas porque la corrección mecánica las aceptó (no integran las 61).
    """
    por_caso = defaultdict(dict)
    for ident, fila in firmada.items():
        partes = ident.split('|')
        por_caso[(partes[1], partes[4])][ident] = fila['resultado']
    cambios = []
    autor = {d['id']: d['autor'] for d in datos}
    for clave, filas in sorted(por_caso.items()):
        antes = sum(map(error, filas.values())) >= 2
        despues = sum(error(autor.get(i, v)) for i, v in filas.items()) >= 2
        if antes != despues:
            cambios.append(dict(ejecutor=clave[0], caso=clave[1], antes=antes, despues=despues))
    return cambios


def markdown(r):
    fmt = lambda v: 'indefinido (una sola categoría en ambos)' if v is None else f'{v:.3f}'
    lineas = ['# Concordancia de la adjudicación manual', '',
              '| Conjunto | n | Acuerdo | Kappa de Cohen | AC1 de Gwet |', '|---|---:|---:|---:|---:|']
    for nombre, v in [('Total, sin ponderar', r['total']), *[(f'Estrato {e}', v) for e, v in r['estratos'].items()]]:
        lineas.append(f"| {nombre} | {v['n']} | {v['acuerdo']:.1%} | {fmt(v['kappa'])} | {fmt(v['ac1'])} |")
    lineas += ['', '## Discrepancias', '']
    lineas += [f"- {d['codigo']} ({d['id']}): autor `{d['autor']}`, firmada `{d['firmada']}`. {d['motivo_autor']}" for d in r['discrepancias']] or ['Ninguna.']
    lineas += ['', '## Casos que cambian de clasificación', '']
    lineas += [f"- {c['ejecutor']} / {c['caso']}: con problema {c['antes']} → {c['despues']}. Recalcular la rama y declararlo." for c in r['cambios_de_caso']] or ['Ninguno.']
    lineas += ['', '## Regla fijada antes de adjudicar', '',
               (f"Acuerdo menor a {UMBRAL:.0%}: el autor adjudica también las 41 filas restantes." if r['extender_a_las_restantes']
                else f"Acuerdo de {UMBRAL:.0%} o más: la adjudicación delegada queda acreditada para esta muestra."), '']
    return '\n'.join(lineas)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('planilla')
    p.add_argument('clave')
    p.add_argument('carpeta')
    p.add_argument('--salida')
    a = p.parse_args()
    with open(a.clave, encoding='utf-8', newline='') as f:
        clave = list(csv.DictReader(f))
    texto = markdown(analizar(leer_planilla(a.planilla), clave, leer_firmada(a.carpeta)))
    if a.salida:
        Path(a.salida).write_text(texto, encoding='utf-8')
    else:
        print(texto.encode('ascii', 'backslashreplace').decode())


if __name__ == '__main__':
    main()
