"""MED-9c: base externa y unión estricta de fragmentos, sin Docker/red."""
import ast
import json
import random
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
        if not cambio or 'orden' not in cambio:
            meta['orden'] = [[c, r] for c in casos for r in range(1, meta['k'] + 1)]
        rows = [dict({k: meta[k] for k in ('tanda', 'dimension', 'ejecutor', 'modelo', 'brazo', 'condicion', 'ensayo', 'fuera_del_arbol', 'k', 'hash_ejecutor')},
                     caso=c, repeticion=r, intentos=[dict(captura_antes='crudo/antes', captura_despues='crudo/despues', oraculo='crudo/oraculo.json')])
                for c, r in meta['orden']]
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
                referencia = root / 'admision-sintetica'
                no_m = [c for c in casos if not c.startswith('M-')]
                if no_m:
                    import hashlib
                    for c in no_m:
                        guardar(referencia / c / 'base/oraculo.json', bases.get(c, {}))
                        guardar(referencia / c / 'base/archivos.json', captura(c, 'base').get('__archivos__', {}))
                    guardar(referencia / 'admision.json', dict(adr='ADR-098',
                        hash_espec=HOJA['hashes_fuentes']['espec.py'],
                        tareas={c: dict(resultado='admitida', captura_completa=True) for c in no_m},
                        filas=[dict(tarea=c, variante='correcta', resultado='correcta') for c in no_m],
                        hashes_evidencia={p.relative_to(referencia).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                                          for p in referencia.rglob('*.json')}))
                validacion = verificar(root, ROOT / 'ecologica/respuestas-ecologica.json', exploracion=referencia if no_m else None)
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

    def comprobar_lanzador(self, k=3, dimension='ecologica', fuera=False,
                           seleccion=None, ensayo=False, error=False, auth=None):
        # BASH_ENV sustituye medición/corrección/unión; la selección Python
        # y su manifiesto se ejecutan realmente, sin Docker ni credencial.
        if not shutil.which('bash'):
            self.skipTest('Bash no disponible')
        def ruta_shell(path):
            return '/' + path.drive[0].lower() + path.as_posix()[2:] if os.name == 'nt' else str(path)
        raiz = Path(tempfile.mkdtemp(dir=self.root))
        stub = raiz / 'stub.sh'
        stub.write_text('''bash() {
  [[ -f "$MED9C_REPARTO" ]] || return 1
  local linea
  printf -v linea '%s|' "$@"
  printf '%s\n' "$linea" >> "$MED9C_LOG"
}
python() {
  if [[ $1 == - ]]; then command python "$@";
  elif [[ $1 == herramientas/unir.py ]]; then
    printf '%s\n' "$@" > "$MED9C_UNION"
  fi
}
mkdir() { command python -c 'from pathlib import Path; import sys; Path(sys.argv[1]).mkdir(parents=True, exist_ok=True)' "$2"; }
''', encoding='utf-8', newline='\n')
        log, manifiesto = raiz / 'lanzadas.log', raiz / 'tanda/reparto.json'
        union = raiz / 'union.log'
        cmd = [shutil.which('bash'), (ROOT / 'herramientas/medir-med9c-paralelo.sh').as_posix(),
               ruta_shell(raiz), 'tanda', dimension, 'principal', '--k', str(k)]
        if fuera:
            cmd.append('--fuera-del-arbol')
        if seleccion is not None:
            cmd.extend(['--casos', seleccion])
        if ensayo:
            cmd.append('--ensayo')
        env = os.environ | {'BASH_ENV': ruta_shell(stub), 'MED9C_LOG': ruta_shell(log),
                            'MED9C_REPARTO': ruta_shell(manifiesto), 'MED9C_UNION': ruta_shell(union)}
        env.pop('OPENCODE_AUTH_JSON', None)
        if auth is not None:
            env['OPENCODE_AUTH_JSON'] = auth
        r = subprocess.run(cmd, env=env, capture_output=True, text=True)
        lineas = [linea.rstrip('|').split('|') for linea in log.read_text().splitlines()] if log.exists() else []
        if error:
            self.assertNotEqual(r.returncode, 0, r.stdout)
            self.assertEqual(lineas, [])
            self.assertFalse(manifiesto.exists())
            self.assertFalse(union.exists())
            return
        self.assertEqual(r.returncode, 0, r.stderr)
        casos = seleccion.split(',') if seleccion is not None else list(DET if dimension == 'deteccion' else ECO)
        if fuera:
            casos = [c for c in casos if c.startswith('M-')]
        partes = min(4, len(casos))
        self.assertEqual(len(lineas), partes, lineas)
        vistos, destinos, grupos = set(), set(), [None] * partes
        for args in lineas:
            destino = args[args.index('--destino') + 1]
            destinos.add(destino)
            parte = int(destino.rsplit('/p', 1)[1])
            for flag, valor in [('--k', str(k)), ('--semilla', '20261015'), ('--limite', '600'),
                                ('--tanda', 'tanda'), ('--dimension', dimension)]:
                self.assertEqual(args[args.index(flag) + 1], valor)
            self.assertNotIn('--pares', args)
            self.assertEqual('--ensayo' in args, ensayo)
            self.assertEqual('--fuera-del-arbol' in args, fuera)
            grupo = args[args.index('--casos') + 1].split(',')
            self.assertEqual(len(grupo), len(set(grupo)))
            self.assertFalse(vistos & set(grupo))
            vistos.update(grupo)
            grupos[parte] = grupo
        self.assertEqual(len(destinos), partes)
        self.assertEqual(vistos, set(casos))
        llamada_union = union.read_text().splitlines()
        if seleccion is None:
            self.assertNotIn('--casos', llamada_union)
        else:
            self.assertEqual(llamada_union[llamada_union.index('--casos') + 1], seleccion)
        return grupos, lineas, json.loads(manifiesto.read_text(encoding='utf-8'))

    def test_R_1_ecologica_k3_disjunta_completa_sin_pares(self):
        grupos, _, _ = self.comprobar_lanzador()
        self.assertEqual(len(grupos), 4)
        self.assertEqual(sum(map(len, grupos)), 46)

    def test_R_2_reparto_reproducible_dependiente_de_semilla(self):
        grupos, _, _ = self.comprobar_lanzador()
        self.assertEqual(grupos, self.comprobar_lanzador()[0])
        # Ejecuta el mismo bloque de selección con otra semilla, sin agregar
        # una opción de semilla al lanzador de la tanda real.
        codigo = (ROOT / 'herramientas/medir-med9c-paralelo.sh').read_text(encoding='utf-8')
        codigo = codigo.split("<<'PY'\n", 1)[1].split('\nPY\n', 1)[0]
        def reparto(semilla):
            r = subprocess.run([sys.executable, '-B', '-', 'ecologica', '0', '3', str(semilla), '',
                                str(self.root / f'reparto-{semilla}.json')], input=codigo,
                               cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(r.returncode, 0, r.stderr)
            return [linea.split(',') for linea in r.stdout.splitlines()]
        self.assertEqual(grupos, reparto(20261015))
        otro = reparto(20261016)
        self.assertEqual(otro, reparto(20261016))
        self.assertNotEqual(grupos, otro)

    def test_R_3_ecologica_partes_equilibradas(self):
        grupos, _, _ = self.comprobar_lanzador()
        self.assertEqual(sorted(map(len, grupos)), [11, 11, 12, 12])

    def test_R_4_deteccion_y_contraste_disjuntos_completos(self):
        for dimension, fuera, total in [('deteccion', False, 11), ('ecologica', True, 10)]:
            with self.subTest(dimension=dimension, fuera=fuera):
                grupos, _, _ = self.comprobar_lanzador(dimension=dimension, fuera=fuera)
                self.assertEqual(len(grupos), 4)
                self.assertEqual(sum(map(len, grupos)), total)
                if fuera:
                    self.assertTrue(all(c.startswith('M-') for grupo in grupos for c in grupo))

    def test_R_5_seleccion_tres_partes_y_errores_antes_de_lanzar(self):
        grupos, _, _ = self.comprobar_lanzador(seleccion='C-1,M-1,M-2')
        self.assertEqual(list(map(len, grupos)), [1, 1, 1])
        for dimension, fuera, seleccion in [
                ('ecologica', False, 'NO-EXISTE'), ('deteccion', False, 'M-1'),
                ('ecologica', True, 'C-1'), ('ecologica', False, 'M-1,M-1'),
                ('ecologica', False, 'M-1,')]:
            with self.subTest(dimension=dimension, fuera=fuera, seleccion=seleccion):
                self.comprobar_lanzador(dimension=dimension, fuera=fuera, seleccion=seleccion, error=True)

    def test_R_6_ensayo_explicito_sin_credencial(self):
        for dimension, fuera in [('ecologica', False), ('deteccion', False), ('ecologica', True)]:
            for ensayo in (False, True):
                with self.subTest(dimension=dimension, fuera=fuera, ensayo=ensayo):
                    self.comprobar_lanzador(k=1, dimension=dimension, fuera=fuera, ensayo=ensayo)
        self.comprobar_lanzador(ensayo=True, auth='credencial-sintetica', error=True)

    def test_R_7_manifiesto_previo_coincide_con_casos_lanzados(self):
        for dimension, fuera in [('ecologica', False), ('deteccion', False), ('ecologica', True)]:
            with self.subTest(dimension=dimension, fuera=fuera):
                grupos, _, manifiesto = self.comprobar_lanzador(dimension=dimension, fuera=fuera)
                self.assertEqual(manifiesto, dict(semilla=20261015, k=3, partes=grupos))
        grupos, _, manifiesto = self.comprobar_lanzador(k=1, seleccion='C-1,M-1,M-2', ensayo=True)
        self.assertEqual(manifiesto, dict(semilla=20261015, k=1, partes=grupos))

    def test_R_8_pares_baraja_repeticiones_dentro_de_una_parte(self):
        # Carga exclusivamente pares(), sin inicializar el arnés Linux.
        fuente = ROOT / 'vm/simulado/ecologica.py'
        funcion = next(n for n in ast.parse(fuente.read_text(encoding='utf-8')).body
                       if isinstance(n, ast.FunctionDef) and n.name == 'pares')
        espacio = {'random': random}
        exec(compile(ast.Module(body=[funcion], type_ignores=[]), str(fuente), 'exec'), espacio)
        casos = self.comprobar_lanzador()[0][0]
        producto = [(c, r) for c in casos for r in range(1, 4)]
        trabajos = espacio['pares'](casos, 3, 20261015, None)
        self.assertEqual(len(trabajos), len(producto))
        self.assertEqual(set(trabajos), set(producto))
        self.assertEqual(trabajos, espacio['pares'](casos, 3, 20261015, None))
        self.assertNotEqual(trabajos, producto)
        self.assertNotEqual(trabajos, espacio['pares'](casos, 3, 20261016, None))
        for caso in casos:
            posiciones = [n for n, (c, _) in enumerate(trabajos) if c == caso]
            self.assertGreater(max(posiciones) - min(posiciones), 2, caso)

    def test_R_9_union_cuatro_fragmentos_solo_casos_k3(self):
        for dimension, fuera in [('ecologica', False), ('deteccion', False), ('ecologica', True)]:
            with self.subTest(dimension=dimension, fuera=fuera):
                grupos, _, _ = self.comprobar_lanzador(dimension=dimension, fuera=fuera)
                paths = [self.fragmento(f'R9-{dimension}-{fuera}-{n}', grupo, dimension, fuera,
                                       cambio=dict(k=3, casos=','.join(grupo), pares=None))
                         for n, grupo in enumerate(grupos)]
                rows, meta, faltantes = unir(paths)
                self.assertEqual(len(rows), sum(map(len, grupos)) * 3)
                self.assertEqual(len({(r['caso'], r['repeticion']) for r in rows}), len(rows))
                self.assertEqual(faltantes, [])
                self.assertTrue(meta['union_med9'])

    def test_union_seleccion_explicita_exige_todos_sus_pares(self):
        casos = ['C-1', 'M-1', 'M-2']
        paths = [self.fragmento(f'seleccion-{n}', [c], cambio=dict(k=3, casos=c, pares=None))
                 for n, c in enumerate(casos)]
        with self.assertRaisesRegex(ValueError, 'Pares incompletos'):
            unir(paths)
        for seleccion, patron in [(casos + ['M-3'], 'Pares incompletos'),
                                  (casos[:2], 'ajeno'), (['NO-EXISTE'], 'inválidos'),
                                  (casos + ['M-1'], 'inválidos'), ([], 'inválidos')]:
            with self.subTest(seleccion=seleccion), self.assertRaisesRegex(ValueError, patron):
                unir(paths, seleccion)
        with self.assertRaisesRegex(ValueError, 'Par repetido'):
            unir(paths + [paths[0]], casos)
        salida = self.root / 'seleccion-unida/corregido.jsonl'
        r = subprocess.run([sys.executable, '-B', str(ROOT / 'herramientas/unir.py'),
                            *map(str, paths), '--salida', str(salida), '--casos', ','.join(casos)],
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn('9 filas de 9; 0 pares faltantes', r.stdout)
        for nombre, cambio, patron in [('parametros', {'semilla': 0}, 'semilla'),
                                      ('detenida', {}, 'detenida')]:
            b = self.fragmento(nombre, ['M-2'], cambio=dict(k=3, **cambio))
            if nombre == 'detenida':
                (b.parent / 'DETENCION.txt').write_text('fallo')
            with self.assertRaisesRegex(ValueError, patron):
                unir(paths[:2] + [b], casos)


if __name__ == '__main__':
    unittest.main()
