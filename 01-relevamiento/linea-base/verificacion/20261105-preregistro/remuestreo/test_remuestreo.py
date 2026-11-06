"""Pruebas con datos inventados y valores calculables a mano."""
import random
import unittest

import remuestreo as r


class Remuestreo(unittest.TestCase):
    def test_un_problema_con_una_de_tres_da_siete_de_27(self):
        valores = r.adquisiciones({'X': [True, False, False]}, random.Random(1), 20000)
        self.assertAlmostEqual(sum(v > 0 for v in valores) / len(valores), 7 / 27, delta=0.01)

    def test_resultado_fijo_en_cero_de_tres(self):
        self.assertEqual(set(r.adquisiciones({'X': [False] * 3}, random.Random(1), 200)), {0})

    def test_defecto_con_tres_de_tres_no_baja_id1(self):
        casos = {'D': [dict(detectados={'a'}, fp=0, universo=['a'])] * 3}
        descensos, fps = r.deteccion(casos, 1, random.Random(1), 200)
        self.assertEqual(set(descensos), {0})
        self.assertEqual(set(fps), {0})

    def test_falsos_positivos_varian_con_la_repeticion(self):
        casos = {'D': [dict(detectados=set(), fp=f, universo=[]) for f in (0, 0, 3)]}
        _, fps = r.deteccion(casos, 0, random.Random(1), 2000)
        self.assertEqual(set(fps), {0, 3, 6, 9})

    def test_percentil95_por_rango_mas_cercano(self):
        self.assertEqual(r.percentil95(list(range(1, 101))), 95)

    def test_decision_en_el_limite(self):
        self.assertEqual(r.resumen([0] * 95 + [1] * 5, lambda v: v > 0)['decision'], 'se conserva la condición')
        self.assertEqual(r.resumen([0] * 94 + [1] * 6, lambda v: v > 0)['decision'], 'tolerancia en el percentil 95')

    def test_reservado_sin_variacion_no_difiere(self):
        familia = {'M': [True] * 3}
        self.assertEqual(set(r.reservado(familia, 5, random.Random(1), 200)), {0})


if __name__ == '__main__':
    unittest.main()
