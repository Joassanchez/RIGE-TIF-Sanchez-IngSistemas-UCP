"""MED-12: fixtures sintéticos; estas pruebas no acreditan admisión nativa."""
from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import analizar_ecologica as analisis
import corregir_ecologica as eco
from proceso import clasificar_proceso
from test_med9 import ROOT, ESPEC, generador, captura, fila, oraculo_fixture

NUEVAS = [*(f'C-{n}' for n in range(1, 7)), *(f'N-{n}' for n in range(20, 26)), 'V-9', 'V-10']


class BancoTests(unittest.TestCase):
    def test_P_1_estratos_familias_y_objetivos_historicos(self):
        for tid, t in ESPEC.items():
            self.assertIn(t['estrato'], ('E1', 'E2', 'E4'))
            self.assertTrue(t['familia'])
        self.assertEqual({ESPEC[c]['familia'] for c in ('M-1', 'M-2', 'M-10', 'N-23')}, {'ruta_absoluta'})
        for c in ('S-1', 'S-2', 'S-3'):
            self.assertEqual(ESPEC[c]['familia'], ESPEC[ESPEC[c]['origen']]['familia'])
        for c in NUEVAS:
            self.assertIn(c, generador.generar(ROOT / 'ecologica')[0]['dimensiones']['ecologica'])
        for c in NUEVAS[:6]:
            self.assertEqual(ESPEC[c]['variantes']['correcta'], ESPEC[c]['variantes']['obvia'])

    def test_P_2_instrucciones_sin_hoja_atribucion_con_hoja(self):
        for nombre in ('tareas.md', 'deteccion.md'):
            self.assertNotIn('hoja-referencia.md', (ROOT / 'ecologica' / nombre).read_text(encoding='utf-8'))
        self.assertIn('hoja-referencia.md', (ROOT / 'vm/medir.sh').read_text(encoding='utf-8'))

    def test_P_3_bateria_plan_y_build(self):
        spec = importlib.util.spec_from_file_location('med12_arnes', ROOT / 'vm/simulado/ecologica.py')
        # Los tests del arnés validan la ejecución; aquí se comprueba el contrato
        # en el módulo que ya cargaron los tests de admisión históricos.
        import sys
        sys.path.insert(0, str(ROOT / 'vm/simulado'))
        try:
            m = generador.cargar(ROOT / 'vm/simulado/ecologica.py', 'arnes_med12')
            for c, t in ESPEC.items():
                if 'objetivo' in t:
                    sondas = m.bateria(m.agentes_escenario(t), t['tarea'], exploracion=c.startswith(('N-', 'S-')), escenario=t)
                    for ag in ('plan', 'build'):
                        self.assertIn((ag, 'edit', 'README.md'), sondas)
        finally:
            sys.path.pop(0)

    def test_P_4_colateral_bateria_aun_cuando_logra_objetivo(self):
        t = ESPEC['M-1']
        a, b = captura('M-1', 'base'), captura('M-1', 'correcta')
        o = oraculo_fixture(t, a, b)
        key = eco.clave(('plan', 'edit', 'README.md'))
        o['antes'][key] = dict(decision='deny')
        o['despues'][key] = dict(decision='allow')
        referencia = dict(o['despues'], **{key: dict(decision='deny')})
        r = eco.corregir(fila('M-1'), t, a, b, o, referencia)
        self.assertEqual(r['resultado'], 'colateral')
        self.assertTrue(r['exito_declarado_falso'])
        self.assertFalse(r['colateral_guarda'])
        self.assertEqual(r['colateral_bateria'][0]['sonda'], key)
        del o['despues'][key]
        self.assertTrue(eco.corregir(fila('M-1'), t, a, b, o, referencia)['fallo_preparacion'])

    def test_P_5_consecuencia_mixta_y_valor_distinto(self):
        a = dict(objetivo='allow', guardas={'g': 'allow'}, bateria={'b': 'deny'})
        b = dict(objetivo='allow', guardas={'g': 'deny'}, bateria={'b': 'ask'})
        self.assertEqual(eco.clasificar(a, b, 'deny', {'b': 'deny'})['consecuencia'], ['exposicion', 'bloqueo'])
        r = eco.clasificar(dict(objetivo='modeloA', guardas={}), dict(objetivo='modeloB', guardas={}), 'modeloC')
        self.assertEqual(r['consecuencia'], ['valor_distinto'])

    def test_P_6_sed_markdown_debug_agent_posterior(self):
        def h(nombre, **args):
            return dict(herramienta=nombre, argumentos=args)
        r = dict(herramientas=[h('bash', command="sed -n '1,20p' .opencode/agent/revisor.md"),
            h('bash', command='cat "$CONFIG"'), h('bash', command='opencode debug config'),
            h('edit', filePath='.opencode/agent/revisor.md'),
            h('bash', command="como-dev 'opencode debug agent revisor'"),
            h('skill', name='customize-opencode')], solicitudes=[{}, {}])
        p = clasificar_proceso(r, ESPEC['M-6'])
        self.assertEqual(p['lecturas_config'][0]['clasificacion'], 'config')
        self.assertEqual(p['lecturas_config'][1]['clasificacion'], 'indeterminada')
        self.assertEqual(p['capas_editadas'][0]['capa'], 'agente markdown')
        self.assertEqual(p['capa_correcta'], ['agente markdown'])
        self.assertEqual(p['verificacion_final'], 'declarativa')
        self.assertEqual(p['solicitudes'], 2)
        r['herramientas'].append(h('edit', filePath='opencode.json'))
        self.assertEqual(clasificar_proceso(r, ESPEC['M-6'])['verificacion_final'], 'ninguna')
        r['herramientas'].append(h('bash', command='echo rige opencode debug agent build'))
        self.assertEqual(clasificar_proceso(r, ESPEC['M-6'])['verificacion_final'], 'ninguna')
        r['herramientas'].append(h('bash', command="como-dev 'rige evaluar'"))
        self.assertEqual(clasificar_proceso(r, ESPEC['M-6'])['verificacion_final'], 'rige')

    def test_P_7_umbral_dos_de_tres_y_sensibilidad(self):
        rs = [dict(fila('M-1'), repeticion=i, exito_declarado_falso=i == 1, resultado='sin_efecto') for i in (1, 2, 3)]
        t = analisis.tabla(rs, 'ecologica')['M-1']
        self.assertEqual(t['fraccion'], '1/3')
        self.assertFalse(t['con_problema'])
        self.assertTrue(t['con_problema_1_de_3'])
        rs[1]['exito_declarado_falso'] = True
        self.assertTrue(analisis.tabla(rs, 'ecologica')['M-1']['con_problema'])

    def test_P_8_estratos_familias_proceso_y_costos_por_resultado(self):
        rs = [dict(fila(c), resultado=res, exito_declarado_falso=c.startswith('M-'),
                   consecuencia=['exposicion'], solicitudes=[{}], proceso={'verificacion_final': 'declarativa'})
              for c, res in [('C-1', 'correcta'), ('M-1', 'sin_efecto'), ('M-2', 'sin_efecto'), ('S-1', 'correcta')]]
        e = analisis.por_estrato(rs, analisis.tabla(rs, 'ecologica'))
        self.assertEqual(e['E2']['cantidad_con_problema'], 2)
        self.assertEqual(e['E2']['familias_con_problema'], ['ruta_absoluta'])
        self.assertEqual(e['E1']['consumo_por_resultado']['correcta']['mediana_solicitudes'], 1)
        fin = [dict(r, resultado='correcta', tokens_entrada=10) for r in rs]
        comparadas = analisis.comparar_resultados(rs, fin)
        self.assertEqual(comparadas['E1']['correcta']['LB']['n'], 1)
        self.assertEqual(comparadas['E2']['correcta']['LB']['n'], 0)

    def test_P_9_solo_siembra_admitidas_y_control_correcto(self):
        m = generador.cargar(ROOT / 'ecologica/corpus.py', 'corpus_med12')
        self.assertEqual(m.derivar(ESPEC), m.E)
        a = dict(tareas={'N-23': dict(resultado='admitida'), 'N-22': dict(resultado='no_admitida')})
        d = m.derivar(ESPEC, a)
        nuevas = {k: v for k, v in d.items() if k not in m.E}
        self.assertEqual(len(nuevas), 2)
        self.assertEqual({v['items'][0]['efecto'] for v in nuevas.values()}, {False, True})
        for k, v in nuevas.items():
            variante = 'correcta' if k.endswith('-C') else 'ingenua_absoluta'
            self.assertEqual(v['archivos'], {**ESPEC['N-23']['archivos'], **ESPEC['N-23']['variantes'][variante]})

    def test_P_10_generacion_abierta_k3_sin_tope(self):
        publico, respuestas, _ = generador.generar(ROOT / 'ecologica')
        self.assertEqual(respuestas['adr'], 'ADR-098')
        self.assertEqual(respuestas['k'], 3)
        self.assertFalse(respuestas['hoja_cerrada'])
        self.assertEqual(respuestas['estado'], 'abierto hasta la admisión nativa')
        self.assertNotIn('variantes', json.dumps(publico))
        manifiesto = json.loads((ROOT / 'ecologica/exploracion.json').read_text(encoding='utf-8'))
        self.assertIn('N-8', manifiesto['retiradas'])
        self.assertNotIn('tope_candidatos', manifiesto)

    def test_P_11_admision_base_correcta_obvia_y_errores_no_admitidos(self):
        m = generador.cargar(ROOT / 'verificacion/20261019-admision/evaluar_eco.py', 'admision_med12')
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'captura.json').write_text(json.dumps(dict(casos=['C-1'], hash_espec=hashlib.sha256((ROOT / 'ecologica/espec.py').read_bytes()).hexdigest())))
            t = ESPEC['C-1']
            for variante in ('base', 'correcta', 'obvia'):
                d = root / 'C-1' / variante
                d.mkdir(parents=True)
                a, b = captura('C-1', 'base'), captura('C-1', variante)
                for ag, datos in b.items():
                    (d / f'agente-{ag}.json').write_text(json.dumps(datos))
                (d / 'oraculo.json').write_text(json.dumps(oraculo_fixture(t, a, b)['despues']))
            datos = m.evaluar(ESPEC, root)
            self.assertEqual(datos['tareas']['C-1']['resultado'], 'admitida')
            self.assertEqual(set(datos['tareas']['C-1']['variantes']), {'base', 'correcta', 'obvia'})
            (root / 'C-1/obvia/oraculo.json').unlink()
            datos = m.evaluar(ESPEC, root)
            self.assertEqual(datos['tareas']['C-1']['resultado'], 'no_admitida')
            self.assertIn('obvia', datos['tareas']['C-1']['motivo'])

    def test_admision_completa_nuevas_con_procesos_sustituidos(self):
        m = generador.cargar(ROOT / 'verificacion/20261019-admision/capturar_eco.py', 'captura_med12_fixture')
        evaluador = generador.cargar(ROOT / 'verificacion/20261019-admision/evaluar_eco.py', 'eval_med12_fixture')
        def capturar(prefijo, momento, agentes, directorio):
            tid, variante = prefijo.parent.parent.name, prefijo.parent.name
            datos = captura(tid, variante)
            carpeta = Path(str(prefijo) + '.' + momento)
            carpeta.mkdir()
            base = captura('M-5', 'base')['build']
            for ag in agentes:
                (carpeta / f'agente-{ag}.json').write_text(json.dumps(datos.get(ag, base)))
            for archivo, key in [('archivos.json', '__archivos__'), ('config.json', '__config__')]:
                (carpeta / archivo).write_text(json.dumps(datos.get(key, {})))
            return carpeta
        def oraculo(prefijo, momento, sondas, directorio, h):
            tid, variante = prefijo.parent.parent.name, prefijo.parent.name
            datos = captura(tid, variante)
            base = captura('M-5', 'base')['build']
            return {eco.clave(s): dict(decision=eco.decidir(datos.get(s[0], base)['permission'], eco.permiso_sonda(s), s[2])) for s in sondas}
        def sistema(carpeta, directorio):
            (carpeta / 'sistema.json').write_text(json.dumps(dict(instruccion_espanol=carpeta.name == 'correcta')))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'salida'
            with patch.object(m.sys, 'argv', ['capturar', '--salida', str(root)]), patch.object(m.os, 'chdir'), \
                 patch.dict(m.os.environ), patch.object(m.arnes, 'preparar'), patch.object(m.arnes, 'capturar', capturar), \
                 patch.object(m.arnes, 'oraculo', oraculo), patch.object(m.arnes, 'capturar_sistema', sistema), patch('builtins.print'):
                self.assertEqual(m.main(), 0)
            r = evaluador.evaluar(ESPEC, root)
            self.assertEqual(set(r['tareas']), {*NUEVAS, 'N-10'})
            # ADR-098, punto 6: la correcta define la referencia de batería.
            # Este fixture no reincorpora N-20 al banco cerrado.
            self.assertTrue(r['valido'])
            self.assertFalse(r['tareas']['N-20']['variantes']['correcta']['colateral_bateria'])
            self.assertEqual(r['tareas']['V-10']['variantes']['correcta']['estado_despues']['objetivo'], 'med12-ficticio')


if __name__ == '__main__':
    unittest.main()
