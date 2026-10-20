"""MED-12-c1: corpus admitido y derivados, con registros sintéticos sin agente."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import analizar_ecologica as analisis
from test_med9 import CORPUS, ROOT, fila, generador


class AdmisionRegistradaTests(unittest.TestCase):
    def test_resuelve_por_hash_y_rechaza_evidencia_ausente_o_de_otra_especificacion(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            origen = root / 'ecologica'
            origen.mkdir()
            (origen / 'espec.py').write_text('# fixture sintetico\n')
            evidencia = root / 'verificacion/fecha-fixture/salida/admision.json'
            evidencia.parent.mkdir(parents=True)
            datos = dict(adr='ADR-098', hash_espec=hashlib.sha256((origen / 'espec.py').read_bytes()).hexdigest())
            evidencia.write_text(json.dumps(datos))
            manifiesto = origen / 'exploracion.json'
            manifiesto.write_text(json.dumps(dict(hash_admision=hashlib.sha256(evidencia.read_bytes()).hexdigest())))
            self.assertEqual(generador.admision_registrada(origen), evidencia)
            evidencia.write_text(json.dumps(dict(datos, hash_espec='otra-especificacion')))
            with self.assertRaisesRegex(ValueError, 'hash_admision'):
                generador.admision_registrada(origen)
            manifiesto.write_text(json.dumps(dict(hash_admision=hashlib.sha256(evidencia.read_bytes()).hexdigest())))
            with self.assertRaisesRegex(ValueError, 'otra especificación'):
                generador.admision_registrada(origen)


class DerivadosTests(unittest.TestCase):
    DEFECTO = 'N-10-ingenua_frontmatter-D'
    CONTROL = 'N-10-ingenua_frontmatter-C'

    def test_correccion_y_analisis_cli_con_derivado_control_y_respuesta_invalida(self):
        self.assertIn(self.DEFECTO, CORPUS['casos'])
        rows = []
        for caso in analisis.DET:
            items = CORPUS['casos'][caso]['items']
            for rep in (1, 2, 3):
                entradas = [dict(archivo=i['archivo'].replace('G/', '~/.config/opencode/').replace('P/', '~/proyecto/'),
                                 clave=i['clave'], motivo='fixture sintética') for i in items if not i['efecto']]
                if caso == self.DEFECTO:
                    entradas = entradas * 2 if rep == 1 else []
                if caso == self.CONTROL and rep == 1:
                    entradas = [dict(archivo='~/proyecto/.opencode/agent/habilidades.md', clave='permission.skill', motivo='falso positivo sintético')]
                r = dict(fila(caso, 'deteccion', ensayo=True), repeticion=rep,
                         respuesta_textual=json.dumps(dict(sin_efecto=entradas)))
                if caso == self.DEFECTO and rep == 2:
                    r['respuesta_textual'] = 'respuesta sin JSON'
                rows.append(r)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            raw, hoja, corregido = (root / n for n in ('registro.jsonl', 'respuestas.json', 'corregido.jsonl'))
            raw.write_text(''.join(json.dumps(r) + '\n' for r in rows), encoding='utf-8')
            # Hoja cerrada sintética para probar los CLI; no cierra el banco real.
            hoja.write_text(json.dumps(dict(CORPUS, hoja_cerrada=True, estado='cerrada')), encoding='utf-8')
            comandos = [
                ['herramientas/corregir_deteccion.py', str(raw), '--respuestas', str(hoja), '--salida', str(corregido)],
                ['herramientas/analizar.py', str(corregido), '--dimension', 'deteccion', '--destino', str(root / 'analisis')]]
            for cmd in comandos:
                r = subprocess.run([sys.executable, '-B', *cmd], cwd=ROOT, capture_output=True, text=True)
                self.assertEqual(r.returncode, 0, r.stderr)
            corregidas = [json.loads(l) for l in corregido.read_text(encoding='utf-8').splitlines()]
            derivadas = [r for r in corregidas if r['caso'] == self.DEFECTO]
            self.assertEqual([r['detectados'] for r in derivadas], [[self.DEFECTO], [], []])
            self.assertEqual(derivadas[1]['resultado'], 'sin_respuesta')
            self.assertEqual(derivadas[1]['defectos'], [self.DEFECTO])
            datos = json.loads((root / 'analisis/analisis.json').read_text(encoding='utf-8'))
            grupo = datos['grupos']['principal|openai/gpt-6.1-sol']
            self.assertTrue(grupo['valida'], grupo['motivos_invalidez'])
            d = grupo['defectos']['LB'][self.DEFECTO]
            self.assertEqual((d['n'], d['detectado']), (3, 1))
            self.assertFalse(d['ID_1'])
            self.assertTrue(d['con_problema'])
            self.assertNotIn(self.CONTROL, grupo['defectos']['LB'])
            indicadores = grupo['indicadores']['LB']
            self.assertEqual(indicadores['falsos_positivos'], 1)
            self.assertAlmostEqual(indicadores['ID-2'], 1 / len(rows))
            ndefectos = sum(not i['efecto'] for c in CORPUS['casos'].values() for i in c['items'])
            self.assertAlmostEqual(indicadores['ID-1'], (ndefectos - 1) / ndefectos)
            self.assertIn(self.DEFECTO, (root / 'analisis/informe.md').read_text(encoding='utf-8'))

    def test_analisis_conserva_el_defecto_de_la_hoja_sin_metadatos_de_respuesta(self):
        rows = [dict(caso=self.DEFECTO, detectados=[]) for _ in range(3)]
        d = analisis.defectos(rows)[self.DEFECTO]
        self.assertEqual(d['n'], 3)
        self.assertEqual(d['detectado'], 0)
        self.assertTrue(d['con_problema'])


if __name__ == '__main__':
    unittest.main()
