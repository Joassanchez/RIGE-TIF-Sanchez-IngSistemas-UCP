#!/usr/bin/env python3
"""Análisis descriptivo por caso y reglas prerregistradas de ADR-079 / IV.3."""
import argparse
from collections import Counter, defaultdict
from fractions import Fraction
import json
import math
from pathlib import Path
from statistics import median

from comun import CASOS, RESULTADOS, TOKEN_FIELDS, costo_solicitudes, escribir_json, leer_jsonl, numero


def resumen(valores):
    valores = sorted(valores)
    if not valores:
        return {'mediana': None, 'ric': None, 'minimo': None, 'maximo': None}
    # Cuantiles por interpolación lineal explícita (descriptivos, sin IC).
    def q(p):
        pos = (len(valores) - 1) * p
        bajo = math.floor(pos)
        return valores[bajo] + (valores[math.ceil(pos)] - valores[bajo]) * (pos - bajo)
    return {'mediana': median(valores), 'ric': q(.75) - q(.25),
            'minimo': valores[0], 'maximo': valores[-1]}


def completa(row):
    return row.get('resultado') in RESULTADOS and all(numero(row.get(k)) for k in TOKEN_FIELDS) and not row.get('escenario_alterado') and not row.get('acceso_web') and not row.get('registro_incompleto')


def por_caso(rows):
    grupos = defaultdict(list)
    for r in rows:
        grupos[r['caso']].append(r)
    out = {}
    for caso, rs in sorted(grupos.items()):
        errores = sum(r['resultado'] != 'correcta' for r in rs)
        tokens = [sum(r[k] for k in TOKEN_FIELDS) for r in rs]
        out[caso] = {
            'n': len(rs), 'errores': errores, 'tasa_error': errores / len(rs),
            'con_problema': errores * 2 >= len(rs), 'resultados': dict(Counter(r['resultado'] for r in rs)),
            'tokens': resumen(tokens), 'tokens_ejecuciones': tokens,
            'censuradas': sum(bool(r.get('censurado')) for r in rs),
            'duracion_s': resumen([r['duracion_s'] for r in rs if numero(r.get('duracion_s'))]),
            'archivos_leidos': resumen([len(r.get('archivos_leidos', [])) for r in rs]),
            'invocaciones': resumen([len(r.get('herramientas', [])) for r in rs]),
            'sigue_documentacion': sum(bool(r.get('sigue_documentacion')) for r in rs) / len(rs),
            'fuente_observada': dict(Counter(f for r in rs for f in r.get('fuente_observada', []))),
            'negativas_por_recurso_retirado': [r['negativa_por_recurso_retirado'] for r in rs if r.get('negativa_por_recurso_retirado')],
        }
    return out


def conjunto(casos, ids):
    cs = [casos[c] for c in ids if c in casos]
    n = sum(c['n'] for c in cs)
    return {
        'casos': [c for c in ids if c in casos], 'n': n,
        'ib1_agregado': sum(c['errores'] for c in cs) / n if n else None,
        'ib1_promedio_casos': sum(c['tasa_error'] for c in cs) / len(cs) if cs else None,
        'casos_con_problema': sum(c['con_problema'] for c in cs),
        'nivel_tokens': median(c['tokens']['mediana'] for c in cs) if cs else None,
        'tokens_ejecuciones': resumen([t for c in cs for t in c['tokens_ejecuciones']]),
        'ib3_parciales': sum(c['resultados'].get('parcial', 0) for c in cs) / n if n else None,
        'censura': sum(c['censuradas'] for c in cs) / n if n else None,
    }


def descriptivas(rows):
    """Cruces descriptivos; no confundir procedencia declarada con ayuda usada."""
    def indicador(rs):
        validas = [r for r in rs if completa(r)]
        n = len(validas)
        return {'n': n, 'ib1': sum(r['resultado'] != 'correcta' for r in validas) / n if n else None,
                'tokens': resumen([sum(r[k] for k in TOKEN_FIELDS) for r in validas]),
                'ib2_duracion_s': resumen([r['duracion_s'] for r in validas if numero(r.get('duracion_s'))]),
                'ib4_archivos': resumen([len(r.get('archivos_leidos', [])) for r in validas]),
                'ib4_herramientas': resumen([len(r.get('herramientas', [])) for r in validas]),
                'costo_usd': sum(r['costo_usd'] for r in validas) if all(numero(r.get('costo_usd')) for r in validas) else None}
    out = {}
    for brazo in sorted({r['brazo'] for r in rows}):
        rs = [r for r in rows if r['brazo'] == brazo]
        out[brazo] = {
            'por_tipo': {tipo: indicador([r for r in rs if r.get('tipo_consulta') == tipo]) for tipo in ('valor', 'permiso')},
            'pares': {par: {c: indicador([r for r in rs if r['caso'] == c]) for c in par.split('/')} for par in ('C-3d/C-4c', 'C-4a/C-4b')},
            'introspeccion_vs_acierto': {str(usa): indicador([r for r in rs if bool(r.get('comandos_introspeccion')) == usa]) for usa in (True, False)},
            'fuente_observada': {f: indicador([r for r in rs if f in r.get('fuente_observada', [])]) for f in sorted({f for r in rs for f in r.get('fuente_observada', [])})},
            'documentacion': {v: indicador([r for r in rs if r.get('documentada') == v]) for v in sorted({r['documentada'] for r in rs if r.get('documentada')})},
            'cobertura_disponible': '[DATO PENDIENTE: completar etiquetas con evidencia antes del piloto; no inferir desde fuente observada]',
            'totales': indicador(rs),
        }
    return out


def iv3(casos):
    control = conjunto(casos, [c for c in casos if c.startswith('C-1')])
    objetivo = conjunto(casos, [c for c in casos if not c.startswith('C-1')])
    if objetivo['ib1_promedio_casos'] <= control['ib1_promedio_casos']:
        return {'resultado': 'Refuta', 'pendiente': ''}
    tasas = {f'C-{i}': conjunto(casos, [c for c in casos if c.startswith(f'C-{i}')])['ib1_promedio_casos'] for i in range(1, 5)}
    if tasas['C-3'] > max(t for c, t in tasas.items() if c != 'C-3'):
        return {'resultado': 'Reordena', 'pendiente': ''}
    if tasas['C-3'] == max(tasas.values()):
        # Empate de C-3 con la mayor tasa: cuenta como Reordena (decisión del autor, 13/10/2026).
        return {'resultado': 'Reordena', 'pendiente': '', 'nota': 'empate de C-3 con la mayor tasa, leído como Reordena'}
    return {'resultado': 'Confirma', 'pendiente': ''}


def rama(casos):
    control = conjunto(casos, [c for c in casos if c.startswith('C-1')])
    objetivo = conjunto(casos, [c for c in casos if not c.startswith('C-1')])
    p = objetivo['casos_con_problema']
    minimo = Fraction(len(objetivo['casos']), 3)
    if p >= minimo and objetivo['ib1_agregado'] > control['ib1_agregado']:
        return 'E'
    if p < minimo and objetivo['nivel_tokens'] >= 2 * control['nivel_tokens']:
        return 'C'
    if p:
        return 'P'  # Incluye >=1/3 con Refuta, independientemente de IV.3.
    return 'N'


def evaluar_final(lb, fin, elegida):
    ids = [c for c in lb if not c.startswith('C-1')]
    problemas = [c for c in ids if lb[c]['con_problema']]
    recuperados = [c for c in problemas if not fin[c]['con_problema']]
    retrocesos = [c for c in ids if not lb[c]['con_problema'] and fin[c]['con_problema']]
    reducciones = {c: (1 - fin[c]['tokens']['mediana'] / lb[c]['tokens']['mediana']) if lb[c]['tokens']['mediana'] else None for c in ids}
    mediana = median(reducciones.values()) if all(v is not None for v in reducciones.values()) else None
    error_lb = conjunto(lb, ids)['ib1_agregado']
    error_fin = conjunto(fin, ids)['ib1_agregado']
    requerido = math.ceil(Fraction(2 * len(problemas), 3))
    error_cumple = len(recuperados) >= requerido and not retrocesos and error_fin < error_lb
    tokens_cumple = mediana is not None and mediana >= (0 if elegida == 'E' else .30)
    if elegida == 'E':
        # ADR-079: en la rama E los tokens son criterio secundario; se informan y no anulan el principal.
        cumple = error_cumple
    elif elegida == 'C':
        cumple = tokens_cumple and not retrocesos and error_fin <= error_lb
    else:
        cumple = None
    return {'cumple': cumple, 'criterio_error_E': error_cumple if elegida == 'E' else None,
            'criterio_tokens': tokens_cumple if elegida in ('E', 'C') else None,
            'recuperados': recuperados, 'recuperaciones_requeridas': requerido,
            'retrocesos': {c: {'LB': lb[c], 'FIN': fin[c], 'causa': '[DATO PENDIENTE: adjudicar causa del retroceso con la traza]'} for c in retrocesos},
            'ib1_LB': error_lb, 'ib1_FIN': error_fin,
            'reducciones_tokens': reducciones, 'mediana_reducciones_tokens': mediana,
            'pendientes': ['[DECISIÓN PENDIENTE: reducción de tokens con denominador cero]'] if mediana is None else []}


def analizar_grupo(rows, esperados=CASOS):
    brazos = sorted(set(r['brazo'] for r in rows))
    agrupados = {(b, c): [r for r in rows if r['brazo'] == b and r['caso'] == c] for b in brazos for c in esperados}
    motivos = defaultdict(list)
    for (b, c), rs in agrupados.items():
        ks = {r.get('k') for r in rs}
        k = next(iter(ks)) if len(ks) == 1 else None
        if not isinstance(k, int) or k <= 0 or len(rs) != k or sorted(r.get('repeticion', 0) for r in rs) != list(range(1, k + 1)) or not all(completa(r) for r in rs):
            motivos[c].append(f'{b}: ejecución perdida, duplicada, contaminada, sin k o resultado/tokens incompletos')
    excluidos = sorted(motivos)
    comunes = [c for c in esperados if c not in excluidos]
    limpio = [r for r in rows if r['caso'] in comunes]
    tablas = {b: por_caso([r for r in limpio if r['brazo'] == b]) for b in brazos}
    invalidez = []
    if 'LB' not in brazos:
        invalidez.append('Falta línea de base propia.')
    if len({r.get('k') for r in rows}) != 1:
        invalidez.append('k no es uniforme dentro de la combinación ejecutor/modelo.')
    if len(excluidos) > 2:
        invalidez.append('Más de dos exclusiones.')
    if any(r.get('censurado') for r in rows if r['caso'].startswith('C-1')):
        invalidez.append('C-1 censurada, incluida una ejecución excluida.')
    for b, tabla in tablas.items():
        for c, datos in tabla.items():
            if c.startswith('C-1') and (datos['con_problema'] or datos['censuradas']):
                invalidez.append(f'{b}/{c}: C-1 con problema o censura.')
    out = {'valida': not invalidez, 'estado': 'medición inválida' if invalidez else 'válida',
           'motivos_invalidez': invalidez, 'exclusiones': dict(motivos), 'conjunto_comun': comunes,
           'rama': None, 'iv3': None, 'comparaciones': {}, 'casos': tablas,
           'umbral_rama_E': len([c for c in comunes if not c.startswith('C-1')]) / 3,
           'censuradas': [r for r in rows if r.get('censurado')],
           'ejecuciones_excluidas': [r for r in rows if r['caso'] in excluidos],
           'descriptivas': descriptivas(limpio),
           'indicadores': {b: {**{f'C-{i}': conjunto(tabla, [c for c in comunes if c.startswith(f'C-{i}')]) for i in range(1, 5)},
                               'C-2_a_C-4': conjunto(tabla, [c for c in comunes if not c.startswith('C-1')])} for b, tabla in tablas.items()}}
    if invalidez:
        out['accion'] = 'Corregir el instrumento y repetir LB completa; no leer las ramas.'
        return out
    # Repeticiones pareadas; k no puede cambiar entre LB/FIN de esta combinación.
    if any(tablas[b][c]['n'] != tablas['LB'][c]['n'] for b in brazos for c in comunes):
        out.update(valida=False, estado='medición inválida', motivos_invalidez=['k distinto entre LB y FIN.'])
        return out
    out['rama'] = rama(tablas['LB'])
    out['iv3'] = iv3(tablas['LB'])
    out['casos_con_problema_LB'] = [c for c in comunes if not c.startswith('C-1') and tablas['LB'][c]['con_problema']]
    out['comparaciones'] = {b: evaluar_final(tablas['LB'], tablas[b], out['rama']) for b in brazos if b != 'LB'}
    indicado = out['comparaciones'].get('indicado', {}).get('cumple')
    disponible = out['comparaciones'].get('disponible', {}).get('cumple')
    if indicado is True and disponible is True:
        out['lectura_brazos'] = 'RIGE resuelve y el agente lo adopta'
    elif indicado is True and disponible is False:
        out['lectura_brazos'] = 'RIGE resuelve si el desarrollador lo indica'
    elif indicado is False:
        out['lectura_brazos'] = 'El objetivo no se alcanza'
    else:
        out['lectura_brazos'] = 'Sin criterio de cumplimiento o brazos pendientes'
    return out


def piloto(rows):
    if not rows or {r['ejecutor'] for r in rows} != {'principal'} or {r['modelo'].split('/')[-1] for r in rows} != {'gpt-6.1-sol'}:
        return {'valido': False, 'motivo': 'Piloto: requiere principal / gpt-6.1-sol.'}
    if any(sum(r['caso'] == c for r in rows) != 10 for c in CASOS) or len(rows) != 240 or not all(completa(r) for r in rows):
        return {'valido': False, 'motivo': 'Piloto: requiere 24 casos completos, 10 ejecuciones por caso.'}
    if any(sorted(r['repeticion'] for r in rows if r['caso'] == c) != list(range(1, 11)) for c in CASOS):
        return {'valido': False, 'motivo': 'Piloto: repeticiones duplicadas o ausentes.'}
    cs = por_caso(rows)
    concordancias = {c: max(v['errores'], v['n'] - v['errores']) / 10 for c, v in cs.items()}
    concordantes = sum(v >= .9 for v in concordancias.values())
    return {'valido': True, 'k': 3 if concordantes * 10 >= len(CASOS) * 9 else 5,
            'concordancias': concordancias, 'proporcion_concordante': concordantes / len(CASOS),
            'inestables': [c for c, v in cs.items() if .30 <= v['tasa_error'] <= .70],
            'tiempo_limite_aceptable': not any(r.get('censurado') for r in rows if r['caso'].startswith('C-1')) and sum(bool(r.get('censurado')) for r in rows if r['caso'].startswith('C-4')) < 30,
            'formato_aceptable': sum(r['resultado'] == 'sin_respuesta' and r.get('motivo') == 'formato' for r in rows) * 10 <= len(rows),
            'validez_previa_y_rama_descriptiva': analizar_grupo(rows), 'casos': cs}


def analizar(rows, filas_piloto=(), tarifas=None):
    if len({bool(r.get('ensayo')) for r in [*rows, *filas_piloto]}) > 1:
        raise ValueError('No mezclar datos de ensayo y de medición real.')
    if any(r.get('fase') == 'piloto' for r in rows):
        raise ValueError('El piloto va exclusivamente por --piloto; nunca integra LB.')
    grupos = defaultdict(list)
    for r in rows:
        modelo = r['modelo'].split('/')[-1]
        if r['ejecutor'] == 'charles' and modelo != 'gpt-6.1-sol':
            raise ValueError('Charles requiere gpt-6.1-sol (ADR-082).')
        if r['ejecutor'] == 'principal' and modelo not in ('gpt-6.1-sol', 'gpt-5.6-luna'):
            raise ValueError('Modelo principal no admitido por ADR-082.')
        if (modelo == 'gpt-5.6-luna') != (r.get('fase') == 'p3'):
            raise ValueError('P3 requiere principal/gpt-5.6-luna y --fase p3 (ADR-082).')
        if r['caso'] not in CASOS or r['brazo'] not in ('LB', 'indicado', 'disponible') or r.get('condicion') != ('LB' if r['brazo'] == 'LB' else 'FIN'):
            raise ValueError('Caso, brazo o condición incompatible.')
        grupos[(r['ejecutor'], r['modelo'])].append(r)
    for r in rows:
        if tarifas:
            r['costo_usd'] = None if r.get('registro_incompleto') else costo_solicitudes(r.get('solicitudes', []), r['modelo'], tarifas)
    resultados = {f'{e}|{m}': analizar_grupo(rs) for (e, m), rs in sorted(grupos.items())}
    datos_piloto = piloto(filas_piloto) if filas_piloto else None
    esperado_k = datos_piloto.get('k') if datos_piloto and datos_piloto['valido'] else None
    if esperado_k is None:
        principal_lb = [r['k'] for r in rows if r['ejecutor'] == 'principal' and r['modelo'].split('/')[-1] == 'gpt-6.1-sol' and r['brazo'] == 'LB' and isinstance(r.get('k'), int)]
        esperado_k = principal_lb[0] if principal_lb else None
    for (e, m), rs in grupos.items():
        g = resultados[f'{e}|{m}']
        recortable = e != 'principal' or m.split('/')[-1] != 'gpt-6.1-sol'
        difiere = esperado_k is not None and any(r.get('k') != esperado_k for r in rs)
        recorte = esperado_k is not None and recortable and all(r.get('recorte_declarado') for r in rs) and all(r.get('k', esperado_k) < esperado_k for r in rs)
        if difiere and not recorte:
            g.update(valida=False, estado='medición inválida', rama=None, iv3=None, comparaciones={},
                     lectura_brazos='No leer las ramas; corregir y repetir LB completa.')
            g['motivos_invalidez'].append('k difiere del piloto/principal sin recorte admisible declarado.')
        g['recortes_declarados'] = sorted({r['recorte_declarado'] for r in rs if r.get('recorte_declarado')})
    principal = next((g for key, g in resultados.items() if key.split('|')[0] == 'principal' and key.split('|')[1].split('/')[-1] == 'gpt-6.1-sol'), None)
    segundo = next((g for key, g in resultados.items() if key.split('|')[0] == 'charles' and key.split('|')[1].split('/')[-1] == 'gpt-6.1-sol'), None)
    reevaluar = bool(principal and segundo and principal['valida'] and segundo['valida'] and principal['rama'] == segundo['rama'] == 'N')
    cumplimiento = principal.get('comparaciones', {}).get('indicado', {}).get('cumple') if principal and principal['valida'] else None
    costos = [None if r.get('registro_incompleto') else (costo_solicitudes(r.get('solicitudes', []), r['modelo'], tarifas) if tarifas else r.get('costo_usd')) for r in rows]
    return {'ensayo': bool(rows and rows[0].get('ensayo')), 'grupos': resultados,
            'cumplimiento_proyecto': None if rows and rows[0].get('ensayo') else cumplimiento,
            'cumplimiento_sintetico': cumplimiento if rows and rows[0].get('ensayo') else None,
            'reevaluar_objeto': reevaluar, 'segundo_ejecutor_pendiente': principal is not None and principal['rama'] == 'N' and segundo is None,
            'piloto': datos_piloto,
            'costos_ejecuciones_usd': costos, 'equivalente_usd_total': sum(costos) if all(c is not None for c in costos) else None,
            'equivalente_usd_conocido': sum(c for c in costos if c is not None),
            'costo_incompleto': any(c is None for c in costos),
            'ejecuciones': rows, 'nota': 'Equivalente informativo a tarifas congeladas; no es desembolso ni inferencia estadística.'}


def markdown(datos):
    lines = ['# Análisis de la medición' + (' · ENSAYO, datos inventados' if datos['ensayo'] else ''), '',
             f"Cumplimiento del proyecto: {datos['cumplimiento_proyecto']}. Reevaluar objeto: {datos['reevaluar_objeto']}.", '',
             f"Equivalente USD: {datos['equivalente_usd_total']}. {datos['nota']}", '']
    for key, g in datos['grupos'].items():
        lines.extend([f'## {key}', '', f"{g['estado']}; rama: {g['rama']}; IV.3: {g['iv3']}", '',
                      f"Exclusiones de todos los brazos: {g['exclusiones']}", '',
                      f"Censuradas (también las excluidas): {len(g['censuradas'])}", '',
                      '| Brazo | Caso | n | Error | Correctas | Parciales | Incorrectas | Sin respuesta | Mediana tokens | Censuradas |',
                      '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|'])
        for b, tabla in g['casos'].items():
            for c, s in tabla.items():
                counts = s['resultados']
                lines.append(f"| {b} | {c} | {s['n']} | {s['tasa_error']:.4f} | {counts.get('correcta', 0)} | {counts.get('parcial', 0)} | {counts.get('incorrecta', 0)} | {counts.get('sin_respuesta', 0)} | {s['tokens']['mediana']} | {s['censuradas']} |")
        lines.extend(['', f"Lectura: {g.get('lectura_brazos', g.get('accion', ''))}", ''])
        for b, indicadores in g['indicadores'].items():
            lines.extend([f'### Indicadores {b}', '', '| Conjunto | IB-1 agregado | Promedio tasas | Casos con problema | Nivel tokens | IB-3 | Censura |', '|---|---:|---:|---:|---:|---:|---:|'])
            for c, s in indicadores.items():
                lines.append(f"| {c} | {s['ib1_agregado']} | {s['ib1_promedio_casos']} | {s['casos_con_problema']} | {s['nivel_tokens']} | {s['ib3_parciales']} | {s['censura']} |")
            lines.append('')
        for b, cmp in g['comparaciones'].items():
            lines.extend([f"{b}: cumple={cmp['cumple']}; recuperados={cmp['recuperados']}; requeridos={cmp['recuperaciones_requeridas']}; mediana reducciones={cmp['mediana_reducciones_tokens']}; retrocesos={list(cmp['retrocesos'])}.", '', *cmp['pendientes'], ''])
        lines.extend(['### Comparaciones descriptivas', '', '```json', json.dumps(g['descriptivas'], ensure_ascii=False, indent=2), '```', ''])
    if datos['piloto']:
        lines.extend(['## Piloto separado', '', json.dumps({k: v for k, v in datos['piloto'].items() if k != 'casos'}, ensure_ascii=False), ''])
    return '\n'.join(lines) + '\n'


def cargar(paths):
    rows = []
    for path in paths:
        rs = leer_jsonl(path)
        meta = path.parent / 'tanda.json'
        if meta.exists():
            tanda = json.loads(meta.read_text(encoding='utf-8'))
            for r in rs:
                for k in ('k', 'fase', 'ensayo', 'recorte_declarado'):
                    if k in tanda:
                        r.setdefault(k, tanda[k])
        rows.extend(rs)
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('registros', nargs='+', type=Path)
    parser.add_argument('--piloto', nargs='+', type=Path, default=[])
    parser.add_argument('--destino', type=Path, required=True)
    parser.add_argument('--tarifas', type=Path, default=Path(__file__).resolve().parents[1] / 'tarifas-congeladas-20261001.json')
    args = parser.parse_args()
    datos = analizar(cargar(args.registros), cargar(args.piloto), json.loads(args.tarifas.read_text(encoding='utf-8')))
    args.destino.mkdir(parents=True, exist_ok=True)
    escribir_json(args.destino / 'analisis.json', datos)
    (args.destino / 'informe.md').write_text(markdown(datos), encoding='utf-8')
    print(f'{len(datos["grupos"])} combinaciones; informe.md y analisis.json en {args.destino}')


if __name__ == '__main__':
    main()
