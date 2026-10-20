"""Ensayo MED-13-c1 de los derivados; nombre único entre ambas suites."""
import importlib.util
import json
from unittest.mock import patch
import unittest

import ecologica as eco
import test_registro_ecologica as registro


class DeteccionDerivadaTests(unittest.TestCase):
    def test_1_medir_resuelve_todos_los_planes_generados_en_anfitrion(self):
        spec = importlib.util.spec_from_file_location('med13c1_planes', registro.ROOT / 'herramientas/generar-ecologica.py')
        generador = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(generador)
        hoja = json.loads((registro.ROOT / 'ecologica/respuestas-deteccion.json').read_text(encoding='utf-8'))
        base = json.loads((registro.ROOT / 'vm/simulado/deteccion.json').read_text(encoding='utf-8'))
        plan = generador.planes_deteccion(hoja, base)
        original = eco.medir
        def medir(compartidas, ejecutar_medida):
            eco.guardar(compartidas['BASE'] / 'simulado/deteccion.json', plan)
            return original(compartidas, ejecutar_medida)
        for caso in set(hoja['casos']) - {'D-A', 'D-B', 'D-C'}:
            with self.subTest(caso=caso):
                fixture = registro.RegistroTests()
                self.addCleanup(fixture.doCleanups)
                with patch.object(eco, 'medir', medir):
                    r, salida, _, _ = fixture.correr(dimension='deteccion', caso=caso)
                self.assertEqual(r['caso'], caso)
                self.assertFalse(r['registro_incompleto'])
                self.assertFalse((salida / 'DETENCION.txt').exists())


if __name__ == '__main__':
    unittest.main()
