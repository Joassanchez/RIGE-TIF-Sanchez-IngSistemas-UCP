"""Pruebas con datos inventados: nunca leen la adjudicación firmada."""
import unittest

import concordancia as c


class Coeficientes(unittest.TestCase):
    def test_kappa_conocido(self):
        # Tabla de 2×2 de manual: 20 sí-sí, 5 sí-no, 10 no-sí, 15 no-no → kappa 0,4.
        pares = [('correcta', 'correcta')] * 20 + [('correcta', 'parcial')] * 5 + [('parcial', 'correcta')] * 10 + [('parcial', 'parcial')] * 15
        self.assertAlmostEqual(c.kappa(pares), 0.4)

    def test_una_sola_categoria_deja_kappa_indefinido_y_ac1_en_uno(self):
        pares = [('correcta', 'correcta')] * 20
        self.assertIsNone(c.kappa(pares))
        self.assertEqual(c.ac1(pares), 1)

    def test_prevalencia_alta_kappa_bajo_ac1_alto(self):
        pares = [('correcta', 'correcta')] * 19 + [('correcta', 'parcial')]
        self.assertEqual(c.kappa(pares), 0)
        self.assertGreater(c.ac1(pares), .9)


class Regla(unittest.TestCase):
    def datos(self, autor_x, autor_y):
        firmada = {f'T|ej|m|LB|C-1|{r}': dict(id=f'T|ej|m|LB|C-1|{r}', hash_respuesta=str(r), resultado='parcial' if r < 3 else 'correcta') for r in (1, 2, 3)}
        clave = [dict(codigo='P-01', estrato='A', id='T|ej|m|LB|C-1|1', hash_respuesta='1'),
                 dict(codigo='P-02', estrato='B', id='T|ej|m|LB|C-1|2', hash_respuesta='2')]
        planilla = {'P-01': dict(autor=autor_x, motivo=''), 'P-02': dict(autor=autor_y, motivo='')}
        return planilla, clave, firmada

    def test_coincidencia_total_no_extiende(self):
        r = c.analizar(*self.datos('parcial', 'parcial'))
        self.assertEqual(r['total']['acuerdo'], 1)
        self.assertFalse(r['extender_a_las_restantes'])
        self.assertEqual(r['cambios_de_caso'], [])

    def test_discrepancia_que_cambia_el_caso(self):
        r = c.analizar(*self.datos('correcta', 'parcial'))
        self.assertTrue(r['extender_a_las_restantes'])
        self.assertEqual(r['cambios_de_caso'], [dict(ejecutor='ej', caso='C-1', antes=True, despues=False)])

    def test_hash_distinto_se_rechaza(self):
        planilla, clave, firmada = self.datos('parcial', 'parcial')
        clave[0]['hash_respuesta'] = 'otro'
        with self.assertRaises(SystemExit):
            c.analizar(planilla, clave, firmada)


if __name__ == '__main__':
    unittest.main()
