"""MED-7: detector del arnés y recálculo externo, sin red ni Docker."""
from copy import deepcopy
import json
import unittest

from corregir import corregir
from corregir_modificacion import corregir as corregir_modificacion
from deteccion import acceso_web, recalcular_acceso_web
from test_med5 import cargar_arnes, ROOT


def herramienta(command='', nombre='bash'):
    return dict(herramienta=nombre, argumentos=dict(command=command),
                estado='completed', resultado='')


class DetectorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.arnes = cargar_arnes()

    def comprobar(self, herramientas, esperado):
        self.assertEqual(acceso_web(herramientas), esperado)
        self.assertEqual(self.arnes.observar(herramientas)['acceso_web'], esperado)

    def test_esquema_en_python_no_cuenta(self):
        self.comprobar([herramienta('como-dev \'python3 -c ... "$schema": "https://opencode.ai/config.json" ...\'')], 0)

    def test_curl_al_esquema_cuenta(self):
        self.comprobar([herramienta('curl https://opencode.ai/config.json')], 1)

    def test_curl_en_como_dev_cuenta(self):
        self.comprobar([herramienta("como-dev 'curl -fsSL https://raw.githubusercontent.com/...' ")], 1)

    def test_herramientas_web_siempre_cuentan(self):
        for nombre in ('webfetch', 'websearch'):
            with self.subTest(nombre=nombre):
                self.comprobar([herramienta('https://opencode.ai/config.json', nombre)], 1)

    def test_programas_web_siempre_cuentan(self):
        for programa in ('curl', 'wget', 'fetch', 'requests', 'urllib', 'Invoke-WebRequest'):
            with self.subTest(programa=programa):
                self.comprobar([herramienta(f'{programa} https://opencode.ai/config.json')], 1)

    def test_elimina_todas_las_apariciones_exactas(self):
        self.comprobar([herramienta('echo https://opencode.ai/config.json "https://opencode.ai/config.json"')], 0)

    def test_otras_urls_se_conservan(self):
        self.comprobar([herramienta('echo https://opencode.ai/config.json https://example.com')], 1)

    def test_correctores_conservan_crudo_incluso_en_retorno_temprano(self):
        for herramientas, esperado in (([], 0), ([herramienta('https://opencode.ai/config.json')], 0),
                                      ([herramienta('curl https://opencode.ai/config.json')], 1), (None, 1)):
            row = dict(acceso_web=1, respuesta_textual='formato inválido')
            if herramientas is not None:
                row['herramientas'] = herramientas
            original = deepcopy(row)
            salidas = (corregir(row, {}), corregir_modificacion(row, dict(agente='build', elemento='model'), {}, {}))
            for salida in salidas:
                with self.subTest(herramientas=herramientas):
                    self.assertEqual(salida['acceso_web'], esperado)
                    self.assertEqual(salida['acceso_web_registrado'], 1)
                    self.assertEqual(salida['regla_acceso_web'], 'ADR-086')
            self.assertEqual(row, original)

    def test_tandas_reales_solo_cambian_tres_filas(self):
        esperados = {
            '20261013-LB-principal-sol': set(),
            '20261013-LB-charles-sol': set(),
            '20261014-LB-mod-principal-sol': set(),
            '20261014-LB-mod-charles-sol': {('C-3b', 1), ('C-3b', 3)},
            '20261014-LB-mod-charles-b-sol': {('C-3b', 2)},
        }
        registros = sorted((ROOT / 'verificacion').glob('*/registro.jsonl'))
        self.assertTrue(set(esperados).issubset({p.parent.name for p in registros}))
        for path in registros:
            cambios = set()
            for linea in path.read_text(encoding='utf-8').splitlines():
                row = json.loads(linea)
                nuevo = recalcular_acceso_web(row)
                self.comprobar(row['herramientas'], nuevo['acceso_web'])
                self.assertEqual(nuevo['acceso_web_registrado'], row['acceso_web'])
                if nuevo['acceso_web'] != row['acceso_web']:
                    cambios.add((row['caso'], row['repeticion']))
                    self.assertEqual((row['acceso_web'], nuevo['acceso_web']), (1, 0))
                if path.parent.name.startswith('20261013-LB-'):
                    self.assertEqual(nuevo['acceso_web'], 0)
                if path.parent.name == '20261014-LB-mod-charles-sol' and (row['caso'], row['repeticion']) == ('C-3f', 2):
                    self.assertEqual(nuevo['acceso_web'], 1)
            with self.subTest(tanda=path.parent.name):
                self.assertEqual(cambios, esperados.get(path.parent.name, set()))


if __name__ == '__main__':
    unittest.main()
