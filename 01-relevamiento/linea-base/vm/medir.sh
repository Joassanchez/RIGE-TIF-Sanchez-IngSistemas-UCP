#!/usr/bin/env bash
# Orquestación root, ejecución evaluador, corrección exclusivamente externa.
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Ejecutar como root dentro del contenedor.' >&2; exit 2; }
exec python3 - "$@" <<'PYTHON_MED4B'
import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import shlex
import stat
import subprocess
import sys

BASE = Path('/opt/linea-base')
HOME_E = Path('/home/evaluador')
HOME_P = Path('/home/participante')
TOKEN_FIELDS = ('tokens_entrada', 'tokens_cache', 'tokens_salida')
HASH_CATALOGO = '515672f64e5e6c83b715d67f57bedbdd6fe0abd9e3e786176974ef902b8d1219'
GENERADOS_OPENCODE = {'node_modules', 'package.json', 'package-lock.json', 'bun.lock', 'bun.lockb', '.gitignore'}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def hash_arbol(roots, excluir=(), inventario=None):
    # El inventario opcional describe exactamente las mismas entradas y bytes
    # del hash, en la misma pasada; no cambia el digest ni los usos históricos.
    h = hashlib.sha256()
    for root in map(Path, roots):
        entradas = {}
        if inventario is not None:
            inventario[str(root)] = entradas
        h.update(str(root).encode() + b'\0')
        if not root.exists():
            entradas['.'] = {'tipo': 'ausente'}
            h.update(b'AUSENTE\0')
            continue
        entradas['.'] = {'tipo': 'directorio' if root.is_dir() else 'archivo'}
        # Excluir sólo entradas de primer nivel y podar sus subárboles antes
        # de recorrerlos: las dependencias pueden cambiar durante el run.
        paths = sorted(p for entrada in root.iterdir() if entrada.name not in excluir
                       for p in [entrada, *entrada.rglob('*')]) if root.is_dir() else [root]
        for p in paths:
            if '.git' in p.relative_to(root.parent).parts:
                continue
            nombre = str(p.relative_to(root) if p != root else p.name)
            h.update(nombre.encode() + b'\0')
            if p.is_symlink():
                destino = os.readlink(p)
                h.update(b'LINK\0' + destino.encode())
                entradas[Path(nombre).as_posix()] = {'tipo': 'enlace', 'destino': destino}
            elif p.is_file():
                contenido = p.read_bytes()
                h.update(b'FILE\0' + contenido)
                if inventario is not None:
                    entradas[Path(nombre).as_posix()] = {'tipo': 'archivo', 'sha256': hashlib.sha256(contenido).hexdigest()}
            elif p.is_dir():
                h.update(b'DIR\0')
                entradas[Path(nombre).as_posix()] = {'tipo': 'directorio'}
    return h.hexdigest()


def hash_escenario():
    # Sólo el bloque del caso, no las preferencias ajenas de bash.
    proyecto = hash_arbol([HOME_P / 'proyecto'])
    config = hash_arbol([HOME_P / '.config/opencode'], excluir=GENERADOS_OPENCODE)
    h = hashlib.sha256((proyecto + config).encode())
    bashrc = (HOME_P / '.bashrc').read_text()
    bloque = re.search(r'^# >>> entorno local >>>$.*?^# <<< entorno local <<<$', bashrc, re.M | re.S)
    h.update((bloque[0] if bloque else '').encode())
    return h.hexdigest()


def extraer_eventos(texto):
    eventos, solicitudes, herramientas, mensajes = [], [], [], {}
    vistos = set()
    incompleto = False
    error_tokens = []
    for linea in texto.splitlines():
        if not linea.strip():
            continue
        try:
            e = json.loads(linea)
        except ValueError:
            incompleto = True
            continue
        eventos.append(e)
        p = e.get('part', {})
        if e.get('type') == 'step_finish':
            clave = p.get('id')
            if clave and clave in vistos:
                continue
            if clave:
                vistos.add(clave)
            t = p.get('tokens', {})
            cache = t.get('cache', {})
            numeros = [t.get('input'), t.get('output'), cache.get('read')]
            if not all(isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) and v >= 0 for v in numeros):
                incompleto = True
                error_tokens.append('step_finish sin input/output/cache.read completo')
                continue
            # cache.write se registra aparte y se valoriza al precio de entrada (decisión del autor, 13/10/2026).
            solicitudes.append(dict(tokens_entrada=t['input'], tokens_cache=cache['read'], tokens_salida=t['output'],
                                    razonamiento_reportado=t.get('reasoning'), cache_escritura=cache.get('write', 0), id=clave))
        elif e.get('type') == 'tool_use':
            s = p.get('state', {})
            herramientas.append(dict(herramienta=p.get('tool'), argumentos=s.get('input', {}), resultado=s.get('output', s.get('error')), estado=s.get('status'), callID=p.get('callID'), metadata=s.get('metadata', {})))
        elif e.get('type') == 'text':
            mensajes.setdefault(p.get('messageID', '__final'), []).append(p.get('text', ''))
    if not solicitudes:
        incompleto = True  # jamás sustituir consumo desconocido por cero
    hijos = [t['metadata'].get('sessionId') for t in herramientas if t['herramienta'] == 'task']
    if hijos:
        incompleto = True
        error_tokens.append('[VERIFICAR: sesiones hijas sin export completo]')
    final = ''.join(next(reversed(mensajes.values()))) if mensajes else ''
    return {'eventos': eventos, 'solicitudes': solicitudes, 'herramientas': herramientas,
            'respuesta_textual': final, 'registro_incompleto': incompleto, 'errores_tokens': error_tokens,
            'sesiones_hijas': hijos}


def eventos_exportados(obj, sesion):
    """Sólo el esquema explícito info/messages/parts; no adivinar otros esquemas."""
    if not isinstance(obj, dict) or not isinstance(obj.get('messages'), list) or obj.get('info', {}).get('id') != sesion:
        raise ValueError('Export no coincide con info.id/messages esperado.')
    out = []
    tipos = {'step-finish': 'step_finish', 'tool': 'tool_use', 'text': 'text'}
    for mensaje in obj['messages']:
        if not isinstance(mensaje.get('parts'), list):
            raise ValueError('Export sin parts por mensaje.')
        for parte in mensaje['parts']:
            if parte.get('type') in tipos:
                out.append(dict(type=tipos[parte['type']], sessionID=sesion, part=parte))
    return out


def recuperar_sesiones(parsed, prefijo, entorno):
    padre = next((e.get('sessionID') for e in parsed['eventos'] if e.get('sessionID')), None)
    pendientes = [padre] if padre else []
    exportados, sesiones, sin_cubrir = [], set(), False
    while pendientes and len(sesiones) < 100:
        sid = pendientes.pop(0)
        if not sid or sid in sesiones or not re.fullmatch(r'ses_[A-Za-z0-9]+', sid):
            sin_cubrir |= not bool(sid)
            continue
        sesiones.add(sid)
        path = f'{prefijo}.{sid}.export.json'
        codigo = ejecutar(como_evaluador(['opencode', 'export', sid], entorno), path, f'{prefijo}.{sid}.export.stderr.txt')
        try:
            if codigo:
                raise ValueError('export falló')
            es = eventos_exportados(json.loads(Path(path).read_text()), sid)
            if not es:
                raise ValueError('export sin partes medibles')
            exportados.extend(es)
            for e in es:
                parte = e['part']
                if parte.get('tool') == 'task':
                    child = parte.get('state', {}).get('metadata', {}).get('sessionId')
                    if child:
                        pendientes.append(child)
                    else:
                        sin_cubrir = True
        except (ValueError, OSError):
            sin_cubrir = True
    sin_cubrir |= bool(pendientes) or not bool(padre)
    # Export es la fuente completa; no sumarlo a los mismos pasos del stdout.
    recovered = extraer_eventos('\n'.join(json.dumps(e) for e in exportados))
    children = recovered['sesiones_hijas']
    solo_hijos = children and all(s in sesiones for s in children)
    otros_errores = [e for e in recovered['errores_tokens'] if 'sesiones hijas sin export' not in e]
    recovered['registro_incompleto'] = sin_cubrir or bool(otros_errores) or not recovered['solicitudes']
    if children and not solo_hijos:
        recovered['registro_incompleto'] = True
    recovered['errores_tokens'] = otros_errores + (['[VERIFICAR: export incompleto o esquema de sesiones no confirmado]'] if sin_cubrir else [])
    recovered['respuesta_textual'] = parsed['respuesta_textual']
    return recovered


def observar(herramientas):
    leidos, fuentes, introspeccion, retirados = set(), set(), set(), []
    docs = hoja = web = rige = False
    for t in herramientas:
        args = t['argumentos']
        texto = json.dumps(args, ensure_ascii=False)
        command = args.get('command', '')
        for nombre in ('debug config', 'debug agent', 'debug skill', '--help'):
            if nombre in command:
                introspeccion.add(nombre)
        if introspeccion:
            fuentes.add('comando_nativo')
        if t['herramienta'] == 'read' and args.get('filePath'):
            leidos.add(args['filePath'])
        # bash/cat/sed/grep no permiten reconstruir con certeza todos los archivos.
        # Conservar argumentos crudos y etiquetar la limitación, sin contar inventados.
        docs |= 'docs/' in texto
        hoja |= 'hoja-referencia.md' in texto
        rige |= bool(re.search(r'(?:^|[\s/\x27\x22])rige(?:\s|$)', command))
        # ADR-086: el identificador de esquema no acredita acceso web.
        web |= t['herramienta'] in ('webfetch', 'websearch') or bool(re.search(r'\b(?:curl|wget|fetch|requests|urllib|Invoke-WebRequest)\b|https?://', command.replace('https://opencode.ai/config.json', ''), re.I))
        if t['herramienta'] == 'skill':
            fuentes.add('skill_fabricante')
        if command and 'como-dev' in command and not any(x in command for x in ('debug ', '--help')):
            fuentes.add('ejecucion')
        if t['estado'] == 'error':
            retirados.append({'herramienta': t['herramienta'], 'argumentos': args, 'evidencia': t['resultado'], 'atribucion': '[DATO PENDIENTE: adjudicar si corresponde a skill/aprobación/web retiradas]'})
    if docs:
        fuentes.add('documentacion')
    if rige:
        fuentes.add('rige')
    return dict(archivos_leidos=sorted(leidos), archivos_leidos_cobertura='read; lecturas por bash requieren revisión de la traza',
                fuente_observada=sorted(fuentes), comandos_introspeccion=sorted(introspeccion),
                uso_documentacion=int(docs), uso_hoja=int(hoja), uso_rige=int(rige), acceso_web=int(web),
                negativa_por_recurso_retirado=retirados)


def ejecutar(comando, stdout, stderr, limite=120):
    with open(stdout, 'wb') as out, open(stderr, 'wb') as err:
        return subprocess.run(['timeout', '--kill-after=5s', str(limite), *comando], stdout=out, stderr=err).returncode


def como_evaluador(args, entorno=None):
    # OpenCode toma el directorio de PWD y no del proceso: con docker exec, PWD heredado
    # apunta a /opt/linea-base (root, 700) y run falla con «Session not found» (13/10/2026).
    variables = {'HOME': str(HOME_E), 'USER': 'evaluador', 'PWD': os.getcwd(), 'OPENCODE_DISABLE_AUTOUPDATE': '1', 'OPENCODE_DISABLE_MODELS_FETCH': '1', **(entorno or {})}
    return ['runuser', '-u', 'evaluador', '--', 'env', *[f'{k}={v}' for k, v in variables.items()], *args]


def congelar_ejecutor(ejecutor):
    origen = BASE / 'ejecutores' / ejecutor
    destino = HOME_E / '.config/opencode'
    destino.mkdir(parents=True, exist_ok=True)
    for entrada in destino.iterdir():
        if entrada.name in GENERADOS_OPENCODE:
            continue
        if entrada.is_dir() and not entrada.is_symlink():
            shutil.rmtree(entrada)
        else:
            entrada.unlink()
    shutil.copytree(origen, destino, dirs_exist_ok=True,
                    ignore=lambda carpeta, nombres: GENERADOS_OPENCODE.intersection(nombres) if Path(carpeta) == origen else ())
    subprocess.run(['chown', '-R', 'evaluador:evaluador', str(destino)], check=True)
    return (hash_arbol([origen], excluir=GENERADOS_OPENCODE),
            hash_arbol([destino], excluir=GENERADOS_OPENCODE))


def instalar_catalogo(origen):
    if not origen.is_file() or sha(origen) != HASH_CATALOGO:
        raise ValueError('Catálogo ausente o SHA-256 distinto del congelado; usar contenedor.sh medir.')
    cache = HOME_E / '.cache/opencode'
    cache.mkdir(parents=True, exist_ok=True)
    destino = cache / 'models.json'
    shutil.copyfile(origen, destino)
    destino.chmod(0o644)
    for path in (cache.parent, cache, destino):
        shutil.chown(path, user='evaluador', group='evaluador')
    return sha(destino)


def limite_cuota(evidencia):
    return bool(re.search(r'(?:status(?:Code)?|HTTP|status code)[\s\x22:=]+429\b|rate[_ -]limit|usage[_ -]limit|Too Many Requests', evidencia, re.I))


def clasificar_fallo(codigo, stderr, eventos_stdout):
    # Sólo los errores del stdout original: herramientas, texto, tokens y
    # partes recuperadas por export no son evidencia de fallo del proveedor.
    errores = [e for e in eventos_stdout if e.get('type') == 'error']
    evidencia = stderr + '\n' + '\n'.join(json.dumps(e, ensure_ascii=False) for e in errores)
    if codigo in (0, 124, 137) and not errores:
        return False, False, evidencia
    cuota = limite_cuota(evidencia)
    transitorio = cuota or bool(re.search(r'(?:status(?:Code)?|HTTP|status code)[\s\x22:=]+5\d\d\b', evidencia, re.I))
    return cuota, transitorio, evidencia


def detener_por_cuota(salida, caso, repeticion, evidencia):
    hora = datetime.now(timezone.utc).isoformat()
    (salida / 'DETENCION.txt').write_text(
        f'Límite de cuota persistente tras tres intentos. Par: {caso}:{repeticion}\n'
        f'Hora (UTC): {hora}\nEvidencia del último intento:\n{evidencia}\n', encoding='utf-8')
    raise SystemExit(3)


def dentro_configuracion(path):
    path = Path(path)
    try:
        path.relative_to(HOME_P / '.config/opencode')
        return True
    except ValueError:
        pass
    try:
        rel = path.relative_to(HOME_P / 'proyecto')
        return '.opencode' in rel.parts or rel.name in ('opencode.json', 'opencode.jsonc')
    except ValueError:
        return False


def habilitar_configuracion():
    # No dar escritura a proyecto/, sub/ ni .git: sólo archivos JSON existentes
    # y árboles de configuración. Crear archivos en proyecto/ requiere como-dev.
    roots = [HOME_P / '.config/opencode', HOME_P / 'proyecto']
    for root in roots:
        for carpeta, dirs, files in os.walk(root, followlinks=False):
            dirs[:] = [d for d in dirs if d != '.git']
            for path in [Path(carpeta), *[Path(carpeta) / f for f in files]]:
                if path.is_symlink() or not dentro_configuracion(path):
                    continue
                shutil.chown(path, group='participante')
                modo = stat.S_IMODE(path.stat().st_mode)
                path.chmod(modo | (0o2070 if path.is_dir() else 0o060))


def copiar_archivos(prefijo):
    destino = Path(str(prefijo) + '.archivos-antes')
    destino.mkdir()
    for nombre, root in [('global', HOME_P / '.config/opencode'), ('proyecto', HOME_P / 'proyecto')]:
        shutil.copytree(root, destino / nombre, symlinks=True,
                        ignore=lambda carpeta, nombres: {'.git'}.intersection(nombres))
    return destino


def inventario(root):
    archivos = {}
    for carpeta, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d != '.git']
        directorio = Path(carpeta)
        archivos[str(directorio.relative_to(root))] = ('dir', stat.S_IMODE(directorio.stat().st_mode))
        links = [d for d in dirs if (Path(carpeta) / d).is_symlink()]
        for nombre in [*files, *links]:
            path = Path(carpeta) / nombre
            archivos[str(path.relative_to(root))] = ('link', os.readlink(path)) if path.is_symlink() else ('file', sha(path), stat.S_IMODE(path.stat().st_mode))
    return archivos


def diff_archivos(copia):
    cambios = []
    for nombre, root in [('global', HOME_P / '.config/opencode'), ('proyecto', HOME_P / 'proyecto')]:
        antes, despues = inventario(copia / nombre), inventario(root)
        for rel in sorted(antes.keys() | despues.keys()):
            if antes.get(rel) != despues.get(rel):
                path = root / rel
                cambios.append(dict(archivo=str(path), cambio='creado' if rel not in antes else 'borrado' if rel not in despues else 'modificado',
                                    dentro_configuracion=dentro_configuracion(path),
                                    antes=antes.get(rel), despues=despues.get(rel)))
    return cambios


PATRON_ENTORNO = r'^# >>> entorno local >>>$.*?^# <<< entorno local <<<$\n?'


def bloque_entorno(texto):
    match = re.search(PATRON_ENTORNO, texto, re.M | re.S)
    return match[0] if match else ''


def restaurar_entorno(original):
    path = HOME_P / '.bashrc'
    actual = path.read_text()
    alterado = bloque_entorno(actual) != original
    limpio = re.sub(PATRON_ENTORNO, '', actual, flags=re.M | re.S)
    # Escribir sobre el archivo, manteniendo propietario y modo de caso.sh.
    path.write_text(original + limpio)
    return int(alterado)


if __name__ == '__main__':
    selector = argparse.ArgumentParser(add_help=False)
    selector.add_argument('--dimension', choices=['ecologica', 'deteccion'], required=True)
    selector.parse_known_args()
    sys.path.insert(0, str(BASE / 'simulado'))
    from ecologica import medir
    medir(globals())
PYTHON_MED4B
