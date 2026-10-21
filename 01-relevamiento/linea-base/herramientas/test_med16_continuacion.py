"""MED-16: cierre de aislamiento por continuación de una cuota, sin Docker."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from analizar import cargar
from corregir_ecologica import validar_tanda
import test_med9c as fixtures


# Copia íntegra del tanda.json real, leída el 21/10/2026 desde:
# C:/Users/Joa/rige-LB-20261020/LB-ecologica-charles/p0/LB-ecologica-charles/tanda.json
TANDA_REAL_MED16 = {'dimension': 'ecologica',
 'tanda': 'LB-ecologica-charles',
 'ensayo': False,
 'fuera_del_arbol': False,
 'ejecutor': 'charles',
 'modelo': 'openai/gpt-6.1-sol',
 'k': 3,
 'limite': 600,
 'semilla': 20261015,
 'casos': 'M-10,M-5,M-7,N-5,N-21,S-3,C-6,M-6,V-8,N-15,M-3,V-3',
 'pares': None,
 'preparar_base': False,
 'base_verificada': 'a7fa24b3aa92bc0601cbb0d4037edc1e9311d14f08e3048e1cfe6d841dee7acd',
 'hash_escenarios': '7b41b87dfb8417c548666f9e998c7243409ebe56b007e0ad8d78d8eec35bbc47',
 'hash_tareas': '34aa7e315883c45c55b3ba6eb1a3b8df21fb8051bb80f84a0d0e4237b1623d22',
 'hash_deteccion': 'f3e30ce71a48cfa0d8f2359e787dad21001f3b7be8a97dccf10ba5ded35b1012',
 'condicion': 'LB',
 'brazo': 'LB',
 'orden': [['N-21', 3],
           ['V-8', 2],
           ['N-15', 3],
           ['N-5', 1],
           ['S-3', 3],
           ['N-5', 3],
           ['M-6', 3],
           ['M-5', 1],
           ['M-5', 3],
           ['V-8', 1],
           ['M-5', 2],
           ['N-5', 2],
           ['N-15', 1],
           ['M-10', 3],
           ['M-7', 3],
           ['M-6', 1],
           ['V-3', 1],
           ['S-3', 1],
           ['M-7', 2],
           ['M-6', 2],
           ['C-6', 3],
           ['C-6', 1],
           ['V-3', 2],
           ['V-3', 3],
           ['S-3', 2],
           ['M-7', 1],
           ['C-6', 2],
           ['M-3', 2],
           ['M-10', 2],
           ['M-3', 3],
           ['V-8', 3],
           ['M-10', 1],
           ['M-3', 1],
           ['N-15', 2],
           ['N-21', 1],
           ['N-21', 2]],
 'agente': '[AUX] Charles',
 'inicio': '2026-10-21T02:35:05.493200+00:00',
 'hashes_entradas': {'escenarios.json': '7b41b87dfb8417c548666f9e998c7243409ebe56b007e0ad8d78d8eec35bbc47',
                     'tareas.md': '34aa7e315883c45c55b3ba6eb1a3b8df21fb8051bb80f84a0d0e4237b1623d22',
                     'deteccion.md': 'f3e30ce71a48cfa0d8f2359e787dad21001f3b7be8a97dccf10ba5ded35b1012'},
 'hash_ejecutor': '668d11811f459eb6611a2b7756e58ecff56569e3eb1fca148baaedf5d866dc48',
 'hash_arnes': '1a0671b2516a5fedb405faa5b9937a519310de699d22268421bc2101efc2938e',
 'hash_extension': 'c19c322ca1f239b009a86e1dc350e2cb560b9a7797d4d0f9540cbf540872d530',
 'hash_binario': 'd91e0d33676d0839f7cde87924cd4127ea88c9d6784eea9f009a7d08bdc60eeb',
 'hash_catalogo': '515672f64e5e6c83b715d67f57bedbdd6fe0abd9e3e786176974ef902b8d1219',
 'hash_tarifas': 'b6fd5635a653ba84f9c07058054e4b00bb52ad377131571398f232a974394515',
 'exclusiones_hash': ['.gitignore',
                      'bun.lock',
                      'bun.lockb',
                      'node_modules',
                      'package-lock.json',
                      'package.json'],
 'hash_hoja': None,
 'hoja_referencia': 'ausente',
 'verificacion_edit': 'control-inicio/verificacion-edit.json',
 'verificacion_aislamiento': 'control-inicio/aislamiento-ejecutor.json',
 'regla_acceso_web': 'ADR-094',
 'aislamiento_verificado': False,
 'hash_plan_ensayo': None,
 'hash_plan_anidado': None,
 'hash_plan_directo': None,
 'protocolo_oraculo': 'MED-9c',
 'exclusiones_inventario_home': {'nombres': ['.git'], 'caches': []}}


class ContinuacionCuotaTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.respuestas = fixtures.ROOT / 'ecologica/respuestas-ecologica.json'
        self.cortado = self.fragmento('cortado')
        self.sustituto = self.fragmento('continuacion')

    def guardar(self, path, dato):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(dato, ensure_ascii=False), encoding='utf-8')

    def fragmento(self, nombre):
        registro = fixtures.FragmentosTests.fragmento(self, nombre, ['M-1'], cambio={
            'hash_hoja': None, 'hash_escenarios': 'escenarios', 'hash_tareas': 'tareas'})
        root = registro.parent
        estado = fixtures.captura('M-1', 'base')
        for momento in ('antes', 'despues'):
            for agente, dato in estado.items():
                nombre_archivo = ({'__archivos__': 'archivos', '__config__': 'config', '__sistema__': 'sistema'}
                                  .get(agente, 'agente-' + agente))
                self.guardar(root / f'crudo/{momento}/{nombre_archivo}.json', dato)
        self.guardar(root / 'crudo/oraculo.json', fixtures.oraculo_fixture(fixtures.HOJA['casos']['M-1'], estado, estado))
        row = json.loads(registro.read_text(encoding='utf-8'))
        row['respuesta_textual'] = json.dumps(dict(hecho=False, cambios=[], impedimento=''))
        registro.write_text(json.dumps(row) + '\n', encoding='utf-8')
        # El orden de las claves y el formato pueden diferir: se compara JSON.
        control = dict(valido=True, edit={'valido': True}, ejecutor={'hash': 'estable', 'archivos': ['a', 'b']})
        for momento in ('inicio', 'final'):
            self.guardar(root / f'control-{momento}/aislamiento-ejecutor.json', control)
        meta_path = root / 'tanda.json'
        meta = json.loads(meta_path.read_text(encoding='utf-8'))
        meta['regla_acceso_web'] = 'ADR-094'
        self.guardar(meta_path, meta)
        return registro

    def detener(self, texto='Límite de cuota persistente: M-1:1'):
        root = self.cortado.parent
        (root / 'DETENCION.txt').write_text(texto, encoding='utf-8')
        (root / 'control-final/aislamiento-ejecutor.json').unlink()
        path = root / 'tanda.json'
        meta = json.loads(path.read_text(encoding='utf-8'))
        meta['aislamiento_verificado'] = False
        self.guardar(path, meta)

    def corregir(self, *sustitutos, registro=None):
        salida = self.root / 'salida/corregido.jsonl'
        comando = [sys.executable, '-B', str(fixtures.ROOT / 'herramientas/corregir_ecologica.py'),
                   str(registro or self.cortado), '--respuestas', str(self.respuestas), '--salida', str(salida)]
        for sustituto in sustitutos:
            comando.extend(['--control-final-sustituto', str(sustituto)])
        resultado = subprocess.run(comando, capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(resultado.returncode, 0, resultado.stderr)
        return json.loads(salida.read_text(encoding='utf-8'))

    def rechazada(self, row):
        self.assertTrue(row['fallo_preparacion'])
        self.assertIsNone(row['resultado'])
        self.assertNotIn('aislamiento_final_sustituto', row)

    def test_q1_cuota_con_continuacion_valida_corrige_y_marca(self):
        normal = self.corregir(self.sustituto.parent)
        self.assertEqual(normal['resultado'], 'sin_efecto')
        self.assertFalse(normal.get('fallo_preparacion', False))
        self.assertNotIn('aislamiento_final_sustituto', normal)
        self.detener()
        for momento in ('inicio', 'final'):
            path = self.sustituto.parent / f'control-{momento}/aislamiento-ejecutor.json'
            control = json.loads(path.read_text(encoding='utf-8'))
            path.write_text(json.dumps(control, indent=2, sort_keys=True), encoding='utf-8')
        # La opción es repetible; un candidato inválido no impide usar otro.
        row = self.corregir(self.root / 'inexistente', self.sustituto.parent)
        self.assertEqual(row.pop('aislamiento_final_sustituto'), str(self.sustituto.parent.resolve()))
        self.assertEqual(row, normal)
        # MED-9c también conserva la excepción sin la capa ADR-094.
        for registro in (self.cortado, self.sustituto):
            path = registro.parent / 'tanda.json'
            meta = json.loads(path.read_text(encoding='utf-8'))
            del meta['regla_acceso_web']
            self.guardar(path, meta)
        row = self.corregir(self.sustituto.parent)
        self.assertEqual(row.pop('aislamiento_final_sustituto'), str(self.sustituto.parent.resolve()))
        self.assertEqual(row, normal)
        # Conservar el rechazo del entorno de la ejecución original.
        original = json.loads(self.cortado.read_text(encoding='utf-8'))
        original.update(ejecucion_alterada=True, diagnostico_alteracion=['sesión anidada'])
        self.cortado.write_text(json.dumps(original) + '\n', encoding='utf-8')
        row = self.corregir(self.sustituto.parent)
        self.assertTrue(row['fallo_preparacion'])
        self.assertIsNone(row['resultado'])

    def test_q2_control_distinto_o_inicial_invalido_rechaza(self):
        self.detener()
        inicio = self.cortado.parent / 'control-inicio/aislamiento-ejecutor.json'
        original = json.loads(inicio.read_text(encoding='utf-8'))
        for cambio in ({'extra': 1}, {'ejecutor': {'hash': 'otro', 'archivos': ['a', 'b']}}):
            with self.subTest(cambio=cambio):
                for momento in ('inicio', 'final'):
                    self.guardar(self.sustituto.parent / f'control-{momento}/aislamiento-ejecutor.json',
                                 dict(original, **cambio))
                self.rechazada(self.corregir(self.sustituto.parent))
        for momento in ('inicio', 'final'):
            self.guardar(self.sustituto.parent / f'control-{momento}/aislamiento-ejecutor.json', original)
        for invalido in ({**original, 'valido': False}, {**original, 'edit': {'valido': False}}, []):
            with self.subTest(invalido=invalido):
                self.guardar(inicio, invalido)
                self.rechazada(self.corregir(self.sustituto.parent))

    def test_q3_detencion_ajena_a_cuota_rechaza(self):
        self.detener('Parada temprana por credencial inválida')
        self.rechazada(self.corregir(self.sustituto.parent))

    def test_q4_parametros_distintos_o_ausentes_rechazan(self):
        self.detener()
        path = self.sustituto.parent / 'tanda.json'
        original = json.loads(path.read_text(encoding='utf-8'))
        cortado_path = self.cortado.parent / 'tanda.json'
        cortado = json.loads(cortado_path.read_text(encoding='utf-8'))
        for campo, otro in [('tanda', 'otra'), ('ejecutor', 'charles'), ('modelo', 'otro/modelo'),
                            ('semilla', 0), ('k', 3), ('limite', 1),
                            ('hash_binario', 'otro'), ('hash_arnes', 'otro'), ('hash_ejecutor', 'otro'),
                            ('hash_hoja', 'otra'), ('hash_escenarios', 'otros'), ('hash_tareas', 'otras'),
                            ('hash_catalogo', 'otro'), ('hash_tarifas', 'otras'), ('condicion', 'otra'),
                            ('brazo', 'otro'), ('dimension', 'deteccion'), ('fuera_del_arbol', True)]:
            for variante in ('distinto', 'sin_sustituto', 'sin_cortado', 'sin_ambos'):
                with self.subTest(campo=campo, variante=variante):
                    meta = dict(original)
                    meta_cortado = dict(cortado)
                    if variante in ('sin_sustituto', 'sin_ambos'):
                        del meta[campo]
                    if variante in ('sin_cortado', 'sin_ambos'):
                        del meta_cortado[campo]
                    if variante == 'distinto':
                        meta[campo] = otro
                    self.guardar(path, meta)
                    self.guardar(cortado_path, meta_cortado)
                    self.rechazada(self.corregir(self.sustituto.parent))

    def test_regresion_con_tanda_real_sin_imagen_y_hash_hoja_nulo(self):
        self.assertNotIn('imagen', TANDA_REAL_MED16)
        self.assertIsNone(TANDA_REAL_MED16['hash_hoja'])
        normal = self.corregir()
        self.detener()
        for registro, aislamiento in ((self.cortado, False), (self.sustituto, True)):
            path = registro.parent / 'tanda.json'
            base = json.loads(path.read_text(encoding='utf-8'))['base_verificada']
            # Solo adaptar los controles y la base de esta evidencia sintética;
            # todos los campos comparados conservan los valores del manifiesto real.
            self.guardar(path, dict(TANDA_REAL_MED16, base_verificada=base,
                                    aislamiento_verificado=aislamiento))
        validar_tanda(self.sustituto.parent, self.respuestas)
        row = self.corregir(self.sustituto.parent)
        self.assertEqual(row.pop('aislamiento_final_sustituto'), str(self.sustituto.parent.resolve()))
        self.assertEqual(row, normal)

    def test_q5_sustituto_sin_validacion_normal_rechaza(self):
        self.detener()
        final = self.sustituto.parent / 'control-final/aislamiento-ejecutor.json'
        original = json.loads(final.read_text(encoding='utf-8'))
        for dato in (None, {'valido': False}, {'valido': True, 'edit': {'valido': False}}, 'json roto'):
            with self.subTest(dato=dato):
                if dato is None:
                    final.unlink()
                elif isinstance(dato, str):
                    final.write_text(dato, encoding='utf-8')
                else:
                    self.guardar(final, dato)
                self.rechazada(self.corregir(self.sustituto.parent))
        self.guardar(final, original)
        # No admitir un sustituto detenido ni uno con base sin validar.
        detencion = self.sustituto.parent / 'DETENCION.txt'
        detencion.write_text('Límite de cuota persistente', encoding='utf-8')
        self.rechazada(self.corregir(self.sustituto.parent))
        detencion.unlink()
        meta_path = self.sustituto.parent / 'tanda.json'
        meta = json.loads(meta_path.read_text(encoding='utf-8'))
        self.guardar(meta_path, dict(meta, union_med9=True, registros_origen=[]))
        self.rechazada(self.corregir(self.sustituto.parent))
        self.guardar(meta_path, meta)
        self.guardar(self.sustituto.parent / 'validacion-base.json', {'valido': False})
        self.rechazada(self.corregir(self.sustituto.parent))

    def test_q6_sin_opcion_conserva_rechazo_actual(self):
        self.detener()
        self.rechazada(self.corregir())
        with self.assertRaisesRegex(ValueError, 'sin aislamiento inicial/final confirmado'):
            validar_tanda(self.cortado.parent, self.respuestas)

    def test_cargar_conserva_aceptadas_y_rechaza_sustituto_alterado(self):
        self.detener()
        row = self.corregir(self.sustituto.parent)
        self.assertFalse(row.get('fallo_preparacion', False))
        aceptadas = [row, dict(row, repeticion=2)]
        # Ubicar las filas junto a su tanda.json, no en una salida sin manifiesto.
        self.cortado.write_text(''.join(json.dumps(r) + '\n' for r in aceptadas), encoding='utf-8')
        self.assertEqual(cargar([self.cortado]), aceptadas)
        # Los controles del sustituto siguen siendo iguales entre sí y válidos,
        # pero ya no coinciden con el control inicial del fragmento cortado.
        for momento in ('inicio', 'final'):
            path = self.sustituto.parent / f'control-{momento}/aislamiento-ejecutor.json'
            control = json.loads(path.read_text(encoding='utf-8'))
            control['ejecutor']['hash'] = 'alterado'
            self.guardar(path, control)
        validar_tanda(self.sustituto.parent, self.respuestas)
        rechazadas = cargar([self.cortado])
        self.assertEqual(len(rechazadas), len(aceptadas))
        for r in rechazadas:
            self.assertTrue(r['fallo_preparacion'])
            self.assertIsNone(r['resultado'])

    def test_cargar_sin_ruta_comun_conserva_rechazo_actual(self):
        self.detener()
        row = self.corregir(self.sustituto.parent)
        for marca in (None, '', str(self.root / 'otra-continuacion')):
            for primera_inconsistente in (False, True):
                with self.subTest(marca=marca, primera_inconsistente=primera_inconsistente):
                    distinta = dict(row, repeticion=2)
                    if marca is None:
                        distinta.pop('aislamiento_final_sustituto')
                    else:
                        distinta['aislamiento_final_sustituto'] = marca
                    filas = [distinta, row] if primera_inconsistente else [row, distinta]
                    self.cortado.write_text(''.join(json.dumps(r) + '\n' for r in filas), encoding='utf-8')
                    rechazadas = cargar([self.cortado])
                    self.assertEqual(len(rechazadas), len(filas))
                    for r in rechazadas:
                        self.assertTrue(r['fallo_preparacion'])
                        self.assertIsNone(r['resultado'])


if __name__ == '__main__':
    unittest.main()
