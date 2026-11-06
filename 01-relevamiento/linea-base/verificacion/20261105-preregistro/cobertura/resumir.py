#!/usr/bin/env python3
"""Tabla de cobertura desde salida-congelada.json y la hoja. Uso: python -B resumir.py <salida.json> <respuestas.json> <RESULTADO-tabla.md>"""
import json, sys
sal = json.load(open(sys.argv[1], encoding='utf-8'))
hoja = json.load(open(sys.argv[2], encoding='utf-8'))['casos']
CON_EDF = {'M-1', 'M-2', 'M-10', 'N-14', 'N-23'}
MOTIVO = {'solicitud-invalida': 'herramienta no soportada', 'cadena-incompleta': 'cadena incompleta'}
filas, cubiertos, total = [], 0, 0
ABS = 'RF-02 CA-9; RF-07 CA-1 y CA-5'
REQUISITO = {'M-1': ABS, 'M-2': ABS, 'M-10': ABS, 'N-23': ABS, 'N-14': ABS, 'M-3': 'RF-02 CA-2', 'M-4': 'RF-02 CA-2', 'M-7': 'RF-02 CA-2; RF-07 CA-1',
             'M-8': 'RF-02 CA-3', 'M-9': 'RF-02 CA-2; RF-04 CA-1', 'N-1': 'RF-02 CA-2; RF-07 CA-1', 'N-2': 'RF-02 CA-2', 'N-4': 'RF-02 CA-2; RF-07 CA-1',
             'N-5': 'RF-02 CA-2; RF-09 CA-1 y CA-2', 'N-6': 'RF-02 CA-2', 'N-7': 'RF-02 CA-2', 'N-11': 'RF-02 CA-2', 'N-12': 'RF-02 CA-2; RF-06 CA-2', 'N-13': 'RF-02 CA-2',
             'N-21': 'RF-02 CA-2; RF-06 CA-2', 'N-24': 'RF-02 CA-2', 'V-6': 'RF-01 CA-2; RF-07 CA-1 y CA-2'}
casos = [c for c in dict.fromkeys(f['caso'] for f in sal) if hoja[c]['estrato'] == 'E2']
for caso in casos:
    fs = [f for f in sal if f['caso'] == caso and f['variante'] != 'observada_absoluta']
    sondas = [(f, s) for f in fs for s in f['sondas']]
    tot = len(sondas)
    bien = sum(s['relativa'].get('decision') == s['nativa'] and (s['absoluta'] is None or s['absoluta'].get('decision') == s['nativa']) for _, s in sondas)
    hallazgos = sorted({h['causa'] for f in fs if isinstance(f['hallazgos'], list) for h in f['hallazgos']})
    if tot:
        estado = 'Cubierto' if bien == tot else 'Fuera'
        rechazo = sorted({str(s['relativa'].get('mensaje', ''))[:200].split('"mensaje":"')[-1].strip().rstrip('"}') for _, s in sondas if 'error' in s['relativa']})
        detalle = f'{bien}/{tot} sondas' + ('; rechazo: ' + rechazo[0] if rechazo else '')
    else:
        estado = 'Cubierto' if caso == 'V-6' else 'Fuera'
        detalle = {'V-5': 'clave no resuelta: agente en Markdown', 'V-6': 'informa la plantilla y el hallazgo de sustitución sin valor',
                   'V-7': 'clave no resuelta: agente en Markdown', 'V-8': 'informa el prompt sin expandir; no resuelve `instructions`',
                   'V-9': 'sin consulta: `AGENTS.md` no es una clave de agente', 'V-10': 'sin consulta: `mcp` no es una clave de agente'}[caso]
    total += 1; cubiertos += estado == 'Cubierto'
    filas.append(f"| {caso} | {hoja[caso]['mecanismo']} | {'Sí' if caso in CON_EDF else 'No'} | {estado} | {REQUISITO.get(caso, '—')} | {detalle} | {', '.join(hallazgos) or '—'} |")
with open(sys.argv[3], 'w', encoding='utf-8') as f:
    f.write(f'{cubiertos} de {total} problemas de E2 cubiertos.\n\n| Problema | Mecanismo | Éxito falso en la línea de base | Cobertura | Requisito | Detalle | Hallazgos en alguna forma |\n|---|---|---|---|---|---|---|\n' + '\n'.join(filas) + '\n')
print(cubiertos, total)
