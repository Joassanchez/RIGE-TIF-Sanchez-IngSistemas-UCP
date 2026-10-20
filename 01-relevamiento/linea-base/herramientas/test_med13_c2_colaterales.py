"""ADR-098, puntos 3 y 6: guardas y referencia nativa, con datos sintéticos."""
from copy import deepcopy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import corregir_ecologica as eco
import test_med13_c1 as fixtures
from test_med9 import ROOT, ESPEC, HOJA, captura, fila, generador, oraculo_fixture
from verificar_base_ecologica import verificar


EXTRA = eco.clave(('plan', 'edit', 'README.md'))


class ColateralesTests(unittest.TestCase):
    def datos(self):
        regla = deepcopy(ESPEC['M-1'])
        antes, despues = captura('M-1', 'base'), captura('M-1', 'correcta')
        oraculo = oraculo_fixture(regla, antes, despues)
        oraculo['antes'][EXTRA] = dict(decision='deny')
        oraculo['despues'][EXTRA] = dict(decision='allow')
        return regla, antes, despues, oraculo, deepcopy(oraculo['despues'])

    def test_1_guardas_solo_declaradas_en_los_tres_campos(self):
        regla, a, b, o, ref = self.datos()
        regla['guardas_archivos'] = ['P/guardado']
        regla['guardas_valor'] = [['build', 'description']]
        a['__archivos__'] = {'P/guardado': dict(sha256='antes')}
        b['__archivos__'] = {'P/guardado': dict(sha256='despues')}
        b['build']['description'] = 'cambio de guarda declarada'
        b['build']['otra_opcion_no_declarada'] = 'no es una guarda'
        key = eco.clave(regla['guardas'][0])
        o['despues'][key] = dict(decision='ask' if o['antes'][key]['decision'] != 'ask' else 'deny')
        r = eco.corregir(fila('M-1'), regla, a, b, o, ref)
        self.assertEqual({c['sonda'] for c in r['colateral_guarda']},
            {key, 'archivo:P/guardado', eco.clave(['build', 'description'])})
        self.assertNotIn(EXTRA, {c['sonda'] for c in r['colateral_guarda']})
        self.assertEqual(r['colateral_bateria'], [])

    def test_1_valores_no_inventan_guardas_de_otras_opciones(self):
        regla = dict(valor=['build', 'description', 'nueva'], guardas_valor=[['build', 'temperature']])
        a = {'build': dict(description='anterior', temperature=.1, otra='antes')}
        b = {'build': dict(description='nueva', temperature=.1, otra='despues')}
        r = eco.corregir(fila('V-1'), regla, a, b, {})
        self.assertEqual(r['resultado'], 'correcta')
        self.assertFalse(r['colateral_guarda'])
        b['build']['temperature'] = .2
        self.assertEqual(len(eco.corregir(fila('V-1'), regla, a, b, {})['colateral_guarda']), 1)

    def test_2_efecto_necesario_correcta_no_es_colateral_y_sin_cambio_puede_serlo(self):
        regla, a, b, o, ref = self.datos()
        r = eco.corregir(fila('M-1'), regla, a, b, o, ref)
        self.assertEqual(r['resultado'], 'correcta')
        self.assertFalse(r['colaterales'])
        o['despues'][EXTRA] = o['antes'][EXTRA]
        r = eco.corregir(fila('M-1'), regla, a, b, o, ref)
        self.assertEqual(r['resultado'], 'colateral')
        self.assertEqual(r['colateral_bateria'][0]['referencia'], 'allow')
        self.assertEqual(r['consecuencia'], ['bloqueo'])

    def test_2_falta_referencia_incompatible_o_indeterminada_no_adivina(self):
        regla, a, b, o, ref = self.datos()
        for referencia in (None, {}, dict(ref, **{EXTRA: dict(decision='indeterminado')})):
            r = eco.corregir(fila('M-1'), regla, a, b, o, referencia)
            self.assertTrue(r['fallo_preparacion'])
            self.assertIsNone(r['resultado'])

    def test_2_cli_carga_raices_y_verifica_todos_los_hashes(self):
        regla, a, b, o, ref = self.datos()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            fuente = root / 'admision'
            fixtures.guardar(fuente / 'M-1/correcta/oraculo.json', ref)
            fixtures.guardar(fuente / 'crudo.json', dict(evidencia='tambien se verifica'))
            fixtures.guardar(fuente / 'admision.json', dict(adr='ADR-098', hash_espec=HOJA['hashes_fuentes']['espec.py'],
                tareas={'M-1': dict(resultado='admitida', captura_completa=True)},
                filas=[dict(tarea='M-1', variante='correcta', resultado='correcta')],
                hashes_evidencia={p.relative_to(fuente).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in fuente.rglob('*.json')}))
            fixtures.guardar(root / 'respuestas.json', dict(HOJA, casos={'M-1': regla}))
            for nombre, datos in [('antes', a), ('despues', b)]:
                for ag, dato in datos.items():
                    fixtures.guardar(root / nombre / f'agente-{ag}.json', dato)
            fixtures.guardar(root / 'oracle.json', o)
            row = dict(fila('M-1'), intentos=[dict(captura_antes='antes', captura_despues='despues', oraculo='oracle.json')])
            (root / 'registro.jsonl').write_text(json.dumps(row) + '\n')
            cmd = [sys.executable, '-B', str(ROOT / 'herramientas/corregir_ecologica.py'), str(root / 'registro.jsonl'),
                   '--respuestas', str(root / 'respuestas.json')]
            env = os.environ | {'RIGE_EVIDENCIA_ADMISION': str(fuente)}
            for n, args in enumerate(([], ['--evidencia-admision', str(fuente)])):
                out = root / f'corregido{n}.jsonl'
                r = subprocess.run([*cmd, '--salida', str(out), *args], env=env, capture_output=True, text=True)
                self.assertEqual(r.returncode, 0, r.stderr)
                resultado = json.loads(out.read_text(encoding='utf-8'))
                self.assertEqual(resultado['resultado'], 'correcta')
                self.assertEqual(resultado['referencia_bateria']['archivo'], str(fuente / 'M-1/correcta/oraculo.json'))
            (fuente / 'crudo.json').write_text('alterado')
            out = root / 'rechazado.jsonl'
            r = subprocess.run([*cmd, '--salida', str(out)], env=env, capture_output=True, text=True)
            self.assertNotEqual(r.returncode, 0)
            self.assertFalse(out.exists())
            self.assertIn('alterada', r.stderr)

    def test_3_admision_correcta_referencia_y_contrastes(self):
        regla, a, b, o, ref = self.datos()
        evaluador = generador.cargar(ROOT / 'verificacion/20261019-admision/evaluar_eco.py', 'med13c2_eval')
        regla['variantes'] = {'correcta': {}, 'ingenua_amplia': {}, 'ingenua_igual_ref': {}}
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            fixtures.guardar(root / 'captura.json', dict(casos=['M-1'], hash_espec=HOJA['hashes_fuentes']['espec.py']))
            for v in ('base', *regla['variantes']):
                for ag, datos in (a if v == 'base' else b).items():
                    fixtures.guardar(root / 'M-1' / v / f'agente-{ag}.json', datos)
                oracle = deepcopy(o['antes'] if v == 'base' else ref)
                if v == 'ingenua_amplia':
                    oracle[EXTRA] = dict(decision='ask')
                fixtures.guardar(root / 'M-1' / v / 'oraculo.json', oracle)
            r = evaluador.evaluar({'M-1': regla}, root)
            self.assertEqual(r['tareas']['M-1']['variantes']['correcta']['resultado'], 'correcta')
            self.assertFalse(r['valido'])  # La ingenua idéntica ya no es contraste.
            del regla['variantes']['ingenua_igual_ref']
            r = evaluador.evaluar({'M-1': regla}, root)
            self.assertTrue(r['valido'])
            self.assertFalse(r['tareas']['M-1']['variantes']['correcta']['colateral_guarda'])
            self.assertTrue(r['tareas']['M-1']['variantes']['ingenua_amplia']['colateral_bateria'])
            key = eco.clave(regla['guardas'][0])
            ref[key] = dict(decision='ask' if o['antes'][key]['decision'] != 'ask' else 'deny')
            fixtures.guardar(root / 'M-1/correcta/oraculo.json', ref)
            self.assertFalse(evaluador.evaluar({'M-1': regla}, root)['valido'])

    def test_5_las_diez_M_usan_admision_vigente_sin_capturas_historicas(self):
        fixture = fixtures.AdmisionesTests()
        fixture.setUp()
        self.addCleanup(fixture.doCleanups)
        casos = [f'M-{n}' for n in range(1, 11)]
        fuente = fixture.admision('vigente', casos)
        tanda = fixture.tanda(casos)
        r = verificar(tanda, ROOT / 'ecologica/respuestas-ecologica.json',
                      capturas=fixture.root / 'historicas-inexistentes', admisiones=[fuente])
        self.assertTrue(r['valido'])
        self.assertEqual(set(r['fuentes_admision']), set(casos))


if __name__ == '__main__':
    unittest.main()
