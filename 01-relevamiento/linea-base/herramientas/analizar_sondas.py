"""ADR-089: lecturas descriptivas separadas de ramas y cumplimiento."""
from collections import defaultdict
import hashlib
import json
from pathlib import Path, PurePosixPath
import re

CASOS = {'R': ('C-3b', 'C-3d'), 'E': ('C-1d', 'C-1f', 'C-3b', 'C-4e')}


def aplicar_diff(texto, diff):
    """Reconstruye un diff unificado; verifica el contexto, sin ejecutar herramientas."""
    original = texto.splitlines(keepends=True)
    salida, cursor = [], 0
    lineas = diff.splitlines(keepends=True)
    i = 0
    while i < len(lineas):
        m = re.match(r'^@@ -(\d+)(?:,(\d+))? \+\d+(?:,\d+)? @@', lineas[i])
        if not m:
            i += 1
            continue
        inicio = int(m[1]) - (int(m[1]) > 0)
        if inicio < cursor:
            raise ValueError('Diff superpuesto')
        salida.extend(original[cursor:inicio])
        cursor = inicio
        i += 1
        while i < len(lineas) and lineas[i][:1] in (' ', '+', '-'):
            linea = lineas[i]
            if linea[0] in ' -':
                if cursor >= len(original) or original[cursor].rstrip('\n') != linea[1:].rstrip('\n'):
                    raise ValueError('Contexto de diff distinto de la copia')
                cursor += 1
            if linea[0] in ' +':
                salida.append(linea[1:])
            i += 1
    salida.extend(original[cursor:])
    return ''.join(salida)


def contenido_archivo(row, intento, archivo):
    if 'contenido_despues' in archivo:
        texto = archivo['contenido_despues']
    else:
        # Las tandas MED-6 conservan archivos-antes y los diffs nativos.
        base = Path(row['_directorio_registro'])
        prefijo = intento['captura_antes'].removesuffix('.antes')
        ruta = archivo['archivo']
        roots = (('/home/participante/.config/opencode/', 'global'),
                 ('/home/participante/proyecto/', 'proyecto'))
        rel = next((PurePosixPath(nombre) / ruta[len(root):] for root, nombre in roots if ruta.startswith(root)), None)
        if rel is None:
            raise ValueError('Archivo fuera de las copias')
        previo = base / (prefijo + '.archivos-antes') / rel
        texto = previo.read_text(encoding='utf-8') if previo.is_file() else ''
        for tool in row.get('herramientas', []):
            if tool.get('estado') != 'completed':
                continue
            meta = tool.get('metadata', {})
            fd = meta.get('filediff', {})
            if fd.get('file') == ruta and isinstance(fd.get('after'), str):
                texto = fd['after']
            for f in meta.get('files', []):
                if f.get('filePath') == ruta and f.get('patch'):
                    texto = aplicar_diff(texto, f['patch'])
            if tool.get('herramienta') == 'write' and tool.get('argumentos', {}).get('filePath') == ruta:
                texto = tool['argumentos']['content']
    esperado = archivo.get('despues')
    if not esperado or esperado[0] != 'file' or hashlib.sha256(texto.encode()).hexdigest() != esperado[1]:
        raise ValueError('Contenido final no reconstruido con el SHA-256 registrado')
    return texto


def reglas_permiso(texto):
    if texto.startswith('---\n'):
        return reglas_frontmatter(texto)
    # JSONC: quitar comentarios fuera de strings y comas finales, preservando strings.
    patron = r'"(?:\\.|[^"\\])*"|//[^\n]*|/\*.*?\*/'
    texto = re.sub(patron, lambda m: m[0] if m[0].startswith('"') else '', texto, flags=re.S)
    texto = re.sub(r'("(?:\\.|[^"\\])*"|,)\s*(?=[}\]])',
                   lambda m: m[0] if m[0].lstrip().startswith('"') else '', texto)
    obj = json.loads(texto)
    patrones = []
    def visitar(v):
        if not isinstance(v, dict):
            return
        for k, x in v.items():
            if k == 'permission':
                if isinstance(x, str):
                    patrones.append('*')
                elif isinstance(x, dict):
                    for regla in x.values():
                        patrones.extend(regla.keys() if isinstance(regla, dict) else ['*'])
            elif isinstance(x, dict):
                visitar(x)
    visitar(obj)
    return patrones


def reglas_frontmatter(texto):
    """Subconjunto explícito de YAML de agentes; lo no reconocido queda pendiente."""
    cabecera = texto.split('---\n', 2)
    if len(cabecera) != 3:
        raise ValueError('Frontmatter sin cierre')
    reglas, nivel_permiso, nivel_herramienta = [], None, None
    for linea in cabecera[1].splitlines():
        if not linea.strip() or linea.lstrip().startswith('#'):
            continue
        match = re.fullmatch(r"( *)(.+?):(?: (.*))?", linea)
        if not match:
            raise ValueError('YAML de permisos no soportado')
        nivel, clave, valor = len(match[1]), match[2].strip(), (match[3] or '').strip()
        if nivel_permiso is not None and nivel <= nivel_permiso:
            nivel_permiso = None
        if clave == 'permission':
            if valor in ('allow', 'ask', 'deny'):
                reglas.append('*')
            elif valor:
                raise ValueError('Permiso YAML en línea no soportado')
            else:
                nivel_permiso, nivel_herramienta = nivel, None
        elif nivel_permiso is not None:
            if nivel_herramienta is None or nivel <= nivel_herramienta:
                nivel_herramienta = nivel
                if valor in ('allow', 'ask', 'deny'):
                    reglas.append('*')
                elif valor:
                    raise ValueError('Regla YAML no soportada')
            else:
                if valor not in ('allow', 'ask', 'deny'):
                    raise ValueError('Decisión YAML no soportada')
                if clave.startswith(('"', "'")):
                    if clave.startswith('"'):
                        clave = json.loads(clave)
                    elif clave.endswith("'"):
                        clave = clave[1:-1].replace("''", "'")
                    else:
                        raise ValueError('Patrón YAML sin cierre')
                reglas.append(clave)
    return reglas


def rutas_absolutas(row):
    reglas, faltantes = [], []
    for intento in row.get('intentos', []):
        for archivo in intento.get('archivos_tocados', []):
            if not archivo.get('dentro_configuracion') or not archivo.get('despues') or archivo['despues'][0] != 'file':
                continue
            try:
                reglas.extend(reglas_permiso(contenido_archivo(row, intento, archivo)))
            except (ValueError, OSError, KeyError, TypeError) as error:
                faltantes.append(f"{archivo['archivo']}: {error}")
    if row.get('archivos_tocados') and not row.get('intentos'):
        faltantes.append('Sin evidencia por intento de los archivos tocados')
    return dict(reglas=len(reglas), absolutas=sum(p.startswith('/') for p in reglas), pendientes=faltantes)


def analizar_sonda(rows, sonda, dimension):
    from analizar import completa
    esperada = 'atribucion' if sonda == 'R' else 'modificacion'
    if dimension != esperada or any(r.get('dimension', 'atribucion') != esperada for r in rows):
        raise ValueError('Dimensión incompatible con la sonda.')
    if len({bool(r.get('ensayo')) for r in rows}) > 1:
        raise ValueError('No mezclar ensayo y medición real.')
    sondas = [r for r in rows if r.get('sonda')]
    if not sondas or any(r['caso'] not in CASOS[sonda] or not re.fullmatch('[a-f0-9]{64}', r.get('hash_sonda', '')) for r in sondas):
        raise ValueError('Sonda ausente, caso ajeno o hash ausente.')
    if len({r['hash_sonda'] for r in sondas}) != 1:
        raise ValueError('No mezclar hashes de sonda.')
    if any(r.get('condicion') != 'LB' or r.get('brazo') != 'LB' for r in rows):
        raise ValueError('Sondas: comparar exclusivamente con LB.')
    grupos = defaultdict(list)
    for r in rows:
        if r['caso'] in CASOS[sonda]:
            grupos[(r['ejecutor'], r['modelo'], r['caso'])].append(r)
    tabla = []
    for ejecutor, modelo in sorted({(r['ejecutor'], r['modelo']) for r in sondas}):
        if ejecutor not in ('principal', 'charles') or modelo != 'openai/gpt-6.1-sol':
            raise ValueError('Sondas ADR-089: build/Charles con gpt-6.1-sol.')
        for caso in CASOS[sonda]:
            rs = grupos[(ejecutor, modelo, caso)]
            datos, motivos = {}, []
            for etiqueta, es_sonda in (('LB', False), ('sonda', True)):
                filas = [r for r in rs if bool(r.get('sonda')) == es_sonda]
                if len(filas) != 3 or sorted(r.get('repeticion', 0) for r in filas) != [1, 2, 3] or any(r.get('k') != 3 or not completa(r, dimension) for r in filas):
                    motivos.append(f'{etiqueta}: requiere tres repeticiones completas y únicas')
                n = len(filas)
                datos[etiqueta] = dict(n=n, errores=sum(r.get('resultado') != 'correcta' for r in filas),
                    sin_efecto=sum(r.get('resultado') == 'sin_efecto' for r in filas) / n if n else None)
                if sonda == 'E':
                    metricas = [rutas_absolutas(r) for r in filas]
                    pendientes = [p for m in metricas for p in m['pendientes']]
                    reglas = sum(m['reglas'] for m in metricas)
                    absolutas = sum(m['absolutas'] for m in metricas)
                    datos[etiqueta].update(reglas=reglas, absolutas=absolutas,
                        proporcion_absolutas=absolutas / reglas if reglas and not pendientes else None,
                        pendientes=pendientes)
                    if pendientes or not reglas:
                        motivos.append(f'{etiqueta}: evidencia de reglas incompleta o denominador cero')
            lectura = 'no concluyente'
            if not motivos:
                if sonda == 'R':
                    errores = datos['sonda']['errores']
                    lectura = ('dependiente de la redacción' if errores == 0 else 'inestable' if errores == 1 else 'robusta a la redacción')
                else:
                    # La lectura conjunta requiere que desaparezcan ambos indicadores.
                    cero = datos['sonda']['proporcion_absolutas'] == datos['sonda']['sin_efecto'] == 0
                    lectura = 'inducido por la instrucción' if cero else 'propio del agente en este entorno'
            tabla.append(dict(ejecutor=ejecutor, modelo=modelo, caso=caso, **datos, lectura=lectura, motivos=motivos))
    return dict(sonda=sonda, dimension=dimension, hash_sonda=sondas[0]['hash_sonda'], tabla=tabla,
                nota='Descriptiva ADR-089. El ejecutor sigue fuera del árbol. No modifica la línea de base ni su lectura.')


def markdown_sonda(datos):
    lines = [f"# Sonda {datos['sonda']} · ADR-089", '', datos['nota'], '',
             '| Ejecutor | Caso | Errores LB | Errores sonda | Rutas absolutas LB | Rutas absolutas sonda | Sin efecto LB | Sin efecto sonda | Lectura |',
             '|---|---|---:|---:|---:|---:|---:|---:|---|']
    for r in datos['tabla']:
        a, b = r['LB'], r['sonda']
        lines.append(f"| {r['ejecutor']} | {r['caso']} | {a['errores']}/{a['n']} | {b['errores']}/{b['n']} | {a.get('proporcion_absolutas', '—')} | {b.get('proporcion_absolutas', '—')} | {a['sin_efecto']} | {b['sin_efecto']} | {r['lectura']} |")
        if r['motivos']:
            lines.extend(['', f"{r['ejecutor']}/{r['caso']}: " + '; '.join(r['motivos']), ''])
    return '\n'.join(lines) + '\n'
