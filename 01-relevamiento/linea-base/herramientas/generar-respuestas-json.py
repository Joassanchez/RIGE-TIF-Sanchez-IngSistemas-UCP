#!/usr/bin/env python3
"""Compila la hoja; reglas auditables, sin inferencias de un modelo de lenguaje.

Las regex operan sobre texto sin backticks, en minúsculas. Se exige cada regex
de un grupo (AND); los grupos son alternativas (OR). Rechazo y aceptación
simultáneos, o texto no cubierto, requieren adjudicación. No son un analizador
semántico: las formulaciones libres no reconocidas nunca se dan por correctas.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

GLOBAL = r'(?:\bglobal\b|\.config/opencode/opencode\.json(?!c))'
PROYECTO = r'(?:\bproyecto\b|\bproject\b)'
NATIVA = r'(?:nativ[ao]|incorporad[ao]|builtin|built-in)'

# Traducciones conservadoras de «Fuente aceptada/rechazada» de la hoja.
# Una lista interior es conjunción. No aceptar sólo nombres de archivos ambiguos.
FUENTES = {
    'C-1a': ([[PROYECTO]], [[GLOBAL]]),
    'C-1b': ([[GLOBAL]], [[PROYECTO], [r'defecto']]),
    'C-1c': ([[GLOBAL]], [[PROYECTO]]),
    'C-1d': ([[PROYECTO, r'edit\s*[:=→-]*\s*deny']], [[GLOBAL]]),
    'C-1e': ([[r'(?:proyecto/\.opencode/opencode\.json|\.opencode.*proyecto|proyecto.*\.opencode)']], [[GLOBAL], [r'proyecto/opencode\.json'], [NATIVA]]),
    'C-1f': ([[r'config\.json', r'read\s*[:=→-]*\s*deny']], [[r'proyecto.*opencode\.json'], [NATIVA], [r'^(?:el )?global$']]),
    'C-2b': ([[r'(?:proyecto/\.opencode/opencode\.json|\.opencode.*raíz|\.opencode.*raiz|el de arriba)']], [[r'sub/\.opencode'], [r'^(?:el )?\.?opencode$']]),
    'C-2c': ([[r'revisor\.md']], [[r'^opencode\.json$']]),
    'C-2d': ([[r'opencode\.jsonc']], [[r'config\.json'], [r'^(?:el )?global$']]),
    'C-2e': ([[r'opencode_config_content']], [[r'caso\.env'], [r'^(?:el )?opencode\.json.*proyecto$']]),
    'C-3a': ([[r'\boc_modelo\b']], [[r'^(?:el )?global$']]),
    'C-3b': ([[NATIVA]], [[r'^(?:el )?global$'], [r'^(?:el )?proyecto$']]),
    'C-3c': ([[r'modelo-equipo\.txt']], [[r'^(?:el )?global$']]),
    'C-3d': ([[NATIVA, r'\bplan\b']], [[r'^(?:el )?global$'], [r'^(?:el )?proyecto$']]),
    'C-3e': ([[PROYECTO, r'rige_lb_etiqueta_ausente', r'(?:no definida|ausen|sin definir|undefined)']], [[r'^(?:el )?proyecto$'], [r'^(?:el )?global$']]),
    'C-3f': ([[r'general', r'(?:propi[ao]|nativ[ao])', r'(?:no.*(?:hereda|aplica)|sin.*hered)']], [[r'^(?:regla )?bash:\s*deny.*build.*heredada$'], [r'plan.*bash.*allow']]),
    'C-4a': ([[GLOBAL, r'git\s*\*', r'allow']], [[r'^(?:por )?el orden$']]),
    'C-4b': ([[PROYECTO, r'\*', r'deny']], [[r'^(?:por )?el orden$']]),
    'C-4c': ([[GLOBAL, r'edit\s*[:=→-]*\s*allow']], [[r'^(?:el )?modo plan no edita$'], [r'^regla nativa$']]),
    'C-4d': ([[GLOBAL, r'build', r'\*', r'deny']], [[r'^(?:el )?proyecto$'], [r'proyecto tiene prioridad']]),
    'C-4f': ([[PROYECTO, r'edit\s*[:=→-]*\s*deny']], [[r'^opencode_permission$'], [r'^(?:el )?global$'], [r'^regla nativa$']]),
}
COMPUESTAS = {
    'C-2a': [('modelo', GLOBAL), ('temperatura', PROYECTO)],
    'C-2f': [('modelo', r'(?:equipo\.json|opencode_config\b)'), ('temperatura', PROYECTO)],
    'C-4e': [('webfetch', r'(?=.*proyecto)(?=.*agent\.build\.permission\.webfetch).*'), ('edición', r'(?=.*edit)(?=.*opencode_permission).*')],
}
RECHAZOS_COMPUESTAS = {
    'C-2a': ([[PROYECTO]], [[GLOBAL]]),
    'C-2f': ([[GLOBAL]], [[r'equipo\.json|opencode_config\b']]),
    'C-4e': ([[r'opencode_permission'], [GLOBAL]], [[PROYECTO], [GLOBAL]]),
}


def generar(texto):
    bloques = dict(re.findall(r'^### (C-[1-4][a-f])[^\n]*\n(.*?)(?=^### |^## |\Z)', texto, re.M | re.S))
    if len(bloques) != 24:
        raise ValueError('La hoja debe contener los 24 casos, sin duplicados.')
    casos = {}
    for caso, bloque in sorted(bloques.items()):
        campos = dict(re.findall(r'^- ([^:\n]+): (.*)$', bloque, re.M))
        linea = campos.get('Respuesta', campos.get('Respuesta esperada', ''))
        valores = re.findall(r'`([^`]+)`', linea)
        manual = caso == 'C-2c' or not valores
        partes = []
        if caso in COMPUESTAS:
            if caso == 'C-4e':
                valores = ['allow', 'ask']  # extraídos de las parejas clave/valor
                assert re.findall(r'`(allow|ask|deny)`', linea) == valores
            for (nombre, patron), valor, rechazadas_parte in zip(COMPUESTAS[caso], valores, RECHAZOS_COMPUESTAS[caso]):
                partes.append({'nombre': nombre, 'respuesta': valor,
                               'fuentes_aceptadas': [[patron]], 'fuentes_rechazadas': rechazadas_parte})
        elif caso == 'C-2c':
            # La sección del caso conserva dos alternativas aunque la tabla
            # de captura confirme 0.2. No elegir silenciosamente entre ellas.
            partes = [{'nombre': 'modelo', 'respuesta': valores[0]},
                      {'nombre': 'temperatura', 'respuesta': None}]
        aceptadas, rechazadas = FUENTES.get(caso, ([], []))
        if caso in COMPUESTAS:
            rechazadas = [[r'^(?:el )?(?:global|proyecto|equipo\.json|opencode_permission)$']]
        casos[caso] = {
            'condicion': caso[:3], 'tipo_consulta': 'permiso' if 'Decisión + regla' in re.search(rf'^\| {caso} \| ([^|]+)\|', texto.split('## Tipo de consulta')[1], re.M)[1] else 'valor',
            'pregunta': campos['Pregunta'].strip('«»'),
            'respuesta': '; '.join(p['respuesta'] or '[DATO PENDIENTE]' for p in partes) if partes else (valores[0] if valores else None),
            'sinonimos': {'allow': ['permitido'], 'ask': ['pregunta'], 'deny': ['denegado']},
            'partes': partes, 'fuentes_aceptadas': aceptadas,
            'fuentes_rechazadas': rechazadas,
            'revision_manual': manual,
            'motivo_revision': 'C-2c conserva alternativas de temperatura en la sección del caso; adjudicar conforme a la captura verificada.' if manual else '',
            'criterio_respuesta_original': linea,
            'criterio_fuente_original': campos.get('Fuente aceptada', ''),
            'criterio_rechazo_original': campos.get('Fuente rechazada', ''),
            'documentada': re.search(rf'^\| {caso} \| ([^|]+)\|', texto.split('## Clasificación documental')[1].split('## Tipo de consulta')[0], re.M)[1].strip(),
        }
    return {'version': 1, 'sha256_hoja': hashlib.sha256(texto.encode()).hexdigest(),
            'regex': 're.IGNORECASE; texto sin backticks; AND dentro de cada grupo, OR entre grupos; conflictos a revisión manual',
            'hoja_cerrada': True if 'hoja cerrada el' in texto.lower() else (False if 'Cierre de la hoja:** pendiente' in texto else None),
            'casos': casos}


def generar_modificacion(texto):
    tabla = texto.split('## Objetivos por caso', 1)[1].split('\n## ', 1)[0]
    casos = {}
    for linea in tabla.splitlines():
        if not re.match(r'^\| C-[1-4][a-f] \|', linea):
            continue
        caso, agente, elemento, inicial, objetivo = [c.strip() for c in linea.strip('|').split('|')]
        if caso in casos:
            raise ValueError('Caso duplicado en objetivos.')
        def celda(s):
            s = s.strip('`')
            return float(s) if re.fullmatch(r'\d+\.\d+', s) else s
        casos[caso] = dict(agente=re.search(r'`([^`]+)`', agente)[1],
                           elemento=elemento.strip('`'), inicial=celda(inicial),
                           tipo_consulta='permiso' if elemento.startswith('S') else 'valor',
                           objetivo=None if caso == 'C-2e' else celda(objetivo),
                           no_factible=caso == 'C-2e', criterio_original=objetivo)
        if caso == 'C-2e':
            variable = re.search(r'`(OPENCODE_CONFIG_CONTENT)`', objetivo)[1]
            # Traducción conservadora de las dos alternativas de esta celda.
            if not all(s in objetivo for s in ('variable de entorno', 'contiene la configuración', 'gana al proyecto')):
                raise ValueError('Cambió el criterio de impedimento; revisar su traducción.')
            casos[caso]['impedimentos_aceptados'] = [
                [re.escape(variable)],
                [r'variable de entorno', r'(?:contiene|contener).*configuraci[oó]n',
                 r'(?:gana|prevalece|prioridad|precedencia).*proyecto'],
            ]
    if set(casos) != {f'C-{c}{v}' for c in range(1, 5) for v in 'abcdef'}:
        raise ValueError('Se requieren exactamente los 24 objetivos.')
    sondeos = []
    for nombre, permiso, patron in re.findall(r'^\| (S\d+) \| `([^`]+)` \| `([^`]+)` \|$', texto, re.M):
        sondeos.append(dict(nombre=nombre, permiso=permiso, patron=patron))
    if len(sondeos) != 10:
        raise ValueError('Se requieren los diez sondeos de la hoja.')
    return dict(version=1, dimension='modificacion',
                sha256_hoja=hashlib.sha256(texto.encode()).hexdigest(),
                hoja_cerrada=True if 'hoja cerrada el' in texto.lower() else (False if 'Cierre de la hoja:** pendiente' in texto else None),
                sondeos=sondeos, casos=casos)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dimension', choices=['atribucion', 'modificacion'], default='atribucion')
    parser.add_argument('--hoja', type=Path)
    parser.add_argument('--salida', type=Path)
    args = parser.parse_args()
    base = Path(__file__).resolve().parents[1]
    nombre = 'modificacion/respuestas-modificacion' if args.dimension == 'modificacion' else 'respuestas'
    hoja = args.hoja or base / (nombre + '.md')
    salida = args.salida or base / (nombre + '.json')
    generar_hoja = generar_modificacion if args.dimension == 'modificacion' else generar
    salida.write_text(json.dumps(generar_hoja(hoja.read_text(encoding='utf-8')), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
