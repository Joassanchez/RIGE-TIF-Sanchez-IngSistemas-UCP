"""MED-19: los clientes Docker y los agentes se sustituyen por funciones de shell."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from hoja_final import ROOT
import preparar_final
from preparar_final import preparar
from unir import unir


def shell(p):
    return '/' + p.drive[0].lower() + p.as_posix()[2:] if os.name == 'nt' else str(p)


class EntradasTests(unittest.TestCase):
    def test_textos_ejecutables_LF_y_binario_sin_conversion(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            fuente = root / 'fuente'
            archivos = {
                'vm/medir.sh': b'#!/bin/bash\r\ncat <<\'FIN\'\r\ntexto\r\nFIN\r\n',
                'vm/simulado/ecologica.py': b'print("ejemplo")\r\n',
                'vm/simulado/captura-sistema.mjs': b'console.log("ejemplo");\r\n',
                'ecologica/final/instrucciones/disponible.txt': b'Texto exacto del ingeniero\r\n',
                'ecologica/final/planes-ecologica.json': b'{"ensayo":true}\r\n',
                'ecologica/final/planes-deteccion.json': b'{"ensayo":true}\r\n',
            }
            for rel, contenido in archivos.items():
                path = fuente / rel
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(contenido)
            binario = root / 'rige-linux'
            contenido_binario = b'\x7fELF\x00\r\nSIN CONVERSION\x00'
            binario.write_bytes(contenido_binario)
            binario.chmod(0o600)
            with patch.object(preparar_final, 'ROOT', fuente), patch.object(preparar_final, 'ENVOLTORIO', preparar_final.ENVOLTORIO.replace('\n', '\r\n')):
                preparar(root / 'salida', 'indicado', binario, 'etiqueta-sintetica')
            salida = root / 'salida'
            for rel in ('medir.sh', 'simulado/ecologica.py', 'simulado/captura-sistema.mjs'):
                self.assertNotIn(b'\r\n', (salida / 'arnes' / rel).read_bytes())
            self.assertNotIn(b'\r\n', (salida / 'rige-wrapper').read_bytes())
            self.assertNotIn(b'\r\n', (salida / 'arnes/entradas-final.json').read_bytes())
            self.assertEqual((salida / 'rige-binario').read_bytes(), contenido_binario)
            self.assertEqual((salida / 'arnes/instrucciones-final/disponible.txt').read_bytes(), archivos['ecologica/final/instrucciones/disponible.txt'])
            for rel, contenido in archivos.items():
                self.assertEqual((fuente / rel).read_bytes(), contenido)
            inventario = json.loads((salida / 'arnes/entradas-final.json').read_bytes())
            for rel, digest in inventario['archivos'].items():
                self.assertEqual(hashlib.sha256((salida / 'arnes' / rel).read_bytes()).hexdigest(), digest)

    def test_inventario_arnes_instrucciones_binario_y_etiqueta(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            binario = root / 'binario'
            binario.write_bytes(b'BINARIO DE ENSAYO, NO EJECUTABLE')
            for brazo in ('LB', 'sin_rige', 'indicado', 'disponible', 'probar'):
                destino = root / brazo
                digest = preparar(destino, brazo, binario, 'etiqueta-sintetica')
                path = destino / 'arnes/entradas-final.json'
                self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), digest)
                datos = json.loads(path.read_text())
                self.assertIn('medir.sh', datos['archivos'])
                self.assertIn('simulado/ecologica.py', datos['archivos'])
                self.assertIn('instrucciones-final/indicado-ecologica.txt', datos['archivos'])
                for rel, sha in datos['archivos'].items():
                    self.assertEqual(hashlib.sha256((destino / 'arnes' / rel).read_bytes()).hexdigest(), sha)
                self.assertEqual('rige' in datos, brazo in ('indicado', 'disponible'))
                if 'rige' in datos:
                    self.assertEqual(datos['rige']['hash_rige'], hashlib.sha256(binario.read_bytes()).hexdigest())
                    self.assertEqual(datos['rige']['etiqueta_rige'], 'etiqueta-sintetica')
                    wrapper = (destino / 'rige-wrapper').read_text()
                    self.assertIn("printf -v cmd '%q ' /opt/rige/rige \"$@\"", wrapper)
                    self.assertIn('exec como-dev "$cmd"', wrapper)
            with self.assertRaises(ValueError):
                preparar(root / 'invalido', 'indicado')


@unittest.skipUnless(shutil.which('bash'), 'Bash no disponible')
class LanzadorTests(unittest.TestCase):
    def test_cygpath_normaliza_sin_perder_punto_docker_y_no_convierte_linux(self):
        with tempfile.TemporaryDirectory(prefix='med19 espacios ') as tmp:
            root = Path(tmp)
            destino = root / 'evidencia'
            destino.mkdir()
            binario = root / 'rige linux'
            binario.write_bytes(b'\x7fELF\r\nBINARIO SINTETICO')
            binario.chmod(0o600)
            stub = root / 'stub.sh'
            stub.write_text('''cygpath() {
 [[ $1 == -m ]] || return 9
 printf '%s\\n' "$2" >> "$MED19_RUTAS"
 case "$2" in /opt/*|/usr/local/*|*:/opt/*|*:/tmp/*) return 8 ;; esac
 "$MED19_PYTHON" -c 'import posixpath,sys; p=sys.argv[1]; p=p[1].upper()+":"+p[2:] if len(p)>2 and p[0]=="/" and p[2]=="/" and p[1].isalpha() else p; print(posixpath.normpath(p))' "$2"
}
docker() {
 [[ $MSYS_NO_PATHCONV == 1 && $MSYS2_ARG_CONV_EXCL == '*' ]] || return 7
 printf '%s|' "$@" >> "$MED19_LOG"; printf '\\n' >> "$MED19_LOG"
 if [[ $1 == image ]]; then printf 'sha256:a691196f0e3e0000000000000000000000000000000000000000000000000000\\n'
 elif [[ $1 == exec && $3 == sha256sum ]]; then printf '%064d  evidencia.tar\\n' 0; fi
}
python() {
 if [[ $1 == *preparar_final.py ]]; then "$MED19_PYTHON" "$@"
 elif [[ $1 == *verificar_base_ecologica.py ]]; then printf '%064d\\n' 0; fi
}
''', encoding='utf-8', newline='\n')
            env = os.environ | dict(BASH_ENV=shell(stub), MED19_RUTAS=shell(root / 'rutas.log'),
                MED19_LOG=shell(root / 'docker.log'), MED19_PYTHON=sys.executable.replace('\\', '/'),
                PYTHON='python', OPENCODE_AUTH_JSON='', RIGE_BINARIO=str(binario), RIGE_ETIQUETA='etiqueta-sintetica')
            env.pop('RIGE_EVIDENCIA_ADMISION', None)
            r = subprocess.run([shutil.which('bash'), (ROOT / 'vm/contenedor.sh').as_posix(), 'medir', '--ensayo',
                '--dimension', 'ecologica', '--hoja', 'final', '--brazo', 'indicado', '--casos', 'R-1', '--destino', shell(destino)],
                cwd=ROOT, env=env, capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            comandos = [l.rstrip('|').split('|') for l in (root / 'docker.log').read_text().splitlines()]
            copia = next(c for c in comandos if c[0] == 'cp' and '/arnes' in c[1])
            self.assertTrue(copia[1].endswith('/arnes/.'), copia)
            self.assertTrue(copia[2].endswith(':/opt/linea-base/'), copia)
            rutas = (root / 'rutas.log').read_text().splitlines()
            self.assertFalse(any('/arnes/.' in p for p in rutas), rutas)
            self.assertFalse(any(p.startswith(('/opt/', '/usr/local/')) or ':/' in p and not p[1:3] == ':/' for p in rutas), rutas)
            chmod = next(i for i, c in enumerate(comandos) if c[0] == 'exec' and c[2:] == ['chmod', '755', '/opt/rige/rige', '/usr/local/bin/rige'])
            primera_medida = next(i for i, c in enumerate(comandos) if c[0] == 'exec' and c[2] == '/opt/linea-base/medir.sh')
            self.assertLess(chmod, primera_medida)

    def test_final_copia_antes_de_base_y_respuestas_en_anfitrion(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            stub = root / 'stub.sh'
            stub.write_text('''docker() {
 printf '%s|' "$@" >> "$MED19_LOG"; printf '\\n' >> "$MED19_LOG"
 if [[ $1 == image ]]; then printf 'sha256:a691196f0e3e0000000000000000000000000000000000000000000000000000\\n'
 elif [[ $1 == exec && $3 == sha256sum ]]; then printf '%064d  evidencia.tar\\n' 0; fi
}
python() {
 printf '%s|' "$@" >> "$MED19_PYLOG"; printf '\\n' >> "$MED19_PYLOG"
 if [[ $1 == *preparar_final.py ]]; then "$MED19_PYTHON" "$@"
 elif [[ $1 == *verificar_base_ecologica.py ]]; then printf '%064d\\n' 0; fi
}
''', encoding='utf-8', newline='\n')
            binario = root / 'rige'
            binario.write_bytes(b'NO ES UN BINARIO REAL')
            for b in ('LB', 'sin_rige', 'indicado', 'disponible', 'probar'):
                destino = root / b
                destino.mkdir()
                log, pylog = root / (b + '.log'), root / (b + '.python.log')
                env = os.environ | dict(BASH_ENV=shell(stub), MED19_LOG=shell(log), MED19_PYLOG=shell(pylog),
                    MED19_PYTHON=sys.executable.replace('\\', '/'), PYTHON='python', OPENCODE_AUTH_JSON='',
                    RIGE_BINARIO=str(binario), RIGE_ETIQUETA='etiqueta-inventada')
                env.pop('RIGE_EVIDENCIA_ADMISION', None)
                r = subprocess.run([shutil.which('bash'), (ROOT / 'vm/contenedor.sh').as_posix(), 'medir', '--ensayo',
                    '--dimension', 'ecologica', '--hoja', 'final', '--brazo', b, '--casos', 'R-1', '--destino', shell(destino)],
                    cwd=ROOT, env=env, capture_output=True, text=True)
                self.assertEqual(r.returncode, 0, r.stderr)
                lineas = log.read_text().splitlines()
                copia = next(i for i, l in enumerate(lineas) if 'entradas-final/arnes' in l)
                base = next(i for i, l in enumerate(lineas) if '--preparar-base' in l)
                self.assertLess(copia, base)
                self.assertTrue(any('chmod|-R|700' in l for l in lineas))
                self.assertTrue(any('/ecologica/final/escenarios.json' in l for l in lineas))
                self.assertFalse(any('respuestas-' in l or 'espec_final.py' in l for l in lineas))
                self.assertTrue(any('--hash-entradas-final' in l for l in lineas))
                self.assertEqual(any('/opt/rige/rige' in l for l in lineas), b in ('indicado', 'disponible'))
                verificador = next(l for l in pylog.read_text().splitlines() if 'verificar_base_ecologica.py' in l)
                self.assertIn('/ecologica/final/respuestas-ecologica.json', verificador)


class UnionTests(unittest.TestCase):
    def fragmento(self, root, nombre, casos, brazo='sin_rige'):
        carpeta = root / nombre
        carpeta.mkdir()
        meta = dict(tanda='misma', dimension='ecologica', ejecutor='principal', modelo='openai/gpt-6.1-sol',
            brazo=brazo, condicion='FIN', ensayo=True, fuera_del_arbol=False, k=3, hoja='final',
            limite=600, semilla=20261015, hash_ejecutor='ejecutor', hash_hoja=None, hash_tarifas='tarifas', hash_catalogo='catalogo',
            hashes_entradas={}, hash_arnes='arnes', hash_extension='extension', hash_binario='binario', hash_plan_ensayo='plan',
            exclusiones_hash=[], protocolo_oraculo='MED-9c', regla_acceso_web='ADR-094', orden=[[c, r] for c in casos for r in (1, 2, 3)])
        (carpeta / 'tanda.json').write_text(json.dumps(meta))
        filas = [dict({k: meta[k] for k in ('tanda', 'dimension', 'ejecutor', 'modelo', 'brazo', 'condicion', 'ensayo', 'fuera_del_arbol', 'k', 'hash_ejecutor')},
                      caso=c, repeticion=r) for c, r in meta['orden']]
        path = carpeta / 'registro.jsonl'
        path.write_text(''.join(json.dumps(r) + '\n' for r in filas))
        return path

    def test_pares_completos_R_y_dos_validaciones_con_hoja_final(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            a, b = self.fragmento(root, 'a', ['R-1']), self.fragmento(root, 'b', ['R-2'])
            respuestas = ROOT / 'ecologica/final/respuestas-ecologica.json'
            with patch('corregir_ecologica.validar_tanda') as validar:
                filas, meta, _ = unir([a, b], ['R-1', 'R-2'], respuestas)
                self.assertEqual(len(filas), 6)
                self.assertEqual(validar.call_count, 4)
                self.assertTrue(all(c.args[1] == respuestas for c in validar.call_args_list))
                with self.assertRaisesRegex(ValueError, 'Pares incompletos'):
                    unir([a], ['R-1', 'R-2'], respuestas)
                otra = self.fragmento(root, 'otra', ['R-2'], 'probar')
                with self.assertRaisesRegex(ValueError, 'brazo'):
                    unir([a, otra], ['R-1', 'R-2'], respuestas)


if __name__ == '__main__':
    unittest.main()
