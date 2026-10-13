"""Contraejemplos y fronteras de ADR-079; biblioteca estándar, sin red/Docker."""
from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from analizar import analizar, analizar_grupo, evaluar_final, markdown, piloto, por_caso, rama, resumen
from comun import CASOS, costo_solicitudes
from corregir import aplicar_adjudicaciones, corregir, ultimo_json

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('generador', ROOT / 'herramientas/generar-respuestas-json.py')
generador = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generador)
HOJA = generador.generar((ROOT / 'respuestas.md').read_text(encoding='utf-8'))
TARIFAS = json.loads((ROOT / 'tarifas-congeladas-20261001.json').read_text(encoding='utf-8'))
ARNES = {'__name__': 'arnes_test'}
exec(compile((ROOT / 'vm/medir.sh').read_text(encoding='utf-8').split("<<'PYTHON_MED4B'\n", 1)[1].rsplit('\nPYTHON_MED4B', 1)[0], 'medir.sh::python', 'exec'), ARNES)


def filas(brazo='LB', k=3, error=None, tokens=None, ejecutor='principal', modelo='openai/gpt-6.1-sol'):
    error = error or {}
    tokens = tokens or {}
    return [dict(tanda=brazo, condicion='LB' if brazo == 'LB' else 'FIN', brazo=brazo, caso=c,
                 repeticion=r, k=k, ejecutor=ejecutor, modelo=modelo,
                 resultado='incorrecta' if r <= error.get(c, 0) else 'correcta',
                 tokens_entrada=tokens.get(c, 100), tokens_cache=0, tokens_salida=0,
                 duracion_s=1, censurado=False, ensayo=False, fase='medicion', respuesta_textual='',
                 solicitudes=[{'tokens_entrada': tokens.get(c, 100), 'tokens_cache': 0, 'tokens_salida': 0}])
            for c in CASOS for r in range(1, k + 1)]


def respuesta(caso, value, source):
    row = dict(tanda='test', ejecutor='principal', modelo='openai/gpt-6.1-sol', brazo='LB', caso=caso,
               repeticion=1, respuesta_textual=json.dumps({'respuesta': value, 'fuente': source}))
    return corregir(row, HOJA['casos'][caso])


OBJ = [c for c in CASOS if not c.startswith('C-1')]


class CorreccionTests(unittest.TestCase):
    def test_hoja_24_casos_y_reproducible(self):
        self.assertEqual(tuple(HOJA['casos']), CASOS)
        self.assertEqual(HOJA, json.loads((ROOT / 'respuestas.json').read_text(encoding='utf-8')))

    def test_valor_fuente(self):
        self.assertEqual(respuesta('C-1a', ' OPENAI/GPT-5-MINI ', 'el del proyecto')['resultado'], 'correcta')

    def test_parcial_cuenta_como_error(self):
        self.assertEqual(respuesta('C-1a', 'openai/gpt-5-mini', 'global')['resultado'], 'parcial')

    def test_incorrecta(self):
        self.assertEqual(respuesta('C-1a', 'otro', 'proyecto')['resultado'], 'incorrecta')

    def test_fuente_desconocida_manual(self):
        self.assertEqual(respuesta('C-1a', 'openai/gpt-5-mini', 'una señal extraña')['resultado'], 'revision_manual')

    def test_conflicto_manual(self):
        self.assertEqual(respuesta('C-1a', 'openai/gpt-5-mini', 'global y proyecto')['resultado'], 'revision_manual')

    def test_sinonimos(self):
        self.assertEqual(respuesta('C-1b', 'pregunta', 'global')['resultado'], 'correcta')

    def test_formato_final_no_rescata_anterior(self):
        r = dict(caso='C-1a', respuesta_textual='{"respuesta":"x","fuente":"y"}\n{"roto":')
        self.assertEqual(corregir(r, HOJA['casos']['C-1a'])['resultado'], 'sin_respuesta')

    def test_ultimo_bloque_json(self):
        self.assertEqual(ultimo_json('```json\n{"a":1}\n```\n```json\n{"a":2}\n```'), {'a': 2})

    def test_json_anidado_no_se_confunde_con_ultimo_objeto(self):
        obj = {'respuesta': {'modelo': 'x'}, 'fuente': {'modelo': 'y'}}
        self.assertEqual(ultimo_json(json.dumps(obj)), obj)

    def test_campos_ausentes(self):
        self.assertEqual(corregir(dict(caso='C-1a', respuesta_textual='{}'), HOJA['casos']['C-1a'])['resultado'], 'sin_respuesta')

    def test_compuestas_todas_las_partes(self):
        for c, value, source in [('C-2a', 'anthropic/claude-opus-4-1; 0.7', 'modelo: global; temperatura: proyecto'),
                                  ('C-2f', 'mistral/codestral-latest; 0.9', 'modelo: equipo.json indicado por OPENCODE_CONFIG; temperatura: proyecto'),
                                  ('C-4e', 'allow; ask', 'webfetch: agent.build.permission.webfetch del proyecto; edición: edit de OPENCODE_PERMISSION')]:
            with self.subTest(c=c):
                self.assertEqual(respuesta(c, value, source)['resultado'], 'correcta')

    def test_compuestas_invertidas_parciales(self):
        self.assertEqual(respuesta('C-2a', 'anthropic/claude-opus-4-1; 0.7', 'modelo: proyecto; temperatura: global')['resultado'], 'parcial')

    def test_compuesta_una_parte_incorrecta(self):
        self.assertEqual(respuesta('C-2a', 'anthropic/claude-opus-4-1; 0.8', 'modelo: global; temperatura: proyecto')['resultado'], 'incorrecta')

    def test_compuesta_fuente_unica_parcial_y_desconocida_manual(self):
        self.assertEqual(respuesta('C-2a', 'anthropic/claude-opus-4-1; 0.7', 'global')['resultado'], 'parcial')
        self.assertEqual(respuesta('C-2a', 'anthropic/claude-opus-4-1; 0.7', 'otra fuente')['resultado'], 'revision_manual')

    def test_c2c_no_elije_alternativa(self):
        self.assertTrue(HOJA['casos']['C-2c']['revision_manual'])

    def test_c3f_respuesta_corregida_de_la_hoja(self):
        self.assertEqual(HOJA['casos']['C-3f']['respuesta'], 'allow')
        self.assertEqual(respuesta('C-3f', 'allow', 'conjunto propio de general, regla nativa; no hereda la denegación del padre')['resultado'], 'correcta')

    def test_c3b_documentacion(self):
        r = respuesta('C-3b', 'denegado', 'regla nativa')
        self.assertEqual(r['resultado'], 'incorrecta')
        self.assertTrue(r['sigue_documentacion'])

    def test_adjudicacion_segunda_pasada(self):
        r = respuesta('C-1a', 'openai/gpt-5-mini', 'otro origen')
        a = dict(id='test|principal|openai/gpt-6.1-sol|LB|C-1a|1', hash_respuesta=r['hash_respuesta'], resultado='correcta', motivo='Adjudicado por el autor con traza.')
        aplicar_adjudicaciones([r], [a])
        self.assertTrue(r['adjudicado_manual'])
        self.assertEqual(r['resultado'], 'correcta')

    def test_adjudicacion_otra_evidencia_rechazada(self):
        r = respuesta('C-1a', 'openai/gpt-5-mini', 'otro origen')
        with self.assertRaises(ValueError):
            aplicar_adjudicaciones([r], [dict(id='test|principal|openai/gpt-6.1-sol|LB|C-1a|1', hash_respuesta='ajena', resultado='correcta', motivo='x')])


class AnalisisTests(unittest.TestCase):
    def test_umbral_mitad_k3_k5(self):
        for k in (3, 5):
            cs = por_caso(filas(k=k, error={'C-2a': k // 2, 'C-2b': k // 2 + 1}))
            self.assertFalse(cs['C-2a']['con_problema'])
            self.assertTrue(cs['C-2b']['con_problema'])

    def test_parcial_sin_respuesta_son_errores(self):
        rs = filas()
        for r in rs:
            if r['caso'] == 'C-2a' and r['repeticion'] < 3:
                r['resultado'] = 'parcial' if r['repeticion'] == 1 else 'sin_respuesta'
        self.assertTrue(por_caso(rs)['C-2a']['con_problema'])

    def test_tokens_incluyen_cache_error_y_censura(self):
        rs = filas(error={'C-2a': 3})
        for r in rs:
            r.update(tokens_cache=20, tokens_salida=30, censurado=r['caso'] == 'C-2a')
        self.assertEqual(por_caso(rs)['C-2a']['tokens']['mediana'], 150)

    def test_mediana_casos_no_mediana_ejecuciones(self):
        rs = filas()
        for r in rs:
            if r['caso'] == 'C-2a':
                r['tokens_entrada'] = [0, 100, 10000][r['repeticion'] - 1]
        self.assertEqual(por_caso(rs)['C-2a']['tokens']['mediana'], 100)

    def test_rama_E_seis_y_mayor_IB1(self):
        g = analizar_grupo(filas(error=dict.fromkeys(OBJ[:6], 2)))
        self.assertEqual(g['rama'], 'E')

    def test_c1_anomalo_no_activa_costo(self):
        rs = filas(error={'C-1a': 2}, tokens=dict.fromkeys(OBJ, 300))
        g = analizar_grupo(rs)
        self.assertFalse(g['valida'])
        self.assertEqual(g['estado'], 'medición inválida')
        self.assertIsNone(g['rama'])

    def test_c1_censurada_invalida_incluso_si_excluida(self):
        rs = filas()
        rs[0].update(censurado=True, tokens_entrada=None)
        self.assertFalse(analizar_grupo(rs)['valida'])

    def test_orden_E_antes_otros_y_C_antes_P_N(self):
        for n, esperado in ((6, 'E'), (5, 'C'), (0, 'C')):
            rs = filas(error=dict.fromkeys(OBJ[:n], 2), tokens=dict.fromkeys(OBJ, 200))
            self.assertEqual(analizar_grupo(rs)['rama'], esperado)

    def test_p_y_n_sin_criterio(self):
        for n, esperado in ((1, 'P'), (0, 'N')):
            g = analizar_grupo(filas(error=dict.fromkeys(OBJ[:n], 2)) + filas('indicado'))
            self.assertEqual(g['rama'], esperado)
            self.assertIsNone(g['comparaciones']['indicado']['cumple'])

    def test_seis_problemas_y_refuta_rama_P(self):
        rs = filas(error={**dict.fromkeys(OBJ[:6], 2), **dict.fromkeys(CASOS[:6], 1)})
        g = analizar_grupo(rs)
        self.assertEqual(g['iv3']['resultado'], 'Refuta')
        self.assertEqual(g['rama'], 'P')

    def test_IV3_independiente_incluso_N(self):
        rs = filas(error=dict.fromkeys(OBJ, 1))
        g = analizar_grupo(rs)
        self.assertEqual(g['rama'], 'N')
        self.assertIsNotNone(g['iv3'])

    def test_IV3_reordena_y_empate_como_reordena(self):
        rs = filas(error=dict.fromkeys([c for c in OBJ if c.startswith('C-3')], 2))
        self.assertEqual(analizar_grupo(rs)['iv3']['resultado'], 'Reordena')
        # Empate de C-3 con la mayor tasa: Reordena (decisión del autor, 13/10/2026).
        g = analizar_grupo(filas(error=dict.fromkeys(OBJ, 1)))
        self.assertEqual(g['iv3']['resultado'], 'Reordena')

    def test_contraejemplo_IB1_aumenta_aunque_recupera_4(self):
        # LB: seis problemas con 2 errores (12); FIN: recupera cuatro,
        # doce antes sanos tienen un error, dos conservan dos (16).
        lb = filas(error=dict.fromkeys(OBJ[:6], 2))
        fin = filas('indicado', error={**dict.fromkeys(OBJ[4:6], 2), **dict.fromkeys(OBJ[6:], 1)})
        cmp = analizar_grupo(lb + fin)['comparaciones']['indicado']
        self.assertEqual(len(cmp['recuperados']), 4)
        self.assertFalse(cmp['cumple'])
        self.assertGreater(cmp['ib1_FIN'], cmp['ib1_LB'])

    def test_E_dos_tercios_ceil_y_cero_retrocesos(self):
        lb = filas(error=dict.fromkeys(OBJ[:7], 2))
        fin = filas('indicado', error=dict.fromkeys(OBJ[5:7], 2))
        cmp = analizar_grupo(lb + fin)['comparaciones']['indicado']
        self.assertEqual(cmp['recuperaciones_requeridas'], 5)
        self.assertTrue(cmp['cumple'])
        fin = filas('indicado', error={**dict.fromkeys(OBJ[5:7], 2), OBJ[-1]: 2})
        self.assertFalse(analizar_grupo(lb + fin)['comparaciones']['indicado']['cumple'])

    def test_E_tokens_secundarios_no_negativos(self):
        lb = filas(error=dict.fromkeys(OBJ[:6], 2))
        fin = filas('indicado', tokens=dict.fromkeys(OBJ, 101))
        cmp = analizar_grupo(lb + fin)['comparaciones']['indicado']
        self.assertTrue(cmp['criterio_error_E'])
        self.assertFalse(cmp['criterio_tokens'])
        # ADR-079: en E los tokens son secundarios y no anulan el criterio principal.
        self.assertTrue(cmp['cumple'])

    def test_C_reduccion_30_inclusiva(self):
        lb = filas(tokens=dict.fromkeys(OBJ, 200))
        fin = filas('indicado', tokens=dict.fromkeys(OBJ, 140))
        self.assertTrue(analizar_grupo(lb + fin)['comparaciones']['indicado']['cumple'])
        fin = filas('indicado', tokens=dict.fromkeys(OBJ, 141))
        self.assertFalse(analizar_grupo(lb + fin)['comparaciones']['indicado']['cumple'])

    def test_C_no_aumento_IB1_aunque_sin_nuevos_problemas(self):
        lb = filas(tokens=dict.fromkeys(OBJ, 200))
        fin = filas('indicado', error={OBJ[0]: 1}, tokens=dict.fromkeys(OBJ, 140))
        cmp = analizar_grupo(lb + fin)['comparaciones']['indicado']
        self.assertFalse(cmp['cumple'])
        self.assertFalse(cmp['retrocesos'])

    def test_exclusion_de_ambos_brazos_y_umbral_proporcional(self):
        rs = filas() + filas('indicado') + filas('disponible')
        rs = [r for r in rs if not (r['brazo'] == 'disponible' and r['caso'] == 'C-2a' and r['repeticion'] == 1)]
        g = analizar_grupo(rs)
        self.assertTrue(g['valida'])
        self.assertEqual(g['umbral_rama_E'], 17 / 3)
        for b in g['casos']:
            self.assertNotIn('C-2a', g['casos'][b])

    def test_tres_exclusiones_invalida(self):
        rs = [r for r in filas() if r['caso'] not in ('C-2a', 'C-2b', 'C-2c')]
        self.assertFalse(analizar_grupo(rs)['valida'])

    def test_revision_manual_no_se_convierte_en_error(self):
        rs = filas()
        next(r for r in rs if r['caso'] == 'C-2a')['resultado'] = 'revision_manual'
        self.assertIn('C-2a', analizar_grupo(rs)['exclusiones'])

    def test_no_binariza_tasa_y_distribucion(self):
        g = analizar_grupo(filas(error={'C-2a': 1}))
        self.assertEqual(g['casos']['LB']['C-2a']['tasa_error'], 1 / 3)
        self.assertEqual(g['casos']['LB']['C-2a']['resultados'], {'incorrecta': 1, 'correcta': 2})

    def test_n_requiere_segundo_ejecutor(self):
        datos = analizar(filas())
        self.assertFalse(datos['reevaluar_objeto'])
        self.assertTrue(datos['segundo_ejecutor_pendiente'])
        datos = analizar(filas() + filas(ejecutor='charles', modelo='openai/gpt-6-luna'))
        self.assertTrue(datos['reevaluar_objeto'])

    def test_cumplimiento_solo_principal_modelo_brazo(self):
        rs = filas(error=dict.fromkeys(OBJ[:6], 2)) + filas('disponible')
        self.assertIsNone(analizar(rs)['cumplimiento_proyecto'])
        rs += filas('indicado')
        self.assertTrue(analizar(rs)['cumplimiento_proyecto'])

    def test_cada_modelo_rama_propia_y_lectura_brazos(self):
        rs = filas(error=dict.fromkeys(OBJ[:6], 2)) + filas('indicado') + filas('disponible') + filas(modelo='openai/gpt-6-luna')
        d = analizar(rs)
        self.assertEqual(d['grupos']['principal|openai/gpt-6-luna']['rama'], 'N')
        self.assertEqual(d['grupos']['principal|openai/gpt-6.1-sol']['lectura_brazos'], 'RIGE resuelve y el agente lo adopta')

    def test_ensayo_no_cumplimiento_real(self):
        rs = filas(error=dict.fromkeys(OBJ[:6], 2)) + filas('indicado')
        for r in rs:
            r['ensayo'] = True
        self.assertIsNone(analizar(rs)['cumplimiento_proyecto'])
        with self.assertRaises(ValueError):
            analizar(rs + filas())

    def test_k_mismo_en_modelos_salvo_recorte_declarado(self):
        principal = filas()
        secundario = filas(k=1, modelo='openai/gpt-6-luna')
        d = analizar(principal + secundario)
        self.assertFalse(d['grupos']['principal|openai/gpt-6-luna']['valida'])
        for r in secundario:
            r['recorte_declarado'] = 'Recorte por límite de suscripción; ADR-076.'
        d = analizar(principal + secundario)
        self.assertTrue(d['grupos']['principal|openai/gpt-6-luna']['valida'])

    def test_k_uniforme_dentro_de_combination(self):
        rs = filas()
        rs[0]['k'] = 5
        self.assertFalse(analizar_grupo(rs)['valida'])

    def test_piloto_9_de_10_k3_y_8_de_10_k5(self):
        for err, esperado in ((1, 3), (2, 5)):
            p = piloto(filas(k=10, error=dict.fromkeys(CASOS, err)))
            self.assertEqual(p['k'], esperado)

    def test_piloto_90_por_ciento_casos(self):
        self.assertEqual(piloto(filas(k=10, error=dict.fromkeys(CASOS[:2], 2)))['k'], 3)
        self.assertEqual(piloto(filas(k=10, error=dict.fromkeys(CASOS[:3], 2)))['k'], 5)

    def test_piloto_inestables_inclusivos_sin_excluir(self):
        p = piloto(filas(k=10, error={'C-2a': 3, 'C-2b': 7, 'C-2c': 2, 'C-2d': 8}))
        self.assertEqual(p['inestables'], ['C-2a', 'C-2b'])
        self.assertEqual(len(p['casos']), 24)

    def test_piloto_incompleto_o_no_principal(self):
        self.assertFalse(piloto(filas(k=10)[:-1])['valido'])
        self.assertFalse(piloto(filas(k=10, ejecutor='charles'))['valido'])

    def test_piloto_no_se_mezcla_LB(self):
        rs = filas(k=10)
        rs[0]['fase'] = 'piloto'
        with self.assertRaises(ValueError):
            analizar(rs)

    def test_denominador_cero_pendiente(self):
        g = analizar_grupo(filas(error=dict.fromkeys(OBJ[:6], 2), tokens=dict.fromkeys(OBJ, 0)) + filas('indicado'))
        self.assertIn('DECISIÓN PENDIENTE', g['comparaciones']['indicado']['pendientes'][0])

    def test_markdown_y_json_serializables(self):
        d = analizar(filas(), tarifas=TARIFAS)
        json.dumps(d, allow_nan=False)
        self.assertIn('| LB | C-2a |', markdown(d))


class RegistroTests(unittest.TestCase):
    def test_preguntas_completas_y_marcador_indicado(self):
        self.assertEqual(ARNES['PREGUNTAS'], {c: r['pregunta'] for c, r in HOJA['casos'].items()})
        texto = (ROOT / 'vm/indicacion.txt').read_text(encoding='utf-8')
        self.assertNotIn('[DECISIÓN PENDIENTE', texto)
        self.assertIn('rige', texto)

    def test_manifiesto_configuracion_portable(self):
        import hashlib
        root = ROOT / 'vm/ejecutores'
        d = json.loads((root / 'congeladas.json').read_text(encoding='utf-8'))
        for name, digest in d['archivos'].items():
            self.assertNotIn('\\', name)
            self.assertEqual(hashlib.sha256((root / name).read_bytes()).hexdigest(), digest)

    def test_extraccion_traza_real_med4a(self):
        path = ROOT / 'verificacion/20261013-permisos/C-4a/bash/run.stdout.jsonl'
        if not path.exists():
            self.skipTest('Evidencia de MED-4a no presente.')
        r = ARNES['extraer_eventos'](path.read_text(encoding='utf-8'))
        self.assertEqual(len(r['herramientas']), 1)
        self.assertEqual(len(r['solicitudes']), 2)
        self.assertEqual(r['respuesta_textual'], 'MED4A_FIN')
        self.assertFalse(r['registro_incompleto'])

    def test_extraccion_tokens_sin_duplicar(self):
        e = {'type': 'step_finish', 'part': {'id': 'x', 'tokens': {'input': 100, 'output': 30, 'reasoning': 10, 'cache': {'read': 20, 'write': 0}}}}
        r = ARNES['extraer_eventos'](json.dumps(e) + '\n' + json.dumps(e))
        self.assertEqual(len(r['solicitudes']), 1)
        self.assertEqual(r['solicitudes'][0]['tokens_cache'], 20)

    def test_tokens_ausentes_no_son_cero(self):
        r = ARNES['extraer_eventos']('{"type":"step_finish","part":{}}')
        self.assertTrue(r['registro_incompleto'])
        self.assertEqual(r['solicitudes'], [])

    def test_sesiones_hijas_incompletas_no_se_omiten(self):
        r = ARNES['extraer_eventos']('{"type":"tool_use","part":{"tool":"task","state":{}}}')
        self.assertTrue(r['registro_incompleto'])

    def test_export_recupera_padre_e_hijo_sin_duplicar(self):
        parent, child = 'ses_padre', 'ses_hijo'
        task = {'id': 'tool_padre', 'type': 'tool', 'tool': 'task', 'state': {'metadata': {'sessionId': child}, 'status': 'completed', 'input': {}}}
        def step(id, entrada):
            return {'id': id, 'type': 'step-finish', 'tokens': {'input': entrada, 'output': 3, 'cache': {'read': 2, 'write': 0}}}
        objs = {parent: {'info': {'id': parent}, 'messages': [{'parts': [task, step('p', 100)]}]},
                child: {'info': {'id': child}, 'messages': [{'parts': [step('h', 200)]}]}}
        parsed = ARNES['extraer_eventos'](json.dumps({'type': 'tool_use', 'sessionID': parent, 'part': task}))
        old = ARNES['ejecutar']
        def fake_export(comando, stdout, stderr, limite=120):
            Path(stdout).write_text(json.dumps(objs[comando[-1]]))
            return 0
        try:
            ARNES['ejecutar'] = fake_export
            with tempfile.TemporaryDirectory() as tmp:
                got = ARNES['recuperar_sesiones'](parsed, Path(tmp) / 'raw', {})
                self.assertFalse(got['registro_incompleto'])
                self.assertEqual(sum(s['tokens_entrada'] for s in got['solicitudes']), 300)
                self.assertEqual(len(got['solicitudes']), 2)
        finally:
            ARNES['ejecutar'] = old

    def test_export_esquema_desconocido_no_inventa_consumo(self):
        with self.assertRaises(ValueError):
            ARNES['eventos_exportados']({'messages': []}, 'ses_x')

    def test_cache_write_se_registra_aparte(self):
        # cache.write se registra aparte y se valoriza al precio de entrada (decisión del autor, 13/10/2026).
        e = {'type': 'step_finish', 'part': {'id': 'x', 'tokens': {'input': 100, 'output': 30, 'cache': {'read': 20, 'write': 1}}}}
        r = ARNES['extraer_eventos'](json.dumps(e))
        self.assertFalse(r['registro_incompleto'])
        self.assertEqual(r['solicitudes'][0]['cache_escritura'], 1)

    def test_hash_detecta_cambios_excluye_git(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)
            (p / '.git').mkdir()
            (p / 'config').write_text('x')
            before = ARNES['hash_arbol']([p])
            (p / '.git/rastro').write_text('irrelevante')
            self.assertEqual(before, ARNES['hash_arbol']([p]))
            (p / 'config').write_text('y')
            self.assertNotEqual(before, ARNES['hash_arbol']([p]))

    def test_tarifas_por_solicitud_y_frontera_contexto(self):
        s = {'tokens_entrada': 272000, 'tokens_cache': 0, 'tokens_salida': 10}
        self.assertAlmostEqual(costo_solicitudes([s, s], 'openai/gpt-6.1-sol', TARIFAS), 1.0882)
        self.assertAlmostEqual(costo_solicitudes([dict(s, tokens_cache=1)], 'openai/gpt-6.1-sol', TARIFAS), 1.0881502)

    def test_precio_cache_y_modelo_desconocido(self):
        s = {'tokens_entrada': 100, 'tokens_cache': 20, 'tokens_salida': 30}
        self.assertAlmostEqual(costo_solicitudes([s], 'openai/gpt-6.1-sol', TARIFAS), .000502)
        self.assertIsNone(costo_solicitudes([s], 'otro', TARIFAS))

    def test_ensayo_independiente_y_cubre_resultados(self):
        from importlib.machinery import SourceFileLoader
        fixture = json.loads((ROOT / 'vm/simulado/ensayo.json').read_text(encoding='utf-8'))
        resultados = set()
        for c, regla in fixture['casos'].items():
            row = dict(caso=c, respuesta_textual=json.dumps(regla['salida']))
            resultados.add(corregir(row, regla)['resultado'])
            self.assertNotEqual(regla['respuesta'], HOJA['casos'][c]['respuesta'])
        self.assertEqual(resultados, {'correcta', 'parcial', 'incorrecta'})

    def test_congelamiento_charles_prompt_y_permisos(self):
        original = (ROOT.parent / 'evidencia/PRIV/agente-referente-charles_20261013.md').read_text(encoding='utf-8')
        frozen = (ROOT / 'vm/ejecutores/charles/agents/charles.md').read_text(encoding='utf-8')
        self.assertEqual(original.split('---', 2)[2], frozen.split('---', 2)[2])
        self.assertNotIn(': ask', frozen.split('---', 2)[1])
        self.assertIn('edit: deny', frozen)
        self.assertIn('"como-dev *": allow', frozen)
        self.assertIn('"rige *": allow', frozen)
        self.assertNotIn('"opencode": allow', frozen)


if __name__ == '__main__':
    unittest.main()
