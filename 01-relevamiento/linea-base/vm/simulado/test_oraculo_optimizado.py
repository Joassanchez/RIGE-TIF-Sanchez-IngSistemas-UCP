"""MED-9c: protocolo de base, omisión y controles con procesos sustituidos."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import ecologica as eco
import test_registro_ecologica as registro
from test_ecologica import captura, HOJA, oracle_sintetico
import corregir_ecologica as corrector


class OptimizacionTests(unittest.TestCase):
    correr = registro.RegistroTests.correr

    def test_base_una_vez_por_tarea_y_sin_oraculo_posterior_en_tres_repeticiones(self):
        row, salida, pasos, comandos = self.correr(caso='M-1', k=3)
        self.assertEqual(pasos.count('oraculo-antes'), 1)
        self.assertEqual(pasos.count('oraculo-despues'), 0)
        self.assertTrue((salida / 'base/M-1/oraculo.json').is_file())
        for row in self.ultimas_filas:
            intento = row['intentos'][0]
            self.assertEqual(intento['oraculo_omitido'], 'sin cambios')
            oracle = json.loads((salida / intento['oraculo']).read_text())
            self.assertEqual(oracle['antes'], oracle['despues'])
            self.assertEqual(row['ejecutor_alterado'], 0)
        for sufijo in ('.ejecutor-fuera.json', '.wrapper.json', '.version.json'):
            self.assertFalse(any(n.endswith(sufijo) and 'crudo' in str(p) for _, p, n in comandos))
        meta = json.loads((salida / 'tanda.json').read_text())
        self.assertTrue(meta['aislamiento_verificado'])
        for momento in ('inicio', 'final'):
            carpeta = salida / ('control-' + momento)
            for archivo in ('ejecutor-fuera.json', 'wrapper.json', 'version.json', 'verificacion-edit.json', 'aislamiento-ejecutor.json'):
                self.assertTrue((carpeta / archivo).is_file())

    def test_archivos_o_entorno_alterados_exigen_oraculo_completo(self):
        for kwargs in (dict(cambio_escenario=True), dict(cambio_entorno=True)):
            with self.subTest(kwargs=kwargs):
                row, _, pasos, _ = self.correr(caso='M-1', **kwargs)
                self.assertEqual(pasos.count('oraculo-antes'), 1)
                self.assertEqual(pasos.count('oraculo-despues'), 1)
                self.assertNotIn('oraculo_omitido', row['intentos'][0])

    def test_base_incorrecta_detiene_antes_del_agente(self):
        with self.assertRaisesRegex(ValueError, 'Base distinta'):
            self.correr(caso='M-1', base_incorrecta=True)
        self.assertFalse(any('--format' in c for c, _, _ in self.comandos))
        self.assertEqual((self.salida / 'registro.jsonl').read_text(), '')

    def test_fallo_final_invalida_aun_con_filas_ya_escritas(self):
        with self.assertRaisesRegex(ValueError, 'Aislamiento final'):
            self.correr(caso='M-1', fallo_final=True)
        self.assertTrue((self.salida / 'DETENCION.txt').is_file())
        self.assertFalse(json.loads((self.salida / 'tanda.json').read_text())['aislamiento_verificado'])
        self.assertTrue((self.salida / 'registro.jsonl').read_text())
        with self.assertRaisesRegex(ValueError, 'aislamiento'):
            corrector.validar_tanda(self.salida, registro.ROOT / 'ecologica/respuestas-ecologica.json')

    def test_sin_cambios_clasifica_igual_al_oraculo_completo_en_todas_las_tareas(self):
        for caso, regla in HOJA['casos'].items():
            if not caso.startswith('M-'):
                continue
            with self.subTest(caso=caso):
                antes = captura(caso, 'base')
                completo = oracle_sintetico(regla, antes, antes)
                with patch.object(eco, 'oraculo', side_effect=AssertionError('No debe ejecutarse')):
                    control = dict(hash_escenario_igual=True, archivos_inicio_iguales=True,
                                   inventario_home_igual=True, inventario_home_comparable=True)
                    posterior, omitido, motivos = eco.oraculo_posterior(None, ['sonda'], '', None, completo['antes'], [], 0, control)
                self.assertEqual(omitido, 'sin cambios')
                self.assertEqual(motivos, [])
                row = dict(respuesta_textual='{"hecho":true,"cambios":[],"impedimento":""}')
                optimizado = dict(antes=completo['antes'], despues=posterior)
                self.assertEqual(corrector.corregir(row, regla, antes, antes, optimizado),
                                 corrector.corregir(row, regla, antes, antes, completo))

    def test_export_fuera_del_bloque_bashrc_sin_archivos_tocados_corre_oraculo(self):
        row, salida, pasos, _ = self.correr(caso='M-1', cambio_fuera_bloque=True)
        intento = row['intentos'][0]
        self.assertEqual(intento['archivos_tocados'], [])
        self.assertEqual(intento['entorno_alterado'], 0)
        self.assertEqual(intento['hash_antes'], intento['hash_despues'])
        self.assertNotIn('oraculo_omitido', intento)
        self.assertEqual(pasos.count('oraculo-despues'), 1)
        self.assertIn('archivos_inicio_iguales', intento['motivos_no_omision_oraculo'])
        self.assertIn('inventario_home_igual', intento['motivos_no_omision_oraculo'])
        self.assertEqual(intento['control_omision_oraculo']['archivos_inicio_cambiados'], ['.bashrc'])
        prefijo = intento['archivo_evidencia'].removesuffix('.stdout.txt')
        for sufijo in ('.inicio-preparado.json', '.inicio-despues.json', '.home-antes.json', '.home-despues.json'):
            self.assertTrue((salida / (prefijo + sufijo)).is_file())

    def test_profile_bash_profile_y_otro_archivo_del_home_exigen_oraculo(self):
        for nombre in ('.profile', '.bash_profile', '.config/otra/entorno', '.cache/opencode/config.json',
                       '.local/share/opencode/auth.json', '.config/opencode/agents/otro.md'):
            with self.subTest(nombre=nombre):
                row, _, pasos, _ = self.correr(caso='M-1', cambio_home=nombre)
                intento = row['intentos'][0]
                self.assertEqual(pasos.count('oraculo-despues'), 1)
                self.assertIn('inventario_home_igual', intento['motivos_no_omision_oraculo'])
                self.assertIn(nombre, intento['control_omision_oraculo']['rutas_home_cambiadas'])
                self.assertNotIn('oraculo_omitido', intento)

    def test_cada_condicion_adicional_fallida_exige_oraculo(self):
        limpio = dict(hash_escenario_igual=True, archivos_inicio_iguales=True,
                      inventario_home_igual=True, inventario_home_comparable=True)
        for campo in limpio:
            with self.subTest(campo=campo), patch.object(eco, 'oraculo', return_value={'completo': True}) as oraculo:
                posterior, omitido, motivos = eco.oraculo_posterior(None, [], '', None, {}, [], 0, limpio | {campo: False})
                oraculo.assert_called_once()
                self.assertIsNone(omitido)
                self.assertEqual(motivos, [campo])
                self.assertEqual(posterior, {'completo': True})

    def test_inicio_distingue_ausencia_creacion_borrado_y_contenido_completo(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(eco, 'HOME', Path(tmp)):
            ausente = eco.capturar_inicio()
            self.assertEqual(ausente['errores'], [])
            for nombre in eco.ARCHIVOS_INICIO:
                self.assertEqual(ausente['archivos'][nombre], {'tipo': 'ausente'})
                path = Path(tmp) / nombre
                path.write_bytes(b'export A=1\n')
                creado = eco.capturar_inicio()
                path.write_bytes(b'export B=1\n')  # mismos bytes de longitud
                self.assertNotEqual(creado, eco.capturar_inicio())
                path.unlink()
                self.assertEqual(ausente, eco.capturar_inicio())

    def test_control_compara_hashes_y_no_admite_inventarios_ilegibles(self):
        inicio = dict(archivos={n: dict(tipo='ausente') for n in eco.ARCHIVOS_INICIO}, errores=[])
        home = dict(archivos={'.': dict(tipo='directorio')}, errores=[])
        control = eco.control_omision('a', 'b', inicio, inicio, home, home)
        self.assertFalse(control['hash_escenario_igual'])
        self.assertTrue(control['inventario_home_igual'])
        control = eco.control_omision('a', 'a', inicio, inicio, home, home | dict(errores=['ilegible']))
        self.assertFalse(control['inventario_home_comparable'])
        control = eco.control_omision('a', 'a', inicio, inicio | dict(errores=['ilegible']), home, home)
        self.assertFalse(control['archivos_inicio_iguales'])

    def test_inventario_solo_excluye_git_y_no_oculta_configuracion_en_caches(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            home = root / 'home'
            home.mkdir()
            with patch.object(eco, 'HOME', home):
                antes = eco.capturar_home(root / 'prueba', 'antes')
                (home / '.git').mkdir()
                (home / '.git/config').write_text('git generado')
                despues = eco.capturar_home(root / 'prueba', 'git')
                self.assertEqual(antes['archivos'], despues['archivos'])
                self.assertEqual(despues['errores'], [])
                self.assertEqual(despues['exclusiones'], {'nombres': ['.git'], 'caches': []})
                path = home / '.cache/opencode/config.json'
                path.parent.mkdir(parents=True)
                path.write_text('{}')
                nuevo = eco.capturar_home(root / 'prueba', 'cache')
                self.assertIn('.cache/opencode/config.json', nuevo['archivos'])
                with patch.object(eco, 'estado_entrada', side_effect=PermissionError('ilegible')):
                    self.assertTrue(eco.capturar_home(root / 'prueba', 'ilegible')['errores'])

    def test_deteccion_conserva_controles_por_intento_y_no_usa_base(self):
        row, salida, _, comandos = self.correr(dimension='deteccion')
        self.assertNotIn('oraculo_omitido', row['intentos'][0])
        self.assertFalse((salida / 'base').exists())
        self.assertTrue(any(n.endswith('.version.json') for _, _, n in comandos))
        self.assertNotIn('protocolo_oraculo', json.loads((salida / 'tanda.json').read_text()))

    def test_control_final_sale_del_proyecto_antes_de_reconstruirlo(self):
        def preparar(s, h, *args):
            self.assertEqual(Path.cwd(), h.HOME_E / 'tarea')
            return ''
        # El helper tiene preparar sustituido; envolver sólo control_tanda
        # verifica la precondición que necesita shutil.rmtree en Linux.
        control = eco.control_tanda
        def comprobar(h, a, salida, escenario, wrapper, agente, momento):
            with patch.object(eco, 'preparar', preparar):
                return control(h, a, salida, escenario, wrapper, agente, momento)
        with patch.object(eco, 'control_tanda', comprobar):
            self.correr(caso='M-1')


if __name__ == '__main__':
    unittest.main()
