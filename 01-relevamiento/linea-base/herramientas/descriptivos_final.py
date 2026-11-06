"""Descriptivos de rutas por cambios observables, sin atribución causal del error."""
from collections import Counter
import json
import re

from proceso import CONFIG, clasificar_proceso

ABSOLUTA = re.compile(r'^(?:/|[A-Za-z]:)')
PERMISOS_RUTA = {'read', 'edit', 'write', 'external_directory'}


def reglas(texto):
    """JSON/JSONC reconstruido; preservar strings al retirar comentarios/comas."""
    if not isinstance(texto, str):
        raise ValueError('Texto de configuración ausente')
    cadena = r'"(?:\\.|[^"\\])*"'
    texto = re.sub(cadena + r'|//[^\n]*|/\*.*?\*/', lambda m: m[0] if m[0].startswith('"') else ' ', texto, flags=re.S)
    texto = re.sub(cadena + r'|,\s*(?=[}\]])', lambda m: m[0] if m[0].startswith('"') else '', texto)
    dato = json.loads(texto)
    if not isinstance(dato, dict):
        raise ValueError('Configuración no es objeto')
    out = {}
    def visitar(obj, ruta=()):
        if not isinstance(obj, dict):
            return
        for k, v in obj.items():
            if k == 'permission' and isinstance(v, dict):
                for permiso, patrones in v.items():
                    if permiso in PERMISOS_RUTA and isinstance(patrones, dict):
                        for patron, accion in patrones.items():
                            if patron != '*':
                                out[(*ruta, k, permiso, patron)] = accion
            else:
                visitar(v, (*ruta, k))
    visitar(dato)
    return out


def texto_leido(resultado):
    if not isinstance(resultado, str):
        raise ValueError('Lectura sin texto conservado')
    # read de OpenCode entrega encabezado y números de línea dentro de content/file.
    m = re.search(r'<(?:content|file)>\s*(.*?)\s*</(?:content|file)>', resultado, re.S)
    texto = m[1] if m else resultado
    texto = re.sub(r'\n\s*\(End of file - total \d+ lines?\)\s*\Z', '', texto)
    return re.sub(r'^\s*\d+\s*[:|]\s?', '', texto, flags=re.M).strip()


def cambios_patch(texto, patch):
    """Hunks con contexto literal y único; lo demás se omite, sin interpretación manual."""
    segmentos, viejo, nuevo = [], [], []
    for l in patch.splitlines():
        if l.startswith(('@@', '***')):
            if viejo or nuevo:
                segmentos.append(('\n'.join(viejo), '\n'.join(nuevo)))
                viejo, nuevo = [], []
        elif l.startswith(' '):
            viejo.append(l[1:]); nuevo.append(l[1:])
        elif l.startswith('-'):
            viejo.append(l[1:])
        elif l.startswith('+'):
            nuevo.append(l[1:])
    if viejo or nuevo:
        segmentos.append(('\n'.join(viejo), '\n'.join(nuevo)))
    for antes, despues in segmentos:
        if not antes or texto.count(antes) != 1:
            raise ValueError('Patch no reconstruible')
        texto = texto.replace(antes, despues, 1)
    return texto


def analizar_traza(row, regla):
    herramientas = row.get('herramientas')
    if not isinstance(herramientas, list):
        return dict(reglas=[], absoluta=[], motivos=['traza sin herramientas'], fuentes=None)
    estados, modificadas, motivos, primer_absoluto = {}, [], [], None
    ultimos = {h['callID']: i for i, h in enumerate(herramientas) if h.get('callID')}
    for i, h in enumerate(herramientas):
        if h.get('callID') and ultimos[h['callID']] != i or h.get('estado') == 'error':
            continue
        nombre, args = h.get('herramienta'), h.get('argumentos') or {}
        ruta = args.get('filePath', args.get('path', ''))
        if nombre == 'read' and CONFIG.search(ruta):
            try:
                estados[ruta] = texto_leido(h.get('resultado'))
            except ValueError:
                estados.pop(ruta, None)
        par = []
        if nombre in ('write', 'edit') and re.search(r'opencode\.jsonc?$', ruta):
            try:
                anterior = estados.get(ruta)
                if nombre == 'write':
                    posterior = args['content']
                    if anterior is None and any(c.get('archivo') == ruta and c.get('cambio') == 'creado' for c in row.get('archivos_tocados', [])):
                        anterior = '{}'
                else:
                    vieja, nueva = args['oldString'], args['newString']
                    if anterior is None:
                        # Un reemplazo del objeto entero es suficiente sin otro read.
                        reglas(vieja); reglas(nueva)
                        anterior, posterior = vieja, nueva
                    else:
                        if not vieja or not args.get('replaceAll') and anterior.count(vieja) != 1:
                            raise ValueError('Edición no reconstruible')
                        posterior = anterior.replace(vieja, nueva, -1 if args.get('replaceAll') else 1)
                par.append((ruta, anterior, posterior))
            except (KeyError, ValueError, TypeError):
                motivos.append('edición sin configuración previa o cambio reconstruible')
        elif nombre == 'apply_patch':
            patch = args.get('patchText', args.get('patch', ''))
            for modo, archivo, cuerpo in re.findall(r'\*\*\* (Add|Update|Delete) File: ([^\n]+)\n(.*?)(?=\*\*\* (?:Add|Update|Delete|End)|\Z)', patch, re.S):
                if not re.search(r'opencode\.jsonc?$', archivo):
                    continue
                try:
                    anterior = '{}' if modo == 'Add' else estados[archivo]
                    posterior = ('\n'.join(l[1:] for l in cuerpo.splitlines() if l.startswith('+')) if modo == 'Add'
                                 else '{}' if modo == 'Delete' else cambios_patch(anterior, cuerpo))
                    par.append((archivo, anterior, posterior))
                except (KeyError, ValueError):
                    motivos.append('patch sin configuración previa o cambio reconstruible')
        elif nombre == 'bash' and clasificar_proceso(dict(herramientas=[h], solicitudes=[]), regla)['capas_editadas']:
            motivos.append('edición por bash sin contenido reconstruible')
        for archivo, anterior, posterior in par:
            try:
                antes, despues = reglas(anterior), reglas(posterior)
                nuevas = [k[-1] for k, v in despues.items() if k not in antes or antes[k] != v]
                modificadas.extend(nuevas)
                estados[archivo] = posterior
                if primer_absoluto is None and any(ABSOLUTA.match(k) for k in nuevas):
                    primer_absoluto = i
            except (ValueError, TypeError):
                motivos.append('JSON/JSONC no reconstruible mecánicamente')
    fuentes = None
    if primer_absoluto is not None:
        previas = [h for h in herramientas[:primer_absoluto] if h.get('estado') != 'error']
        lectura_sin_salida = any(h.get('herramienta') in ('read', 'skill', 'webfetch', 'bash') and
                                not h.get('resultado') for h in previas)
        if lectura_sin_salida:
            motivos.append('traza sin lo leído antes de la regla absoluta')
        else:
            p = clasificar_proceso(dict(herramientas=previas, solicitudes=[]), regla)
            fuentes = [n for n, campo in [('documentacion_local', 'docs'), ('customize-opencode', 'skill'), ('webfetch', 'webfetch')] if p[campo]] or ['ninguna']
    return dict(reglas=sorted(set(modificadas)), absoluta=sorted({k for k in modificadas if ABSOLUTA.match(k)}),
                motivos=sorted(set(motivos)), fuentes=fuentes)


def rutas_y_origen(rows, hoja):
    datos = [(r, analizar_traza(r, hoja[r['caso']])) for r in rows]
    elegibles = [(r, d) for r, d in datos if d['reglas']]
    absolutas = [(r, d) for r, d in elegibles if d['absoluta']]
    motivos = sorted({m for _, d in datos for m in d['motivos']})
    por_problema = {}
    for c in sorted({r['caso'] for r, _ in elegibles}):
        rs = [(r, d) for r, d in elegibles if r['caso'] == c]
        n = sum(bool(d['absoluta']) for _, d in rs)
        por_problema[c] = dict(elegibles=len(rs), con_absoluta=n,
            reglas_absolutas=sorted({k for _, d in rs for k in d['absoluta']}))
    omision = motivos or (['menos de 10 ejecuciones elegibles'] if len(elegibles) < 10 else [])
    for dato in por_problema.values():
        dato['proporcion'] = None if omision else dato['con_absoluta'] / dato['elegibles']
    tasa = dict(estado='omitida' if omision else 'informada', motivos=omision, elegibles=len(elegibles), con_absoluta=len(absolutas),
                proporcion=None if omision else len(absolutas) / len(elegibles), por_problema=por_problema,
                ejecuciones=[dict(caso=r['caso'], repeticion=r.get('repeticion'), con_absoluta=bool(d['absoluta'])) for r, d in elegibles])
    fuentes = Counter(n for _, d in absolutas for n in d['fuentes'] or [])
    con_lectura = sum(bool(d['fuentes']) and d['fuentes'] != ['ninguna'] for _, d in absolutas)
    motivos_origen = motivos or (['menos de 10 ejecuciones con lectura previa'] if con_lectura < 10 else [])
    origen = dict(estado='omitida' if motivos_origen else 'informada', motivos=motivos_origen,
                  ejecuciones_con_lectura_previa=con_lectura, fuentes=dict(fuentes) if not motivos_origen else None,
                  por_problema={c: dict(Counter(n for r, d in absolutas if r['caso'] == c for n in d['fuentes'] or []))
                                for c in por_problema} if not motivos_origen else {})
    return dict(tasa_ruta_absoluta=tasa, origen_error=origen)
