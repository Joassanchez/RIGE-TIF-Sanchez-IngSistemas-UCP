#!/usr/bin/env python3
"""Valida la fase base en el anfitrión; nunca entrega respuestas al contenedor."""
import argparse
import hashlib
import json
from pathlib import Path

from corregir_ecologica import clave, observar_captura, hoja_admitida, objetivos

ROOT = Path(__file__).resolve().parents[1]
CAPTURAS = ROOT / 'verificacion/20261014-tareas-ecologica/salida'


def admision_med11(fuente, hoja, caso):
    admision = json.loads((fuente / 'admision.json').read_text(encoding='utf-8'))
    if (admision.get('hash_espec') != hoja['hashes_fuentes']['espec.py'] or
            (admision.get('adr') != 'ADR-098' and admision.get('valido') is not True)):
        raise ValueError('Admisión MED-11 ausente o de otra especificación.')
    if admision.get('adr') == 'ADR-098' and admision.get('tareas', {}).get(caso, {}).get('resultado') != 'admitida':
        raise ValueError('Tarea sin admisión ADR-098: ' + caso)
    if not any(r.get('tarea') == caso and r.get('variante') == 'correcta' and r.get('resultado') == 'correcta'
               for r in admision.get('filas', [])):
        raise ValueError(f'Tarea sin admisión MED-11: {caso}')
    for rel, digest in admision['hashes_evidencia'].items():
        if hashlib.sha256((fuente / rel).read_bytes()).hexdigest() != digest:
            raise ValueError('Evidencia de admisión MED-11 alterada.')
    return admision


def verificar(tanda, respuestas, capturas=CAPTURAS, exploracion=None):
    hoja = json.loads(respuestas.read_text(encoding='utf-8'))
    if hoja.get('dimension') != 'ecologica' or not hoja_admitida(hoja):
        raise ValueError('Se requiere hoja cerrada o exploratoria ADR-095.')
    meta = json.loads((tanda / 'tanda.json').read_text(encoding='utf-8'))
    indice = tanda / 'base/indice.json'
    bases = json.loads(indice.read_text(encoding='utf-8'))
    casos = {c for c, _ in meta['orden'] if 'objetivo' in hoja['casos'][c]}
    if set(bases) != casos:
        raise ValueError('Base incompleta o ajena a los pares seleccionados.')
    hashes_capturas = {}
    fuente_exploracion = exploracion or ROOT / 'verificacion/20261019-admision/salida'
    for caso in {c for c, _ in meta['orden']}:
        regla = hoja['casos'][caso]
        if ('valor' in regla and ('candidato' in regla or caso in ('V-9', 'V-10'))) or caso.startswith('C-'):
            admision_med11(fuente_exploracion, hoja, caso)
    for caso in sorted(casos):
        regla = hoja['casos'][caso]
        fuente = capturas if caso.startswith('M-') else fuente_exploracion
        if not caso.startswith('M-'):
            admision_med11(fuente, hoja, caso)
            if regla.get('guardas_archivos'):
                actual = json.loads((tanda / 'base' / caso / 'base.antes/archivos.json').read_text(encoding='utf-8'))
                nativa = json.loads((fuente / caso / 'base/archivos.json').read_text(encoding='utf-8'))
                if any(actual[rel] != nativa[rel] for rel in regla['guardas_archivos']):
                    raise ValueError(f'Base estructural MED-11 distinta de la admisión: {caso}')
            datos = json.loads((fuente / caso / 'base/oraculo.json').read_text(encoding='utf-8'))
            decisiones = {clave(s): datos[clave(s)]['decision'] for s in [*objetivos(regla), *regla['guardas']]}
            for sonda, decision in decisiones.items():
                if bases[caso].get(sonda, {}).get('decision') != decision:
                    raise ValueError(f'Base MED-11 distinta de la admisión: {caso} {sonda}')
            hashes_capturas[f'{caso}/base/oraculo.json'] = hashlib.sha256((fuente / caso / 'base/oraculo.json').read_bytes()).hexdigest()
            continue
        agentes = {}
        for path in sorted((fuente / caso / 'base').glob('agente-*.json')):
            agentes[path.stem[7:]] = json.loads(path.read_text(encoding='utf-8'))
            hashes_capturas[str(path.relative_to(fuente))] = hashlib.sha256(path.read_bytes()).hexdigest()
        # La hoja identifica objetivo/guardas; sus valores iniciales están en
        # las capturas nativas congeladas, no en el valor FINAL del objetivo.
        esperado = observar_captura(agentes, regla)
        valores = esperado['objetivo'] if 'objetivos_adicionales' in regla else [esperado['objetivo']]
        decisiones = {**{clave(s): v for s, v in zip(objetivos(regla), valores)}, **esperado['guardas']}
        for sonda, decision in decisiones.items():
            actual = bases[caso].get(sonda, {}).get('decision')
            if actual != decision or actual not in ('allow', 'ask', 'deny'):
                raise ValueError(f'Base distinta del estado inicial esperado: {caso} {sonda}: {actual!r} != {decision!r}')
    return dict(valido=True, hash_base=hashlib.sha256(indice.read_bytes()).hexdigest(),
                hash_respuestas=hashlib.sha256(respuestas.read_bytes()).hexdigest(),
                hashes_capturas=hashes_capturas)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('tanda', type=Path)
    p.add_argument('--respuestas', type=Path, default=ROOT / 'ecologica/respuestas-ecologica.json')
    a = p.parse_args()
    try:
        resultado = verificar(a.tanda, a.respuestas)
    except (KeyError, OSError, ValueError, TypeError) as error:
        (a.tanda / 'DETENCION.txt').write_text(str(error) + '\n', encoding='utf-8')
        p.error(str(error))
    (a.tanda / 'validacion-base.json').write_text(json.dumps(resultado, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(resultado['hash_base'])


if __name__ == '__main__':
    main()
