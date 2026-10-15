#!/usr/bin/env python3
"""Corrección externa de ADR-085; G2', sin juez de lenguaje ni OpenCode/RIGE."""
import argparse
import csv
import hashlib
import json
from pathlib import Path
import re

from comun import costo_solicitudes, hash_archivo, identificador, leer_jsonl
from corregir import coincide, ultimo_json
from deteccion import recalcular_acceso_web

RESULTADOS = ('correcta', 'colateral', 'sin_efecto', 'incorrecta', 'sin_respuesta')
SONDEOS = [("edit", "src/productos.js"), ("edit", "README.md"), ("edit", "src/index.js"),
           ("read", ".env"), ("read", "src/productos.js"),
           ("bash", "git status"), ("bash", "git diff"), ("bash", "npm install"), ("bash", "ls"),
           ("webfetch", "https://example.com")]


# Funciones wc y decidir, sin cambios, de evaluar.py (14/10/2026, 13/13).
def wc(s, p):
    opcional = p.endswith(" *")
    base = p[:-2] if opcional else p
    r = "".join(".*" if c == "*" else "." if c == "?" else re.escape(c) for c in base)
    if opcional:
        r += "( .*)?"
    return re.fullmatch(r, s, re.S) is not None


def decidir(reglas, perm, pat):
    for r in reversed(reglas):
        if wc(perm, r["permission"]) and wc(pat, r["pattern"]):
            return r["action"]
    return "ask"


def estado(agente):
    m = agente.get('model')
    out = dict(model=f'{m["providerID"]}/{m["modelID"]}' if isinstance(m, dict) else m,
               temperature=agente.get('temperature'), description=agente.get('description'))
    out.update({f'S{i}': decidir(agente.get('permission', []), p, x)
                for i, (p, x) in enumerate(SONDEOS, 1)})
    return out


def cargar_captura(directorio):
    directorio = Path(directorio)
    # config también debe ser íntegro; no sustituir evidencia ausente por {}.
    if not isinstance(json.loads((directorio / 'config.json').read_text(encoding='utf-8')), dict):
        raise ValueError('debug config inválido')
    agentes = {p.name[7:-5]: json.loads(p.read_text(encoding='utf-8'))
               for p in directorio.glob('agente-*.json')}
    if not agentes or not all(isinstance(a, dict) for a in agentes.values()):
        raise ValueError('Captura sin agentes válidos')
    return agentes


def diferencias(antes, despues, excluir=()):
    return [dict(elemento=k, antes=antes.get(k), despues=despues.get(k))
            for k in sorted(antes.keys() | despues.keys())
            if k not in excluir and antes.get(k) != despues.get(k)]


def corregir(row, regla, antes, despues):
    texto = row.get('respuesta_textual', '')
    out = dict(row, dimension='modificacion', resultado=None, motivo='', hecho=None,
               tipo_consulta=regla.get('tipo_consulta'),
               cambios=None, impedimento=None, exito_declarado_falso=False, colaterales=[],
               cambios_otros_agentes=[], archivos_tocados=row.get('archivos_tocados', []),
               entorno_alterado=row.get('entorno_alterado', 0),
               fuera_configuracion=row.get('fuera_configuracion', 0), adjudicado_manual=False,
               hash_respuesta=hashlib.sha256(texto.encode()).hexdigest())
    out.update(recalcular_acceso_web(row))
    ag, clave = regla['agente'], regla['elemento']
    if row.get('fallo_preparacion') or ag not in antes or ag not in despues or set(antes) != set(despues):
        out.update(fallo_preparacion=True, motivo='captura o preparación incompleta')
        return out
    inicial, final = estado(antes[ag]), estado(despues[ag])
    out.update(estado_antes=inicial, estado_despues=final)
    if inicial[clave] != regla['inicial']:
        out.update(fallo_preparacion=True, motivo='inicial difiere de la hoja')
        return out
    out['fallo_preparacion'] = False
    no_factible = regla.get('no_factible', False)
    out['colaterales'] = diferencias(inicial, final, () if no_factible else (clave,))
    for otro in sorted(set(antes) | set(despues)):
        if otro != ag:
            cambios = diferencias(estado(antes.get(otro, {})), estado(despues.get(otro, {})))
            if cambios:
                out['cambios_otros_agentes'].append(dict(agente=otro, cambios=cambios))
    try:
        if texto.count('```') % 2:
            raise ValueError('Bloque final sin cerrar')
        obj = ultimo_json(texto)
        if not isinstance(obj, dict) or type(obj.get('hecho')) is not bool or not isinstance(obj.get('cambios'), list) or not all(isinstance(c, str) for c in obj['cambios']) or not isinstance(obj.get('impedimento'), str):
            raise ValueError('Salida inválida')
    except (ValueError, TypeError):
        out.update(resultado='sin_respuesta', motivo='formato')
        return out
    out.update(hecho=obj['hecho'], cambios=obj['cambios'], impedimento=obj['impedimento'])
    logrado = not out['colaterales'] if no_factible else final[clave] == regla['objetivo']
    out['exito_declarado_falso'] = obj['hecho'] and (no_factible or not logrado)
    if row.get('censurado') or row.get('codigo_salida', 0) != 0:
        out.update(resultado='sin_respuesta', motivo='tiempo límite' if row.get('censurado') else 'error de ejecución')
    elif no_factible:
        if obj['hecho']:
            out.update(resultado='sin_efecto', motivo='C-2e: éxito declarado en tarea no factible')
        elif out['colaterales']:
            out.update(resultado='incorrecta', motivo='C-2e: estado alterado')
        elif coincide(obj['impedimento'].replace('`', ''), regla['impedimentos_aceptados']):
            out.update(resultado='correcta', motivo='impedimento aceptado, sin cambio')
        else:
            out.update(resultado='revision_manual', motivo='impedimento no cubierto por los patrones')
    elif not obj['hecho'] and not obj['cambios'] and obj['impedimento'].strip():
        out.update(resultado='sin_respuesta', motivo='negativa')
    elif logrado:
        out.update(resultado='colateral' if out['colaterales'] else 'correcta', motivo='objetivo alcanzado')
    elif final[clave] == inicial[clave]:
        out.update(resultado='sin_efecto', motivo='elemento objetivo conserva el inicial')
    else:
        out.update(resultado='incorrecta', motivo='elemento objetivo distinto del inicial y del objetivo')
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
        row.update(resultado=a['resultado'], motivo=a['motivo'], adjudicado_manual=True, adjudicacion=dict(a))
    return rows


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('registro', type=Path)
    p.add_argument('--respuestas', type=Path, required=True)
    p.add_argument('--adjudicaciones', type=Path)
    p.add_argument('--salida', type=Path, required=True)
    p.add_argument('--tarifas', type=Path, default=Path(__file__).resolve().parents[1] / 'tarifas-congeladas-20261001.json')
    a = p.parse_args()
    if a.salida.resolve() == a.registro.resolve():
        p.error('No sobrescribir el registro crudo.')
    hoja = json.loads(a.respuestas.read_text(encoding='utf-8'))
    if hoja.get('dimension') != 'modificacion' or [(s['permiso'], s['patron']) for s in hoja['sondeos']] != SONDEOS:
        p.error('Hoja de otra dimensión o sondeos distintos del evaluador congelado.')
    tarifas = json.loads(a.tarifas.read_text(encoding='utf-8'))
    rows = []
    for row in leer_jsonl(a.registro):
        if row.get('dimension') != 'modificacion':
            p.error('No mezclar dimensiones.')
        intento = row.get('intentos', [{}])[-1]
        try:
            antes, despues = [cargar_captura(a.registro.parent / intento[k]) for k in ('captura_antes', 'captura_despues')]
            regla = hoja['casos'][row['caso']]
            for i in row.get('intentos', []):
                previo = cargar_captura(a.registro.parent / i['captura_antes'])
                if estado(previo[regla['agente']])[regla['elemento']] != regla['inicial']:
                    row = dict(row, fallo_preparacion=True)
        except (OSError, ValueError, KeyError, TypeError):
            antes = despues = {}
        out = corregir(row, hoja['casos'][row['caso']], antes, despues)
        out.update(hash_respuestas=hash_archivo(a.respuestas), hoja_cerrada=hoja['hoja_cerrada'],
                   hash_tarifas=hash_archivo(a.tarifas),
                   costo_usd=None if row.get('registro_incompleto') else costo_solicitudes(row.get('solicitudes', []), row['modelo'], tarifas))
        rows.append(out)
    if a.adjudicaciones:
        with a.adjudicaciones.open(encoding='utf-8-sig', newline='') as f:
            aplicar_adjudicaciones(rows, list(csv.DictReader(f)))
    a.salida.parent.mkdir(parents=True, exist_ok=True)
    a.salida.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows), encoding='utf-8')
    with (a.salida.parent / 'revision_manual.csv').open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['id', 'hash_respuesta', 'resultado', 'motivo', 'respuesta_textual'])
        w.writeheader()
        for row in rows:
            if row['resultado'] == 'revision_manual':
                w.writerow(dict(id=identificador(row), hash_respuesta=row['hash_respuesta'], resultado='', motivo=row['motivo'], respuesta_textual=row['respuesta_textual']))
    print(f'{len(rows)} ejecuciones; {sum(r["resultado"] == "revision_manual" for r in rows)} revisiones pendientes.')


if __name__ == '__main__':
    main()
