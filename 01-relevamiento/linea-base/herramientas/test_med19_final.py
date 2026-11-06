"""MED-19: hoja, huellas y criterios; datos sintéticos salvo el control optativo LB."""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

import analizar_final as final
from hoja_final import ROOT, cargar, generar, huella
from verificar_base_ecologica import cargar_admisiones, referencia_correcta

BASE = cargar(ROOT / 'ecologica/espec.py').T
NUEVA = cargar(ROOT / 'ecologica/final/espec_final.py').T
HOJA = json.loads((ROOT / 'ecologica/final/respuestas-ecologica.json').read_text(encoding='utf-8'))


class HojaTests(unittest.TestCase):
    def test_solo_cambia_correcta_S3_M2(self):
        for c, t in BASE.items():
            antes, despues = deepcopy(t), deepcopy(NUEVA[c])
            if c in ('S-3', 'M-2'):
                self.assertNotEqual(antes['variantes']['correcta'], despues['variantes']['correcta'])
                del antes['variantes']['correcta'], despues['variantes']['correcta']
            self.assertEqual(antes, despues, c)
        # Esto incluye los archivos de base e ingenua_* de S-3, y N-1 íntegro.
        s3 = json.loads(NUEVA['S-3']['variantes']['correcta']['G/opencode.json'])
        self.assertEqual(s3['permission']['bash'], {'*': 'allow', 'npm test': 'ask', 'npm test *': 'ask'})
        m2 = json.loads(NUEVA['M-2']['variantes']['correcta']['P/opencode.json'])
        self.assertEqual(m2['agent']['build']['permission']['edit'], {'*': 'ask', 'src/index.js': 'allow'})

    def test_inmutables_y_generacion_idempotente(self):
        manifiesto = json.loads((ROOT / 'ecologica/exploracion.json').read_text(encoding='utf-8'))
        for campo in ('hashes_fuentes', 'hashes_generados'):
            for nombre, digest in manifiesto[campo].items():
                self.assertEqual(hashlib.sha256((ROOT / 'ecologica' / nombre).read_bytes()).hexdigest(), digest)
        for nombre in ('ecologica/exploracion.json', 'tarifas-congeladas-20261001.json', 'tarifas-congeladas-20261014-p3.json'):
            anterior = subprocess.check_output(['git', 'show', 'HEAD:01-relevamiento/linea-base/' + nombre], cwd=ROOT)
            self.assertEqual((ROOT / nombre).read_bytes().replace(b'\r\n', b'\n'), anterior.replace(b'\r\n', b'\n'))
        # exploracion.json no incluye tarifas: fijar también sus bytes locales de entrada.
        for nombre, digest in {
            'tarifas-congeladas-20261001.json': 'b6fd5635a653ba84f9c07058054e4b00bb52ad377131571398f232a974394515',
            'tarifas-congeladas-20261014-p3.json': '5af5805f2a937cd9300527a928067e9486a986fd7fe57b07b355f959894e933b',
        }.items():
            self.assertEqual(hashlib.sha256((ROOT / nombre).read_bytes()).hexdigest(), digest)
        with tempfile.TemporaryDirectory() as tmp:
            destino = Path(tmp) / 'final'
            generar(destino)
            antes = {p.name: p.read_bytes() for p in destino.iterdir()}
            generar(destino)
            self.assertEqual(antes, {p.name: p.read_bytes() for p in destino.iterdir()})
            for nombre in ('escenarios.json', 'respuestas-ecologica.json', 'respuestas-deteccion.json', 'tareas.md', 'deteccion.md'):
                actual = (ROOT / 'ecologica/final' / nombre).read_bytes()
                if HOJA.get('hoja_cerrada') and nombre == 'respuestas-ecologica.json':
                    abierta, cerrada = json.loads(antes[nombre]), json.loads(actual)
                    for campo in ('hoja_cerrada', 'estado', 'fecha_cierre', 'admisiones'):
                        abierta.pop(campo, None)
                        cerrada.pop(campo, None)
                    self.assertEqual(abierta, cerrada)
                elif HOJA.get('hoja_cerrada') and nombre == 'tareas.md':
                    # Solo cambia el encabezado de estado al cerrar; pedidos intactos.
                    for contenido in (antes[nombre], actual):
                        self.assertEqual(sum(l.startswith(b'- **Estado:') for l in contenido.splitlines()), 1)
                    self.assertEqual([l for l in antes[nombre].splitlines() if not l.startswith(b'- **Estado:')],
                                     [l for l in actual.splitlines() if not l.startswith(b'- **Estado:')])
                else:
                    self.assertEqual(antes[nombre], actual)
            final = ROOT / 'ecologica/final'
            manifiesto_final = json.loads((final / 'manifiesto.json').read_bytes())
            for nombre, digest in manifiesto_final['hashes_generados'].items():
                self.assertEqual(hashlib.sha256((final / nombre).read_bytes()).hexdigest(), digest)
            self.assertEqual(antes['respuestas-deteccion.json'], (ROOT / 'ecologica/respuestas-deteccion.json').read_bytes())
        with self.assertRaises(ValueError):
            generar(ROOT / 'ecologica')

    def test_reservadas_publicas_y_archivos_nuevos(self):
        publico = json.loads((ROOT / 'ecologica/final/escenarios.json').read_text(encoding='utf-8'))['dimensiones']
        viejo = json.loads((ROOT / 'ecologica/escenarios.json').read_text(encoding='utf-8'))['dimensiones']
        self.assertEqual(publico['deteccion'], viejo['deteccion'])
        for c in viejo['ecologica']:
            self.assertEqual(publico['ecologica'][c], viejo['ecologica'][c])
        reservadas = {f'R-{n}' for n in range(1, 5)}
        self.assertEqual(set(publico['ecologica']) - set(viejo['ecologica']), reservadas)
        arbol = ROOT.parents[1] / 'src/pruebas/escenarios'
        textos = '\n'.join(p.read_text(encoding='utf-8', errors='replace') for p in arbol.rglob('*') if p.is_file())
        nombres = {p.name for p in arbol.rglob('*') if p.is_file()}
        for c in reservadas:
            self.assertNotIn('absolut', publico['ecologica'][c]['instruccion'].lower())
            for rel in NUEVA[c]['archivos']:
                if rel != 'P/opencode.json':
                    self.assertNotIn(rel[2:], textos)
                    self.assertNotIn(Path(rel).name, nombres)
        for p in (ROOT / 'ecologica/final/instrucciones').glob('*.txt'):
            for prohibida in ('absolut', 'relativa', 'ruta del árbol'):
                self.assertNotIn(prohibida, p.read_text(encoding='utf-8').lower())


class AdmisionesTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def raiz(self, nombre, casos, nueva=False, decision='allow'):
        root = self.root / nombre
        for c in casos:
            p = root / c / 'correcta/oraculo.json'
            p.parent.mkdir(parents=True)
            p.write_text(json.dumps({'sonda': {'decision': decision}}), encoding='utf-8')
        datos = dict(adr='ADR-098', hash_espec=hashlib.sha256((ROOT / ('ecologica/final/espec_final.py' if nueva else 'ecologica/espec.py')).read_bytes()).hexdigest(),
            tareas={c: dict(resultado='admitida', captura_completa=True) for c in casos},
            filas=[dict(tarea=c, variante='correcta', resultado='correcta') for c in casos],
            hashes_evidencia={p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*.json')})
        if nueva:
            datos['huellas_tareas'] = {c: huella(NUEVA[c]) for c in casos}
        (root / 'admision.json').write_text(json.dumps(datos), encoding='utf-8')
        return root

    def test_herencia_por_tarea_y_referencias_corregidas(self):
        vieja = self.raiz('vieja', ['S-3', 'M-2', 'M-1'])
        nueva = self.raiz('nueva', ['S-3', 'M-2', 'R-1'], True)
        indice, _ = cargar_admisiones([vieja, nueva], HOJA)
        self.assertEqual(indice['M-1'][0], vieja.resolve())
        for c in ('S-3', 'M-2', 'R-1'):
            self.assertEqual(indice[c][0], nueva.resolve())
            referencia_correcta(indice, c)
        indice, _ = cargar_admisiones([vieja], HOJA)
        with self.assertRaises(ValueError):
            referencia_correcta(indice, 'M-2')

    def test_rechaza_alteracion_incluso_tarea_no_heredable(self):
        vieja = self.raiz('vieja', ['M-2', 'M-1'])
        (vieja / 'M-2/correcta/oraculo.json').write_text('{}')
        with self.assertRaisesRegex(ValueError, 'alterada'):
            cargar_admisiones([vieja], HOJA)

    def test_ambiguedad_y_huellas_obligatorias(self):
        a = self.raiz('a', ['R-1'], True)
        b = self.raiz('b', ['R-1'], True)
        self.assertIn('R-1', cargar_admisiones([a, b], HOJA)[0])
        c = self.raiz('c', ['R-1'], True, 'deny')
        with self.assertRaisesRegex(ValueError, 'contradictorias'):
            cargar_admisiones([a, c], HOJA)
        path = a / 'admision.json'
        dato = json.loads(path.read_text())
        dato.pop('huellas_tareas')
        path.write_text(json.dumps(dato))
        with self.assertRaisesRegex(ValueError, 'huellas'):
            cargar_admisiones([a], HOJA)

    def test_cierre_solo_final_no_reabre_ni_toca_cerrada(self):
        raiz = self.raiz('nativa-sintetica', list(HOJA['casos']), True)
        destino = self.root / 'hoja'
        cerrados = {p: p.read_bytes() for p in (ROOT / 'ecologica').glob('*') if p.is_file()}
        generar(destino, [raiz], '05/11/2026')
        self.assertTrue(json.loads((destino / 'manifiesto.json').read_text())['hoja_cerrada'])
        generar(destino, [raiz], '05/11/2026')
        with self.assertRaisesRegex(ValueError, 'cerrada'):
            generar(destino)
        with self.assertRaisesRegex(ValueError, 'cerrada'):
            generar(destino, [raiz], '06/11/2026')
        self.assertEqual(cerrados, {p: p.read_bytes() for p in cerrados})


def fixture():
    prereg = json.loads((ROOT / 'verificacion/20261105-preregistro/PREREGISTRO.json').read_text(encoding='utf-8'))
    # Los ejemplos de MED-19 conservan su lectura original; MED-19-c1 ejercita
    # las banderas nuevas y el control contemporáneo del preregistro revisado.
    prereg.update(mejorado_exige_objetivo_logrado=False, exposicion_fuera_de_tolerancia=False, control_contemporaneo=[])
    hoja = {c: {'estrato': 'E2', 'familia': 'f', 'variantes': {}} for c in prereg['cubiertos']}
    hoja['C'] = dict(estrato='E1', familia='control', variantes={})
    for c in prereg['variantes_reservadas']:
        hoja[c] = dict(estrato='R', familia='r', variantes={})
    corpus = {'D': {'items': [{'id': 'd1', 'efecto': False}, {'id': 'd2', 'efecto': False}]}}
    base, finales = [], []
    def agregar(destino, ejecutor, b, d, c, falla=False):
        # Dos fallas sostienen el problema por mayoría; la tercera resolución
        # deja definido el costo por pedido resuelto de la línea de base (c3).
        for rep in (1, 2, 3):
            destino.append(dict(ejecutor=ejecutor, brazo=b, condicion='LB' if b == 'LB' else 'FIN', modelo='openai/gpt-6.1-sol',
                caso=c, dimension=d, repeticion=rep, k=3, costo_usd=1., hecho=True,
                resultado='sin_efecto' if falla and rep <= 2 else 'correcta', objetivo_alcanzado=not (falla and rep <= 2),
                solicitudes=[], herramientas=[], detectados=['d1', 'd2'], falsos_positivos=[]))
    for e in ('principal', 'charles'):
        for c in hoja:
            if hoja[c]['estrato'] == 'R':
                for b in ('sin_rige', 'indicado'):
                    agregar(finales, e, b, 'ecologica', c)
            else:
                agregar(base, e, 'LB', 'ecologica', c, c != 'C')
                agregar(finales, e, 'indicado', 'ecologica', c)
        agregar(base, e, 'LB', 'deteccion', 'D')
        agregar(finales, e, 'indicado', 'deteccion', 'D')
    return base, finales, prereg, hoja, corpus


class AnalisisTests(unittest.TestCase):
    def setUp(self):
        self.base, self.fin, self.pre, self.hoja, self.corpus = fixture()

    def analizar(self):
        return final.analizar(self.base, self.fin, self.pre, self.hoja, self.corpus, self.pre['variantes_reservadas'], control=False)

    def cambiar(self, casos, **valores):
        for r in self.fin:
            if r['ejecutor'] == 'principal' and r['brazo'] == 'indicado' and r['caso'] in casos:
                r.update(valores)

    def test_1_faltan_tandas(self):
        self.fin = []
        self.assertEqual(self.analizar()['veredicto'], final.SIN_EJECUCION)

    def test_2_respaldo_y_deteccion(self):
        self.pre['cubiertos'] = self.pre['cubiertos'][:2]
        datos = self.analizar()
        self.assertEqual(datos['veredicto'], final.RESPALDO)
        self.assertIn('hallazgo negativo', datos['ejecutores']['principal']['detalle_respaldo'])
        self.base[0]['falsos_positivos'] = ['fp']  # No afecta detección.
        for r in self.base:
            if r['dimension'] == 'deteccion':
                r['falsos_positivos'] = ['fp']
        self.assertIn('sin criterio nuevo', self.analizar()['ejecutores']['principal']['detalle_respaldo'])

    def test_3_meta_no_alcanzada(self):
        self.cambiar(self.pre['cubiertos'][:2], resultado='sin_efecto')
        self.assertEqual(self.analizar()['veredicto'], final.NEGATIVO)

    def test_4_regresion(self):
        self.pre['tolerancias']['principal']['adquisicion_problemas'] = 0
        self.cambiar(['C'], resultado='sin_efecto')
        self.assertEqual(self.analizar()['veredicto'], final.REGRESION)

    def test_5_costo_excedido(self):
        self.cambiar(self.pre['cubiertos'], costo_usd=1.150001)
        self.assertEqual(self.analizar()['veredicto'], final.COSTO_EXCEDIDO)

    def test_6_meta_justa_4_de_5_limites_justos_y_replica(self):
        self.cambiar([self.pre['cubiertos'][0]], resultado='sin_efecto')
        self.cambiar(self.pre['cubiertos'], costo_usd=1.15)
        self.cambiar(['C'], resultado='sin_efecto', costo_usd=1.10)
        self.cambiar(['D'], falsos_positivos=['a', 'b', 'c'])  # 9 exactos.
        self.cambiar(['R-1'], resultado='sin_efecto')  # Diferencia 1 exacta.
        datos = self.analizar()
        self.assertEqual(datos['veredicto'], final.COSTO_EXCEDIDO)
        self.assertEqual(datos['replica'], 'no replicado')
        g = datos['ejecutores']['principal']
        self.assertTrue(g['no_regresion']['cumple'])
        self.assertTrue(g['salvaguarda']['E2']['cumple_mediana'])
        self.assertIsNone(g['costo_por_pedido_resuelto']['E1']['indicado'])
        self.assertEqual(g['meta'], 4)
        self.assertEqual(len(g['mejorados']), 4)
        self.assertEqual(g['salvaguarda']['E2']['mediana_cocientes'], 1.15)
        self.assertEqual(g['no_regresion']['deteccion']['indicado']['falsos_positivos'], 9)

    def test_replica_no_cambia_veredicto(self):
        for r in self.fin:
            if r['ejecutor'] == 'charles' and r['dimension'] == 'ecologica':
                r['resultado'] = 'sin_efecto'
        datos = self.analizar()
        self.assertEqual(datos['veredicto'], final.CUMPLIDO)
        self.assertEqual(datos['replica'], 'no replicado')
        self.fin = [r for r in self.fin if r['ejecutor'] != 'charles']
        self.assertEqual(self.analizar()['replica'], 'sin réplica')

    def test_revision_replica_compara_ambos_veredictos(self):
        for r in self.fin:
            if r['brazo'] == 'indicado' and r['caso'] in self.pre['cubiertos']:
                r['resultado'] = 'sin_efecto'
        datos = self.analizar()
        self.assertEqual(datos['veredicto'], final.NEGATIVO)
        self.assertEqual(datos['ejecutores']['charles']['veredicto'], final.NEGATIVO)
        self.assertEqual(datos['replica'], 'replicado')
        # Charles cumple, pero build no: tampoco es una réplica.
        for r in self.fin:
            if r['ejecutor'] == 'charles' and r['caso'] in self.pre['cubiertos']:
                r['resultado'] = 'correcta'
        self.assertEqual(self.analizar()['replica'], 'no replicado')
        # Conservar toda la ejecución y dejar solo dos cubiertos evaluables en Charles.
        for r in self.fin:
            if r['ejecutor'] == 'charles' and r['caso'] in self.pre['cubiertos'][2:]:
                r.update(registro_incompleto=True, costo_usd=1.)
        self.fin.extend(dict(r, tanda='repeticion-incompleta') for r in list(self.fin) if r.get('registro_incompleto'))
        datos = self.analizar()
        self.assertEqual(datos['ejecutores']['charles']['veredicto'], final.SIN_REGISTROS)
        self.assertEqual(datos['replica'], 'réplica no evaluable')
        self.pre['cubiertos'] = self.pre['cubiertos'][:2]
        datos = self.analizar()
        self.assertEqual(datos['veredicto'], final.RESPALDO)
        self.assertEqual(datos['replica'], 'réplica no evaluable')

    def test_revision_incompleta_sin_costo_repetida_o_no_evaluable(self):
        c = self.pre['cubiertos'][0]
        original = next(r for r in self.fin if r['ejecutor'] == 'principal' and r['caso'] == c)
        repeticion = deepcopy(original)
        original.update(registro_incompleto=True, costo_usd=None,
                        tokens_entrada=None, tokens_cache=None, tokens_salida=None)
        self.assertIsNone(final.costo(original))
        self.assertIsNone(final.costo(dict(original, costo_usd=999.)))
        # E/S JSONL como la de un registro corregido, no solo un costo aislado.
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'corregido.jsonl'
            path.write_text(''.join(json.dumps(r) + '\n' for r in [*self.fin, repeticion]), encoding='utf-8')
            filas = final.leer_jsonl(path)
            datos = final.analizar(self.base, filas, self.pre, self.hoja, self.corpus,
                                   self.pre['variantes_reservadas'], control=False)
            final.escribir_json(Path(tmp) / 'analisis-final.json', datos)
            datos = json.loads((Path(tmp) / 'analisis-final.json').read_text(encoding='utf-8'))
            g = datos['ejecutores']['principal']
            self.assertIn(c, g['cubiertos'])
            self.assertFalse(g['no_evaluables'])
            self.assertEqual(g['descriptivos']['indicado']['E2']['costo_todos_los_pedidos_usd'], 16.)
            self.assertEqual(g['descriptivos']['indicado']['E2']['ejecuciones'], 15)
            self.assertEqual(g['registros_incompletos'][0]['fila'], original)
            self.assertTrue(g['registros_incompletos'][0]['reemplazada'])
            pendientes = final.leer_jsonl(path)[:-1]
            pendientes.append(dict(original, tanda='repeticion-incompleta'))
            datos = final.analizar(self.base, pendientes, self.pre, self.hoja, self.corpus,
                                   self.pre['variantes_reservadas'], control=False)
            g = datos['ejecutores']['principal']
            self.assertNotIn(c, g['T'])
            self.assertNotIn(c, g['evaluables'])
            self.assertIn(c, g['cubiertos'])
            self.assertEqual(g['no_evaluables'][0]['caso'], c)
            self.assertEqual(g['descriptivos']['indicado']['E2']['costo_todos_los_pedidos_usd'], 16.)
            self.assertFalse(g['registros_incompletos'][0]['reemplazada'])

    def test_no_evaluable_sale_de_T_y_evaluables_conserva_cubiertos(self):
        c = self.pre['cubiertos'][0]
        row = next(r for r in self.fin if r['ejecutor'] == 'principal' and r['caso'] == c)
        valida = deepcopy(row)
        row['registro_incompleto'] = True
        self.fin.append(dict(row, tanda='repeticion-incompleta'))
        g = self.analizar()['ejecutores']['principal']
        self.assertNotIn(c, g['T'])
        self.assertNotIn(c, g['evaluables'])
        self.assertIn(c, g['cubiertos'])
        self.assertTrue(g['no_evaluables'])
        self.fin.append(valida)
        self.assertIn(c, self.analizar()['ejecutores']['principal']['evaluables'])

    def test_id1_y_reservado_no_puesto_a_prueba(self):
        self.cambiar(['D'], detectados=['d1'])
        self.assertEqual(self.analizar()['veredicto'], final.REGRESION)
        self.pre['variantes_reservadas'] = ['R-1', 'R-2']
        g = self.analizar()['ejecutores']['principal']['no_regresion']
        self.assertEqual(g['reservado']['estado'], 'no puesta a prueba')
        self.assertNotIn('reservado', g['condiciones'])

    def test_incompletas_R_y_deteccion_dejan_prioridad_1_pendiente(self):
        for caso in ('R-1', 'D'):
            base, finales, pre, hoja, corpus = fixture()
            row = next(r for r in finales if r['ejecutor'] == 'principal' and r['caso'] == caso)
            row['registro_incompleto'] = True
            datos = final.analizar(base, finales, pre, hoja, corpus, pre['variantes_reservadas'], control=False)
            self.assertEqual(datos['veredicto'], final.SIN_EJECUCION)
            if caso == 'R-1':
                reservado = datos['ejecutores']['principal']['no_regresion']['reservado']
                self.assertEqual(len(reservado['admitidas']), 4)
                self.assertEqual(reservado['estado'], 'sin evaluar por falta de ejecución')

    def test_costo_desconocido_error_y_no_suma_anidadas(self):
        row = self.fin[0]
        row['solicitudes'] = [{'tokens_entrada': 1}]
        row['solicitudes_anidadas'] = [{'tokens_entrada': 9000000}]
        self.assertEqual(final.costo(row), 1.)
        for valor in (None, '1', True, float('nan')):
            row['costo_usd'] = valor
            with self.assertRaises(ValueError):
                self.analizar()

    def test_productividad_cuenta_costo_de_fallidas_y_probar(self):
        self.cambiar([self.pre['cubiertos'][0]], resultado='sin_efecto', objetivo_alcanzado=False)
        g = self.analizar()['ejecutores']['principal']
        d = g['descriptivos']['indicado']['E2']
        self.assertEqual(d['costo_todos_los_pedidos_usd'], 15)
        self.assertEqual(d['productividad'], 12 / 15)
        self.assertIn('principal amenaza', g['probar']['nota'])
        probar = [dict(r, brazo='probar') for r in self.fin if r['brazo'] == 'indicado' and r['caso'] in self.pre['cubiertos']]
        self.fin.extend(probar)
        self.assertEqual(self.analizar()['ejecutores']['principal']['probar']['nota'], final.NOTA_PROBAR)

    def test_control_real_LB_si_archivo_presente(self):
        archivo = Path('C:/Users/Joa/archivo-linea-base/final-med17-analisis.tar.gz')
        if not archivo.is_file():
            self.skipTest('Archivo LB externo no disponible')
        base = final.leer_base(archivo)
        self.assertEqual(final.controlar_costos(base, HOJA['casos']), final.CONTROL_COSTOS)

    def test_primer_intento_configuracion_despues_de_consulta(self):
        r = dict(objetivo_alcanzado=True, hecho=True, resultado='correcta', herramientas=[
            dict(herramienta='write', argumentos=dict(filePath='/p/opencode.json'), estado='completed'),
            dict(herramienta='bash', argumentos=dict(command="como-dev 'rige permiso --proyecto /p'"), estado='completed')])
        self.assertTrue(final.primer_intento(r, {}))
        r['herramientas'].append(dict(herramienta='edit', argumentos=dict(filePath='/p/README.md'), estado='completed'))
        self.assertTrue(final.primer_intento(r, {}))
        r['herramientas'].append(dict(herramienta='edit', argumentos=dict(filePath='/p/opencode.json'), estado='completed'))
        self.assertFalse(final.primer_intento(r, {}))


if __name__ == '__main__':
    unittest.main()
