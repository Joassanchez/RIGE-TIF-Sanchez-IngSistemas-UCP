"""MED-9c: base externa y unión estricta de fragmentos, sin Docker/red."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

import analizar
from analizar_ecologica import ECO, DET
from corregir_ecologica import validar_tanda
from test_med9 import HOJA, ROOT, captura, oraculo_fixture
from unir import unir
from verificar_base_ecologica import verificar


class FragmentosTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)

    def fragmento(self, nombre, casos, dimension='ecologica', fuera=False, cambio=None):
        root = self.root / nombre
        root.mkdir()
        meta = dict(tanda='misma', dimension=dimension, ejecutor='principal', modelo='openai/gpt-6.1-sol',
                    brazo='LB', condicion='LB', ensayo=True, fuera_del_arbol=fuera, k=1,
                    limite=600, semilla=20261015, hash_ejecutor='ejecutor', hash_hoja='hoja',
                    hash_tarifas='tarifas', hash_catalogo='catalogo', hashes_entradas={'escenarios.json': 'hash'},
                    hash_arnes='arnes', hash_extension='extension', hash_binario='binario',
                    hash_plan_ensayo='plan', exclusiones_hash=[], orden=[[c, 1] for c in casos])
        if cambio:
            meta.update(cambio)
        rows = [dict({k: meta[k] for k in ('tanda', 'dimension', 'ejecutor', 'modelo', 'brazo', 'condicion', 'ensayo', 'fuera_del_arbol', 'k', 'hash_ejecutor')},
                     caso=c, repeticion=1, intentos=[dict(captura_antes='crudo/antes', captura_despues='crudo/despues', oraculo='crudo/oraculo.json')])
                for c in casos]
        def guardar(path, dato):
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(dato), encoding='utf-8')
        if dimension == 'ecologica':
            meta.update(protocolo_oraculo='MED-9c', aislamiento_verificado=True)
            bases = {c: oraculo_fixture(HOJA['casos'][c], captura(c, 'base'), captura(c, 'base'))['antes']
                     for c in casos if 'objetivo' in HOJA['casos'][c]}
            guardar(root / 'base/indice.json', bases)
        guardar(root / 'tanda.json', meta)
        if dimension == 'ecologica':
            if any(c.startswith(('N-', 'S-')) for c in casos):
                import hashlib
                validacion = dict(valido=True, hash_base=hashlib.sha256((root / 'base/indice.json').read_bytes()).hexdigest(),
                    hash_respuestas=hashlib.sha256((ROOT / 'ecologica/respuestas-ecologica.json').read_bytes()).hexdigest())
            else:
                validacion = verificar(root, ROOT / 'ecologica/respuestas-ecologica.json')
            guardar(root / 'validacion-base.json', validacion)
            meta['base_verificada'] = validacion['hash_base']
            guardar(root / 'tanda.json', meta)
            for momento in ('inicio', 'final'):
                guardar(root / f'control-{momento}/aislamiento-ejecutor.json', dict(valido=True))
        registro = root / 'corregido.jsonl'
        registro.write_text(''.join(json.dumps(r) + '\n' for r in rows), encoding='utf-8')
        return registro

    def test_base_distingue_inicial_y_final_de_objetivo_sin_cambiar_hoja(self):
        path = self.fragmento('base', ['M-1'])
        self.assertTrue(verificar(path.parent, ROOT / 'ecologica/respuestas-ecologica.json')['valido'])
        indice = path.parent / 'base/indice.json'
        base = json.loads(indice.read_text())
        sonda = json.dumps(HOJA['casos']['M-1']['objetivo'][:3])
        base['M-1'][sonda]['decision'] = HOJA['casos']['M-1']['objetivo'][3]
        indice.write_text(json.dumps(base))
        with self.assertRaisesRegex(ValueError, 'Base distinta'):
            verificar(path.parent, ROOT / 'ecologica/respuestas-ecologica.json')

    def test_base_incompleta_y_no_validada_se_rechazan(self):
        path = self.fragmento('base', ['M-1'])
        (path.parent / 'base/indice.json').write_text('{}')
        with self.assertRaisesRegex(ValueError, 'Base incompleta'):
            verificar(path.parent, ROOT / 'ecologica/respuestas-ecologica.json')
        with self.assertRaisesRegex(ValueError, 'Base sin validación'):
            validar_tanda(path.parent, ROOT / 'ecologica/respuestas-ecologica.json')

    def test_union_completa_en_cuatro_fragmentos_y_tres_instrumentos(self):
        for dimension, fuera, casos in [('ecologica', False, ECO), ('ecologica', True, ECO[:10]), ('deteccion', False, DET)]:
            with self.subTest(dimension=dimension, fuera=fuera):
                paths = [self.fragmento(f'{dimension}-{fuera}-{n}', casos[n::4], dimension, fuera) for n in range(4)]
                originales = [p.read_bytes() for p in paths]
                rows, meta, faltantes = unir(paths)
                self.assertEqual(len(rows), len(casos))
                self.assertEqual(faltantes, [])
                self.assertTrue(meta['union_med9'])
                self.assertEqual([p.read_bytes() for p in paths], originales)
                self.assertTrue(Path(rows[0]['intentos'][0]['oraculo']).is_absolute())
                self.assertIn(str(paths[0].parent.resolve()), rows[0]['intentos'][0]['oraculo'])

    def test_union_rechaza_duplicados_faltantes_y_fragmento_truncado(self):
        a = self.fragmento('a', ['M-1'])
        b = self.fragmento('b', ['M-1'])
        with self.assertRaisesRegex(ValueError, 'Par repetido'):
            unir([a, b])
        with self.assertRaisesRegex(ValueError, 'Pares incompletos'):
            unir([a])
        a.write_text('')
        with self.assertRaisesRegex(ValueError, 'fragmento incompleto'):
            unir([a])

    def test_union_no_mezcla_tandas_versiones_parametros_o_contrastes(self):
        a = self.fragmento('a', ['V-1'])
        for campo, valor in [('semilla', 0), ('hash_arnes', 'otro'), ('hash_extension', 'otro'),
                             ('tanda', 'otra'), ('limite', 1), ('fuera_del_arbol', True),
                             ('dimension', 'deteccion')]:
            with self.subTest(campo=campo):
                b = self.fragmento(campo, ['V-2'], cambio={campo: valor})
                with self.assertRaisesRegex(ValueError, campo):
                    unir([a, b])

    def test_aislamiento_ausente_fallido_o_distinto_impide_union_y_analisis(self):
        path = self.fragmento('a', ['M-1'])
        meta_path = path.parent / 'tanda.json'
        meta = json.loads(meta_path.read_text())
        meta['aislamiento_verificado'] = False
        meta_path.write_text(json.dumps(meta))
        with self.assertRaisesRegex(ValueError, 'aislamiento'):
            unir([path])
        self.assertTrue(analizar.cargar([path])[0]['fallo_preparacion'])
        meta['aislamiento_verificado'] = True
        meta_path.write_text(json.dumps(meta))
        (path.parent / 'control-final/aislamiento-ejecutor.json').write_text('{"valido":false}')
        with self.assertRaisesRegex(ValueError, 'aislamiento'):
            unir([path])
        (path.parent / 'DETENCION.txt').write_text('fallo')
        with self.assertRaisesRegex(ValueError, 'detenida'):
            unir([path])

    def test_cli_union_y_validacion_de_sus_fuentes(self):
        paths = [self.fragmento(f'p{n}', ECO[n::4]) for n in range(4)]
        salida = self.root / 'unida/corregido.jsonl'
        r = subprocess.run([sys.executable, '-B', str(ROOT / 'herramientas/unir.py'),
                            *map(str, paths), '--salida', str(salida)], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn(f'{len(ECO)} filas de {len(ECO)}; 0 pares faltantes', r.stdout)
        validar_tanda(salida.parent, ROOT / 'ecologica/respuestas-ecologica.json')
        (paths[0].parent / 'DETENCION.txt').write_text('invalidada')
        with self.assertRaisesRegex(ValueError, 'aislamiento'):
            validar_tanda(salida.parent, ROOT / 'ecologica/respuestas-ecologica.json')

    @unittest.skipUnless(shutil.which('bash'), 'Bash no disponible')
    def test_lanzador_genera_cuatro_partes_disjuntas_completas_sin_docker(self):
        self.comprobar_lanzador(3)

    def test_lanzador_k1_incluye_nuevas_y_tres_partes_deteccion(self):
        self.comprobar_lanzador(1)

    def comprobar_lanzador(self, k):
        # BASH_ENV sustituye medición/corrección/unión. Solo los fragmentos
        # Python de selección corren realmente; no se invoca Docker.
        def ruta_shell(path):
            return '/' + path.drive[0].lower() + path.as_posix()[2:] if os.name == 'nt' else str(path)
        stub = self.root / 'stub.sh'
        stub.write_text('''bash() {
  local linea
  printf -v linea '%s|' "$@"
  printf '%s\n' "$linea" >> "$MED9C_LOG"
}
python() { if [[ $1 == - ]]; then command python "$@"; fi; }
mkdir() { :; }
''', encoding='utf-8', newline='\n')
        (self.root / 'logs').mkdir()
        for dimension, fuera, casos in [('ecologica', False, ECO), ('ecologica', True, ECO[:10]), ('deteccion', False, DET)]:
            nombre = f'{dimension}-{fuera}'
            log = self.root / (nombre + '.log')
            cmd = [shutil.which('bash'), (ROOT / 'herramientas/medir-med9c-paralelo.sh').as_posix(),
                   ruta_shell(self.root), nombre, dimension, 'principal', '--k', str(k)]
            if fuera:
                cmd.append('--fuera-del-arbol')
            r = subprocess.run(cmd, env=os.environ | {'BASH_ENV': ruta_shell(stub), 'MED9C_LOG': ruta_shell(log)},
                               capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            lineas = log.read_text().splitlines()
            partes = min(4, len(casos) * k)
            self.assertEqual(len(lineas), partes, lineas)
            vistos, destinos = set(), set()
            for linea in lineas:
                args = linea.rstrip('|').split('|')
                destinos.add(args[args.index('--destino') + 1])
                for flag, valor in [('--k', str(k)), ('--semilla', '20261015'), ('--limite', '600'), ('--tanda', nombre)]:
                    self.assertEqual(args[args.index(flag) + 1], valor)
                seleccion = args[args.index('--casos') + 1].split(',')
                pares = ({(c, int(r)) for c, r in (p.split(':') for p in args[args.index('--pares') + 1].split(','))}
                         if '--pares' in args else {(c, r) for c in seleccion for r in range(1, k + 1)})
                self.assertFalse(vistos & pares)
                vistos |= pares
            self.assertEqual(len(destinos), partes)
            self.assertEqual(vistos, {(c, r) for c in casos for r in range(1, k + 1)})


if __name__ == '__main__':
    unittest.main()
