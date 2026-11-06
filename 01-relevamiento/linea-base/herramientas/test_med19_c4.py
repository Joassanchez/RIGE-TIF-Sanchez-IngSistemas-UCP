"""Tercera revisión: una falta de evidencia no acredita cumplimiento."""
import unittest

import analizar_final as a
import test_med19_c3 as casos


class TrivalenteTests(unittest.TestCase):
    def setUp(self):
        self.c = casos.VeredictoTests()
        self.c.setUp()

    def test_01_texto_de_registros_incompletos(self):
        self.assertEqual(a.SIN_REGISTROS, 'Criterio sin evaluar por registros incompletos')

    def test_02_regresion_comprobada_prevalece_sobre_meta_incierta(self):
        c = self.c
        for caso in ('M-1', 'M-2'):
            c.agotar(caso)
        for r in c.filas('C'):
            r.update(resultado='sin_efecto', objetivo_alcanzado=False, consecuencia=['exposicion'])
        g = c.g()
        self.assertEqual(g['veredicto'], a.REGRESION)
        self.assertIsNone(g['meta_alcanzada'])
        self.assertEqual(g['componentes_operativos'], dict(meta=None, no_regresion=False, salvaguarda=False))

    def test_03_reservado_agotado_en_ambos_brazos(self):
        for brazo in ('sin_rige', 'indicado'):
            with self.subTest(brazo=brazo):
                c = casos.VeredictoTests()
                c.setUp()
                c.agotar('R-1', brazo)
                g = c.g()
                self.assertEqual(g['veredicto'], 'Criterio sin evaluar por registros incompletos')
                self.assertIsNone(g['no_regresion']['condiciones']['reservado'])
                self.assertIsNone(g['no_regresion']['condiciones']['reservado_exposicion'])
                self.assertIsNone(g['no_regresion']['cumple'])
                self.assertEqual(g['n_evaluables'], 5)
                self.assertEqual(len(g['T']), 5)

    def test_04_universo_38_con_dos_E1_desconocidos(self):
        c = self.c
        for i in range(2, 39):
            c.agregar_control(f'C{i}')
        c.agotar('C')
        c.agotar('C2')
        g = c.g()
        self.assertEqual(g['veredicto'], 'Criterio sin evaluar por registros incompletos')
        nr = g['no_regresion']
        self.assertEqual(len(nr['universo']), 38)
        self.assertEqual(nr['no_evaluables'], ['C', 'C2'])
        self.assertIsNone(nr['condiciones']['adquisicion'])
        self.assertIsNone(nr['condiciones']['perdida_resolucion'])
        c.pre['tolerancias']['principal']['perdida_resolucion_problemas'] = 2
        self.assertTrue(c.g()['no_regresion']['condiciones']['perdida_resolucion'])
        c.abandonar(['C3', 'C4', 'C5'])
        self.assertFalse(c.g()['no_regresion']['condiciones']['perdida_resolucion'])

    def test_05_33_pedidos_mas_intento_reemplazado_no_cuestan_igual(self):
        c = self.c
        for i in range(6):
            c.agregar_control(f'E2-{i}', 'E2')
        # 11 problemas x 3 repeticiones con resultado nativo resuelto.
        for r in [*c.base, *c.fin]:
            if r['ejecutor'] == 'principal' and r['dimension'] == 'ecologica' and c.hoja[r['caso']]['estrato'] == 'E2':
                r.update(resultado='correcta', objetivo_alcanzado=True)
        original = dict(c.filas('M-1')[0], registro_incompleto=True, costo_usd=None, tanda='intento-original')
        c.fin.append(original)
        g = c.g()
        self.assertGreater(g['costo_por_pedido_resuelto']['E2']['cociente'], 1.)
        self.assertAlmostEqual(g['costo_por_pedido_resuelto']['E2']['cociente'], 34/33)
        self.assertEqual(g['descriptivos']['indicado']['E2']['costo_total_usd'], 34.)
        self.assertEqual(g['costo_imputado'][0]['costo_usd'], 1.)
        self.assertEqual(g['costo_imputado'][0]['tanda'], 'intento-original')
        # Solicitudes completas: propias y anidadas ya consolidadas una vez.
        propia = dict(tokens_entrada=100, tokens_cache=200, tokens_salida=50, cache_escritura=20)
        anidada = dict(tokens_entrada=30, tokens_cache=40, tokens_salida=10, cache_escritura=5,
                       modelo='openai/gpt-6-astra', origen='anidado')
        original['solicitudes'] = [propia, anidada]
        original['solicitudes_anidadas'] = [anidada]  # Nunca sumar otra vez.
        g = c.g()
        self.assertEqual(g['costo_imputado'], [])
        self.assertAlmostEqual(g['descriptivos']['indicado']['E2']['costo_total_usd'], 33.00165)
        original['tokens_anidados'] = dict(tokens_entrada=None, tokens_cache=None, tokens_salida=None)
        self.assertEqual(c.g()['costo_imputado'][0]['costo_usd'], 1.)

    def test_06_replica_compara_componentes_y_expone_incertidumbre(self):
        c = self.c
        for e in ('principal', 'charles'):
            for caso in c.pre['cubiertos'][:2]:
                for r in c.filas(caso, ejecutor=e):
                    r.update(hecho=False, objetivo_alcanzado=False, resultado='incorrecta')
        for r in c.filas('C', ejecutor='charles'):
            r['costo_usd'] = 2.
        d = c.analizar()
        self.assertEqual(d['veredicto'], a.NEGATIVO)
        self.assertEqual(d['ejecutores']['charles']['veredicto'], a.NEGATIVO)
        self.assertEqual(d['replica'], 'no replicado')
        c = self.c = casos.VeredictoTests()
        c.setUp()
        c.agotar('R-1')
        d = c.analizar()
        self.assertEqual(d['replica'], 'réplica no evaluable')
        self.assertTrue(d['texto'].endswith('; réplica no evaluable'))
        c.fin = [r for r in c.fin if r['ejecutor'] != 'charles']
        self.assertEqual(c.analizar()['replica'], 'sin réplica')

    def test_07_nota_probar_segun_atribucion(self):
        c = self.c
        c.fin.extend(dict(r, brazo='probar') for r in list(c.fin)
                     if r['brazo'] == 'indicado' and r['dimension'] == 'ecologica')
        for caso in ('M-1', 'M-2'):
            for r in c.filas(caso, 'sin_rige'):
                r.update(resultado='correcta', objetivo_alcanzado=True)
        p = c.g()['probar']
        self.assertTrue(p['alcanza_meta'])
        self.assertFalse(p['alcanza_meta_atribuible'])
        self.assertEqual(p['nota'], 'La instrucción de probar resuelve la meta, pero sin atribución suficiente frente al control contemporáneo.')
        c.abandonar(['M-1', 'M-2'], 'sin_rige')
        self.assertEqual(c.g()['probar']['nota'], a.NOTA_PROBAR)

    def test_costo_sin_base_de_imputacion_y_costo_cero_acreditado(self):
        c = self.c
        for r in list(c.filas('C')):
            r.update(registro_incompleto=True, costo_usd=None)
            c.fin.append(dict(r, tanda='reintento'))
        g = c.g()
        self.assertIsNone(g['salvaguarda']['E1']['cumple'])
        self.assertIsNone(g['descriptivos']['indicado']['E1']['costo_total_usd'])
        self.assertEqual(g['costo_imputado'], [])
        self.assertEqual(g['descriptivos']['indicado']['E1']['intentos_sin_costo'], 6)
        # Cero acreditado sí es un costo conocido; sin resueltos, no cumple.
        c.filas('C')[0]['solicitudes'] = [dict(tokens_entrada=0, tokens_cache=0, tokens_salida=0)]
        g = c.g()
        self.assertFalse(g['salvaguarda']['E1']['cumple'])
        self.assertEqual(g['descriptivos']['indicado']['E1']['costo_total_usd'], 0.)
        self.assertEqual(len(g['costo_imputado']), 5)

    def test_imputacion_no_mezcla_brazo_estrato_ni_objetivos_incompletos(self):
        c = self.c
        for r in c.base:
            r['costo_usd'] = 100.
        c.filas('C')[0]['costo_usd'] = 1000.  # Otro estrato.
        otro_brazo = dict(c.filas('M-1')[0], brazo='disponible', costo_usd=2000.)
        c.fin.append(otro_brazo)
        intento = dict(c.filas('M-1')[0], registro_incompleto=True, costo_usd=None)
        c.fin.append(intento)
        g = c.g()
        self.assertEqual(g['costo_imputado'][0]['costo_usd'], 1.)
        self.assertEqual(g['descriptivos']['indicado']['E2']['pedidos_resueltos_con_efecto'], 15)
        self.assertEqual(g['descriptivos']['indicado']['E2']['costo_total_usd'], 16.)
        self.assertNotIn('costo_imputado', intento)  # La fila fuente no se muta.


if __name__ == '__main__':
    unittest.main()
