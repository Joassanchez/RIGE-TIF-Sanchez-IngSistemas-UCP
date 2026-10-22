"""MED-15: análisis con filas sintéticas, sin acreditar ejecución nativa."""
from copy import deepcopy
import unittest

import analizar_ecologica as analisis
from test_med9 import fila


def filas():
    return [dict(fila(c), repeticion=i, hecho=True, resultado='correcta',
                 exito_declarado_falso=False)
            for c in analisis.ECO for i in (1, 2, 3)]


def cambiar(rows, caso, resultados):
    for r, resultado in zip((r for r in rows if r['caso'] == caso), resultados):
        r.update(resultado=resultado, exito_declarado_falso=resultado != 'correcta')


def analizar(rows):
    datos = analisis.analizar_med9(rows, 'ecologica')
    return datos, datos['grupos']['principal|openai/gpt-6.1-sol']


class AnalisisMED15Tests(unittest.TestCase):
    def test_A_1_E1_con_colateral_es_resultado(self):
        rows = filas()
        cambiar(rows, 'C-6', ['colateral'] * 3)
        datos, g = analizar(rows)
        self.assertTrue(g['valida'])
        self.assertEqual(g['E1_con_problema'], [])
        self.assertIn('C-6', g['lectura_preregistrada']['LB']['E1']['tareas_con_problema'])
        informe = analisis.markdown_med9(datos)
        self.assertIn('Pedidos comunes con éxito declarado falso (resultado, no invalida; ADR-098, Contexto 14): []', informe)

    def test_A_2_E1_censurada_invalida(self):
        rows = filas()
        next(r for r in rows if r['caso'] == 'C-6')['censurado'] = True
        _, g = analizar(rows)
        self.assertFalse(g['valida'])
        self.assertEqual(g['motivos_invalidez'],
                         ['LB/C-6: control E1 con censura; repetir instrumento.'])

    def test_A_3_colateral_solo_cuenta_en_principal(self):
        rows = filas()
        cambiar(rows, 'M-1', ['colateral'] * 3)
        original = deepcopy(rows)
        datos, g = analizar(rows)
        self.assertEqual(rows, original)
        principal = g['estratos']['LB']['E2']
        sensibilidad = g['sensibilidad_sin_colateral']['LB']['E2']
        self.assertFalse(principal['tareas']['M-1']['con_problema'])
        self.assertEqual(principal['tareas']['M-1']['fraccion'], '0/3')
        self.assertEqual(g['lectura_preregistrada']['LB']['E2']['tareas']['M-1']['fraccion'], '3/3')
        self.assertEqual(sensibilidad['tareas']['M-1']['fraccion'], '0/3')
        self.assertFalse(sensibilidad['tareas']['M-1']['con_problema'])
        self.assertFalse(sensibilidad['tareas']['M-1']['con_problema_1_de_3'])
        self.assertEqual(sensibilidad['familias_con_problema'], [])
        self.assertIn('Sensibilidad sin colateral (ADR-098, punto 6)', analisis.markdown_med9(datos))

    def test_A_4_sin_efecto_cuenta_en_ambas_lecturas(self):
        rows = filas()
        cambiar(rows, 'M-1', ['sin_efecto', 'sin_efecto', 'colateral'])
        cambiar(rows, 'M-2', ['incorrecta', 'incorrecta', 'incorrecta'])
        for r in rows:
            if r['caso'] == 'M-2':
                r['hecho'] = r['repeticion'] == 1
        _, g = analizar(rows)
        principal = g['estratos']['LB']['E2']
        sensibilidad = g['sensibilidad_sin_colateral']['LB']['E2']
        self.assertTrue(principal['tareas']['M-1']['con_problema'])
        self.assertTrue(sensibilidad['tareas']['M-1']['con_problema'])
        self.assertEqual(sensibilidad['tareas']['M-1']['fraccion'], '2/3')
        self.assertEqual(sensibilidad['familias_con_problema'], ['ruta_absoluta'])
        self.assertEqual(sensibilidad['tareas']['M-2']['fraccion'], '1/3')
        self.assertFalse(sensibilidad['tareas']['M-2']['con_problema'])
        self.assertTrue(sensibilidad['tareas']['M-2']['con_problema_1_de_3'])

    def test_A_5_principal_conserva_resultado_previo(self):
        rows = filas()
        cambiar(rows, 'M-1', ['colateral'] * 3)
        cambiar(rows, 'M-2', ['sin_efecto', 'incorrecta', 'correcta'])
        cambiar(rows, 'S-1', ['incorrecta', 'correcta', 'correcta'])
        _, g = analizar(rows)
        # Resultado previo a MED-15 para estas filas: 3/3, 2/3, 1/3
        # respectivamente; el resto 0/3. No depende del cálculo de sensibilidad.
        previo = {'M-1': ('3/3', True, True), 'M-2': ('2/3', True, True),
                  'S-1': ('1/3', False, True)}
        for c, t in {c: t for estrato in g['lectura_preregistrada']['LB'].values()
                     for c, t in estrato['tareas'].items()}.items():
            self.assertEqual((t['fraccion'], t['con_problema'], t['con_problema_1_de_3']),
                             previo.get(c, ('0/3', False, False)))
        self.assertTrue(g['valida'])
        self.assertEqual(g['motivos_invalidez'], [])
        self.assertEqual(g['tareas_E2_con_problema_LB'], ['M-2'])
        self.assertEqual(g['estratos']['LB']['E2']['familias_con_problema'], ['ruta_absoluta'])
        self.assertEqual(g['estratos']['LB']['E1']['tareas_con_problema'], [])
        self.assertEqual(g['estratos']['LB']['E4']['tareas_con_problema'], [])


if __name__ == '__main__':
    unittest.main()
