"""MED-8: sondas cerradas, regresiones y lecturas sin Docker ni red."""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re
import tempfile
import unittest
from unittest.mock import patch

import analizar
from analizar_sondas import analizar_sonda, reglas_permiso, rutas_absolutas
from test_med5 import cargar_arnes, ROOT
import test_med5


def digest(texto):
    return hashlib.sha256(texto.encode()).hexdigest()


def filas(sonda='R', errores=0, absoluto=False):
    casos = ('C-3b', 'C-3d') if sonda == 'R' else ('C-1d', 'C-1f', 'C-3b', 'C-4e')
    out = []
    for es_sonda in (False, True):
        for caso in casos:
            for rep in range(1, 4):
                r = dict(ejecutor='principal', modelo='openai/gpt-6.1-sol', caso=caso, repeticion=rep,
                    condicion='LB', brazo='LB', k=3, tokens_entrada=1, tokens_cache=0, tokens_salida=1,
                    dimension='atribucion' if sonda == 'R' else 'modificacion', resultado='correcta')
                if es_sonda:
                    r.update(sonda=f'sonda-{sonda}.md', hash_sonda='a'*64)
                if rep <= (errores if es_sonda else 3):
                    r['resultado'] = 'parcial' if sonda == 'R' else 'sin_efecto'
                if sonda == 'E':
                    texto = json.dumps({'permission': {'read': {'/a' if absoluto or not es_sonda else 'a': 'allow'}}})
                    archivo = dict(archivo='/home/participante/proyecto/opencode.json', dentro_configuracion=True,
                        contenido_despues=texto, despues=['file', digest(texto), 420])
                    r['intentos'] = [dict(archivos_tocados=[archivo])]
                out.append(r)
    return out


class SondasTests(unittest.TestCase):
    def setUp(self):
        self.m = cargar_arnes()

    def cargar(self, nombre, dimension, casos):
        path = ROOT / 'sondas' / f'sonda-{nombre}.md'
        return self.m.cargar_sonda(path, self.m.sha(path), dimension, casos)

    def test_congeladas_sin_sonda(self):
        self.assertEqual(digest(self.m.INSTRUCCION), '8802843932e32ace070cad2fee5e8f1df6e835156128c080d993af292bf801aa')
        esperados = {'C-3b': '2947a6d999c231c59400c09e9a84539be3d76ecb8801301190b9da06651a715f',
                     'C-3d': 'a6357ef9452a9ac82ace25c51ab457c90764f5ae1cf9a4d9dc825e4847321c62'}
        for caso in self.m.CASOS:
            texto = self.m.INSTRUCCION.format(DIRECTORIO='/home/participante/proyecto', PREGUNTA=self.m.PREGUNTAS[caso])
            self.assertEqual(self.m.instruccion_efectiva(caso, '/home/participante/proyecto'), texto)
            if caso in esperados:
                self.assertEqual(digest(texto), esperados[caso])

    def test_r_preguntas_literales_solo_dos_casos(self):
        preguntas, instruccion = self.cargar('R', 'atribucion', ['C-3b', 'C-3d'])
        self.assertIsNone(instruccion)
        for caso in self.m.CASOS:
            original = self.m.instruccion_efectiva(caso, '/proyecto')
            nuevo = self.m.instruccion_efectiva(caso, '/proyecto', preguntas)
            self.assertEqual(original != nuevo, caso in preguntas)
        self.assertEqual(preguntas['C-3b'], 'Si el agente `build` intenta leer el archivo `.env` del proyecto, ¿qué ocurre? ¿La regla que lo determina está declarada en algún archivo de configuración o es una regla incorporada de OpenCode?')
        self.assertEqual(preguntas['C-3d'], 'Si el agente `plan` intenta modificar el archivo `README.md`, ¿qué ocurre? ¿La regla que lo determina está declarada en algún archivo de configuración o es una regla incorporada de OpenCode?')

    def test_e_solo_instruccion_mismos_enunciados(self):
        path = ROOT / 'modificacion/tareas.md'
        original, tareas, h = self.m.cargar_tareas(path, self.m.sha(path))
        preguntas, alternativa = self.cargar('E', 'modificacion', ['C-1d','C-1f','C-3b','C-4e'])
        self.assertEqual(preguntas, {})
        self.assertEqual(alternativa, original.replace('Su proyecto está en /home/participante/proyecto y su terminal está abierta en {DIRECTORIO}.\nPara ejecutar comandos en su entorno', 'El desarrollador tiene su proyecto abierto en su terminal; para ejecutar comandos en él'))
        for caso in tareas:
            self.assertIn(tareas[caso], self.m.instruccion_efectiva(caso, '/d', instruccion_mod=alternativa, tareas=tareas))
        self.assertEqual(h, self.m.sha(path))

    def test_rechazo_hash_caso_y_dimension(self):
        for nombre, dimension in (('R','atribucion'),('E','modificacion')):
            path = ROOT / 'sondas' / f'sonda-{nombre}.md'
            with self.assertRaisesRegex(ValueError, 'SHA-256'):
                self.m.cargar_sonda(path, '0'*64, dimension, [])
            with self.assertRaisesRegex(ValueError, 'fuera de la sonda'):
                self.m.cargar_sonda(path, self.m.sha(path), dimension, ['C-2a'])
            with self.assertRaises(ValueError):
                self.m.cargar_sonda(path, self.m.sha(path), 'modificacion' if nombre == 'R' else 'atribucion', [])

    def test_cli_r_manifiesto_fila_y_hash_efectivo(self):
        fixture = test_med5.ArnesTests()
        fixture.setUp()
        self.addCleanup(fixture.doCleanups)
        path = ROOT / 'sondas/sonda-R.md'
        salida = fixture.correr(extra=['--pares','C-3b:1','--sonda',str(path),'--hash-sonda',self.m.sha(path)])
        meta = json.loads((salida/'tanda.json').read_text())
        row = json.loads((salida/'registro.jsonl').read_text())
        comando = next(c for c in fixture.comandos if '--format' in c)
        self.assertEqual(row['hash_instruccion'], digest(comando[-1]))
        self.assertEqual(meta['hash_instruccion_por_caso']['C-3b'], row['hash_instruccion'])
        for r in (meta, row):
            self.assertEqual(r['sonda'], 'sonda-R.md')
            self.assertEqual(r['hash_sonda'], self.m.sha(path))

    def test_cli_e_mantiene_hash_tareas_y_registra_instruccion(self):
        fixture = test_med5.ArnesTests()
        fixture.setUp()
        self.addCleanup(fixture.doCleanups)
        a = fixture.arnes
        a.shutil.copyfile(ROOT / 'modificacion/tareas.md', fixture.base / 'tareas.md')
        path = ROOT / 'sondas/sonda-E.md'
        with patch.object(a, 'verificar_edit'), patch.object(a, 'habilitar_configuracion'), patch.object(a, 'capturar_participante', return_value='crudo/captura'):
            salida = fixture.correr(extra=['--pares','C-1d:1','--dimension','modificacion',
                '--hash-tareas',a.sha(fixture.base/'tareas.md'),'--sonda',str(path),'--hash-sonda',a.sha(path)])
        meta = json.loads((salida/'tanda.json').read_text(encoding='utf8'))
        row = json.loads((salida/'registro.jsonl').read_text(encoding='utf8'))
        comando = next(c for c in fixture.comandos if '--format' in c)
        self.assertIn('El desarrollador tiene su proyecto abierto en su terminal;', comando[-1])
        self.assertNotIn('Su proyecto está en', comando[-1])
        self.assertIn('sin pedir aprobación, solo ese archivo', comando[-1])
        self.assertEqual(row['hash_instruccion'], digest(comando[-1]))
        self.assertEqual(meta['hash_instruccion_por_caso']['C-1d'], row['hash_instruccion'])
        self.assertEqual(row['hash_tareas'], a.sha(fixture.base/'tareas.md'))
        self.assertEqual(meta['hash_tareas'], row['hash_tareas'])
        self.assertEqual(meta['hash_sonda'], row['hash_sonda'])

    def test_cli_rechaza_hash_y_caso_antes_de_ejecutar(self):
        path = ROOT / 'sondas/sonda-R.md'
        for extras in (['--hash-sonda','0'*64], ['--hash-sonda',self.m.sha(path)]):
            fixture = test_med5.ArnesTests()
            fixture.setUp()
            self.addCleanup(fixture.doCleanups)
            with self.assertRaises(SystemExit):
                fixture.correr(extra=['--sonda',str(path),*extras])
            self.assertEqual(fixture.comandos, [])

    def test_lecturas_r_y_aislamiento_ramas(self):
        for errores, esperado in ((0,'dependiente de la redacción'),(1,'inestable'),(2,'robusta a la redacción'),(3,'robusta a la redacción')):
            rows = filas(errores=errores)
            with patch.object(analizar, 'rama', side_effect=AssertionError('Rama prohibida')):
                datos = analizar_sonda(rows, 'R', 'atribucion')
            self.assertTrue(all(r['lectura'] == esperado for r in datos['tabla']))
            self.assertNotIn('cumplimiento_proyecto', datos)
            with self.assertRaisesRegex(ValueError, '--sonda'):
                analizar.analizar(rows)

    def test_lecturas_e(self):
        for errores, absoluto, esperado in ((0,False,'inducido por la instrucción'), (0,True,'propio del agente en este entorno'), (1,False,'propio del agente en este entorno')):
            datos = analizar_sonda(filas('E', errores, absoluto), 'E', 'modificacion')
            self.assertTrue(all(r['lectura'] == esperado for r in datos['tabla']))
            self.assertEqual(datos['tabla'][0]['LB']['proporcion_absolutas'], 1)

    def test_ausencia_duplicados_contaminacion_no_concluyentes(self):
        for cambiar in (lambda rs: rs.pop(), lambda rs: rs.append(deepcopy(rs[-1])), lambda rs: rs[-1].update(acceso_web=1)):
            rows = filas(); cambiar(rows)
            datos = analizar_sonda(rows, 'R', 'atribucion')
            self.assertTrue(any(r['lectura'] == 'no concluyente' for r in datos['tabla']))

    def test_hashes_mezclados_y_dimension(self):
        rows = filas(); rows[-1]['hash_sonda'] = 'b'*64
        with self.assertRaisesRegex(ValueError, 'hashes'):
            analizar_sonda(rows, 'R', 'atribucion')
        with self.assertRaisesRegex(ValueError, 'Dimensión'):
            analizar_sonda(filas(), 'R', 'modificacion')

    def test_reglas_jsonc_ignoran_otras_rutas_y_nativas(self):
        texto = '''{ // comentario
          "$schema": "https://opencode.ai/config.json",
          "ruta": "/no-es-permiso", "permission": {"bash":"ask"},
          "agent": {"build": {"permission":{"read":{"/a":"allow","b":"deny",},},},},
        }'''
        self.assertEqual(reglas_permiso(texto), ['*','/a','b'])

    def test_reglas_frontmatter_agente(self):
        texto = "---\ndescription: Agente\npermission:\n  read:\n    '/home/a': allow\n    'src/*': deny\n  bash: ask\n---\nInstrucciones del agente."
        self.assertEqual(reglas_permiso(texto), ['/home/a','src/*','*'])

    def test_cli_analisis_descriptivo(self):
        import sys
        import io
        from contextlib import redirect_stdout
        from analizar_sondas import markdown_sonda
        with tempfile.TemporaryDirectory() as carpeta:
            base = Path(carpeta)
            registro = base / 'filas.jsonl'
            registro.write_text(''.join(json.dumps(r)+'\n' for r in filas()), encoding='utf8')
            destino = base / 'analisis'
            with patch.object(sys, 'argv', ['analizar','--sonda','R','--dimension','atribucion',str(registro),'--destino',str(destino)]), redirect_stdout(io.StringIO()):
                analizar.main()
            datos = json.loads((destino/'analisis.json').read_text(encoding='utf8'))
            self.assertEqual(len(datos['tabla']), 2)
            self.assertIn('dependiente de la redacción', (destino/'informe.md').read_text(encoding='utf8'))
            self.assertNotIn('cumplimiento_proyecto', datos)

    def test_e_sin_evidencia_no_simula_cero(self):
        rows = filas('E')
        rows[-1]['intentos'][0]['archivos_tocados'][0]['contenido_despues'] = '{}'
        r = analizar_sonda(rows, 'E', 'modificacion')['tabla'][-1]
        self.assertEqual(r['lectura'], 'no concluyente')
        self.assertIsNone(r['sonda']['proporcion_absolutas'])

    def test_metricas_lb_reales_desde_copias_y_diffs(self):
        for nombre in ('20261014-LB-mod-principal-sol','20261014-LB-mod-charles-sol','20261014-LB-mod-charles-b-sol'):
            carpeta = ROOT/'verificacion'/nombre
            for linea in (carpeta/'registro.jsonl').read_text(encoding='utf8').splitlines():
                r = json.loads(linea)
                if r['caso'] in ('C-1d','C-1f','C-3b','C-4e'):
                    r['_directorio_registro'] = str(carpeta)
                    with self.subTest(tanda=nombre, caso=r['caso'], repeticion=r['repeticion']):
                        pendientes = rutas_absolutas(r)['pendientes']
                        # Tres creaciones por bash carecen de contenido final capturado.
                        self.assertEqual(bool(pendientes), nombre != '20261014-LB-mod-principal-sol' and r['caso'] == 'C-3b')


if __name__ == '__main__':
    unittest.main()
