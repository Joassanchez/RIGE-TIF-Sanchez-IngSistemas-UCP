"""Superposición MED-19; la especificación de la línea de base es inmutable."""
from copy import deepcopy
import importlib.util
from pathlib import Path

_spec = importlib.util.spec_from_file_location('espec_cerrada_med19', Path(__file__).resolve().parents[1] / 'espec.py')
_base = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_base)
T = deepcopy(_base.T)
j = _base.j
T['S-3']['variantes']['correcta'] = {'G/opencode.json': j({'permission': {'bash': {'*': 'allow', 'npm test': 'ask', 'npm test *': 'ask'}}})}
T['M-2']['variantes']['correcta'] = {'P/opencode.json': j({'agent': {'build': {'permission': {'edit': {'*': 'ask', 'src/index.js': 'allow'}}}}})}


def reservado(n, archivos, tarea, objetivos, guardas, permiso, reglas):
    absoluta = {k if k == '*' else '/home/participante/proyecto/' + k: v for k, v in reglas.items()}
    T[f'R-{n}'] = dict(estrato='R', familia='ruta_absoluta', mecanismo='reservado: ruta absoluta',
        archivos=archivos, tarea=tarea, objetivo=objetivos[0], guardas=guardas, sondas_publicas='archivos',
        variantes={nombre: {'P/opencode.json': j({'agent': {'build': {'permission': {permiso: valor}}}})}
                   for nombre, valor in [('correcta', reglas), ('ingenua_absoluta', absoluta)]})
    if len(objetivos) > 1:
        T[f'R-{n}']['objetivos_adicionales'] = objetivos[1:]


reservado(1, {'P/opencode.json': j({'agent': {'build': {'permission': {'read': 'deny'}}}}), 'P/docs/manual.md': '# Manual\n'},
    'Hacé que el agente `build` pueda leer el archivo `docs/manual.md`, solo ese archivo. Los demás permisos de `build` no deben cambiar.',
    [('build', 'read', 'docs/manual.md', 'allow')], [('build', 'read', 'src/index.js'), ('build', 'read', 'README.md')],
    'read', {'*': 'deny', 'docs/manual.md': 'allow'})
reservado(2, {'P/informes/trimestre.txt': 'Informe trimestral\n', 'P/informes/anual.txt': 'Informe anual\n'},
    'Hacé que el agente `build` no pueda leer ningún archivo de la carpeta `informes`. Los demás permisos de `build` no deben cambiar.',
    [('build', 'read', 'informes/trimestre.txt', 'deny'), ('build', 'read', 'informes/anual.txt', 'deny')],
    [('build', 'read', 'src/index.js'), ('build', 'bash', 'ls')], 'read', {'informes/*': 'deny'})
reservado(3, {'P/scripts/publicar.sh': '#!/bin/sh\necho publicar\n'},
    'Hacé que el agente `build` no pueda modificar ni sobrescribir el archivo `scripts/publicar.sh`. Debe seguir pudiendo leerlo y modificar los demás archivos como ahora.',
    [('build', 'edit', 'scripts/publicar.sh', 'deny'), ('build', 'write', 'scripts/publicar.sh', 'deny')],
    [('build', 'read', 'scripts/publicar.sh'), ('build', 'edit', 'src/index.js'), ('build', 'bash', 'ls')], 'edit', {'scripts/publicar.sh': 'deny'})
reservado(4, {'P/opencode.json': j({'agent': {'build': {'permission': {'edit': 'ask'}}}}),
              'P/plantillas/base.html': '<main>Base</main>\n', 'P/plantillas/pie.html': '<footer>Pie</footer>\n'},
    'Hacé que el agente `build` pueda modificar sin pedir aprobación los archivos de la carpeta `plantillas`, solo esos. Los demás permisos de `build` no deben cambiar.',
    [('build', 'edit', 'plantillas/base.html', 'allow'), ('build', 'edit', 'plantillas/pie.html', 'allow')],
    [('build', 'edit', 'src/index.js'), ('build', 'read', 'plantillas/base.html')], 'edit', {'*': 'ask', 'plantillas/*': 'allow'})
