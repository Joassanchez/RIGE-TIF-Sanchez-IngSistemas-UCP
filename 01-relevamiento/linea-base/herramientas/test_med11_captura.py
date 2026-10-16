"""Capturas parciales y errores MED-11, con el binario sustituido y sin Docker."""
from contextlib import redirect_stderr
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from test_med9 import ROOT, ESPEC, captura, oraculo_fixture


def script(nombre):
    spec = importlib.util.spec_from_file_location('med11_' + nombre, ROOT / 'verificacion/20261015-exploracion' / (nombre + '_eco.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def capturar_sin_binario(root, casos, falla=None, preparar_error=False):
    m = script('capturar')
    llamados = []
    def nativa(prefijo, momento, agentes, directorio):
        tid, variante = prefijo.parent.parent.name, prefijo.parent.name
        llamados.append((tid, variante))
        carpeta = Path(str(prefijo) + '.' + momento)
        carpeta.mkdir()
        estados = captura(tid, variante)
        for ag in agentes:
            (carpeta / f'agente-{ag}.json').write_text(json.dumps(estados[ag]), encoding='utf-8')
        (carpeta / 'archivos.json').write_text(json.dumps(estados.get('__archivos__', {})), encoding='utf-8')
        return carpeta
    def oraculo(prefijo, momento, sondas, directorio, h):
        tid, variante = prefijo.parent.parent.name, prefijo.parent.name
        if (tid, variante) == falla:
            (prefijo.parent / 'parcial.json').write_text('{"evidencia":"conservada"}')
            raise RuntimeError('ripgrep execution failed')
        return oraculo_fixture(ESPEC[tid], captura(tid, 'base'), captura(tid, variante))['despues']
    argv = ['capturar', '--salida', str(root), '--casos', casos]
    with patch.object(m.sys, 'argv', argv), patch.object(m.os, 'chdir'), patch.dict(m.os.environ), \
         patch.object(m.arnes, 'preparar', side_effect=RuntimeError('preparación fallida') if preparar_error else None), \
         patch.object(m.arnes, 'capturar', nativa), patch.object(m.arnes, 'oraculo', oraculo), patch('builtins.print'):
        codigo = m.main()
    return codigo, llamados


class CapturaTests(unittest.TestCase):
    def test_seleccion_incluye_valores_y_evaluador_respeta_excluidas(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'salida'
            codigo, llamados = capturar_sin_binario(root, 'N-7,V-7')
            self.assertEqual(codigo, 0)
            self.assertEqual({t for t, _ in llamados}, {'N-7', 'V-7'})
            self.assertFalse((root / 'N-1').exists())
            meta = json.loads((root / 'captura.json').read_text())
            self.assertEqual(meta['casos'], ['N-7', 'V-7'])
            self.assertEqual(meta['errores'], [])
            filas = script('evaluar').evaluar(ESPEC, root)
            self.assertEqual({r['tarea'] for r in filas}, {'N-7', 'V-7'})
            self.assertNotIn('error de captura', {r['resultado'] for r in filas})

    def test_error_en_base_conserva_crudos_y_continua_variantes_y_tareas(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'salida'
            codigo, llamados = capturar_sin_binario(root, 'N-7,N-1', falla=('N-7', 'base'))
            self.assertEqual(codigo, 1)
            self.assertIn('ripgrep execution failed', (root / 'N-7/base/error.txt').read_text())
            self.assertTrue((root / 'N-7/base/parcial.json').exists())
            self.assertIn(('N-7', 'correcta'), llamados)
            self.assertIn(('N-1', 'correcta'), llamados)
            filas = script('evaluar').evaluar(ESPEC, root)
            self.assertTrue(any(r['tarea'] == 'N-7' and r['resultado'] == 'error de captura' for r in filas))
            self.assertTrue(any(r['tarea'] == 'N-1' and r['variante'] == 'correcta' and r['resultado'] == 'correcta' for r in filas))
            self.assertFalse(any(r['tarea'] == 'N-7' and r['resultado'] == 'correcta' for r in filas))

    def test_error_de_variante_no_se_admite_y_cli_devuelve_uno(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'salida'
            capturar_sin_binario(root, 'N-1,N-2', falla=('N-1', 'ingenua_merge'))
            # Aun si quedó JSON legible, error.txt prevalece sobre esos artefactos.
            p = root / 'N-1/ingenua_merge/oraculo.json'
            p.write_text(json.dumps(oraculo_fixture(ESPEC['N-1'], captura('N-1', 'base'), captura('N-1', 'ingenua_merge'))['despues']))
            r = subprocess.run([sys.executable, str(ROOT / 'verificacion/20261015-exploracion/evaluar_eco.py'), str(root)],
                               capture_output=True, text=True)
            self.assertEqual(r.returncode, 1, r.stderr)
            self.assertIn('error de captura', r.stdout)
            self.assertIn('N-2 correcta correcta', r.stdout)
            admision = json.loads((root / 'admision.json').read_text(encoding='utf-8'))
            self.assertFalse(admision['valido'])
            self.assertEqual(len(admision['errores_captura']), 1)
            self.assertIn('N-1/ingenua_merge/error.txt', {p.replace('\\', '/') for p in admision['hashes_evidencia']})

    def test_error_de_preparacion_y_error_a_nivel_tarea_no_abortan(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'salida'
            codigo, llamados = capturar_sin_binario(root, 'N-1,N-2', preparar_error=True)
            self.assertEqual(codigo, 1)
            self.assertEqual(llamados, [])
            self.assertTrue((root / 'N-1/base/error.txt').exists())
            self.assertTrue((root / 'N-2/ingenua_cercana/error.txt').exists())
            (root / 'N-1/error.txt').write_text('error de tarea')
            filas = script('evaluar').evaluar(ESPEC, root)
            self.assertTrue(any(r['tarea'] == 'N-1' and r['variante'] == 'tarea' for r in filas))
            self.assertTrue(any(r['tarea'] == 'N-2' and r['resultado'] == 'error de captura' for r in filas))

    def test_casos_invalidos_no_preparan_ni_crean_salida(self):
        m = script('capturar')
        with tempfile.TemporaryDirectory() as tmp:
            for seleccion in ('', 'N-8', 'N-1,N-1', 'M-1', 'N-1,'):
                with self.subTest(seleccion=seleccion):
                    root = Path(tmp) / 'salida'
                    with patch.object(m.sys, 'argv', ['capturar', '--salida', str(root), '--casos', seleccion]), \
                         patch.object(m.arnes, 'preparar') as preparar, redirect_stderr(io.StringIO()):
                        with self.assertRaises(SystemExit) as error:
                            m.main()
                    self.assertEqual(error.exception.code, 2)
                    preparar.assert_not_called()
                    self.assertFalse(root.exists())

    def test_captura_incompleta_sin_error_txt_tambien_se_lista(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'salida'
            capturar_sin_binario(root, 'N-1,N-2')
            (root / 'N-1/base/oraculo.json').unlink()
            filas = script('evaluar').evaluar(ESPEC, root)
            self.assertTrue(any(r['tarea'] == 'N-1' and r['resultado'] == 'error de captura' for r in filas))
            self.assertTrue(any(r['tarea'] == 'N-2' and r['resultado'] == 'correcta' for r in filas))

    def test_ripgrep_fijado_sin_cambiar_base_ni_descargar_otro_binario(self):
        texto = (ROOT / 'vm/Dockerfile').read_text(encoding='utf-8')
        self.assertIn('ARG UBUNTU_DIGEST=sha256:88a381d5b5eeb2b35d3ad70925a362c37ce569daf43ede89ff818ec20e4d3794', texto)
        self.assertIn('FROM ubuntu:26.04@${UBUNTU_DIGEST}', texto)
        self.assertIn('ARG RIPGREP_DEB_VERSION=15.1.0-1ubuntu1', texto)
        self.assertIn('ripgrep="${RIPGREP_DEB_VERSION}"', texto)
        self.assertIn('command -v rg', texto)
        self.assertNotIn('releases/download', texto)


if __name__ == '__main__':
    unittest.main()
