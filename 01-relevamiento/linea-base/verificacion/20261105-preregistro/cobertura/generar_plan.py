#!/usr/bin/env python3
"""Contraste de cobertura sin agente (ADR-098, punto 8): plan por problema y forma.

Toma las formas de `respuestas-ecologica.json` y la decisión nativa del oráculo de
la admisión vigente (imagen a691196f0e3e). No ejecuta agentes ni consume cuota.
Uso: python -B generar_plan.py <respuestas.json> <raíz admisión> <proyecto común> <salida>
"""
import base64, glob, json, os, sys
from pathlib import Path

respuestas, admision, comun, salida = sys.argv[1:5]
hoja = json.load(open(respuestas, encoding='utf-8'))['casos']
publico = json.load(open(Path(respuestas).with_name('escenarios.json'), encoding='utf-8'))['dimensiones']['ecologica']
plan = []
for tid, t in hoja.items():
    escenario = publico[tid]
    objetivos = []
    if 'objetivo' in t:
        objetivos = [t['objetivo'][:3], *[o[:3] for o in t.get('objetivos_adicionales', [])]]
    sondas = [*objetivos, *[g[:3] for g in t.get('guardas', []) if len(g) >= 3]]
    for variante in ['base', *t['variantes']]:
        carpetas = glob.glob(os.path.join(admision, 'p*', tid, variante))
        if not carpetas:
            continue
        oraculo = json.load(open(os.path.join(carpetas[0], 'oraculo.json'), encoding='utf-8'))
        archivos = dict(escenario['archivos'])
        if variante != 'base':
            archivos.update(t['variantes'][variante])
        plan.append(dict(
            caso=tid, variante=variante, estrato=t['estrato'], archivos=archivos, env=escenario.get('env', {}),
            directorio=escenario.get('directorio', ''),
            sondas=[dict(agente=a, herramienta=p, objetivo=s, objetivo_principal=[a, p, s] in objetivos,
                         nativa=oraculo.get(json.dumps([a, p, s], ensure_ascii=False), {}).get('decision'))
                    for a, p, s in sondas],
            valor=t.get('valor'), carpeta_admision=carpetas[0].replace(os.sep, '/')))
comunes = {}
for raiz, _, nombres in os.walk(comun):
    for n in nombres:
        ruta = os.path.join(raiz, n)
        comunes[os.path.relpath(ruta, comun).replace(os.sep, '/')] = base64.b64encode(open(ruta, 'rb').read()).decode()
json.dump(dict(plan=plan, comun=comunes), open(salida, 'w', encoding='utf-8'), ensure_ascii=False)
print(len(plan), 'formas de', len({p['caso'] for p in plan}), 'problemas')
