"""Proveedor MED-6: las 24 recetas pasan por herramientas; sin servidor ni Docker."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

from ensayo import Ensayo, EnsayoModificacion

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'herramientas'))
import corregir_modificacion as cm


class ModificacionSimuladaTests(unittest.TestCase):
    def test_24_planes_por_herramientas_y_cinco_resultados(self):
        planes = json.loads((ROOT/'vm/simulado/modificacion.json').read_text(encoding='utf-8'))
        hoja = json.loads((ROOT/'modificacion/respuestas-modificacion.json').read_text(encoding='utf-8'))
        fixture = json.loads((ROOT/'herramientas/fixtures/med6-capturas.json').read_text(encoding='utf-8'))
        resultados = set()
        self.assertEqual(len(planes['casos']),24)
        with tempfile.TemporaryDirectory() as tmp:
            for caso, plan in planes['casos'].items():
                with self.subTest(caso=caso):
                    home = Path(tmp)/caso
                    shutil.copytree(ROOT/'vm/casos/comun/proyecto',home/'proyecto')
                    carpeta = ROOT/'vm/casos'/caso
                    if (carpeta/'proyecto').exists():
                        shutil.copytree(carpeta/'proyecto',home/'proyecto',dirs_exist_ok=True)
                    (home/'.config/opencode').mkdir(parents=True)
                    if (carpeta/'global').exists():
                        shutil.copytree(carpeta/'global',home/'.config/opencode',dirs_exist_ok=True)
                    antes_archivos = {p:p.read_bytes() for p in home.rglob('*') if p.is_file()}
                    proveedor = EnsayoModificacion(plan,'ensayo',home/'proveedor.jsonl',home)
                    # Preparar el proveedor no aplica ninguna edición.
                    self.assertEqual(antes_archivos,{p:p.read_bytes() for p in antes_archivos})
                    cuerpo = dict(messages=[dict(role='user',content='tarea')],tools=[dict(function=dict(name=n)) for n in ('read', 'edit', 'write')])
                    vistos = set()
                    for _ in range(20):
                        respuesta = proveedor.respuesta(cuerpo)
                        if 'tool_calls' not in respuesta:
                            break
                        tool = respuesta['tool_calls'][0]
                        self.assertNotIn(tool['id'],vistos)
                        vistos.add(tool['id'])
                        fn = tool['function']
                        args = json.loads(fn['arguments'])
                        path = Path(args['filePath'])
                        self.assertTrue(path.is_relative_to(home))
                        if fn['name'] == 'read':
                            contenido = path.read_text(encoding='utf-8')
                        elif fn['name'] == 'edit':
                            self.assertEqual(fn['name'],'edit')
                            self.assertTrue(args['oldString'])
                            contenido = path.read_text(encoding='utf-8') if path.exists() else ''
                            self.assertEqual(contenido,args['oldString'])
                            path.parent.mkdir(parents=True,exist_ok=True)
                            path.write_text(args['newString'],encoding='utf-8')
                            contenido = 'Edit applied successfully.'
                        else:
                            self.assertEqual(fn['name'], 'write')
                            path.parent.mkdir(parents=True, exist_ok=True)
                            path.write_text(args['content'], encoding='utf-8')
                            contenido = 'File written successfully.'
                        cuerpo['messages'].extend([respuesta,dict(role='tool',tool_call_id=tool['id'],content=contenido)])
                    else:
                        self.fail('El proveedor no terminó')
                    variante = plan['variante']
                    fuente = 'salida2' if variante == 'minima' else 'salida'
                    base = deepcopy(fixture['capturas'][f'{fuente}/{caso}/base']['agentes'])
                    if variante in ('sin_respuesta','impedimento'):
                        despues = deepcopy(base)
                    else:
                        v = 'correcta' if variante == 'otro_modelo' else variante
                        despues = deepcopy(fixture['capturas'][f'{fuente}/{caso}/{v}']['agentes'])
                        if variante == 'otro_modelo':
                            despues['build']['model']['modelID'] = 'gemini-2.5-pro'
                    row = dict(caso=caso,respuesta_textual=respuesta['content'])
                    resultado = cm.corregir(row,hoja['casos'][caso],base,despues)['resultado']
                    resultados.add(resultado)
                    for rel,nuevo in plan['archivos'].items():
                        path = home/('.config/opencode' if rel.startswith('G/') else 'proyecto')/rel[2:]
                        self.assertEqual(path.read_text(encoding='utf-8'),nuevo)
        self.assertEqual(resultados,set(cm.RESULTADOS))

    def test_atribucion_conserva_respuesta_sin_llamadas(self):
        datos = json.loads((ROOT/'vm/simulado/ensayo.json').read_text(encoding='utf-8'))
        with tempfile.TemporaryDirectory() as tmp:
            for caso,plan in datos['casos'].items():
                proveedor = Ensayo(plan,'ensayo',Path(tmp)/'log.jsonl')
                respuesta = proveedor.respuesta({'messages':[]})
                self.assertNotIn('tool_calls',respuesta)
                self.assertEqual(json.loads(respuesta['content'].split('\n',1)[1]),plan['salida'])
