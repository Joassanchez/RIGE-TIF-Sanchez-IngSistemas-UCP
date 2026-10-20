"""MED-13-c4: tar y enlaces sintéticos; nunca Docker, modelos ni git."""
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest
from unittest.mock import patch

from evidencia_portable import archivos, descriptor, extraer, leer_texto
from analizar_sondas import contenido_archivo
from corregir_ecologica import capturas, corregir
from test_med9 import ROOT, HOJA, captura, oraculo_fixture


def crear_tar(path, miembros):
    with tarfile.open(path, 'w', format=tarfile.PAX_FORMAT) as tar:
        for nombre, tipo, contenido in miembros:
            m = tarfile.TarInfo(nombre)
            m.type = tipo
            if tipo in (tarfile.SYMTYPE, tarfile.LNKTYPE):
                m.linkname = contenido
                tar.addfile(m)
            else:
                data = contenido.encode('utf-8')
                m.size = len(data)
                tar.addfile(m, io.BytesIO(data))
    return hashlib.sha256(path.read_bytes()).hexdigest()


class PortableTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory(prefix='med13 c4 ')
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.tar = self.root / 'integra.tar'
        self.out = self.root / 'extraida'

    def test_1_tar_conserva_enlaces_extraccion_sin_symlink_y_hash_integro(self):
        sha = crear_tar(self.tar, [('archivo', tarfile.REGTYPE, 'original'),
            ('link', tarfile.SYMTYPE, 'archivo'), ('duro', tarfile.LNKTYPE, 'archivo'),
            ('colgante', tarfile.SYMTYPE, '../../no-existe')])
        with patch.object(Path, 'symlink_to', side_effect=AssertionError('Sin privilegios de enlaces')):
            self.assertEqual(extraer(self.tar, self.out, sha), sha)
        with tarfile.open(self.tar) as t:
            self.assertTrue(t.getmember('link').issym())
            self.assertEqual(t.getmember('link').linkname, 'archivo')
        self.assertEqual(json.loads(descriptor(self.out / 'link').read_text()), dict(tipo='enlace', destino='archivo'))
        self.assertFalse((self.out / 'link').exists())
        self.assertEqual(leer_texto(self.out / 'link', self.out), 'original')
        self.assertEqual(leer_texto(self.out / 'duro', self.out), 'original')
        self.assertEqual(hashlib.sha256(self.tar.read_bytes()).hexdigest(), sha)
        self.assertEqual(Path(str(self.tar) + '.sha256').read_text().split()[0], sha)
        with self.assertRaises(ValueError):
            leer_texto(self.out / 'colgante', self.out)

    def test_1_hash_distinto_detiene_antes_de_extraer(self):
        crear_tar(self.tar, [('archivo', tarfile.REGTYPE, 'original')])
        with self.assertRaisesRegex(ValueError, 'SHA-256'):
            extraer(self.tar, self.out, '0' * 64)
        self.assertFalse(self.out.exists())

    def test_1_tar_no_puede_escapar_colisionar_o_escribir_bajo_un_enlace(self):
        for miembros in [[('../afuera', tarfile.REGTYPE, 'x')], [('/absoluto', tarfile.REGTYPE, 'x')],
                [('C:/ruta', tarfile.REGTYPE, 'x')], [('a', tarfile.SYMTYPE, '../fuera'), ('a/x', tarfile.REGTYPE, 'x')],
                [('A', tarfile.REGTYPE, 'x'), ('a', tarfile.REGTYPE, 'y')],
                [('a', tarfile.SYMTYPE, 'x'), ('a.enlace.json', tarfile.REGTYPE, '{}')]]:
            with self.subTest(miembros=miembros):
                sha = crear_tar(self.tar, miembros)
                with self.assertRaises(ValueError):
                    extraer(self.tar, self.out, sha)
                self.assertFalse(self.out.exists())

    def test_1_ciclo_de_descriptores_no_se_sigue(self):
        sha = crear_tar(self.tar, [('a', tarfile.SYMTYPE, 'b'), ('b', tarfile.SYMTYPE, 'a')])
        extraer(self.tar, self.out, sha)
        with self.assertRaisesRegex(ValueError, 'Ciclo'):
            leer_texto(self.out / 'a', self.out)

    def test_1_corregir_N_11_y_analizar_diff_desde_descriptores(self):
        miembros = []
        estados = [captura('N-11', v) for v in ('base', 'correcta')]
        for momento, datos in zip(('antes', 'despues'), estados):
            for ag, dato in datos.items():
                if ag == '__archivos__':
                    miembros.append((f'crudo/n.{momento}/archivos.json', tarfile.REGTYPE, json.dumps(dato)))
                else:
                    miembros.append((f'data/{ag}-{momento}.json', tarfile.REGTYPE, json.dumps(dato)))
                    miembros.append((f'crudo/n.{momento}/agente-{ag}.json', tarfile.SYMTYPE, f'../../data/{ag}-{momento}.json'))
        inicial, final = '{"permission":{"bash":"deny"}}\n', '{"permission":{"bash":"ask"}}\n'
        miembros += [('crudo/n.archivos-antes/global/opencode.json', tarfile.SYMTYPE, '../../proyecto/.opencode/compartida.json'),
                     ('crudo/n.archivos-antes/proyecto/.opencode/compartida.json', tarfile.REGTYPE, inicial)]
        sha = crear_tar(self.tar, miembros)
        extraer(self.tar, self.out, sha)
        antes, despues = capturas(self.out, dict(captura_antes='crudo/n.antes', captura_despues='crudo/n.despues'))
        self.assertEqual([antes, despues], estados)
        oraculo = oraculo_fixture(HOJA['casos']['N-11'], *estados)
        r = corregir(dict(respuesta_textual='{"hecho":true,"cambios":[],"impedimento":""}'),
                     HOJA['casos']['N-11'], antes, despues, oraculo)
        self.assertEqual(r['resultado'], 'correcta')
        ruta = '/home/participante/.config/opencode/opencode.json'
        row = dict(_directorio_registro=str(self.out), herramientas=[dict(estado='completed',
            herramienta='edit', metadata=dict(files=[dict(filePath=ruta,
                patch='@@ -1 +1 @@\n-' + inicial + '+' + final)]))])
        archivo = dict(archivo=ruta, despues=['file', hashlib.sha256(final.encode()).hexdigest()])
        self.assertEqual(contenido_archivo(row, dict(captura_antes='crudo/n.antes'), archivo), final)
        self.assertEqual([p.name for p in archivos(self.out / 'crudo/n.antes', 'agente-*.json')],
                         sorted('agente-' + ag + '.json' for ag in antes if not ag.startswith('__')))


@unittest.skipUnless(shutil.which('bash'), 'Bash no disponible')
class LanzadorPortableTests(unittest.TestCase):
    def test_1_todos_los_resultados_via_tar_con_fase_base_y_fallos(self):
        with tempfile.TemporaryDirectory(prefix='med13c4-shell-') as tmp:
            root = Path(tmp)
            tar = root / 'contenedor.tar'
            sha = crear_tar(tar, [('codigo-salida.txt', tarfile.REGTYPE, '0\n'),
                ('ensayo/crudo/global/opencode.json', tarfile.SYMTYPE, '../../proyecto/.opencode/compartida.json'),
                ('ensayo/registro.jsonl', tarfile.REGTYPE, 'registro sintético\n')])
            def shell(p):
                return '/' + p.drive[0].lower() + p.as_posix()[2:] if os.name == 'nt' else str(p)
            stub = root / 'stub.sh'
            stub.write_text('''docker() {
 printf '%s|' "$@" >> "$MED13_LOG"; printf '\\n' >> "$MED13_LOG"
 if [[ $1 == exec && $3 == sha256sum ]]; then printf '%s  evidencia.tar\\n' "$MED13_SHA"
 elif [[ $1 == cp && $2 == *:/tmp/rige-evidencia-* ]]; then cp "$MED13_TAR" "$3"
 elif [[ $1 == exec && $3 == /opt/linea-base/medir.sh && $* != *--preparar-base* ]]; then return "${MED13_CODIGO:-0}"; fi
}
python() {
 if [[ $1 == *verificar_base_ecologica.py ]]; then printf '%064d\\n' 0
 else "$MED13_PYTHON" "$@"; fi
}
''', encoding='utf-8', newline='\n')
            for caso in ('verificar', 'permisos', 'atribucion', 'modificacion', 'deteccion', 'ecologica', 'fallida'):
                with self.subTest(caso=caso):
                    out = root / caso
                    out.mkdir()
                    log = root / (caso + '.log')
                    env = os.environ | dict(BASH_ENV=shell(stub), MED13_LOG=shell(log), MED13_TAR=shell(tar),
                        MED13_SHA=sha, MED13_PYTHON=sys.executable.replace('\\', '/'), PYTHON='python',
                        OPENCODE_AUTH_JSON='', MED13_CODIGO='7' if caso == 'fallida' else '0')
                    env.pop('RIGE_EVIDENCIA_ADMISION', None)
                    args = [caso, 'todos', shell(out)] if caso in ('verificar', 'permisos') else [
                        'medir', '--ensayo', '--dimension', 'ecologica' if caso == 'fallida' else caso, '--destino', shell(out)]
                    r = subprocess.run([shutil.which('bash'), (ROOT / 'vm/contenedor.sh').as_posix(), *args],
                        cwd=ROOT, env=env, capture_output=True, text=True)
                    self.assertEqual(r.returncode, 7 if caso == 'fallida' else 0, r.stderr)
                    salidas = [l.split('|')[1] for l in log.read_text().splitlines()
                               if l.startswith('cp|') and l.split('|')[1].startswith('rige-')]
                    self.assertTrue(salidas)
                    self.assertTrue(all(s.endswith('.tar') and ':/tmp/rige-evidencia-' in s for s in salidas))
                    self.assertEqual(len(salidas), 2 if caso in ('ecologica', 'fallida') else 1)
                    self.assertTrue(list(out.glob('*.tar.sha256')))
                    self.assertTrue((out / 'ensayo/crudo/global/opencode.json.enlace.json').is_file())
                    self.assertFalse((out / 'ensayo/crudo/global/opencode.json').exists())


if __name__ == '__main__':
    unittest.main()
