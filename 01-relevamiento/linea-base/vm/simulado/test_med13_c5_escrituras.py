"""MED-13-c5: contratos de read/edit/write sobre todos los planes de ensayo."""
import json
from pathlib import Path
import shlex
import shutil
import tempfile
import unittest

from ensayo import EnsayoModificacion

ROOT = Path(__file__).resolve().parents[2]


def leer(rel):
    return json.loads((ROOT / rel).read_text(encoding='utf-8'))


def materializar(home, archivos):
    roots = {'G': home / '.config/opencode', 'P': home / 'proyecto', 'H': home}
    for rel, contenido in archivos.items():
        path = roots[rel[0]] / rel[2:]
        path.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(contenido, str):
            path.write_text(contenido, encoding='utf-8')
    for rel, contenido in archivos.items():
        if isinstance(contenido, dict):
            # Sustituto de enlaces para que la prueba no requiera privilegios
            # de Windows. Mantiene el contenido que leerá el proveedor.
            path = roots[rel[0]] / rel[2:]
            path.write_bytes((path.parent / contenido['enlace']).read_bytes())
    return roots


class EscriturasTests(unittest.TestCase):
    def test_todos_los_planes_sin_edit_vacio_sobre_archivo_existente(self):
        escenarios = leer('ecologica/escenarios.json')['dimensiones']['ecologica']
        faltantes = set()
        cubiertos = set()
        extras = [p.relative_to(ROOT / 'vm/simulado').as_posix() for p in sorted((ROOT / 'vm/simulado/planes').glob('MED-13-*.json'))]
        for fuente in ('ecologica.json', 'deteccion.json', *extras):
            planes = leer('vm/simulado/' + fuente)['casos']
            for caso, plan in planes.items():
                if 'archivos' not in plan:
                    # Detección no solicita ninguna modificación.
                    continue
                cubiertos.add((fuente, caso))
                for estado in ('inicial', 'ausente', 'vacio'):
                    with self.subTest(fuente=fuente, caso=caso, estado=estado), tempfile.TemporaryDirectory(prefix='med13 c5 ') as tmp:
                        home = Path(tmp)
                        shutil.copytree(ROOT / 'vm/casos/comun/proyecto', home / 'proyecto')
                        (home / '.config/opencode').mkdir(parents=True)
                        roots = materializar(home, escenarios[caso]['archivos'])
                        for rel in plan['archivos']:
                            path = roots[rel[0]] / rel[2:]
                            if estado == 'inicial' and not path.exists() and fuente == 'ecologica.json':
                                faltantes.add((caso, rel))
                            if estado == 'ausente' and path.exists():
                                path.unlink()
                            elif estado == 'vacio':
                                path.parent.mkdir(parents=True, exist_ok=True)
                                path.write_bytes(b'')
                        inicial = {p: p.read_bytes() for p in home.rglob('*') if p.is_file()}
                        proveedor = EnsayoModificacion(plan, 'ensayo', home / 'proveedor.jsonl', home)
                        self.assertEqual(inicial, {p: p.read_bytes() for p in home.rglob('*') if p.is_file()})
                        cuerpo = dict(messages=[])
                        for _ in range(50):
                            respuesta = proveedor.respuesta(cuerpo)
                            if 'tool_calls' not in respuesta:
                                break
                            tool = respuesta['tool_calls'][0]
                            fn = tool['function']
                            args = json.loads(fn['arguments'])
                            if fn['name'] == 'bash':
                                como = shlex.split(args['command'])
                                self.assertEqual(como[0], 'como-dev')
                                orden = shlex.split(como[1])
                                path = Path(orden[2])
                                self.assertEqual(orden, ['touch', '--', str(path), '&&', 'chmod', 'g+rw', '--', str(path)])
                                self.assertTrue(path.is_relative_to(home))
                                self.assertFalse(path.exists())
                                # Solo simula touch: no ejecuta chmod ni cambia permisos.
                                path.touch()
                                contenido = 'Archivo vacío creado.'
                            elif args['filePath'] in plan.get('lecturas', []):
                                self.assertEqual(fn['name'], 'read')
                                contenido = '<file>Documentación sintética</file>'
                            else:
                                path = Path(args['filePath'])
                                self.assertTrue(path.is_relative_to(home))
                                if fn['name'] == 'read':
                                    contenido = path.read_text(encoding='utf-8')
                                elif fn['name'] == 'edit':
                                    # Restricción nativa de 1.18.25, que el
                                    # sustituto permisivo anterior no verificaba.
                                    self.assertTrue(args['oldString'], 'oldString no puede ser vacío sobre un archivo existente')
                                    self.assertTrue(path.exists())
                                    self.assertEqual(args['oldString'], path.read_text(encoding='utf-8'))
                                    path.write_text(args['newString'], encoding='utf-8')
                                    contenido = 'Edit applied successfully.'
                                else:
                                    self.assertEqual(fn['name'], 'write')
                                    self.assertNotIn('oldString', args)
                                    self.assertFalse(path.exists() and path.read_bytes(), 'write solo para destino ausente o vacío')
                                    path.parent.mkdir(parents=True, exist_ok=True)
                                    path.write_text(args['content'], encoding='utf-8')
                                    contenido = 'File written successfully.'
                            cuerpo['messages'].extend([respuesta, dict(role='tool', tool_call_id=tool['id'], content=contenido)])
                        else:
                            self.fail('El plan no terminó')
                        proveedor.verificar_lecturas()
                        for rel, esperado in plan['archivos'].items():
                            self.assertEqual((roots[rel[0]] / rel[2:]).read_text(encoding='utf-8'), esperado)
        self.assertEqual(len(cubiertos), 46 + sum(len(leer('vm/simulado/' + p)['casos']) for p in extras))
        self.assertEqual(faltantes, {('N-21', 'P/opencode.json'), ('N-23', 'P/opencode.json'), ('V-9', 'P/AGENTS.md'),
                                    ('M-9', 'G/opencode.json'), ('M-10', 'G/opencode.json'), ('N-11', 'G/opencode.jsonc')})


if __name__ == '__main__':
    unittest.main()
