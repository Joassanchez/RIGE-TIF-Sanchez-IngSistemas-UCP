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
import random
import re
import shutil
import subprocess
import sys
import tempfile
import time

BASE = Path('/opt/linea-base')
HOME_E = Path('/home/evaluador')
HOME_P = Path('/home/participante')
CASOS = [f'C-{c}{v}' for c in range(1, 5) for v in 'abcdef']
TOKEN_FIELDS = ('tokens_entrada', 'tokens_cache', 'tokens_salida')
PREGUNTAS = {
    'C-1a': '¿Con qué modelo corre el agente `build` en este proyecto, y qué archivo lo determina?',
    'C-1b': 'Si el agente `build` usa la herramienta `webfetch`, ¿qué ocurre, y qué archivo lo determina?',
    'C-1c': '¿Qué temperatura usa el agente `plan` en este proyecto, y qué archivo la determina?',
    'C-1d': 'Si el agente `build` intenta modificar el archivo `src/productos.js`, ¿qué ocurre, y qué archivo lo determina?',
    'C-1e': '¿Qué temperatura usa el agente `build` en este proyecto, y qué archivo la determina?',
    'C-1f': 'Si el agente `build` intenta leer `src/productos.js`, ¿qué decisión de permiso corresponde, y qué regla y archivo la determinan?',
    'C-2a': '¿Con qué modelo y con qué temperatura corre el agente `build`, y de qué archivo sale cada uno de los dos valores?',
    'C-2b': 'Trabajando desde `sub/`, ¿con qué modelo corre el agente `docs`, y qué archivo lo determina?',
    'C-2c': '¿Con qué modelo y con qué temperatura corre el agente `revisor`, y de dónde sale cada uno de los dos valores?',
    'C-2d': '¿Con qué modelo corre el agente `build`, y qué archivo lo determina?',
    'C-2e': '¿Con qué modelo corre el agente `build` en este proyecto, y de qué entrada sale ese valor?',
    'C-2f': '¿Con qué modelo y con qué temperatura corre el agente `build`, y de qué entrada y archivo sale cada valor?',
    'C-3a': '¿Qué modelo usa el agente `plan`, y de dónde sale ese valor?',
    'C-3b': 'Si el agente `build` intenta leer el archivo `.env` del proyecto, ¿qué ocurre, y qué regla lo determina?',
    'C-3c': '¿Con qué modelo corre el agente `build`, y de dónde sale ese valor?',
    'C-3d': 'Si el agente `plan` intenta modificar el archivo `README.md`, ¿qué ocurre, y qué regla lo determina?',
    'C-3e': '¿Cuál es el valor efectivo de `description` del agente `plan`, y de dónde sale ese valor?',
    'C-3f': 'Si el agente `build` lanza al subagente `general` para ejecutar `git status` en este proyecto, ¿qué decisión de permiso corresponde al subagente, y qué regla la determina?',
    'C-4a': 'Si el agente `build` ejecuta `git status`, ¿qué ocurre, y qué regla lo decide?',
    'C-4b': 'Si el agente `build` ejecuta `git diff`, ¿qué ocurre, y qué regla lo decide?',
    'C-4c': 'Si el agente `plan` intenta modificar el archivo `src/index.js`, ¿qué ocurre, y qué regla lo decide?',
    'C-4d': 'Si el agente `build` ejecuta `npm install`, ¿qué ocurre, y qué regla lo decide?',
    'C-4e': 'Para el agente `build`, ¿qué decisiones de permiso corresponden a usar `webfetch` y a modificar `src/productos.js`, y qué regla y entrada determinan cada decisión?',
    'C-4f': 'Si el agente `build` intenta modificar `src/productos.js`, ¿qué decisión de permiso corresponde, y qué regla y entrada la determinan?',
}
INSTRUCCION = '''Estás ayudando a un desarrollador a entender la configuración de OpenCode 1.18.25 en esta máquina.

Su proyecto está en /home/participante/proyecto y su terminal está abierta en {DIRECTORIO}.
Para ejecutar comandos en su entorno, con sus variables y su configuración, usá:
    como-dev '<comando>'
En tu directorio actual tenés la hoja de referencia (hoja-referencia.md) y la documentación
oficial de OpenCode 1.18.25 sin conexión (docs/index.html).

No modifiques ningún archivo.

Pregunta: {PREGUNTA}

Cuando tengas la respuesta, terminá tu mensaje con un único bloque JSON con esta forma exacta:
{{"respuesta": "<valor o decisión>", "fuente": "<archivo, variable o regla de la que proviene>"}}
'''


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def hash_arbol(roots):
    h = hashlib.sha256()
    for root in map(Path, roots):
        h.update(str(root).encode() + b'\0')
        if not root.exists():
            h.update(b'AUSENTE\0')
            continue
        paths = sorted(root.rglob('*')) if root.is_dir() else [root]
        for p in paths:
            if '.git' in p.relative_to(root.parent).parts:
                continue
            nombre = str(p.relative_to(root) if p != root else p.name)
            h.update(nombre.encode() + b'\0')
            if p.is_symlink():
                h.update(b'LINK\0' + os.readlink(p).encode())
            elif p.is_file():
                h.update(b'FILE\0' + p.read_bytes())
            elif p.is_dir():
                h.update(b'DIR\0')
    return h.hexdigest()


def hash_escenario():
    # Sólo el bloque del caso, no las preferencias ajenas de bash.
    h = hashlib.sha256(hash_arbol([HOME_P / 'proyecto', HOME_P / '.config/opencode']).encode())
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
        web |= t['herramienta'] in ('webfetch', 'websearch') or bool(re.search(r'\b(?:curl|wget|fetch|requests|urllib|Invoke-WebRequest)\b|https?://', command, re.I))
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
    if destino.exists():
        shutil.rmtree(destino)
    shutil.copytree(origen, destino)
    subprocess.run(['chown', '-R', 'evaluador:evaluador', str(destino)], check=True)
    return hash_arbol([origen]), hash_arbol([destino])


def main():
    p = argparse.ArgumentParser(description='MED-4b; nunca corrige dentro del contenedor.')
    p.add_argument('--tanda', default='ensayo')
    p.add_argument('--condicion', choices=['LB', 'FIN'], default='LB')
    p.add_argument('--ejecutor', choices=['principal', 'charles'], default='principal')
    p.add_argument('--brazo', choices=['LB', 'indicado', 'disponible'], default='LB')
    p.add_argument('--modelo', default='openai/gpt-6.1-sol')
    p.add_argument('--agente')
    p.add_argument('--k', type=int, default=3)
    p.add_argument('--limite', type=int, default=600)
    p.add_argument('--semilla', type=int, default=20261013)
    p.add_argument('--casos', default=','.join(CASOS))
    p.add_argument('--ensayo', action='store_true')
    p.add_argument('--fase', choices=['piloto', 'medicion'], default='medicion')
    p.add_argument('--recorte-declarado', help='Motivo del recorte de k permitido por ADR-076/079; nunca en principal/gpt-6.1-sol')
    p.add_argument('--rige-descripcion', help='Texto congelado de la fila de RIGE, contrastado con --help')
    a = p.parse_args()
    if not a.ensayo:
        requeridas = ('--tanda', '--modelo', '--k', '--limite', '--semilla', '--ejecutor', '--brazo', '--condicion')
        if not all(f in sys.argv for f in requeridas):
            p.error('Medición real: indicar explícitamente tanda, modelo, k, limite, semilla, ejecutor, brazo y condicion congelados.')
    if not re.fullmatch(r'[A-Za-z0-9_-]+', a.tanda) or a.k < 1 or a.limite < 1:
        p.error('Tanda inválida o parámetros no positivos.')
    casos = a.casos.split(',')
    if len(set(casos)) != len(casos) or not set(casos) <= set(CASOS):
        p.error('Lista de casos inválida.')
    if (a.condicion == 'LB') != (a.brazo == 'LB'):
        p.error('LB requiere brazo LB; FIN requiere indicado o disponible.')
    if a.ejecutor == 'charles' and a.modelo != 'openai/gpt-6-luna':
        p.error('Charles conserva openai/gpt-6-luna.')
    if a.ejecutor == 'principal' and a.modelo not in ('openai/gpt-6.1-sol', 'openai/gpt-6-astra', 'openai/gpt-6-luna'):
        p.error('Principal: sólo los tres modelos congelados de ADR-076.')
    if a.recorte_declarado and a.ejecutor == 'principal' and a.modelo == 'openai/gpt-6.1-sol':
        p.error('ADR-076/079: no recortar k del ejecutor y modelo principales.')
    agente = 'build' if a.ejecutor == 'principal' else 'charles'
    if a.agente and a.agente != agente:
        p.error('El agente debe coincidir con el ejecutor congelado.')
    if a.fase == 'piloto' and (a.k != 10 or casos != CASOS or a.ejecutor != 'principal' or a.modelo != 'openai/gpt-6.1-sol' or a.condicion != 'LB'):
        p.error('Piloto: principal/gpt-6.1-sol, 24 casos, k=10, LB.')
    indicacion = (BASE / 'indicacion.txt').read_text(encoding='utf-8')
    if a.brazo == 'indicado' and ('[DECISIÓN PENDIENTE' in indicacion or not indicacion.strip()):
        p.error('Brazo indicado bloqueado: fijar vm/indicacion.txt antes del piloto.')
    if a.condicion == 'FIN' and (not shutil.which('rige') or not a.rige_descripcion):
        p.error('[DECISIÓN PENDIENTE: instalar RIGE congelado y fijar su fila de referencia contrastada con --help]')
    if a.ensayo:
        if os.environ.get('OPENCODE_AUTH_JSON'):
            p.error('Ensayo sin credenciales.')
        rutas = Path('/proc/net/route').read_text().splitlines()[1:]
        if any(l.split()[0] != 'lo' for l in rutas if l.strip()):
            p.error('Ensayo requiere --network none, sólo bucle local.')
    else:
        credencial = os.environ.pop('OPENCODE_AUTH_JSON', None)
        if not credencial:
            p.error('Falta OPENCODE_AUTH_JSON; la credencial sólo ingresa por entorno.')
        try:
            auth = json.loads(credencial)
            if not isinstance(auth, dict) or 'openai' not in auth:
                raise ValueError()
        except ValueError:
            p.error('OPENCODE_AUTH_JSON debe contener el objeto auth.json con proveedor openai.')
        authpath = HOME_E / '.local/share/opencode/auth.json'
        authpath.parent.mkdir(parents=True, exist_ok=True)
        authpath.write_text(json.dumps(auth))
        authpath.chmod(0o600)
        shutil.chown(authpath, user='evaluador', group='evaluador')
        del credencial, auth
    salida = BASE / 'resultados' / a.tanda
    salida.mkdir(parents=True, exist_ok=False)
    crudo = salida / 'crudo'
    crudo.mkdir()
    tarifas_path = BASE / 'tarifas.json'
    if not tarifas_path.exists():
        p.error('Falta la copia root de tarifas congeladas; usar contenedor.sh medir.')
    tarifas = json.loads(tarifas_path.read_text())
    freeze, hash_config = congelar_ejecutor(a.ejecutor)
    manifiesto = json.loads((BASE / 'ejecutores/congeladas.json').read_text())
    for nombre, esperado in manifiesto['archivos'].items():
        if sha(BASE / 'ejecutores' / nombre) != esperado:
            p.error(f'Configuración cambió después de congelar: {nombre}')
    os.chdir(HOME_E / 'tarea')
    help_code = ejecutar(como_evaluador(['opencode', 'run', '--help']), salida / 'run-help.txt', salida / 'run-help.stderr.txt')
    # opencode run --help escribe la ayuda en stderr (verificado el 13/10/2026).
    ayuda = (salida / 'run-help.txt').read_text() + (salida / 'run-help.stderr.txt').read_text()
    if help_code or not all(f in ayuda for f in ('--model', '--agent', '--format')):
        (salida / 'DETENCION.txt').write_text('opencode run no confirma --model/--agent/--format; alternativa: servidor/API con selección explícita, pendiente de decisión. No se ejecutó ninguna repetición.\n')
        p.error('Detención: flags no confirmados; conservar la evidencia y decidir alternativa.')
    for comando, nombre in [(['opencode', 'debug', 'config'], 'config'), (['opencode', 'debug', 'agent', agente], 'agente'), (['opencode', 'debug', 'skill'], 'skills')]:
        if ejecutar(como_evaluador(comando), salida / f'ejecutor-{nombre}.json', salida / f'ejecutor-{nombre}.stderr.txt'):
            p.error(f'Configuración efectiva no verificable: debug {nombre}; conservar evidencia.')
    ejecutar(como_evaluador(['opencode', '--version']), salida / 'opencode-version.txt', salida / 'opencode-version.stderr.txt')
    if (salida / 'opencode-version.txt').read_text().strip() != '1.18.25':
        p.error('Versión de OpenCode distinta de 1.18.25.')
    hoja = (BASE / 'hoja-referencia.md').read_text()
    hoja = re.sub(r'^## Cómo responder\n.*?(?=^## )', '', hoja, flags=re.M | re.S)
    hoja = re.sub(r'^## No disponible durante la sesión\n.*', '', hoja, flags=re.M | re.S)
    if a.condicion == 'FIN':
        hoja = hoja.replace('## Documentación', f'| `rige` | {a.rige_descripcion} |\n\n## Documentación')
    hoja_path = HOME_E / 'tarea/hoja-referencia.md'
    hoja_path.write_text(hoja)
    trabajos = [(c, r) for c in casos for r in range(1, a.k + 1)]
    random.Random(a.semilla).shuffle(trabajos)
    meta = vars(a) | {'agente': agente, 'orden': trabajos, 'inicio': datetime.now(timezone.utc).isoformat(),
        'version_opencode': '1.18.25', 'hash_binario': sha(shutil.which('opencode')),
        'hash_ejecutor': freeze, 'hash_instruccion': hashlib.sha256(INSTRUCCION.encode()).hexdigest(),
        'hash_indicacion': sha(BASE / 'indicacion.txt'), 'hash_hoja': sha(hoja_path), 'hash_tarifas': sha(tarifas_path),
        'hash_arnes': sha(BASE / 'medir.sh'), 'hash_preguntas': hashlib.sha256(json.dumps(PREGUNTAS, sort_keys=True).encode()).hexdigest(),
        'verificacion_flags': 'opencode run --help como evaluador; run-help.txt',
        'extraccion_tokens': 'step_finish.part.tokens.input + cache.read + output; por solicitud; no duplicar part.id; export completo por sesión para incluir hijos y censura',
        'verificacion_tokens_proveedor_real': '[VERIFICAR: contrastar semántica de input/cache/output/reasoning y export/API en fase 0; evidencia local sólo acredita estructura]'}
    (salida / 'tanda.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
    registro = salida / 'registro.jsonl'
    for caso, repeticion in trabajos:
        congelar_ejecutor(a.ejecutor)
        todos_solicitudes, todos_tools, intentos = [], [], []
        incompleto = False
        inicio = datetime.now(timezone.utc).isoformat()
        principio = time.monotonic()
        duracion_ejecuciones = 0
        for intento in range(3):
            prefijo = crudo / f'{caso}-{repeticion}-{intento}'
            with (Path(str(prefijo) + '.activacion.txt')).open('wb') as out:
                subprocess.run([str(BASE / 'caso.sh'), caso], stdout=out, stderr=subprocess.STDOUT, check=True)
            env_text = (BASE / 'casos' / caso / 'caso.env').read_text()
            match = re.search(r'^DIR=([A-Za-z0-9_/-]*)$', env_text, re.M)
            directorio = match[1] if match else ''
            if directorio and not re.fullmatch(r'[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*', directorio):
                p.error('DIR inválido.')
            instruccion = INSTRUCCION.format(DIRECTORIO=str(HOME_P / 'proyecto' / directorio), PREGUNTA=PREGUNTAS[caso])
            if a.brazo == 'indicado':
                instruccion += '\n' + indicacion
            entorno = {'COMO_DEV_DIR': directorio}
            modelo_ejecutado = a.modelo
            proveedor = None
            temporal = None
            try:
                if a.ensayo:
                    temporal = tempfile.TemporaryDirectory(prefix='med4b-')
                    aux = Path(temporal.name)
                    aux.chmod(0o755)
                    listo = aux / 'listo'
                    proveedor = subprocess.Popen(['python3', str(BASE / 'simulado/ensayo.py'), '--datos', str(BASE / 'simulado/ensayo.json'), '--caso', caso,
                        '--registro', str(prefijo) + '.proveedor.jsonl', '--listo', str(listo)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    for _ in range(100):
                        if listo.exists() or proveedor.poll() is not None:
                            break
                        time.sleep(.05)
                    if not listo.exists():
                        raise RuntimeError('El simulado no inició; conservar la tanda incompleta.')
                    modelo_ejecutado = 'simulado/medicion'
                    cfg = aux / 'proveedor.json'
                    cfg.write_text(json.dumps({'provider': {'simulado': {'npm': '@ai-sdk/openai-compatible', 'name': 'Ensayo local', 'options': {'baseURL': f'http://127.0.0.1:{listo.read_text().strip()}/v1'}, 'models': {'medicion': {'name': 'ENSAYO', 'limit': {'context': 64000, 'output': 8000}, 'tool_call': True}}}}}))
                    cfg.chmod(0o644)
                    entorno['OPENCODE_CONFIG'] = str(cfg)
                # Calentamiento nativo fuera del cronómetro: OpenCode escribe
                # .gitignore/paquetes en su config aun al hacer introspección.
                warmcode = ejecutar(como_evaluador(['opencode', 'debug', 'agent', agente], entorno), str(prefijo) + '.ejecutor.json', str(prefijo) + '.ejecutor.stderr.txt')
                if warmcode:
                    raise RuntimeError('No se pudo preparar/verificar el ejecutor; no medir sobre ese fallo.')
                antes = hash_escenario()
                antes_e = hash_arbol([HOME_E / '.config/opencode'])
                outpath, errpath = str(prefijo) + '.stdout.txt', str(prefijo) + '.stderr.txt'
                inicio_run = time.monotonic()
                codigo = ejecutar(como_evaluador(['opencode', 'run', '--model', modelo_ejecutado, '--agent', agente, '--format', 'json', instruccion], entorno), outpath, errpath, a.limite)
                duracion_run = time.monotonic() - inicio_run
                duracion_ejecuciones += duracion_run
                despues = hash_escenario()
                despues_e = hash_arbol([HOME_E / '.config/opencode'])
                parsed = extraer_eventos(Path(outpath).read_text(errors='replace'))
                if parsed['sesiones_hijas'] or codigo in (124, 137):
                    parsed = recuperar_sesiones(parsed, prefijo, entorno)
                Path(str(prefijo) + '.eventos.txt').write_text(''.join(json.dumps(e, ensure_ascii=False) + '\n' for e in parsed['eventos']))
                todos_solicitudes.extend(parsed['solicitudes'])
                todos_tools.extend(parsed['herramientas'])
                incompleto |= parsed['registro_incompleto'] or antes != despues or antes_e != despues_e
                evidencia = Path(errpath).read_text(errors='replace') + Path(outpath).read_text(errors='replace')
                transitorio = codigo not in (124, 137) and bool(re.search(r'(?:status(?:Code)?|HTTP|status code)[\s\x22:=]+(?:429|5\d\d)\b|rate[_ -]limit|Too Many Requests', evidencia, re.I))
                intentos.append(dict(intento=intento, codigo_salida=codigo, hash_antes=antes, hash_despues=despues,
                                     duracion_s=duracion_run,
                                     hash_ejecutor_antes=antes_e, hash_ejecutor_despues=despues_e, transitorio=transitorio,
                                     censurado=codigo in (124, 137), archivo_evidencia=f'crudo/{prefijo.name}.stdout.txt',
                                     errores_tokens=parsed['errores_tokens']))
            finally:
                if proveedor:
                    proveedor.terminate()
                    proveedor.wait(timeout=5)
                if temporal:
                    temporal.cleanup()
            if not transitorio or intento == 2:
                break
            time.sleep(1)
        # Incluye el consumo de todos los intentos, incluso errores y censura.
        totales = {k: sum(s[k] for s in todos_solicitudes) if not incompleto else None for k in TOKEN_FIELDS}
        precio = next((m for m in tarifas['modelos'] if m['modelo'] == a.modelo.split('/')[-1]), None)
        costo = None
        if precio and not incompleto:
            costo = 0
            for s in todos_solicitudes:
                nivel = 'contexto_largo' if s['tokens_entrada'] + s['tokens_cache'] > tarifas['umbral_contexto_largo_tokens_entrada_por_solicitud'] else 'contexto_corto'
                rates = precio[nivel]
                costo += ((s['tokens_entrada'] + s.get('cache_escritura', 0)) * rates['entrada'] + s['tokens_cache'] * rates['entrada_en_cache'] + s['tokens_salida'] * rates['salida']) / 1e6
        row = dict(tanda=a.tanda, condicion=a.condicion, ejecutor=a.ejecutor, modelo=a.modelo, agente=agente, brazo=a.brazo,
            ensayo=a.ensayo, fase=a.fase, k=a.k, caso=caso, condicion_caso=caso[:3], variante=caso[-1], repeticion=repeticion,
            recorte_declarado=a.recorte_declarado,
            inicio=inicio, duracion_s=duracion_ejecuciones, duracion_total_s=time.monotonic() - principio, censurado=int(any(i['censurado'] for i in intentos)),
            codigo_salida=codigo, reintentos=len(intentos)-1, intentos=intentos, solicitudes=todos_solicitudes,
            hash_antes=intentos[0]['hash_antes'], hash_despues=intentos[-1]['hash_despues'],
            escenario_alterado=int(any(i['hash_antes'] != i['hash_despues'] for i in intentos)),
            ejecutor_alterado=int(any(i['hash_ejecutor_antes'] != i['hash_ejecutor_despues'] for i in intentos)),
            respuesta_textual=parsed['respuesta_textual'], archivo_evidencia=intentos[-1]['archivo_evidencia'],
            herramientas=todos_tools, registro_incompleto=incompleto, costo_usd=costo,
            hash_ejecutor=freeze, modelo_ejecutado=modelo_ejecutado, **totales, **observar(todos_tools))
        row['hash_instruccion'] = hashlib.sha256(instruccion.encode()).hexdigest()
        if a.condicion == 'LB':
            row['uso_rige'] = None
        with registro.open('a') as f:
            f.write(json.dumps(row, ensure_ascii=False) + '\n')
    print(f'Tanda terminada: {salida}. Corregir y analizar fuera del contenedor.')


if __name__ == '__main__':
    main()
PYTHON_MED4B
