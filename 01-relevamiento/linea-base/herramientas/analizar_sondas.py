"""Reconstrucción de archivos de evidencia desde copias y diffs."""
import hashlib
from pathlib import Path, PurePosixPath
import re
from evidencia_portable import leer_texto


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
        snapshot = base / (prefijo + '.archivos-antes')
        previo = snapshot / rel
        virtuales = {'/home/participante/.config/opencode': snapshot / 'global',
                     '/home/participante/proyecto': snapshot / 'proyecto'}
        try:
            texto = leer_texto(previo, base, virtuales)
        except FileNotFoundError:
            texto = ''
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

