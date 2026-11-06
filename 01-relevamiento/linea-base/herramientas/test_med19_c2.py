"""Cobertura de Charles y comandos reales, sin ejecutar contenedores."""
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
import unittest

import analizar_final as a
from hoja_final import ROOT
from test_med19_final import fixture


class ReplicaTests(unittest.TestCase):
    def test_charles_195_filas_sin_control_contemporaneo(self):
        plantilla = fixture()[0][0]
        pre = json.loads((ROOT / 'verificacion/20261105-preregistro/PREREGISTRO.json').read_bytes())
        hoja = json.loads((ROOT / 'ecologica/final/respuestas-ecologica.json').read_bytes())['casos']
        corpus = json.loads((ROOT / 'ecologica/final/respuestas-deteccion.json').read_bytes())['casos']
        base, finales = [], []
        for c, t in hoja.items():
            for b in (('sin_rige', 'indicado') if t['estrato'] == 'R' else ('LB', 'indicado')):
                for rep in (1, 2, 3):
                    mala = b == 'LB' and c in pre['cubiertos'] and rep <= 2
                    row = dict(plantilla, ejecutor='charles', brazo=b, condicion='LB' if b == 'LB' else 'FIN', caso=c, repeticion=rep,
                        resultado='sin_efecto' if mala else 'correcta', objetivo_alcanzado=not mala)
                    (base if b == 'LB' else finales).append(row)
        for c in corpus:
            for b in ('LB', 'indicado'):
                for rep in (1, 2, 3):
                    (base if b == 'LB' else finales).append(dict(plantilla, ejecutor='charles',
                        brazo=b, condicion='LB' if b == 'LB' else 'FIN', dimension='deteccion', caso=c, repeticion=rep, detectados=[], falsos_positivos=[]))
        self.assertEqual(len(finales), 195)
        def analizar():
            return a.por_ejecutor(base, finales, pre, hoja, corpus, 'charles', pre['variantes_reservadas'])
        g = analizar()
        self.assertEqual(g['faltantes_prioridad_1'], [])
        self.assertEqual(g['veredicto'], a.CUMPLIDO)
        self.assertEqual(g['mejorados'], sorted(pre['cubiertos']))
        # Un control opcional de Charles tampoco modifica la atribución.
        finales.extend(dict(r, brazo='sin_rige') for r in list(finales)
                       if r['dimension'] == 'ecologica' and r['caso'] in pre['control_contemporaneo'])
        self.assertEqual(analizar()['no_atribuibles'], [])
        self.assertEqual(analizar()['mejorados'], g['mejorados'])


class ComandosTests(unittest.TestCase):
    def plan(self):
        texto = (ROOT / 'verificacion/20261105-med19/README.md').read_text(encoding='utf-8')
        self.assertTrue('## Medición real: prioridades 1 a 4' in texto, 'Faltan los comandos reales de prioridades 1 a 4')
        bloque = texto.split('## Medición real: prioridades 1 a 4', 1)[1].split('## ', 1)[0]
        variables = dict(re.findall(r"^(BANCO|PROBAR|RESERVADO|CONTEMPORANEO)='([^']+)'$", bloque, re.M))
        comandos = [shlex.split(l) for l in bloque.splitlines() if l.startswith('bash herramientas/medir-med9c-paralelo.sh ')]
        return variables, comandos

    def test_prioridades_y_cantidades_exactas(self):
        v, comandos = self.plan()
        hoja = json.loads((ROOT / 'ecologica/final/respuestas-ecologica.json').read_bytes())['casos']
        banco = json.loads((ROOT / 'ecologica/escenarios.json').read_bytes())['dimensiones']['ecologica']
        self.assertEqual(v['BANCO'].split(','), list(banco))
        self.assertEqual(len(v['BANCO'].split(',')), 46)
        self.assertEqual(v['PROBAR'].split(','), [c for c in banco if hoja[c]['estrato'] in ('E1', 'E2')])
        self.assertEqual(v['RESERVADO'], 'R-1,R-2,R-3,R-4')
        self.assertEqual(v['CONTEMPORANEO'], 'M-1,M-2,M-10,N-14,N-23')
        esperados = [('principal','ecologica','indicado','BANCO'), ('principal','deteccion','indicado',None),
            ('principal','ecologica','indicado','RESERVADO'), ('principal','ecologica','sin_rige','RESERVADO'),
            ('principal','ecologica','sin_rige','CONTEMPORANEO'), ('principal','ecologica','probar','PROBAR'),
            ('charles','ecologica','indicado','BANCO'), ('charles','deteccion','indicado',None),
            ('charles','ecologica','indicado','RESERVADO'), ('charles','ecologica','sin_rige','RESERVADO'),
            ('principal','ecologica','disponible','BANCO'), ('principal','ecologica','indicado',None)]
        obtenidos, cantidades = [], dict.fromkeys(('p1', 'p2', 'p3', 'p4'), 0)
        for cmd in comandos:
            self.assertNotIn('--ensayo', cmd)
            self.assertEqual(cmd[cmd.index('--k')+1], '3')
            self.assertEqual(cmd[cmd.index('--hoja')+1], 'final')
            obtenidos.append((cmd[5], cmd[4], cmd[cmd.index('--brazo')+1],
                cmd[cmd.index('--casos')+1].strip('$') if '--casos' in cmd else None))
            n = len(v[obtenidos[-1][3]].split(',')) if '--casos' in cmd else (10 if '--fuera-del-arbol' in cmd else 11)
            cantidades[cmd[3].split('-')[0]] += n * int(cmd[cmd.index('--k')+1])
        self.assertEqual(obtenidos, esperados)
        self.assertIn('--fuera-del-arbol', comandos[-1])
        self.assertEqual(cantidades, dict(p1=210, p2=129, p3=195, p4=168))

    def reparto(self, ejecutor):
        v, comandos = self.plan()
        cmd = next(c for c in comandos if c[5] == ejecutor and '$BANCO' in c)
        from test_med19_lanzadores import shell
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            stub = root / 'stub.sh'
            stub.write_text('''bash() { :; }
mkdir() { "$C2_PYTHON" -c 'from pathlib import Path; import sys; Path(sys.argv[1]).mkdir(parents=True, exist_ok=True)' "$2"; }
python() { if [[ $1 == - ]]; then "$C2_PYTHON" "$@"; fi; }
''', encoding='utf-8', newline='\n')
            env = os.environ | dict(BASH_ENV=shell(stub), C2_PYTHON=sys.executable.replace('\\', '/'))
            args = [shutil.which('bash'), (ROOT / cmd[1]).as_posix(), shell(root), *cmd[3:]]
            args = [v[x[1:]] if x.startswith('$') else x for x in args]
            run = subprocess.run(args, env=env, cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stderr)
            reparto = json.loads((root / cmd[3] / 'reparto.json').read_bytes())
            referencia = json.loads((ROOT / f'verificacion/20261021-LB-ADR098/reparto-LB-ecologica-{ejecutor}.json').read_bytes())
            self.assertEqual(reparto, referencia)

    @unittest.skipUnless(shutil.which('bash'), 'Bash no disponible')
    def test_reparto_principal_igual_octubre(self):
        self.reparto('principal')

    @unittest.skipUnless(shutil.which('bash'), 'Bash no disponible')
    def test_reparto_charles_igual_octubre(self):
        self.reparto('charles')


if __name__ == '__main__':
    unittest.main()
