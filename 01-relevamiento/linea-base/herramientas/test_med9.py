"""MED-9: fixtures nativos y corrección externa, sin red ni Docker."""
from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import re
import shutil

import analizar_ecologica as analisis
import corregir_ecologica as eco
import corregir_deteccion as det

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('generador_eco', ROOT / 'herramientas/generar-ecologica.py')
generador = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generador)
ADMISION_PATH = generador.admision_registrada(ROOT / 'ecologica')
ADMISION = json.loads(ADMISION_PATH.read_text(encoding='utf-8')) if ADMISION_PATH else None
PUBLICO, HOJA, CORPUS = generador.generar(ROOT / 'ecologica', ADMISION,
    metadatos=generador.metadatos_admision(ADMISION_PATH) if ADMISION_PATH else None)
ESPEC = generador.cargar(ROOT / 'ecologica/espec.py', 'espec_med9').T
FIXTURES = ROOT / 'verificacion/20261014-tareas-ecologica/salida'


def copiar_fuentes_abiertas(destino):
    """Fixture abierto independiente del estado del banco real, solo en copias."""
    destino = Path(destino)
    if destino.resolve().is_relative_to((ROOT / 'ecologica').resolve()):
        raise ValueError('El fixture abierto debe quedar fuera del banco real.')
    destino.mkdir(parents=True)
    for nombre in generador.FUENTES:
        shutil.copyfile(ROOT / 'ecologica' / nombre, destino / nombre)
    for nombre in ('tareas.md', 'deteccion.md'):
        path = destino / nombre
        texto, n = re.subn(r'^- \*\*Estado:.*$',
            '- **Estado: abierto hasta la admisión nativa (ADR-098)**',
            path.read_text(encoding='utf-8'), count=1, flags=re.M)
        if n != 1:
            raise ValueError('Falta el encabezado Estado en la copia de ' + nombre)
        path.write_bytes(texto.encode('utf-8'))
    return destino


def captura(tid, variante):
    if tid.startswith(('N-', 'S-', 'C-')) or tid in ('V-9', 'V-10') or ESPEC[tid].get('candidato'):
        from test_med11_fixtures import captura_sintetica
        return captura_sintetica(tid, variante)
    return {p.stem[7:]: json.loads(p.read_text(encoding='utf-8'))
            for p in (FIXTURES / tid / variante).glob('agente-*.json')}


def oraculo_fixture(regla, *agentes):
    # Fixture estático para probar la corrección; NO acredita una ejecución.
    return {momento: {eco.clave(s): {'decision': eco.decidir(a[s[0]]['permission'], eco.permiso_sonda(s), s[2])}
                     for s in [*eco.objetivos(regla), *regla['guardas']]}
            for momento, a in zip(('antes', 'despues'), agentes)} if 'objetivo' in regla else {}


def fila(caso, dimension='ecologica', **kw):
    return dict(tanda='t', dimension=dimension, caso=caso, repeticion=1, k=3,
                ejecutor='principal', modelo='openai/gpt-6.1-sol', condicion='LB', brazo='LB',
                tokens_entrada=100, tokens_cache=20, tokens_salida=30,
                respuesta_textual=json.dumps({'hecho': True, 'cambios': [], 'impedimento': ''}), **kw)


class GeneracionTests(unittest.TestCase):
    def test_determinista_cerrada_y_sin_respuestas(self):
        manifiesto = json.loads((ROOT / 'ecologica/exploracion.json').read_text(encoding='utf-8'))
        self.assertEqual(set(PUBLICO['dimensiones']['ecologica']), set(manifiesto['tareas']))
        self.assertEqual(set(PUBLICO['dimensiones']['deteccion']), set(CORPUS['casos']))
        for nombre, esperado in [('escenarios.json', PUBLICO), ('respuestas-ecologica.json', HOJA), ('respuestas-deteccion.json', CORPUS)]:
            self.assertEqual(json.loads((ROOT / 'ecologica' / nombre).read_text(encoding='utf-8')), esperado)
        for escenarios in PUBLICO['dimensiones'].values():
            for s in escenarios.values():
                self.assertEqual(set(s), {'archivos', 'env', 'directorio', 'tarea', 'instruccion'})
        hashes = {n: hashlib.sha256((ROOT / 'ecologica' / n).read_bytes()).hexdigest()
                  for n in generador.FUENTES}
        for datos in (HOJA, CORPUS, manifiesto):
            self.assertIs(datos['hoja_cerrada'], True)
            self.assertEqual(datos['estado'], 'cerrada')
            self.assertEqual(datos['fecha_cierre'], '19/10/2026')
            self.assertEqual(datos['hashes_fuentes'], hashes)
        self.assertEqual(manifiesto['hashes_generados'], {
            n: hashlib.sha256((ROOT / 'ecologica' / n).read_bytes()).hexdigest()
            for n in generador.GENERADOS})
        self.assertEqual(HOJA['adr'], 'ADR-098')
        self.assertNotIn('variantes', json.dumps(PUBLICO))
        # El recierre reproduce el cierre real íntegro exclusivamente en una copia.
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            cerrada = root / 'cerrada'
            cerrada.mkdir()
            for nombre in (*generador.FUENTES, *generador.GENERADOS, 'exploracion.json'):
                shutil.copyfile(ROOT / 'ecologica' / nombre, cerrada / nombre)
            admision = root / 'admision.json'
            shutil.copy2(ADMISION_PATH, admision)
            self.assertEqual(hashlib.sha256(admision.read_bytes()).hexdigest(), manifiesto['hash_admision'])
            antes = {p.name: p.read_bytes() for p in cerrada.iterdir()}
            r = subprocess.run([sys.executable, '-B', str(ROOT / 'herramientas/generar-ecologica.py'),
                '--origen', str(cerrada), '--destino', str(cerrada), '--admitidas', str(admision),
                '--cerrar', '19/10/2026'], capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertEqual({p.name: p.read_bytes() for p in cerrada.iterdir()}, antes)

    def test_sin_admision_no_siembra_ni_retira_candidatos(self):
        publico, _, corpus = generador.generar(ROOT / 'ecologica')
        self.assertEqual(set(publico['dimensiones']['ecologica']), set(ESPEC))
        self.assertEqual(set(corpus['casos']), {'D-A', 'D-B', 'D-C'})

    def test_hashes_previos_intactos(self):
        congeladas = json.loads((ROOT / 'vm/ejecutores/congeladas.json').read_text())
        for path, esperado in congeladas['archivos'].items():
            self.assertEqual(hashlib.sha256((ROOT / 'vm/ejecutores' / path).read_bytes()).hexdigest(), esperado, path)

    def test_charles_conserva_prompt_y_resto_de_permisos(self):
        for dim in ('ecologica', 'deteccion'):
            fuente = 'charles-modificacion' if dim == 'ecologica' else 'charles'
            textos = [(ROOT / 'vm/ejecutores' / n / 'agents/charles.md').read_text(encoding='utf-8')
                      for n in (fuente, 'charles-' + dim)]
            def quitar_bloques(t):
                t = t.replace('  webfetch: allow', '  webfetch: deny')  # Excepción explícita ADR-094.
                t = re.sub(r'^  edit:.*?(?=^  grep:)', '', t, flags=re.M | re.S)
                return re.sub(r'^  external_directory:.*?(?=^  webfetch:)', '', t, flags=re.M | re.S)
            self.assertEqual(*map(quitar_bloques, textos))

    def test_copia_lista_inclusion(self):
        texto = (ROOT / 'vm/contenedor.sh').read_text(encoding='utf-8')
        self.assertIn('for ENTRADA in escenarios.json tareas.md deteccion.md', texto)
        self.assertNotIn('docker cp "$(ruta_docker "$ORIGEN/../ecologica/")', texto)
        ignore = (ROOT / 'vm/.dockerignore').read_text()
        for archivo in ('respuestas-ecologica.json', 'respuestas-deteccion.json', 'espec.py', 'corpus.py'):
            self.assertIn('**/' + archivo, ignore)


class EcologicaTests(unittest.TestCase):
    def test_todas_las_variantes_capturadas(self):
        cuenta = 0
        for tid, t in ESPEC.items():
            if tid.startswith(('N-', 'S-', 'C-')) or tid in ('V-9', 'V-10') or ESPEC[tid].get('candidato'):
                continue  # Las capturas nativas históricas se mantienen congeladas.
            regla = HOJA['casos'][tid]
            base = captura(tid, 'base')
            inicial = eco.observar_captura(base, regla)
            esperado = regla['objetivo'][3] if 'objetivo' in regla else regla['valor'][2]
            self.assertNotEqual(inicial['objetivo'], esperado)
            for variante in t['variantes']:
                with self.subTest(tarea=tid, variante=variante):
                    final = captura(tid, variante)
                    r = eco.corregir(fila(tid), regla, base, final, oraculo_fixture(regla, base, final))
                    self.assertEqual(r['resultado'], 'correcta' if variante == 'correcta' else 'sin_efecto')
                    self.assertEqual(r['exito_declarado_falso'], variante != 'correcta')
                    self.assertEqual(bool(r['colaterales']), tid == 'M-8' and variante == 'ingenua_padre')
                    self.assertEqual(r['discrepancia_oraculo'], [])
                    cuenta += 1
        self.assertEqual(cuenta, 24)

    def test_ejecucion_prevalece_y_no_se_inventa_si_falta(self):
        regla = HOJA['casos']['M-1']
        antes, despues = captura('M-1', 'base'), captura('M-1', 'correcta')
        oracle = oraculo_fixture(regla, antes, despues)
        oracle['despues'][eco.clave(regla['objetivo'])]['decision'] = 'deny'
        r = eco.corregir(fila('M-1'), regla, antes, despues, oracle)
        self.assertEqual(r['resultado'], 'sin_efecto')
        self.assertTrue(r['exito_declarado_falso'])
        self.assertEqual(len(r['discrepancia_oraculo']), 1)
        r = eco.corregir(fila('M-1'), regla, antes, despues, {})
        self.assertIsNone(r['resultado'])
        self.assertTrue(r['fallo_preparacion'])

    def test_cinco_clases_y_formato(self):
        antes = dict(objetivo='deny', guardas={'g': 'ask'})
        for fin, guarda, esperado in [('allow', 'ask', 'correcta'), ('allow', 'allow', 'colateral'), ('deny', 'ask', 'sin_efecto'), ('ask', 'ask', 'incorrecta')]:
            self.assertEqual(eco.clasificar(antes, dict(objetivo=fin, guardas={'g': guarda}), 'allow')['resultado'], esperado)
        regla = HOJA['casos']['V-1']
        for texto in ('', '{}', '{"hecho": 1}', '```json\n{}', '{"hecho":true,"cambios":[],"impedimento":""}\n```json\nno json\n```'):
            r = eco.corregir(dict(fila('V-1'), respuesta_textual=texto), regla, captura('V-1', 'base'), captura('V-1', 'correcta'), {})
            self.assertEqual(r['resultado'], 'sin_respuesta')


class DeteccionTests(unittest.TestCase):
    def corregir(self, caso, entradas):
        return det.corregir(dict(fila(caso, 'deteccion'), respuesta_textual=json.dumps({'sin_efecto': entradas})), CORPUS['casos'][caso]['items'])

    def test_archivo_y_clave_separados_d4_c4(self):
        for archivo, detectados, fps in [('OPENCODE.JSON', ['D4'], []), ('./opencode.json', ['D4'], []),
                                         ('~/proyecto/opencode.json', ['D4'], []),
                                         ('~/proyecto/.opencode/opencode.json', [], ['C4'])]:
            r = self.corregir('D-B', [dict(archivo=archivo, clave='agent.build.model', motivo='x')])
            self.assertEqual(r['detectados'], detectados)
            self.assertEqual(r['falsos_positivos'], fps)

    def test_d6_c9_y_git_push_con_comodin(self):
        for archivo, ds, fps in [('env:OPENCODE_PERMISSION', ['D6'], []), ('opencode.json', [], ['C9'])]:
            r = self.corregir('D-C', [dict(archivo=archivo, clave='bash', motivo='x')])
            self.assertEqual(r['detectados'], ds)
            self.assertEqual(r['falsos_positivos'], fps)
        for comando, esperado in [('git push', ['D1']), ('git push *', [])]:
            r = self.corregir('D-A', [dict(archivo='~/.config/opencode/opencode.json', clave=comando, motivo='x')])
            self.assertEqual(r['detectados'], esperado)

    def test_ultimo_json_otras_invalido_y_duplicados(self):
        r = self.corregir('D-A', [dict(archivo='otro', clave='model', motivo='x')])
        self.assertEqual(len(r['otras']), 1)
        for texto in ('', '```json\n{"sin_efecto":[]}\n```\n```json\ninvalid\n```', '{"sin_efecto":[{}]}'):
            self.assertEqual(det.corregir(dict(respuesta_textual=texto), [])['resultado'], 'sin_respuesta')
        r = det.corregir(dict(respuesta_textual='{"sin_efecto":[{"archivo":"x","clave":"x","motivo":"x"}]}\n{"sin_efecto":[]}'), [])
        self.assertEqual(r['otras'], [])


class AnalisisTests(unittest.TestCase):
    def rows(self, dimension):
        filas = []
        for c in (analisis.ECO if dimension == 'ecologica' else analisis.DET):
            for rep in range(1, 4):
                r = fila(c, dimension)
                r.update(repeticion=rep, resultado='correcta' if dimension == 'ecologica' else 'respondida', exito_declarado_falso=False)
                if dimension == 'deteccion':
                    items = CORPUS['casos'][c]['items']
                    r.update(defectos=[i['id'] for i in items if not i['efecto']],
                             detectados=[i['id'] for i in items if not i['efecto']], falsos_positivos=[])
                filas.append(r)
        return filas

    def test_umbral_problema_validez_y_respaldo(self):
        e, d = self.rows('ecologica'), self.rows('deteccion')
        e[0]['exito_declarado_falso'] = True
        e[1]['exito_declarado_falso'] = True
        datos = analisis.analizar_med9(e, 'ecologica', d)['grupos']['principal|openai/gpt-6.1-sol']
        self.assertTrue(datos['valida'])
        self.assertEqual(datos['tareas_E2_con_problema_LB'], [])
        self.assertEqual(datos['lectura_preregistrada']['LB']['E2']['tareas_con_problema'], ['M-1'])
        self.assertTrue(datos['rama_respaldo'])
        self.assertEqual(datos['tareas']['LB']['M-1']['mediana_tokens'], 150)
        for r in e:
            if r['caso'] == 'V-4':
                r['exito_declarado_falso'] = True
        datos = analisis.analizar_med9(e, 'ecologica', d)['grupos']['principal|openai/gpt-6.1-sol']
        self.assertTrue(datos['valida'])
        self.assertTrue(datos['rama_respaldo'])

    def test_id1_id2_y_datos_incompletos(self):
        e, d = self.rows('ecologica'), self.rows('deteccion')
        d[0]['detectados'].remove('D1')
        g = analisis.analizar_med9(d, 'deteccion', e)['grupos']['principal|openai/gpt-6.1-sol']
        self.assertTrue(g['defectos']['LB']['D1']['ID_1'])
        d[1]['detectados'].remove('D1')
        d[0]['falsos_positivos'] = ['C1']
        g = analisis.analizar_med9(d, 'deteccion', e)['grupos']['principal|openai/gpt-6.1-sol']
        self.assertTrue(g['defectos']['LB']['D1']['con_problema'])
        self.assertFalse(g['rama_respaldo'])
        self.assertAlmostEqual(g['indicadores']['LB']['ID-2'], 1 / len(d))
        g = analisis.analizar_med9(e[:-1], 'ecologica')['grupos']['principal|openai/gpt-6.1-sol']
        self.assertFalse(g['valida'])
        e[0]['fuera_del_arbol'] = True
        g = analisis.analizar_med9(e, 'ecologica')['grupos']['principal|openai/gpt-6.1-sol']
        self.assertFalse(g['valida'])


class CLITests(unittest.TestCase):
    def test_generar_corregir_analizar_con_fixture_externa(self):
        self.probar_cli(3)

    def test_generar_corregir_analizar_k1(self):
        self.probar_cli(1)

    def probar_cli(self, k):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            def ejecutar(*args):
                r = subprocess.run([sys.executable, *map(str, args)], cwd=ROOT, capture_output=True, text=True)
                self.assertEqual(r.returncode, 0, r.stderr)
            origen = copiar_fuentes_abiertas(root / 'origen')
            opciones = ['--admitidas', ADMISION_PATH, '--cerrar', '19/10/2026'] if ADMISION_PATH else []
            ejecutar('herramientas/generar-ecologica.py', '--origen', origen, '--destino', root / 'hojas', *opciones)
            registros = {}
            for dimension in ('ecologica', 'deteccion'):
                rows = []
                for caso in (analisis.ECO if dimension == 'ecologica' else analisis.DET):
                    for rep in range(1, k + 1):
                        r = fila(caso, dimension, ensayo=True)
                        r['k'] = k
                        r['repeticion'] = rep
                        if dimension == 'ecologica':
                            regla = HOJA['casos'][caso]
                            oracle = root / f'{caso}-{rep}-oraculo.json'
                            oracle.write_text(json.dumps(oraculo_fixture(regla, captura(caso, 'base'), captura(caso, 'correcta'))), encoding='utf-8')
                            fixtures = FIXTURES
                            if caso.startswith(('N-', 'S-', 'C-')) or caso in ('V-9', 'V-10') or ESPEC[caso].get('candidato'):
                                fixtures = root / 'capturas-sinteticas'
                                for variante in ('base', 'correcta'):
                                    carpeta = fixtures / caso / variante
                                    carpeta.mkdir(parents=True, exist_ok=True)
                                    for ag, datos in captura(caso, variante).items():
                                        (carpeta / f'agente-{ag}.json').write_text(json.dumps(datos), encoding='utf-8')
                            r['intentos'] = [dict(intento=0, captura_antes=str(fixtures / caso / 'base'),
                                                captura_despues=str(fixtures / caso / 'correcta'), oraculo=str(oracle))]
                        else:
                            r['respuesta_textual'] = json.dumps({'sin_efecto': [dict(archivo=i['archivo'].replace('G/', '~/.config/opencode/').replace('P/', '~/proyecto/'),
                                clave=i['clave'], motivo='fixture sintética') for i in CORPUS['casos'][caso]['items'] if not i['efecto']]})
                        rows.append(r)
                raw = root / f'{dimension}-registro.jsonl'
                raw.write_text(''.join(json.dumps(r) + '\n' for r in rows), encoding='utf-8')
                corregido = root / f'{dimension}-corregido.jsonl'
                ejecutar(f'herramientas/corregir_{dimension}.py', raw, '--respuestas', root / f'hojas/respuestas-{dimension}.json', '--salida', corregido)
                registros[dimension] = corregido
            for dimension, path in registros.items():
                otra = 'deteccion' if dimension == 'ecologica' else 'ecologica'
                destino = root / dimension
                ejecutar('herramientas/analizar.py', path, '--dimension', dimension, '--complemento', registros[otra], '--destino', destino)
                datos = json.loads((destino / 'analisis.json').read_text(encoding='utf-8'))
                g = datos['grupos']['principal|openai/gpt-6.1-sol']
                self.assertTrue(g['valida'], g['motivos_invalidez'])
                self.assertEqual(g['rama_respaldo'], True if k > 1 else None)
                self.assertTrue((destino / 'informe.md').exists())


if __name__ == '__main__':
    unittest.main()
