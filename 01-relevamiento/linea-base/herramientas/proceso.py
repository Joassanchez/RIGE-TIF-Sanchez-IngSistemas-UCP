"""ADR-098 P-6: descripción conservadora de la traza, sin autoinforme."""
import argparse
import json
from pathlib import Path
import re
import shlex

CONFIG = re.compile(r'(?:opencode\.jsonc?|AGENTS\.md|\.opencode/[^\s\'";]+|\.config/opencode/[^\s\'";]+)')
LECTORES = {'cat', 'head', 'tail', 'less', 'more', 'sed', 'awk', 'grep', 'rg', 'jq', 'python', 'python3', 'node'}


def comandos_desarrollador(cmd):
    """Solo comandos ejecutables: una mención en echo/read no es ejecución."""
    try:
        lexer = shlex.shlex(cmd, posix=True, punctuation_chars=';&|()')
        lexer.whitespace_split = True
        palabras = list(lexer)
    except ValueError:
        return []
    out = []
    inicio = True
    for i, palabra in enumerate(palabras):
        if palabra and set(palabra) <= set(';&|()'):
            inicio = True
            continue
        if inicio and Path(palabra).name == 'como-dev' and i + 1 < len(palabras):
            try:
                internos = shlex.split(palabras[i + 1])
                if len(internos) == 1:
                    internos = palabras[i + 1:]
            except ValueError:
                internos = []
            for j, token in enumerate(internos[:-1]):
                if Path(token).name == 'opencode' and internos[j + 1] == 'run' and (j == 0 or internos[j - 1] in ('&&', ';', '||')):
                    out.append(shlex.join(internos[j:]))
        inicio = False
    return out


def capa(ruta):
    ruta = ruta.replace('\\', '/')
    if re.search(r'/(?:agents?)/[^/]+\.md$', ruta):
        return 'agente markdown'
    if ruta.startswith('G/') or '.config/opencode/' in ruta:
        return 'global'
    if '.opencode/' in ruta:
        return '.opencode/'
    if ruta.startswith('P/') or re.search(r'(^|/)(opencode\.jsonc?|AGENTS\.md)$', ruta):
        return 'proyecto'
    return 'otra'


def clasificar_proceso(registro, regla):
    lecturas, docs, web, skills, editadas, verificaciones = [], [], [], [], [], []
    ultima = -1
    acciones_probadas = []
    herramientas = registro.get('herramientas', [])
    ultimos = {h['callID']: i for i, h in enumerate(herramientas) if h.get('callID')}
    for i, h in enumerate(herramientas):
        if h.get('callID') and ultimos[h['callID']] != i:
            continue
        nombre, args = h.get('herramienta', ''), h.get('argumentos') or {}
        ruta = args.get('filePath', args.get('path', ''))
        cmd = args.get('command', '') if nombre == 'bash' else ''
        if nombre == 'read' and CONFIG.search(ruta):
            lecturas.append(dict(archivo=ruta, via='read', clasificacion='config'))
        if nombre == 'bash':
            try:
                palabras = shlex.split(cmd)
            except ValueError:
                palabras = []
            lector = any(Path(p).name in LECTORES for p in palabras)
            if lector:
                archivos = [p for p in palabras if CONFIG.search(p)]
                # Sustituciones, variables y programas inline no prueban qué archivo
                # se abrió. Se conserva el comando y se evita inventar una lectura.
                incierta = not archivos or bool(re.search(r'\$|`|\b(?:python\d*|node)\b', cmd))
                lecturas.extend(dict(archivo=p if not incierta else None, via='bash', comando=cmd,
                                      clasificacion='indeterminada' if incierta else 'config')
                                for p in (archivos or [None]))
        if (nombre == 'read' and '/docs/' in ruta) or (cmd and re.search(r'(?:/docs/|permissions\.html|index\.html)', cmd)):
            docs.append(dict(indice=i, archivo=ruta or cmd))
        if nombre == 'webfetch':
            web.append(args.get('url'))
        if nombre == 'skill' and args.get('name') == 'customize-opencode':
            skills.append(i)
        anidadas = comandos_desarrollador(cmd) if h.get('estado') == 'completed' else []
        rutas = []
        if nombre in ('edit', 'write'):
            rutas = [ruta]
        if nombre == 'apply_patch':
            rutas = re.findall(r'\*\*\* (?:Update|Add|Delete) File: (.+)', args.get('patchText', args.get('patch', '')))
        if cmd and not anidadas and re.search(r'(?:>|\bsed\s+-i|\btee\b|writeFile|write_text|write_bytes)', cmd):
            rutas = CONFIG.findall(cmd) or ['indeterminada']
        if rutas and h.get('estado') != 'error':
            ultima = i
            editadas.extend(dict(archivo=r, capa=capa(r)) for r in rutas)
        tipo = None
        invocacion = r'(?:^|[;&|])\s*(?:como-dev\s+[\'"]?)?(?:[^\s]+/)?'
        if anidadas:
            tipo = 'comportamiento'
            acciones_probadas.append(dict(indice=i, comandos=anidadas,
                objetivos_identificados=[o[:3] for o in [regla['objetivo'], *regla.get('objetivos_adicionales', [])]
                                        if o[2] in cmd] if 'objetivo' in regla else []))
        elif nombre.lower().startswith('rige') or re.search(invocacion + r'rige(?:\s|$)', cmd, re.I):
            tipo = 'rige'
        elif re.search(invocacion + r'opencode\s+debug\s+(?:config|agent|skill)\b', cmd):
            tipo = 'declarativa'
        else:
            objetivos = [regla['objetivo'], *regla.get('objetivos_adicionales', [])] if 'objetivo' in regla else []
            for ag, permiso, sujeto, _ in objetivos:
                # La lectura de configuración del ejecutor no prueba el permiso
                # del participante: exigir como-dev/opencode run en bash.
                if cmd and not re.search(r'\bopencode\s+run\b', cmd) and ('como-dev' in cmd) and sujeto in cmd:
                    tipo = 'comportamiento'
                elif nombre == permiso and sujeto == ruta and h.get('agente') == ag:
                    tipo = 'comportamiento'
        if tipo:
            verificaciones.append((i, tipo))
    posteriores = [t for i, t in verificaciones if i > ultima]
    prioridad = ['ninguna', 'declarativa', 'comportamiento', 'rige']
    return dict(lecturas_config=lecturas, docs=docs, webfetch=web, skill=skills,
        capas_editadas=editadas, capa_correcta=sorted({capa(r) for r in regla.get('variantes', {}).get('correcta', {})}),
        verificacion_final=max(posteriores, key=prioridad.index) if posteriores else 'ninguna',
        acciones_probadas=[a for a in acciones_probadas if a['indice'] > ultima],
        solicitudes=len(registro['solicitudes']) if isinstance(registro.get('solicitudes'), list) else registro.get('solicitudes'))


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('registro', type=Path)
    p.add_argument('--respuestas', type=Path, required=True)
    a = p.parse_args()
    reglas = json.loads(a.respuestas.read_text(encoding='utf-8'))['casos']
    for linea in a.registro.read_text(encoding='utf-8').splitlines():
        r = json.loads(linea)
        print(json.dumps(dict(caso=r['caso'], proceso=clasificar_proceso(r, reglas[r['caso']])), ensure_ascii=False))
