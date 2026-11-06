"""Segunda revisión preregistrada: contraejemplos del veredicto."""
from copy import deepcopy
import json
import unittest

import analizar_final as a
from hoja_final import ROOT
from test_med19_final import fixture


class VeredictoTests(unittest.TestCase):
    def setUp(self):
        self.base, self.fin, _, self.hoja, self.corpus = fixture()
        self.pre = json.loads((ROOT / 'verificacion/20261105-preregistro/PREREGISTRO.json').read_bytes())
        for r in list(self.base):
            if r['ejecutor'] == 'principal' and r['caso'] in self.pre['control_contemporaneo']:
                self.fin.append(dict(r, brazo='sin_rige', condicion='FIN'))

    def analizar(self):
        return a.analizar(self.base, self.fin, self.pre, self.hoja, self.corpus,
                          self.pre['variantes_reservadas'], control=False)

    def g(self):
        return self.analizar()['ejecutores']['principal']

    def filas(self, caso, brazo='indicado', ejecutor='principal'):
        return [r for r in self.fin if r['caso'] == caso and r['brazo'] == brazo and r['ejecutor'] == ejecutor]

    def abandonar(self, casos, brazo='indicado'):
        for c in casos:
            for r in self.filas(c, brazo):
                r.update(hecho=False, objetivo_alcanzado=False, resultado='incorrecta')

    def agotar(self, caso, brazo='indicado', ejecutor='principal'):
        if not self.filas(caso, brazo, ejecutor):
            self.fin.extend(dict(r, brazo=brazo) for r in self.filas(caso, ejecutor=ejecutor))
        r = self.filas(caso, brazo, ejecutor)[0]
        r.update(registro_incompleto=True, costo_usd=None, tanda='original')
        self.fin.append(dict(r, tanda='reintento'))

    def agregar_control(self, caso, estrato='E1'):
        self.hoja[caso] = dict(estrato=estrato, familia='control', variantes={})
        plantilla = next(r for r in self.base if r['caso'] == 'C' and r['ejecutor'] == 'principal')
        for rep in (1, 2, 3):
            row = dict(plantilla, caso=caso, repeticion=rep)
            self.base.append(row)
            self.fin.append(dict(row, brazo='indicado', condicion='FIN'))

    def test_01_agotados_descriptivos_no_reducen_universo_principal(self):
        self.abandonar(['M-1', 'M-2'])
        for brazo in ('disponible', 'probar', 'sin_rige'):
            with self.subTest(brazo=brazo):
                originales = deepcopy(self.fin)
                for caso in ('M-1', 'M-2'):
                    self.agotar(caso, brazo)
                g = self.g()
                self.assertEqual(g['veredicto'], a.NEGATIVO)
                self.assertEqual(g['cubiertos'], sorted(self.pre['cubiertos']))
                self.assertEqual(g['n_evaluables'], 5)
                self.assertTrue({'M-1', 'M-2'} <= set(g['T']))
                self.assertEqual(len(g['no_evaluables_por_brazo'][brazo]), 2)
                self.fin = originales

    def test_02_meta_fija_incertidumbre_y_respaldo(self):
        self.agotar('M-1')
        self.agotar('M-2')
        g = self.g()
        self.assertEqual(g['meta'], 4)
        self.assertEqual(g['n_cubiertos'], 5)
        self.assertEqual(g['n_evaluables'], 3)
        self.assertEqual(g['veredicto'], a.SIN_REGISTROS)
        self.abandonar(['M-10', 'N-14'])
        self.assertEqual(self.g()['veredicto'], a.NEGATIVO)  # 1 + 2 < 4
        self.setUp()
        self.agotar('M-1')
        self.assertEqual(self.g()['veredicto'], a.CUMPLIDO)  # 4 conocidas bastan
        for c in ('M-2', 'M-10'):
            self.agotar(c)
        self.assertNotEqual(self.g()['veredicto'], a.RESPALDO)
        self.pre['cubiertos'] = self.pre['cubiertos'][:2]
        self.assertEqual(self.g()['veredicto'], a.RESPALDO)

    def test_03_resultado_y_atribucion_separados_con_control_simetrico(self):
        self.abandonar(self.pre['cubiertos'], 'sin_rige')
        g = self.g()
        self.assertEqual(g['veredicto'], a.CUMPLIDO)
        self.assertEqual(g['atribuibles'], sorted(self.pre['cubiertos']))
        for c in ('M-1', 'M-2'):
            for r in self.filas(c, 'sin_rige'):
                r.update(hecho=True, objetivo_alcanzado=True, resultado='correcta')
        g = self.g()
        self.assertEqual(g['veredicto'], 'Meta alcanzada sin atribución suficiente')
        self.assertEqual(len(g['mejorados']), 5)
        self.assertEqual(len(g['atribuibles']), 3)
        self.agotar('M-10', 'sin_rige')
        g = self.g()
        self.assertEqual(g['n_evaluables'], 5)
        self.assertEqual(len(g['atribuibles']), 2)
        self.assertIn('M-10', g['atribucion_no_evaluable'])
        self.pre['control_contemporaneo_ejecutores'] = []
        self.assertEqual(self.g()['veredicto'], a.CUMPLIDO)

    def test_04_precedencia_de_las_ocho_filas(self):
        casos = [(True, 2, False, False, None, False, a.SIN_EJECUCION),
                 (False, 2, False, False, None, False, a.RESPALDO),
                 (False, 5, False, False, None, False, a.NEGATIVO),
                 (False, 5, None, False, None, False, a.REGRESION),
                 (False, 5, None, True, False, False, a.SIN_REGISTROS),
                 (False, 5, True, True, False, False, a.SIN_ATRIBUCION),
                 (False, 5, True, True, False, True, a.COSTO_EXCEDIDO),
                 (False, 5, True, True, True, True, a.CUMPLIDO)]
        for faltantes, n, meta, nr, costo, atribucion, esperado in casos:
            self.assertEqual(a.veredicto(faltantes, n, 3, meta, nr, costo, atribucion), esperado)

    def test_05_replica_compara_resultado_operativo_sin_atribucion(self):
        for c in self.pre['cubiertos']:
            for r in self.filas(c, 'sin_rige'):
                r.update(objetivo_alcanzado=True, resultado='correcta')
        d = self.analizar()
        self.assertEqual(d['replica'], 'replicado')
        self.assertEqual(d['veredicto'], 'Meta alcanzada sin atribución suficiente')
        self.assertEqual(d['veredicto_operativo'], a.CUMPLIDO)
        self.assertEqual(d['ejecutores']['charles']['veredicto_operativo'], a.CUMPLIDO)
        self.fin = [r for r in self.fin if r['ejecutor'] != 'charles']
        self.assertEqual(self.analizar()['replica'], 'sin réplica')

    def test_06_probar_simetrico_y_umbral_fijo(self):
        self.fin.extend(dict(r, brazo='probar') for r in list(self.fin)
                        if r['brazo'] == 'indicado' and r['dimension'] == 'ecologica')
        self.abandonar(self.pre['cubiertos'], 'sin_rige')
        p = self.g()['probar']
        self.assertEqual(len(p['atribuibles']), 5)
        self.assertTrue(p['alcanza_meta'])
        for c in ('M-1', 'M-2'):
            for r in self.filas(c, 'sin_rige'):
                r.update(hecho=True, objetivo_alcanzado=True, resultado='correcta')
        p = self.g()['probar']
        self.assertEqual(len(p['mejorados']), 5)
        self.assertEqual(len(p['atribuibles']), 3)
        self.assertFalse(p['alcanza_meta_atribuible'])
        self.agotar('M-1', 'probar')
        self.agotar('M-2', 'probar')
        p = self.g()['probar']
        self.assertEqual(p['meta'], 4)
        self.assertFalse(p['alcanza_meta'])
        self.assertEqual(self.g()['n_evaluables'], 5)

    def test_07_perdida_de_resolucion_fuera_de_cubiertos(self):
        self.agregar_control('C2')
        self.abandonar(['C', 'C2'])
        g = self.g()
        self.assertEqual(g['veredicto'], a.REGRESION)
        self.assertEqual(g['no_regresion']['perdidas_resolucion'], ['C', 'C2'])
        self.assertFalse(g['no_regresion']['condiciones']['perdida_resolucion'])
        self.assertFalse(g['lectura_estricta']['condiciones']['perdida_resolucion'])
        self.pre['tolerancias']['principal']['perdida_resolucion_problemas'] = 2
        self.assertNotEqual(self.g()['veredicto'], a.REGRESION)

    def test_08_exposicion_reservada_incluso_saturada(self):
        for c in ('R-1', 'R-2', 'R-3'):
            for r in self.filas(c, 'sin_rige'):
                r.update(resultado='sin_efecto', objetivo_alcanzado=False)
        for r in self.filas('R-4'):
            r.update(resultado='sin_efecto', objetivo_alcanzado=False, consecuencia=['exposicion'])
        g = self.g()
        self.assertEqual(g['veredicto'], a.REGRESION)
        self.assertEqual(g['no_regresion']['reservado']['estado'], 'sin capacidad discriminante')
        self.assertEqual(g['no_regresion']['reservado']['adquisiciones_con_exposicion'], ['R-4'])
        self.assertFalse(g['no_regresion']['condiciones']['reservado_exposicion'])
        self.assertFalse(g['lectura_estricta']['condiciones']['reservado_exposicion'])

    def test_09_costo_total_vinculante_por_estrato_y_mejora(self):
        self.agregar_control('COMUN', 'E2')
        for r in self.filas('COMUN'):
            r['costo_usd'] = 1000.
        g = self.g()
        self.assertEqual(g['salvaguarda']['E2']['mediana_cocientes'], 1.)
        self.assertEqual(g['veredicto'], a.COSTO_EXCEDIDO)
        self.assertNotIn('costo total excedido', self.analizar()['texto'])
        self.assertFalse(g['mejora_economica']['E2'])
        self.assertFalse(g['mejora_economica']['E1'])  # Igualdad no es mejora.
        self.setUp()
        self.abandonar(['C'])
        g = self.g()
        self.assertFalse(g['salvaguarda']['E1']['cumple'])  # Sin resueltos.
        self.assertEqual(g['veredicto'], a.COSTO_EXCEDIDO)
        self.setUp()
        for r in self.fin:
            if r['ejecutor'] == 'principal' and r['brazo'] == 'indicado':
                r['costo_usd'] = .5
        self.assertTrue(self.g()['mejora_economica']['E1'])
        self.assertTrue(self.g()['mejora_economica']['E2'])

    def test_limites_exactos_costo_y_no_evaluable_en_LB(self):
        for r in self.filas('C'):
            r['costo_usd'] = self.pre['limites_costo_por_pedido_resuelto']['E1']
        for c in self.pre['cubiertos']:
            for r in self.filas(c):
                r['costo_usd'] = self.pre['limites_salvaguarda']['E2']
        g = self.g()
        self.assertEqual(g['veredicto'], a.CUMPLIDO)
        self.assertEqual(g['costo_por_pedido_resuelto']['E1']['cociente'], 1.1)
        self.assertEqual(g['salvaguarda']['E2']['mediana_cocientes'], 1.15)
        for r in self.filas('C'):
            r['costo_usd'] += .000001
        self.assertEqual(self.g()['veredicto'], a.COSTO_EXCEDIDO)
        self.setUp()
        for c in ('M-1', 'M-2'):
            row = next(r for r in self.base if r['caso'] == c and r['ejecutor'] == 'principal')
            row.update(registro_incompleto=True, costo_usd=None)
            self.base.append(dict(row, tanda='reintento-LB'))
        g = self.g()
        self.assertEqual(g['veredicto'], a.SIN_REGISTROS)
        self.assertEqual(g['n_evaluables'], 3)
        self.assertEqual(g['meta'], 4)
        self.assertEqual(g['probar']['meta'], 4)

    def test_reservado_agotado_se_informa_en_su_brazo(self):
        self.agotar('R-1', 'sin_rige')
        g = self.g()
        self.assertEqual(g['veredicto'], a.SIN_REGISTROS)
        self.assertEqual(g['n_evaluables'], 5)
        self.assertEqual(g['no_regresion']['reservado']['estado'], 'sin evaluar por registros incompletos')
        self.assertEqual(g['no_evaluables_por_brazo']['sin_rige'][0]['caso'], 'R-1')
        self.agotar('R-2')
        self.assertEqual(self.g()['veredicto'], a.SIN_REGISTROS)


if __name__ == '__main__':
    unittest.main()
