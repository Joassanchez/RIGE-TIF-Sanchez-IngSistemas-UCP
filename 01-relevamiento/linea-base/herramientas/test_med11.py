"""Exploración MED-11: integridad histórica, conjunciones y reporte k=1."""
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
import test_med9
from test_med9 import ROOT, ESPEC, HOJA, PUBLICO, captura, fila, oraculo_fixture


class ExploracionTests(unittest.TestCase):
    def test_captura_y_evaluacion_completas_con_binario_sustituido(self):
        # Prueba del formato de artefactos; NO es evidencia nativa de OpenCode.
        spec = importlib.util.spec_from_file_location('captura_med11_fixture', ROOT / 'verificacion/20261015-exploracion/capturar_eco.py')
        m = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(m)
        spec = importlib.util.spec_from_file_location('evaluacion_med11_fixture', ROOT / 'verificacion/20261015-exploracion/evaluar_eco.py')
        evaluador = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(evaluador)
        def datos(prefijo):
            return prefijo.parent.parent.name, prefijo.parent.name
        def capturar(prefijo, momento, agentes, directorio):
            tid, variante = datos(prefijo)
            out = Path(str(prefijo) + '.' + momento)
            out.mkdir()
            estados = captura(tid, variante)
            for ag in agentes:
                (out / f'agente-{ag}.json').write_text(json.dumps(estados[ag]), encoding='utf-8')
            (out / 'archivos.json').write_text(json.dumps(estados.get('__archivos__', {})), encoding='utf-8')
            return out
        def oraculo(prefijo, momento, sondas, directorio, h):
            tid, variante = datos(prefijo)
            return oraculo_fixture(ESPEC[tid], captura(tid, 'base'), captura(tid, variante))['despues']
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'salida'
            with patch.object(m.sys, 'argv', ['capturar', '--salida', str(root)]), \
                 patch.object(m.os, 'chdir'), patch.dict(m.os.environ), \
                 patch.object(m.arnes, 'preparar'), patch.object(m.arnes, 'capturar', capturar), \
                 patch.object(m.arnes, 'oraculo', oraculo), patch('builtins.print'):
                m.main()
            filas = evaluador.evaluar(ESPEC, root)
            self.assertEqual(len({r['tarea'] for r in filas}), 27)
            self.assertEqual({r['tipo'] for r in filas}, {'permiso', 'valor'})

    def test_valores_exploratorios_no_se_miden_sin_admision(self):
        from verificar_base_ecologica import verificar
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'base').mkdir()
            (root / 'base/indice.json').write_text('{}')
            (root / 'tanda.json').write_text('{"orden":[["V-7",1]]}')
            with self.assertRaises(OSError):
                verificar(root, ROOT / 'ecologica/respuestas-ecologica.json', exploracion=root / 'sin-admision')

    def test_conserva_tareas_y_corpus_historicos(self):
        antes = json.loads((ROOT / 'verificacion/20261015-exploracion/antecedente.json').read_text(encoding='utf-8'))
        for tid, t in antes['tareas_originales'].items():
            self.assertEqual(json.loads(json.dumps({k: v for k, v in ESPEC[tid].items() if k not in ('estrato', 'familia')})), t)
        # ADR-098 amplía el código del corpus y retira la hoja de la instrucción;
        # los tres escenarios originales siguen intactos (test_med12, P-9).
        self.assertNotIn('N-8', ESPEC)

    def test_sintomas_y_directorio_sin_filtrar_respuestas(self):
        for tid in ('S-1', 'S-2', 'S-3'):
            t = ESPEC[tid]
            for k in ('archivos', 'objetivo', 'guardas', 'variantes'):
                self.assertEqual(t[k], ESPEC[t['origen']][k])
        self.assertEqual(PUBLICO['dimensiones']['ecologica']['N-2']['directorio'], 'sub')
        self.assertEqual(set(analisis.ECO), set(PUBLICO['dimensiones']['ecologica']))

    def test_conjuncion_y_guardas_en_todas_las_variantes_sinteticas(self):
        for tid, t in ESPEC.items():
            if not tid.startswith(('N-', 'S-')) and not t.get('candidato'):
                continue
            base = captura(tid, 'base')
            inicial = eco.observar_captura(base, t)
            self.assertNotEqual(inicial['objetivo'], eco.esperado_objetivo(t), tid)
            for v in t['variantes']:
                with self.subTest(tarea=tid, variante=v):
                    final = captura(tid, v)
                    r = eco.corregir(fila(tid), t, base, final, oraculo_fixture(t, base, final))
                    if v == 'correcta':
                        self.assertEqual(r['resultado'], 'correcta')
                    else:
                        self.assertNotEqual(r['resultado'], 'correcta')
                        self.assertTrue(r['exito_declarado_falso'])
        t = ESPEC['N-6']
        base, final = captura('N-6', 'base'), captura('N-6', 'correcta')
        oracle = oraculo_fixture(t, base, final)
        del oracle['despues'][eco.clave(t['objetivos_adicionales'][0])]
        self.assertTrue(eco.corregir(fila('N-6'), t, base, final, oracle)['fallo_preparacion'])

    def test_k1_eco_sin_umbral_y_deteccion_binaria(self):
        for dim in ('ecologica', 'deteccion'):
            rows = [dict(r, k=1) for r in test_med9.AnalisisTests().rows(dim) if r['repeticion'] == 1]
            if dim == 'ecologica':
                for r in rows:
                    r['exito_declarado_falso'] = r['caso'] in ('N-1', 'S-3', 'N-5')
            datos = analisis.analizar_med9(rows, dim)
            g = datos['grupos']['principal|openai/gpt-6.1-sol']
            self.assertTrue(g['valida'])
            self.assertIsNone(g['rama_respaldo'])
            md = analisis.markdown_med9(datos)
            self.assertFalse(g['criterio_aplicable'])
            if dim == 'ecologica':
                self.assertNotIn('ID-1', md)
                self.assertIn('falló en la única ejecución', md)
                self.assertEqual(set(g['mecanismos_exito_declarado_falso']), {'N-1', 'N-5'})
            else:
                self.assertIn('detectado o no', md)
                rows[0]['detectados'].remove('D1')
                g = analisis.analizar_med9(rows, dim)['grupos']['principal|openai/gpt-6.1-sol']
                self.assertFalse(g['defectos']['LB']['D1']['ID_1'])

    def test_admision_exige_todos_los_contrastes(self):
        spec = importlib.util.spec_from_file_location('admision_med11', ROOT / 'verificacion/20261015-exploracion/evaluar_eco.py')
        m = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(m)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for tid, t in ESPEC.items():
                if not tid.startswith(('N-', 'S-')) and not t.get('candidato'):
                    continue
                base = captura(tid, 'base')
                for v in ['base', *t['variantes']]:
                    final = captura(tid, v)
                    d = root / tid / v
                    d.mkdir(parents=True)
                    (d / 'oraculo.json').write_text(json.dumps(oraculo_fixture(t, base, final).get('despues', {})), encoding='utf-8')
                    for ag, dato in final.items():
                        nombre = 'archivos.json' if ag == '__archivos__' else f'agente-{ag}.json'
                        (d / nombre).write_text(json.dumps(dato), encoding='utf-8')
            filas = m.evaluar(ESPEC, root)
            self.assertTrue(filas)
            path = root / 'N-7/correcta/oraculo.json'
            datos = json.loads(path.read_text())
            datos[eco.clave(ESPEC['N-7']['objetivos_adicionales'][0])]['decision'] = 'allow'
            path.write_text(json.dumps(datos))
            with self.assertRaises(ValueError):
                m.evaluar(ESPEC, root)

    def test_valores_separados_no_invalidan_controles_ni_cuentan_como_permisos(self):
        rows = [dict(r, k=1) for r in test_med9.AnalisisTests().rows('ecologica') if r['repeticion'] == 1]
        for r in rows:
            if r['caso'] == 'V-7':
                r.update(exito_declarado_falso=True, resultado='sin_efecto')
        datos = analisis.analizar_med9(rows, 'ecologica')
        g = datos['grupos']['principal|openai/gpt-6.1-sol']
        self.assertTrue(g['valida'])
        self.assertEqual(g['tareas_E2_con_problema_LB'], ['V-7'])
        self.assertEqual(g['mecanismos_exito_declarado_falso'], {})
        self.assertIn('V-7', g['valores_exploratorios']['LB'])
        self.assertIn('### Valores', analisis.markdown_med9(datos))

    def test_prompt_y_enlace_se_observan_sin_inferir_respuesta_del_modelo(self):
        t = ESPEC['V-7']
        base = captura('V-7', 'base')
        r = eco.corregir(fila('V-7'), t, base, base, {})
        self.assertFalse(r['objetivo_alcanzado'])
        final = captura('V-7', 'correcta')
        self.assertEqual(eco.corregir(fila('V-7'), t, base, final, {})['resultado'], 'correcta')
        t = ESPEC['N-11']
        base, final = captura('N-11', 'base'), captura('N-11', 'ingenua_reemplaza_enlace')
        r = eco.corregir(fila('N-11'), t, base, final, oraculo_fixture(t, base, final))
        self.assertEqual(r['resultado'], 'colateral')
        self.assertTrue(r['exito_declarado_falso'])
        del final['__archivos__']
        self.assertTrue(eco.corregir(fila('N-11'), t, base, final, oraculo_fixture(t, base, final))['fallo_preparacion'])

    def test_tope_y_correspondencia_de_valores(self):
        candidatos = [c for c, t in ESPEC.items() if c.startswith(('N-', 'S-')) or t.get('candidato')]
        self.assertGreater(len(candidatos) + 1, 23)  # ADR-098 retira el tope.
        self.assertEqual({t['candidato']: c for c, t in ESPEC.items() if c.startswith('V-') and t.get('candidato')},
                         {f'N-{n}': f'V-{n-11}' for n in range(16, 20)})


if __name__ == '__main__':
    unittest.main()
