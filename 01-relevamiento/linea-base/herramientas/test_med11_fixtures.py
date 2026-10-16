"""Capturas SINTÉTICAS para probar tuberías; nunca acreditan admisión nativa."""
from copy import deepcopy
import importlib.util
from pathlib import Path
import json
import hashlib

ROOT = Path(__file__).resolve().parents[1]


def captura_sintetica(tid, variante):
    spec = importlib.util.spec_from_file_location('med11_fixture_spec', ROOT / 'ecologica/espec.py')
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    t = m.T[tid]
    base = json.loads((ROOT / 'verificacion/20261014-tareas-ecologica/salida/M-5/base/agente-build.json').read_text(encoding='utf-8'))
    agentes = ({s[0] for s in [t['objetivo'], *t.get('objetivos_adicionales', []), *t['guardas']]}
               if 'objetivo' in t else {t['valor'][0]})
    out = {ag: deepcopy(base) for ag in agentes}
    def regla(ag, permiso, patron, accion):
        out[ag]['permission'].append(dict(permission=permiso, pattern=patron, action=accion))
    if t.get('guardas_archivos'):
        out['__archivos__'] = {rel: (dict(tipo='enlace', destino='../../proyecto/.opencode/compartida.json')
            if rel == 'G/opencode.json' else dict(tipo='archivo', sha256=hashlib.sha256(t['archivos'][rel].encode()).hexdigest()))
            for rel in t['guardas_archivos']}
    if 'valor' in t:
        ag, campo, esperado = t['valor']
        out[ag].update(temperature=0.2)
        if tid == 'V-5': out[ag].update(model='openai/gpt-5-mini', prompt='Documentá el inventario.')
        if tid == 'V-6': out[ag]['description'] = 'Equipo '
        if tid == 'V-7': out[ag].update(prompt='', description='Guía de auditoría')
        if tid == 'V-8': out[ag].update(prompt='MED11_GUIA_BASE', options={'instructions': ['reglas.md']})
        if variante == 'correcta': out[ag][campo] = esperado
        if tid == 'V-8' and variante == 'ingenua_instructions': out[ag]['options']['instructions'] = ['./reglas.md']
        return out
    if tid.startswith('S-'):
        origen = t['origen']
        if origen.startswith('M-'):
            return {p.stem[7:]: json.loads(p.read_text(encoding='utf-8')) for p in
                    (ROOT / f'verificacion/20261014-tareas-ecologica/salida/{origen}/{variante}').glob('agente-*.json')}
        return captura_sintetica(origen, variante)
    if tid == 'N-2': regla('build', 'webfetch', '*', 'deny')
    if tid == 'N-3':
        regla('auditor', 'bash', '*', 'deny')
        regla('auditor', 'edit', '*', 'deny')
    if tid == 'N-5':
        regla('build', 'edit', '*', 'ask')
        regla('plan', 'edit', '*', 'deny')
    if tid == 'N-7': regla('build', 'read', 'secretos.txt', 'deny')
    if tid == 'N-13': regla('build', 'write', '*', 'deny')
    if tid == 'N-14': regla('build', 'list', '*', 'deny')
    if variante == 'correcta':
        for ag, perm, sujeto, accion in [t['objetivo'], *t.get('objetivos_adicionales', [])]:
            regla(ag, 'edit' if perm == 'write' else perm, sujeto, accion)
    elif variante == 'ingenua_amplia':
        regla(t['objetivo'][0], 'bash', '*', 'ask' if tid == 'N-1' else 'allow')
    elif variante == 'ingenua_global':
        for ag in ('build', 'plan'): regla(ag, 'edit', '*', 'allow')
    elif variante == 'ingenua_quita_permission': regla('build', 'bash', '*', 'deny')
    elif variante == 'ingenua_destino': out['__archivos__']['P/.opencode/compartida.json']['sha256'] = 'alterado'
    elif variante == 'ingenua_reemplaza_enlace':
        regla('build', 'bash', 'npm test', 'ask')
        out['__archivos__']['G/opencode.json'] = dict(tipo='archivo', sha256='reemplazo')
    elif variante == 'ingenua_allowlist': regla('build', 'read', '*', 'allow')
    return out
