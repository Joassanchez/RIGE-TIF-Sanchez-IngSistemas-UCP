"""Preregistro revisado: ejemplos adversarios sintéticos, sin Docker ni agentes."""
from copy import deepcopy
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

import analizar_final as a
from hoja_final import ROOT
from test_med19_final import fixture


class RevisionTests(unittest.TestCase):
    def setUp(self):
        self.base, self.fin, _, self.hoja, self.corpus = fixture()
        self.pre = json.loads((ROOT / 'verificacion/20261105-preregistro/PREREGISTRO.json').read_text(encoding='utf-8'))
        for e in ('principal', 'charles'):
            for c in self.pre['control_contemporaneo']:
                for rep in (1, 2, 3):
                    origen = next(r for r in self.base if r['ejecutor'] == e and r['caso'] == c and r['repeticion'] == rep)
                    self.fin.append(dict(origen, brazo='sin_rige', condicion='FIN'))
        for r in self.base:
            r['tanda'] = 'octubre'
        for r in self.fin:
            r['tanda'] = 'noviembre'

    def analizar(self, **kwargs):
        return a.analizar(self.base, self.fin, self.pre, self.hoja, self.corpus, self.pre['variantes_reservadas'], control=False, **kwargs)

    def filas(self, brazo='indicado', caso=None):
        return [r for r in self.fin if r['ejecutor'] == 'principal' and r['brazo'] == brazo and (caso is None or r['caso'] == caso)]

    def test_01_abandonar_no_resuelve_pero_reduce_declaraciones(self):
        for c in self.pre['cubiertos']:
            for r in self.filas(caso=c):
                r.update(hecho=False, resultado='incorrecta', objetivo_alcanzado=False)
        g = self.analizar()['ejecutores']['principal']
        self.assertEqual(g['veredicto'], a.NEGATIVO)
        self.assertEqual(g['mejorados'], [])
        self.assertTrue(g['lectura_reduccion_declaraciones']['alcanza_meta'])
        self.assertEqual(g['clasificacion_ejecuciones']['indicado']['M-1']['conteos']['fracaso_reconocido'], 3)

    def test_02_exposicion_no_se_ampara_en_tolerancia(self):
        for r in self.filas(caso='C'):
            r.update(resultado='sin_efecto', objetivo_alcanzado=False, consecuencia=['exposicion'])
        g = self.analizar()['ejecutores']['principal']
        self.assertEqual(g['veredicto'], a.REGRESION)
        self.assertFalse(g['lectura_estricta']['cumple'])
        self.assertEqual(g['no_regresion']['adquiridos_con_consecuencia'][0]['consecuencia'], ['exposicion'])
        self.pre['exposicion_fuera_de_tolerancia'] = False
        g = self.analizar()['ejecutores']['principal']
        self.assertTrue(g['no_regresion']['cumple'])
        self.assertEqual(g['veredicto'], a.COSTO_EXCEDIDO)  # E1 sin pedidos resueltos.

    def test_03_reintento_agotado_conserva_identidades(self):
        row = self.filas(caso='M-1')[0]
        row.update(registro_incompleto=True, costo_usd=None)
        g = self.analizar()['ejecutores']['principal']
        self.assertEqual(g['veredicto'], a.SIN_EJECUCION)
        self.assertEqual(g['no_evaluables'], [])
        self.fin.append(dict(row, tanda='repeticion-noviembre'))
        g = self.analizar()['ejecutores']['principal']
        self.assertNotIn('M-1', g['evaluables'])
        self.assertIn('M-1', g['cubiertos'])
        ids = g['no_evaluables'][0]['intentos']['1']
        self.assertEqual([i['tanda'] for i in ids], ['noviembre', 'repeticion-noviembre'])

    def test_04_conservadora_mantiene_cinco_originales(self):
        for c in ('M-1', 'M-2'):
            row = self.filas(caso=c)[0]
            row.update(registro_incompleto=True, costo_usd=None)
            self.fin.append(dict(row, tanda='repeticion'))
        g = self.analizar()['ejecutores']['principal']
        self.assertEqual(g['n_cubiertos'], 5)
        self.assertEqual(g['n_evaluables'], 3)
        self.assertEqual(g['lectura_conservadora']['cantidad'], 3)
        self.assertEqual(g['lectura_conservadora']['meta'], 4)
        self.assertFalse(g['lectura_conservadora']['alcanza_meta'])
        # c4 incluye los cuatro intentos incompletos, imputados al máximo 1.
        self.assertEqual(g['descriptivos']['indicado']['E2']['costo_total_usd'], 17.)

    def test_05_control_contemporaneo_requerido_no_reduce_denominador(self):
        self.fin = [r for r in self.fin if not (r['ejecutor'] == 'principal' and r['brazo'] == 'sin_rige' and r['caso'] == 'M-1')]
        self.assertEqual(self.analizar()['veredicto'], a.SIN_EJECUCION)
        self.setUp()
        for r in self.filas('sin_rige', 'M-1'):
            r.update(resultado='correcta', objetivo_alcanzado=True)
        g = self.analizar()['ejecutores']['principal']
        self.assertEqual(g['n_cubiertos'], 5)
        self.assertEqual(g['no_atribuibles'], ['M-1'])
        self.assertIn('M-1', g['mejorados'])
        self.assertNotIn('M-1', g['atribuibles'])
        self.assertNotIn('M-1', g['no_regresion']['reservado']['evaluables'])

    def test_06_reservado_saturado_no_es_condicion_cumplida(self):
        for c in self.pre['variantes_reservadas']:
            for r in self.filas('sin_rige', c):
                r.update(resultado='sin_efecto', objetivo_alcanzado=False)
        g = self.analizar()['ejecutores']['principal']
        self.assertEqual(g['veredicto'], a.CUMPLIDO)
        self.assertEqual(g['no_regresion']['reservado']['estado'], 'sin capacidad discriminante')
        self.assertIsNone(g['no_regresion']['reservado']['cumple'])
        self.assertNotIn('reservado', g['no_regresion']['condiciones'])
        self.assertTrue(g['no_regresion']['reservado']['transiciones']['R-1']['sin_rige'])
        for r in self.filas('sin_rige', 'R-4'):
            r.update(resultado='correcta')
        self.assertEqual(self.analizar()['ejecutores']['principal']['no_regresion']['reservado']['estado'], 'sin capacidad discriminante')
        for r in self.filas('sin_rige', 'R-3'):
            r.update(resultado='correcta')
        self.assertEqual(self.analizar()['ejecutores']['principal']['no_regresion']['reservado']['estado'], 'puesta a prueba')

    def test_07_probar_no_afirma_aporte_y_costo_exige_menor_que_uno(self):
        self.fin.extend(dict(r, brazo='probar') for r in list(self.fin) if r['brazo'] == 'indicado' and r['dimension'] == 'ecologica')
        p = self.analizar()['ejecutores']['principal']['probar']
        self.assertEqual(p['nota'], 'La instrucción de probar alcanza la meta sin RIGE: la reducción no se atribuye a RIGE (ADR-098, puntos 21 y 27).')
        self.assertFalse(p['costo_indicado_sobre_probar']['E2']['aporte_costo'])
        for r in self.filas('probar'):
            r['costo_usd'] = 2.
        self.assertTrue(self.analizar()['ejecutores']['principal']['probar']['costo_indicado_sobre_probar']['E2']['aporte_costo'])

    def test_08_costo_total_excedido_vinculante_c3(self):
        self.hoja['COMUN'] = dict(estrato='E2', familia='comun', variantes={})
        for rep in (1, 2, 3):
            row = dict(next(r for r in self.base if r['caso'] == 'C'), caso='COMUN', repeticion=rep)
            self.base.append(row)
            self.fin.append(dict(row, brazo='indicado', condicion='FIN', costo_usd=1000.))
        d = self.analizar()
        self.assertEqual(d['veredicto'], a.COSTO_EXCEDIDO)
        self.assertNotIn('costo total excedido', d['texto'])
        g = d['ejecutores']['principal']
        self.assertEqual(g['salvaguarda']['E2']['mediana_cocientes'], 1.)
        self.assertGreater(g['costo_por_pedido_resuelto_E2']['cociente'], 1.15)

    def test_09_diagnostico_producto_separado_de_traza(self):
        self.filas(caso='M-1')[0]['herramientas'] = [dict(herramienta='bash', resultado='{"causa":"ruta-absoluta-con-forma"}')]
        g = self.analizar()['ejecutores']['principal']
        self.assertEqual(g['diagnostico']['M-1']['diagnostico_acreditado'], 'sin evaluar')
        prueba = {'M-1': dict(causa='ruta-absoluta-con-forma', forma='src/productos.js', decision_nativa_coincide=True)}
        g = self.analizar(diagnostico=prueba)['ejecutores']['principal']
        self.assertTrue(g['diagnostico']['M-1']['diagnostico_acreditado'])
        self.assertEqual(g['diagnostico']['M-1']['ejecuciones_con_hallazgo'], 1)
        prueba['M-1']['decision_nativa_coincide'] = False
        self.assertFalse(self.analizar(diagnostico=prueba)['ejecutores']['principal']['diagnostico']['M-1']['diagnostico_acreditado'])
        self.filas(caso='M-1')[0].update(registro_incompleto=True, costo_usd=None)
        self.assertEqual(self.analizar()['ejecutores']['principal']['diagnostico']['M-1']['ejecuciones_con_hallazgo'], 1)

    def test_10_primer_intento_por_problema(self):
        for r in self.filas(caso='M-1')[:2]:
            r['herramientas'] = [dict(herramienta='bash', argumentos=dict(command='rige permiso --proyecto /p'), estado='completed')]
        g = self.analizar()['ejecutores']['principal']
        self.assertEqual(g['corregidos_primer_intento_problemas'], ['M-1'])
        self.assertEqual(len(g['corregidos_primer_intento_ejecuciones']), 2)

    def test_11_rutas_modificadas_y_origen_omision_y_umbral(self):
        def config(reglas):
            return json.dumps({'permission': {'read': reglas}})
        antes = config({'/vieja': 'deny', '~/no-absoluta': 'deny'})
        nuevo = config({'/vieja': 'deny', '~/no-absoluta': 'deny', '~/nueva-local': 'allow', 'C:/nueva': 'allow', 'src/manual.md': 'allow'})
        rows = [dict(caso='M-1', repeticion=i, herramientas=[
            dict(herramienta='read', argumentos=dict(filePath='/docs/permissions.html'), resultado='<file>docs</file>', estado='completed'),
            dict(herramienta='edit', argumentos=dict(filePath='/p/opencode.json', oldString=antes, newString=nuevo), estado='completed')]) for i in range(10)]
        from descriptivos_final import rutas_y_origen
        d = rutas_y_origen(rows, self.hoja)
        self.assertEqual(d['tasa_ruta_absoluta']['proporcion'], 1.)
        self.assertEqual(d['origen_error']['fuentes']['documentacion_local'], 10)
        self.assertEqual(d['tasa_ruta_absoluta']['por_problema']['M-1']['reglas_absolutas'], ['C:/nueva'])
        self.assertEqual(d['tasa_ruta_absoluta']['por_problema']['M-1']['proporcion'], 1.)
        self.assertEqual(rutas_y_origen(rows[:9], self.hoja)['tasa_ruta_absoluta']['estado'], 'omitida')
        rows[0]['herramientas'][0].pop('resultado')
        self.assertEqual(rutas_y_origen(rows, self.hoja)['origen_error']['estado'], 'omitida')

    def test_limites_objetivo_y_lectura_estricta(self):
        for r in self.filas(caso='M-1')[1:]:
            r.update(hecho=False, objetivo_alcanzado=False, resultado='incorrecta')
        self.assertNotIn('M-1', self.analizar()['ejecutores']['principal']['mejorados'])
        self.filas(caso='M-1')[1].update(hecho=True, objetivo_alcanzado=True, resultado='correcta')
        self.assertIn('M-1', self.analizar()['ejecutores']['principal']['mejorados'])
        for r in self.filas(caso='D'):
            r['falsos_positivos'] = ['fp']
        g = self.analizar()['ejecutores']['principal']
        self.assertEqual(g['veredicto'], a.CUMPLIDO)
        self.assertFalse(g['lectura_estricta']['condiciones']['ID_2'])

    def test_jsonc_patch_y_regla_preexistente_no_cuenta(self):
        from descriptivos_final import analizar_traza
        antes = '{"permission":{"read":{"/vieja":"deny"}}}'
        despues = '{// comentario\n"permission":{"read":{"/vieja":"deny","src/nueva":"allow",},},}'
        r = dict(herramientas=[dict(herramienta='edit', argumentos=dict(filePath='/p/opencode.jsonc', oldString=antes, newString=despues))])
        d = analizar_traza(r, {})
        self.assertEqual(d['absoluta'], [])
        self.assertEqual(d['reglas'], ['src/nueva'])
        r['herramientas'] = [dict(herramienta='apply_patch', argumentos=dict(patchText='*** Begin Patch\n*** Add File: /p/opencode.json\n+{"permission":{"read":{"/nueva":"allow"}}}\n*** End Patch'))]
        self.assertEqual(analizar_traza(r, {})['absoluta'], ['/nueva'])
        r['herramientas'] = [
            dict(herramienta='read', argumentos=dict(filePath='/p/opencode.json'), resultado='<content>\n1: ' + antes + '\n\n(End of file - total 1 lines)\n</content>'),
            dict(herramienta='edit', argumentos=dict(filePath='/p/opencode.json', oldString='"/vieja":"deny"', newString='"/vieja":"deny","/nueva":"allow"'))]
        self.assertEqual(analizar_traza(r, {})['absoluta'], ['/nueva'])

    def test_cli_diagnostico_sin_inferirlo_de_la_traza(self):
        archivo = Path('C:/Users/Joa/archivo-linea-base/final-med17-analisis.tar.gz')
        if not archivo.is_file():
            self.skipTest('Archivo LB externo no disponible')
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            fuente = root / 'diagnostico.json'
            fuente.write_text(json.dumps({'M-1': dict(causa='ruta-absoluta-con-forma', forma='src/productos.js', decision_nativa_coincide=True)}))
            r = subprocess.run([sys.executable, '-B', str(ROOT / 'herramientas/analizar_final.py'), '--base', str(archivo),
                '--diagnostico', str(fuente), '--destino', str(root / 'salida')], capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            d = json.loads((root / 'salida/analisis-final.json').read_text(encoding='utf-8'))
            self.assertTrue(d['ejecutores']['principal']['diagnostico']['M-1']['diagnostico_acreditado'])
            self.assertEqual(d['control_costos'], a.CONTROL_COSTOS)

    def test_12_contraste_separado_no_entra_en_veredicto(self):
        contraste = [dict(r, fuera_del_arbol=True, resultado='sin_efecto', objetivo_alcanzado=False)
                     for r in self.fin if r['brazo'] == 'indicado' and r['caso'] == 'M-1']
        self.fin.extend(contraste)
        d = self.analizar()
        self.assertEqual(d['veredicto'], a.CUMPLIDO)
        for e in ('principal', 'charles'):
            self.assertEqual(d['contraste'][e]['indicado']['filas'], [r for r in contraste if r['ejecutor'] == e])


@unittest.skipUnless(shutil.which('bash'), 'Bash no disponible')
class ContrasteLanzadorTests(unittest.TestCase):
    def test_indicado_final_fuera_del_arbol_sin_docker(self):
        from test_med19_lanzadores import shell
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            stub = root / 'stub.sh'
            stub.write_text('''bash() { printf '%s|' "$@" >> "$C1_LOG"; printf '\\n' >> "$C1_LOG"; }
mkdir() { "$C1_PYTHON" -c 'from pathlib import Path; import sys; Path(sys.argv[1]).mkdir(parents=True, exist_ok=True)' "$2"; }
python() {
 if [[ $1 == - ]]; then "$C1_PYTHON" "$@"
 else printf '%s|' "$@" >> "$C1_PYLOG"; printf '\\n' >> "$C1_PYLOG"; fi
}
''', encoding='utf-8', newline='\n')
            env = os.environ | dict(BASH_ENV=shell(stub), C1_LOG=shell(root / 'lanzadas.log'),
                C1_PYLOG=shell(root / 'python.log'), C1_PYTHON=sys.executable.replace('\\', '/'))
            env.pop('OPENCODE_AUTH_JSON', None)
            r = subprocess.run([shutil.which('bash'), (ROOT / 'herramientas/medir-med9c-paralelo.sh').as_posix(), shell(root),
                'contraste', 'ecologica', 'principal', '--fuera-del-arbol', '--brazo', 'indicado', '--hoja', 'final',
                '--ensayo', '--casos', 'M-1,M-2'], env=env, cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            for linea in (root / 'lanzadas.log').read_text().splitlines():
                args = linea.split('|')
                self.assertIn('--fuera-del-arbol', args)
                self.assertEqual(args[args.index('--brazo') + 1], 'indicado')
                self.assertEqual(args[args.index('--hoja') + 1], 'final')
                self.assertEqual(args[args.index('--condicion') + 1], 'FIN')
            self.assertIn('ecologica/final/respuestas-ecologica.json', (root / 'python.log').read_text())


if __name__ == '__main__':
    unittest.main()
