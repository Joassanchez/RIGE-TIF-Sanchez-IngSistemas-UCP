"""Extracción mecánica ADR-083, con hoja congelada y evidencia sintética."""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import unittest

from comun import identificador
from corregir import aplicar_adjudicaciones, corregir

ROOT = Path(__file__).resolve().parents[1]
HOJA = json.loads((ROOT / 'respuestas.json').read_text(encoding='utf-8'))['casos']
MOTIVO = 'Decisión en texto libre sin término explícito o con términos en conflicto (ADR-083).'
FUENTE_C4E = 'webfetch: agent.build.permission.webfetch del proyecto; edición: edit de OPENCODE_PERMISSION'


def fila(caso, respuesta, fuente):
    return dict(tanda='test', ejecutor='principal', modelo='openai/gpt-6.1-sol', brazo='LB',
                caso=caso, repeticion=1,
                respuesta_textual=json.dumps({'respuesta': respuesta, 'fuente': fuente}, ensure_ascii=False))


def corregida(caso, respuesta, fuente):
    return corregir(fila(caso, respuesta, fuente), HOJA[caso])


class ExtraccionPermisoTests(unittest.TestCase):
    def assert_manual(self, row):
        self.assertEqual(row['resultado'], 'revision_manual')
        self.assertEqual(row['regla_extraccion'], 'revision_manual')
        self.assertIsNone(row['decision_extraida'])
        self.assertEqual(row['motivo'], MOTIVO)

    def test_deny_texto_libre_conserva_respuesta_y_hash(self):
        respuesta = 'deny: npm install queda bloqueado, sin pedir aprobación'
        row = fila('C-4d', respuesta, 'global: build, * deny')
        original = deepcopy(row)
        out = corregir(row, HOJA['C-4d'])
        self.assertEqual(out['decision_extraida'], 'deny')
        self.assertEqual(out['regla_extraccion'], 'termino_unico')
        self.assertEqual(out['resultado'], 'correcta')
        self.assertEqual(out['respuesta'], respuesta)
        self.assertEqual(out['respuesta_textual'], original['respuesta_textual'])
        self.assertEqual(out['hash_respuesta'], hashlib.sha256(original['respuesta_textual'].encode()).hexdigest())
        self.assertEqual(row, original)

    def test_ask_entre_parentesis(self):
        out = corregida('C-1b', 'Pide aprobación (ask) cuando build usa webfetch.', 'global')
        self.assertEqual(out['decision_extraida'], 'ask')
        self.assertEqual(out['regla_extraccion'], 'termino_unico')
        self.assertEqual(out['resultado'], 'correcta')

    def test_sin_termino_explicito_no_infiere_decision_desde_fuente(self):
        out = corregida('C-3d', 'Se bloquea la modificación de README.md, sin pedir aprobación.', 'regla nativa de plan: deny')
        self.assert_manual(out)

    def test_conflicto_incluso_con_negacion(self):
        self.assert_manual(corregida('C-1b', 'ask: se pide aprobación (no deny)', 'global'))

    def test_c4e_texto_libre_por_partes_en_orden(self):
        respuesta = 'build: webfetch = allow (sin aprobación); modificar src/productos.js = ask (requiere aprobación).'
        out = corregida('C-4e', respuesta, FUENTE_C4E)
        self.assertEqual(out['decision_extraida'], ['allow', 'ask'])
        self.assertEqual(out['regla_extraccion'], 'termino_unico')
        self.assertEqual(out['resultado'], 'correcta')
        self.assertEqual(out['respuesta'], respuesta)

    def test_decision_distinta_es_incorrecta_sin_evaluar_fuente(self):
        out = corregida('C-1d', 'allow', 'fuente sin cobertura')
        self.assertEqual(out['decision_extraida'], 'allow')
        self.assertEqual(out['regla_extraccion'], 'termino_unico')
        self.assertEqual(out['resultado'], 'incorrecta')
        self.assertEqual(out['motivo'], 'valor o decisión no coincide')

    def test_valores_con_texto_libre_conservan_comparacion_vigente(self):
        for respuesta, resultado in (('openai/gpt-5-mini', 'correcta'),
                                     ('El modelo es openai/gpt-5-mini (allow).', 'incorrecta')):
            with self.subTest(respuesta=respuesta):
                out = corregida('C-1a', respuesta, 'proyecto')
                self.assertEqual(out['resultado'], resultado)
                self.assertIsNone(out['decision_extraida'])
                self.assertEqual(out['regla_extraccion'], 'exacta')
        out = corregida('C-2a', 'modelo: anthropic/claude-opus-4-1 (allow); temperatura: 0.7',
                        'modelo: global; temperatura: proyecto')
        self.assertEqual(out['resultado'], 'incorrecta')
        self.assertIsNone(out['decision_extraida'])
        self.assertEqual(out['regla_extraccion'], 'exacta')

    def test_coincidencia_exacta_y_sinonimos_exactos_tienen_precedencia(self):
        for respuesta in ('ask', ' ASK ', '`ask`', 'pregunta'):
            with self.subTest(respuesta=respuesta):
                out = corregida('C-1b', respuesta, 'global')
                self.assertEqual(out['decision_extraida'], 'ask')
                self.assertEqual(out['regla_extraccion'], 'exacta')
                self.assertEqual(out['resultado'], 'correcta')
        for respuesta in ('allow; ask', 'webfetch: allow; edición: ask',
                          {'webfetch': 'allow', 'edit': 'ask'}):
            with self.subTest(respuesta=respuesta):
                out = corregida('C-4e', respuesta, FUENTE_C4E)
                self.assertEqual(out['decision_extraida'], ['allow', 'ask'])
                self.assertEqual(out['regla_extraccion'], 'exacta')
                self.assertEqual(out['resultado'], 'correcta')

    def test_sinonimos_y_repeticiones_de_una_misma_decision(self):
        for caso, respuesta, esperada, fuente in (
                ('C-1d', 'DENY: denegado, sigue denegado.', 'deny', 'proyecto: edit deny'),
                ('C-1b', 'La herramienta pregunta: `ask`.', 'ask', 'global'),
                ('C-3f', 'Está permitido (allow).', 'allow', 'general: regla nativa propia, no hereda')):
            with self.subTest(respuesta=respuesta):
                out = corregida(caso, respuesta, fuente)
                self.assertEqual(out['decision_extraida'], esperada)
                self.assertEqual(out['regla_extraccion'], 'termino_unico')
                self.assertEqual(out['resultado'], 'correcta')
        regla = deepcopy(HOJA['C-1d'])
        regla['sinonimos']['deny'].append('prohibido')
        out = corregir(fila('C-1d', 'Está prohibido.', 'proyecto: edit deny'), regla)
        self.assertEqual(out['decision_extraida'], 'deny')
        self.assertEqual(out['regla_extraccion'], 'termino_unico')

    def test_solo_palabras_completas_y_conflicto_entre_sinonimos(self):
        for respuesta in ('allowance asking denied denegados', 'no_deny',
                          'permitido, pero pregunta', 'deny o permitido'):
            with self.subTest(respuesta=respuesta):
                self.assert_manual(corregida('C-1d', respuesta, 'proyecto: edit deny'))

    def test_fuentes_mantienen_los_mismos_resultados_y_motivos(self):
        for fuente in ('global', 'proyecto', 'origen desconocido', 'global y proyecto', {'origen': 'global'}):
            with self.subTest(fuente=fuente):
                exacta = corregida('C-1b', 'ask', fuente)
                libre = corregida('C-1b', 'Pide aprobación (ask).', fuente)
                self.assertEqual((libre['resultado'], libre['motivo']), (exacta['resultado'], exacta['motivo']))
                self.assertEqual(libre['regla_extraccion'], 'termino_unico')
        for fuente in (FUENTE_C4E, 'global', 'origen desconocido',
                       'webfetch: global; edición: edit OPENCODE_PERMISSION'):
            with self.subTest(fuente=fuente):
                exacta = corregida('C-4e', 'allow; ask', fuente)
                libre = corregida('C-4e', 'permitido (allow); se pregunta (ask)', fuente)
                self.assertEqual((libre['resultado'], libre['motivo']), (exacta['resultado'], exacta['motivo']))

    def test_compuesto_incompleto_o_ambiguo_va_a_revision(self):
        for respuesta in ('allow', 'allow; ask; deny', 'allow;', 'allow; se pide aprobación',
                          'allow; ask, no deny', 'deny; sin decisión'):
            with self.subTest(respuesta=respuesta):
                self.assert_manual(corregida('C-4e', respuesta, FUENTE_C4E))

    def test_compuesto_con_decisiones_distintas_es_incorrecto_sin_reordenar(self):
        out = corregida('C-4e', 'ask; allow', FUENTE_C4E)
        self.assertEqual(out['decision_extraida'], ['ask', 'allow'])
        self.assertEqual(out['regla_extraccion'], 'termino_unico')
        self.assertEqual(out['resultado'], 'incorrecta')

    def test_c3b_sigue_documentacion_usa_decision_extraida(self):
        for respuesta, esperada in (('deny: denegado según la documentación.', True),
                                    ('denegado', True), ('Se pide aprobación (ask).', False)):
            with self.subTest(respuesta=respuesta):
                out = corregida('C-3b', respuesta, 'regla nativa')
                self.assertEqual(out['sigue_documentacion'], esperada)
        out = corregida('C-3b', 'ask, no deny', 'regla nativa')
        self.assert_manual(out)
        self.assertFalse(out['sigue_documentacion'])

    def test_adjudicaciones_previas_de_permiso_exacto_y_valor_conservan_hash(self):
        raws = [fila('C-1b', 'ask', 'origen a adjudicar'),
                fila('C-1a', 'openai/gpt-5-mini', 'origen a adjudicar')]
        adjudicaciones = [dict(id=identificador(r), hash_respuesta=hashlib.sha256(r['respuesta_textual'].encode()).hexdigest(),
                               resultado='correcta', motivo='Adjudicación previa del autor.') for r in raws]
        rows = [corregir(r, HOJA[r['caso']]) for r in raws]
        self.assertTrue(all(r['resultado'] == 'revision_manual' for r in rows))
        aplicar_adjudicaciones(rows, adjudicaciones)
        for row, previa in zip(rows, adjudicaciones):
            self.assertEqual(row['hash_respuesta'], previa['hash_respuesta'])
            self.assertEqual(row['resultado'], 'correcta')
            self.assertTrue(row['adjudicado_manual'])
            self.assertEqual(row['regla_extraccion'], 'exacta')

    def test_todas_las_filas_tienen_metadatos_incluso_sin_respuesta(self):
        for texto in ('{}', 'JSON roto', '{"respuesta":"sin respuesta","fuente":"global"}'):
            with self.subTest(texto=texto):
                row = fila('C-1b', 'ask', 'global')
                row['respuesta_textual'] = texto
                out = corregir(row, HOJA['C-1b'])
                self.assertEqual(out['resultado'], 'sin_respuesta')
                self.assertIn('regla_extraccion', out)
                self.assertIsNone(out['decision_extraida'])


if __name__ == '__main__':
    unittest.main()
