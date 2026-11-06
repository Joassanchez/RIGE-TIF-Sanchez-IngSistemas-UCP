"""MED-19-c5: archivos de proyecto y humo sobre copias."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import analizar_final as a
import test_med19_c3 as casos

ROOT = Path(__file__).resolve().parents[1]
HUMO = ROOT / 'verificacion/20261105-med19/humo_analisis.py'


class ArchivosTests(unittest.TestCase):
    def setUp(self):
        self.c = casos.VeredictoTests()
        self.c.setUp()

    def test_01_todos_los_brazos_conservan_oraculo_y_aislamiento(self):
        c = self.c
        original = c.analizar()
        for r in [*c.base, *c.fin]:
            r['fuera_configuracion'] = True
        actual = c.analizar()
        for e in original['ejecutores']:
            for campo in ('veredicto', 'componentes_operativos', 'mejorados', 'atribuibles', 'no_regresion', 'salvaguarda', 'probar'):
                self.assertEqual(original['ejecutores'][e][campo], actual['ejecutores'][e][campo])
        for marca in ('fallo_preparacion', 'ejecutor_alterado', 'ejecucion_alterada'):
            with self.subTest(marca=marca), self.assertRaisesRegex(ValueError, 'aislamiento'):
                a.grupos_validos([dict(c.fin[0], **{marca: True})])

    def test_02_lista_por_ejecutor_brazo_y_problema_sin_contenido(self):
        c = self.c
        original = c.analizar()
        for e in ('principal', 'charles'):
            r = next(r for r in c.fin if r['ejecutor'] == e and r['brazo'] == 'indicado')
            r.update(fuera_configuracion=True, archivos_tocados=[
                dict(archivo='src/index.js', cambio='modificado', dentro_configuracion=False, contenido='SECRETO-C5'),
                dict(archivo='opencode.json', cambio='modificado', dentro_configuracion=True)])
        datos = c.analizar()
        for e, g in datos['ejecutores'].items():
            r = next(r for r in c.fin if r['ejecutor'] == e and r['brazo'] == 'indicado')
            self.assertEqual(g['archivos_fuera_configuracion']['indicado'][r['caso']],
                [dict(**a.identidad(r), archivos=[dict(archivo='src/index.js', cambio='modificado')])])
            self.assertEqual(g['veredicto'], original['ejecutores'][e]['veredicto'])
        self.assertIn('Archivos del proyecto fuera de la configuración (descriptivo)', a.informe(datos))
        self.assertNotIn('SECRETO-C5', a.informe(datos))

    def test_03_analizador_rechaza_ensayo_y_modelo_simulado(self):
        for cambios in (dict(ensayo=True), dict(modelo='simulado')):
            self.c.setUp()
            self.c.fin[0].update(cambios)
            with self.subTest(cambios=cambios), self.assertRaisesRegex(ValueError, 'mediciones reales'):
                self.c.analizar()

    def test_04_humo_filtra_copia_y_propaga_codigo(self):
        self.assertTrue(HUMO.is_file(), 'Falta el script de humo')
        spec = importlib.util.spec_from_file_location('humo_c5', HUMO)
        humo = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(humo)
        with tempfile.TemporaryDirectory() as tmp:
            raiz = Path(tmp)
            ensayo, destino = raiz / 'ensayo', raiz / 'salida'
            entradas = {}
            for tanda, brazo, cs in [('eco-LB', 'LB', ['M-2']), ('eco-sin_rige', 'sin_rige', ['M-2', 'R-4']), ('control-sin_rige', 'sin_rige', ['M-2']), ('eco-probar', 'probar', ['M-2'])]:
                p = ensayo / tanda / 'unida/corregido.jsonl'
                p.parent.mkdir(parents=True)
                p.write_text(''.join(json.dumps(dict(tanda=tanda, brazo=brazo, caso=c, ensayo=True, modelo='simulado', k=1, otro=42)) + '\n' for c in cs), encoding='utf-8')
                entradas[p] = p.read_bytes()
            def ejecutar(cmd):
                self.assertEqual(cmd[:3], [sys.executable, '-B', str(ROOT / 'herramientas/analizar_final.py')])
                rutas = cmd[cmd.index('--finales') + 1:cmd.index('--destino')]
                filas = [json.loads(l) for p in rutas for l in Path(p).read_text(encoding='utf-8').splitlines()]
                self.assertEqual([(r['tanda'], r['caso']) for r in filas], [('control-sin_rige', 'M-2'), ('eco-probar', 'M-2'), ('eco-sin_rige', 'R-4')])
                for r in filas:
                    self.assertEqual((r['ensayo'], r['modelo'], r['k'], r['otro']), (False, 'openai/gpt-6.1-sol', 3, 42))
                self.assertTrue(all(Path(p).is_relative_to(destino) for p in rutas))
                return subprocess.CompletedProcess(cmd, 7)
            args = [str(HUMO), '--ensayo', str(ensayo), '--base', str(raiz/'base.tar'), '--admision', str(raiz/'admision'), '--destino', str(destino)]
            with patch.object(sys, 'argv', args), patch.object(humo.subprocess, 'run', side_effect=ejecutar), patch('builtins.print') as imprimir:
                self.assertEqual(humo.main(), 7)
                self.assertIn('NO ES UNA MEDICIÓN', imprimir.call_args_list[0].args[0])
            for p, contenido in entradas.items():
                self.assertEqual(p.read_bytes(), contenido)

    def test_05_readme_documenta_humo_y_control_actual(self):
        texto = (HUMO.parent / 'README.md').read_text(encoding='utf-8')
        self.assertIn('## MED-19-c5', texto)
        self.assertIn('humo_analisis.py --ensayo', texto)
        self.assertNotIn('sin reemplazar los archivos persistidos', texto)
