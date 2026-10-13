#!/usr/bin/env python3
"""Corrección determinista externa; adjudicaciones independientes y auditables."""
import argparse
import csv
import hashlib
import json
import re
from pathlib import Path

from comun import RESULTADOS, costo_solicitudes, hash_archivo, identificador, leer_jsonl


def normalizar(value):
    return str(value).strip().lower().replace('`', '')


def ultimo_json(texto):
    """Último objeto JSON superior; no rescata uno anterior si el último falla."""
    bloques = re.findall(r'```(?:json)?\s*([\s\S]*?)```', texto, re.I)
    if bloques:
        return json.loads(bloques[-1])
    decoder = json.JSONDecoder()
    objetos = []
    i = 0
    while i < len(texto):
        if texto[i] != '{':
            i += 1
            continue
        obj, fin = decoder.raw_decode(texto[i:])
        objetos.append(obj)
        i += fin
    if not objetos:
        raise ValueError('No hay objeto JSON final.')
    return objetos[-1]


def coincide(texto, grupos):
    return any(all(re.search(p, texto, re.I) for p in grupo) for grupo in grupos)


def valor(value, esperado, sinonimos):
    value = normalizar(value)
    return value in [normalizar(esperado), *sinonimos.get(normalizar(esperado), [])]


def separar(value, nombres):
    if isinstance(value, dict):
        limpio = {normalizar(k): v for k, v in value.items()}
        limpio.setdefault('edición', limpio.get('edicion', limpio.get('edit')))
        return [limpio.get(n) for n in nombres]
    pedazos = str(value).split(';')
    if len(pedazos) != len(nombres):
        return None
    return [p.split(':', 1)[1].strip() if p.strip().lower().startswith(n + ':') else p.strip() for n, p in zip(nombres, pedazos)]


def corregir(row, regla):
    out = dict(row, respuesta=None, fuente=None, resultado='sin_respuesta', motivo='',
               sigue_documentacion=False, adjudicado_manual=False)
    texto = row.get('respuesta_textual', '')
    out['hash_respuesta'] = hashlib.sha256(texto.encode()).hexdigest()
    try:
        obj = ultimo_json(texto)
        if not isinstance(obj, dict) or not all(k in obj for k in ('respuesta', 'fuente')):
            raise ValueError('Campos requeridos ausentes.')
        if not isinstance(obj['respuesta'], (str, dict)) or not isinstance(obj['fuente'], (str, dict)):
            raise ValueError('Campos de tipo inválido.')
        if obj['respuesta'] in ('', {}) or obj['fuente'] in ('', {}):
            raise ValueError('Campos vacíos.')
    except (ValueError, TypeError):
        out['motivo'] = 'formato'
        return out
    out.update(respuesta=obj['respuesta'], fuente=obj['fuente'])
    if row.get('codigo_salida', 0) not in (0, 124, 137):
        out['motivo'] = 'error de ejecución'
        return out
    if isinstance(obj['respuesta'], str) and normalizar(obj['respuesta']) in ('sin respuesta', 'me niego', 'no puedo responder'):
        out['motivo'] = 'negativa'
        return out
    out['sigue_documentacion'] = row['caso'] == 'C-3b' and valor(obj['respuesta'], 'deny', regla['sinonimos'])
    if regla['revision_manual']:
        out.update(resultado='revision_manual', motivo=regla['motivo_revision'])
        return out
    partes = regla.get('partes', [])
    if partes:
        nombres = [p['nombre'] for p in partes]
        valores = separar(obj['respuesta'], nombres)
        if valores is None:
            out.update(resultado='revision_manual', motivo='Respuesta compuesta sin asignación inequívoca por partes.')
            return out
        correcta = all(valor(v, p['respuesta'], regla['sinonimos']) for v, p in zip(valores, partes))
    else:
        correcta = valor(obj['respuesta'], regla['respuesta'], regla['sinonimos'])
    if not correcta:
        out.update(resultado='incorrecta', motivo='valor o decisión no coincide')
        return out
    if partes:
        fuentes = separar(obj['fuente'], nombres)
        if fuentes is None:
            if isinstance(obj['fuente'], str) and coincide(normalizar(obj['fuente']), regla['fuentes_rechazadas']):
                out.update(resultado='parcial', motivo='Una sola fuente para ambas partes: rechazada por la hoja.')
            else:
                out.update(resultado='revision_manual', motivo='Fuente compuesta sin asignación inequívoca por partes.')
            return out
        estados = [(coincide(normalizar(f), p['fuentes_aceptadas']), coincide(normalizar(f), p.get('fuentes_rechazadas', []))) for f, p in zip(fuentes, partes)]
        aceptada = all(a and not r for a, r in estados)
        rechazada = all(a != r for a, r in estados) and any(r for a, r in estados)
    else:
        if not isinstance(obj['fuente'], str):
            out.update(resultado='revision_manual', motivo='Fuente de caso simple en estructura no definida.')
            return out
        fuente = normalizar(obj['fuente'])
        aceptada = coincide(fuente, regla['fuentes_aceptadas'])
        rechazada = coincide(fuente, regla['fuentes_rechazadas'])
    if aceptada and not rechazada:
        out.update(resultado='correcta', motivo='valor y fuente coinciden')
    elif rechazada and not aceptada:
        out.update(resultado='parcial', motivo='valor correcto, fuente rechazada')
    else:
        out.update(resultado='revision_manual', motivo='Fuente no cubierta o patrones en conflicto.')
    return out


def aplicar_adjudicaciones(rows, adjudicaciones):
    pendientes = {identificador(r): r for r in rows if r['resultado'] == 'revision_manual'}
    vistos = set()
    for a in adjudicaciones:
        clave = a['id']
        if clave in vistos or clave not in pendientes:
            raise ValueError(f'Adjudicación duplicada o ajena a revisión: {clave}')
        vistos.add(clave)
        row = pendientes[clave]
        if a['resultado'] not in RESULTADOS or not a.get('motivo', '').strip() or a.get('hash_respuesta') != row['hash_respuesta']:
            raise ValueError(f'Adjudicación incompleta o evidencia distinta: {clave}')
        row.update(resultado=a['resultado'], motivo=a['motivo'], adjudicado_manual=True,
                   adjudicacion=dict(a))
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('registro', type=Path)
    parser.add_argument('--respuestas', type=Path, default=Path(__file__).resolve().parents[1] / 'respuestas.json')
    parser.add_argument('--adjudicaciones', type=Path, help='CSV independiente: id,hash_respuesta,resultado,motivo')
    parser.add_argument('--salida', type=Path, required=True)
    parser.add_argument('--tarifas', type=Path, default=Path(__file__).resolve().parents[1] / 'tarifas-congeladas-20261001.json')
    args = parser.parse_args()
    if args.salida.resolve() == args.registro.resolve():
        parser.error('La corrección no sobrescribe el registro crudo.')
    hoja = json.loads(args.respuestas.read_text(encoding='utf-8'))
    tarifas = json.loads(args.tarifas.read_text(encoding='utf-8'))
    rows = [corregir(r, hoja['casos'][r['caso']]) for r in leer_jsonl(args.registro)]
    if args.adjudicaciones:
        with args.adjudicaciones.open(encoding='utf-8-sig', newline='') as f:
            aplicar_adjudicaciones(rows, list(csv.DictReader(f)))
    for r in rows:
        r['tipo_consulta'] = hoja['casos'][r['caso']].get('tipo_consulta')
        r['documentada'] = hoja['casos'][r['caso']].get('documentada')
        r.update(hash_respuestas=hash_archivo(args.respuestas), hash_tarifas=hash_archivo(args.tarifas),
                 costo_usd=None if r.get('registro_incompleto') else costo_solicitudes(r.get('solicitudes', []), r['modelo'], tarifas))
    args.salida.parent.mkdir(parents=True, exist_ok=True)
    args.salida.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows), encoding='utf-8')
    with (args.salida.parent / 'revision_manual.csv').open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'hash_respuesta', 'resultado', 'motivo', 'respuesta_textual'])
        writer.writeheader()
        for r in rows:
            if r['resultado'] == 'revision_manual':
                writer.writerow(dict(id=identificador(r), hash_respuesta=r['hash_respuesta'], resultado='', motivo=r['motivo'], respuesta_textual=r['respuesta_textual']))
    print(f'{len(rows)} ejecuciones; {sum(r["resultado"] == "revision_manual" for r in rows)} revisiones pendientes.')


if __name__ == '__main__':
    main()
