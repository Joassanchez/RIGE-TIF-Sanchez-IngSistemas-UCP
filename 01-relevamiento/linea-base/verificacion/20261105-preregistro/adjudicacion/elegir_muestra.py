#!/usr/bin/env python3
"""Elige la muestra de CRITERIO-muestra.md y genera la planilla a ciegas.

Lee de los CSV de adjudicación solo `id` y `hash_respuesta`; nunca `resultado` ni `motivo`.
Uso: python -B elegir_muestra.py <carpeta adjudicación> <analisis tar.gz> <respuestas.json> <destino>
"""
import csv
import json
import random
import sys
import tarfile
from collections import defaultdict
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font
from openpyxl.worksheet.datavalidation import DataValidation

SEMILLA = 20261105
DECISIVOS = {'C-3b', 'C-3d', 'C-4e'}
POR_ESTRATO = 10


def leer_ids(carpeta):
    filas = []
    for nombre in ('adjudicaciones-LB-principal-sol.csv', 'adjudicaciones-LB-charles-sol.csv'):
        with open(Path(carpeta) / nombre, encoding='utf-8', newline='') as f:
            for fila in csv.DictReader(f):
                partes = fila['id'].split('|')
                filas.append(dict(id=fila['id'], hash=fila['hash_respuesta'], ejecutor=partes[1],
                                  caso=partes[4], repeticion=int(partes[5])))
    return filas


def elegir(filas):
    rnd = random.Random(SEMILLA)
    elegidas = []
    for estrato, pertenece in (('A', lambda f: f['caso'] in DECISIVOS), ('B', lambda f: f['caso'] not in DECISIVOS)):
        grupos = defaultdict(list)
        for fila in sorted(filter(pertenece, filas), key=lambda f: f['id']):
            grupos[(fila['caso'], fila['ejecutor'])].append(fila)
        for grupo in grupos.values():
            rnd.shuffle(grupo)
        claves = sorted(grupos)
        rnd.shuffle(claves)
        tomadas = 0
        while tomadas < POR_ESTRATO:
            for clave in claves:
                if grupos[clave] and tomadas < POR_ESTRATO:
                    elegidas.append(dict(grupos[clave].pop(), estrato=estrato))
                    tomadas += 1
    rnd.shuffle(elegidas)
    for n, fila in enumerate(elegidas, 1):
        fila['codigo'] = f'P-{n:02d}'
    return elegidas


def main():
    carpeta, tar, respuestas, destino = sys.argv[1:5]
    destino = Path(destino)
    destino.mkdir(parents=True, exist_ok=True)
    elegidas = elegir(leer_ids(carpeta))
    hoja = json.load(open(respuestas, encoding='utf-8'))['casos']
    with tarfile.open(tar) as t:
        analisis = json.load(t.extractfile('20261014-adjudicacion-autor/analisis-LB/analisis.json'))
    texto = {r['hash_respuesta']: r['respuesta_textual'] for r in analisis['ejecuciones']}
    wb = Workbook()
    ws = wb.active
    ws.title = 'Adjudicación'
    ws.append(['Código', 'Pregunta', 'Respuesta exigida', 'Fuente aceptada', 'Fuente rechazada',
               'Respuesta del agente', 'Resultado (correcta, parcial o incorrecta)', 'Motivo'])
    for fila in elegidas:
        c = hoja[fila['caso']]
        ws.append([fila['codigo'], c['pregunta'], c.get('criterio_respuesta_original', ''),
                   c.get('criterio_fuente_original', ''), c.get('criterio_rechazo_original', ''),
                   texto[fila['hash']], None, None])
    anchos = dict(A=9, B=38, C=22, D=30, E=24, F=80, G=18, H=36)
    for col, ancho in anchos.items():
        ws.column_dimensions[col].width = ancho
    for fila in ws.iter_rows():
        for celda in fila:
            celda.alignment = Alignment(wrap_text=True, vertical='top')
    for celda in ws[1]:
        celda.font = Font(bold=True)
    ws.freeze_panes = 'B2'
    validacion = DataValidation(type='list', formula1='"correcta,parcial,incorrecta"', allow_blank=True)
    ws.add_data_validation(validacion)
    validacion.add(f'G2:G{len(elegidas) + 1}')
    guia = wb.create_sheet('Criterio')
    for linea in (
            'Adjudicación a mano del autor. Ningún modelo participa en esta decisión.',
            'La fuente se exige en el nivel que pide la pregunta. En las preguntas de «qué regla», basta la regla determinante correcta, salvo que se la ubique en un lugar que la hoja rechaza.',
            'Una decisión escrita con otras palabras se acepta si su significado es inequívoco.',
            'Completar las columnas G y H de cada fila. No hace falta abrir ningún otro archivo.'):
        guia.append([linea])
    guia.column_dimensions['A'].width = 120
    wb.save(destino / 'planilla-adjudicacion.xlsx')
    with open(destino / 'clave-muestra.csv', 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['codigo', 'estrato', 'id', 'hash_respuesta'])
        for fila in sorted(elegidas, key=lambda x: x['codigo']):
            w.writerow([fila['codigo'], fila['estrato'], fila['id'], fila['hash']])
    print(len(elegidas), 'filas')


if __name__ == '__main__':
    main()
