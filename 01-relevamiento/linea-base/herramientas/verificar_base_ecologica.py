#!/usr/bin/env python3
"""Valida la fase base en el anfitrión; nunca entrega respuestas al contenedor."""
import argparse
import hashlib
import json
import os
from pathlib import Path

from corregir_ecologica import clave, observar_captura, hoja_admitida, objetivos

ROOT = Path(__file__).resolve().parents[1]
CAPTURAS = ROOT / 'verificacion/20261014-tareas-ecologica/salida'


def exigir_tarea(admision, caso):
    if admision.get('adr') == 'ADR-098' and (
            admision.get('tareas', {}).get(caso, {}).get('resultado') != 'admitida' or
            admision['tareas'][caso].get('captura_completa') is not True):
        raise ValueError('Tarea sin admisión ADR-098: ' + caso)
    if not any(r.get('tarea') == caso and r.get('variante') == 'correcta' and r.get('resultado') == 'correcta'
               for r in admision.get('filas', [])):
        raise ValueError(f'Tarea sin admisión MED-11: {caso}')


def cargar_admisiones(fuentes, hoja, permitir_legacy=False):
    """Cada raíz debe estar completa; nunca completar sus faltantes con otra."""
    indice, firmas, procedencia = {}, {}, []
    for fuente in dict.fromkeys(Path(f).expanduser().resolve() for f in fuentes):
        path = fuente / 'admision.json'
        contenido = path.read_bytes()
        admision = json.loads(contenido)
        if (admision.get('hash_espec') != hoja['hashes_fuentes']['espec.py'] or
                (admision.get('adr') != 'ADR-098' and not (permitir_legacy and admision.get('valido') is True))):
            raise ValueError('Admisión MED-11 ausente o de otra especificación: ' + str(path))
        hashes = admision['hashes_evidencia']
        if not isinstance(hashes, dict) or (admision.get('adr') == 'ADR-098' and not hashes):
            raise ValueError('Admisión sin hashes de evidencia: ' + str(path))
        for rel, digest in hashes.items():
            relativa = Path(rel.replace('\\', '/'))
            archivo = (fuente / relativa).resolve()
            if relativa.is_absolute() or '..' in relativa.parts or not archivo.is_relative_to(fuente):
                raise ValueError('Ruta de evidencia fuera de su raíz: ' + rel)
            if hashlib.sha256(archivo.read_bytes()).hexdigest() != digest:
                raise ValueError('Evidencia de admisión MED-11 alterada: ' + str(archivo))
        tareas = admision.get('tareas', {})
        casos = set(tareas) | {r['tarea'] for r in admision.get('filas', [])}
        for caso in sorted(casos):
            firma = dict(tarea=tareas.get(caso),
                filas=sorted((json.dumps(r, sort_keys=True) for r in admision.get('filas', []) if r.get('tarea') == caso)),
                hashes={rel.replace('\\', '/'): digest for rel, digest in hashes.items() if rel.replace('\\', '/').startswith(caso + '/')})
            if caso in firmas and firmas[caso] != firma:
                raise ValueError('Admisiones contradictorias para ' + caso)
            firmas[caso] = firma
            indice.setdefault(caso, (fuente, admision))
        procedencia.append(dict(raiz=str(fuente), hash_admision=hashlib.sha256(contenido).hexdigest(),
                                hashes_verificados=len(hashes), tareas=sorted(tareas)))
    return indice, procedencia


def admision_med11(fuente, hoja, caso):
    indice, _ = cargar_admisiones([fuente], hoja, permitir_legacy=True)
    if caso not in indice:
        raise ValueError('Tarea sin admisión ADR-098: ' + caso)
    admision = indice[caso][1]
    exigir_tarea(admision, caso)
    return admision


def referencia_correcta(indice, caso):
    if caso not in indice:
        raise ValueError('Tarea sin admisión ADR-098: ' + caso)
    fuente, admision = indice[caso]
    exigir_tarea(admision, caso)
    rel = caso + '/correcta/oraculo.json'
    digest = admision['hashes_evidencia'].get(rel)
    if not digest:
        raise ValueError('Referencia correcta sin hash de admisión: ' + rel)
    path = fuente / rel
    if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
        raise ValueError('Referencia correcta alterada: ' + str(path))
    datos = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(datos, dict) or not datos or any(d.get('decision') not in ('allow', 'ask', 'deny') for d in datos.values()):
        raise ValueError('Referencia correcta incompleta o indeterminada: ' + caso)
    return datos, dict(archivo=str(path), sha256=digest, regla='ADR-098, punto 6')


def verificar(tanda, respuestas, capturas=CAPTURAS, exploracion=None, admisiones=None):
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
    no_m = {c for c, _ in meta['orden'] if not c.startswith('M-')}
    fuentes = admisiones if admisiones is not None else [exploracion or ROOT / 'verificacion/20261019-admision/salida']
    if admisiones is not None and not fuentes:
        raise ValueError('Indicar al menos una raíz completa de admisión.')
    indice_admision, procedencia = cargar_admisiones(fuentes, hoja, permitir_legacy=exploracion is not None and admisiones is None) if no_m or admisiones is not None or exploracion is not None else ({}, [])
    for caso in sorted(no_m):
        if caso not in indice_admision:
            raise ValueError('Tarea sin admisión ADR-098: ' + caso)
        exigir_tarea(indice_admision[caso][1], caso)
    for caso in sorted(casos):
        regla = hoja['casos'][caso]
        fuente = capturas if caso not in indice_admision else indice_admision[caso][0]
        if caso in indice_admision:
            exigir_tarea(indice_admision[caso][1], caso)
            if regla.get('guardas_archivos'):
                actual = json.loads((tanda / 'base' / caso / 'base.antes/archivos.json').read_text(encoding='utf-8'))
                nativa = json.loads((fuente / caso / 'base/archivos.json').read_text(encoding='utf-8'))
                if any(actual[rel] != nativa[rel] for rel in regla['guardas_archivos']):
                    raise ValueError(f'Base estructural MED-11 distinta de la admisión: {caso}')
            datos = json.loads((fuente / caso / 'base/oraculo.json').read_text(encoding='utf-8'))
            if set(datos) != set(bases[caso]):
                raise ValueError('Batería vigente distinta de la admisión: ' + caso)
            for s in [*objetivos(regla), *regla['guardas']]:
                if clave(s) not in datos:
                    raise ValueError('Objetivo/guarda ausente de la admisión: ' + caso)
            decisiones = {k: d['decision'] for k, d in datos.items()}
            for sonda, decision in decisiones.items():
                if decision not in ('allow', 'ask', 'deny') or bases[caso].get(sonda, {}).get('decision') != decision:
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
                hashes_capturas=hashes_capturas, admisiones=procedencia,
                fuentes_admision={c: str(indice_admision[c][0]) for c, _ in meta['orden'] if c in indice_admision})


def raices_admision(valores):
    if valores is None:
        entorno = os.environ.get('RIGE_EVIDENCIA_ADMISION')
        valores = [entorno] if entorno is not None else None
    if valores is None:
        return None
    partes = [p.strip() for valor in valores for p in valor.split(';')]
    if not partes or any(not p for p in partes):
        raise ValueError('RIGE_EVIDENCIA_ADMISION/--evidencia-admision contiene una raíz vacía.')
    return [Path(p) for p in partes]


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('tanda', type=Path)
    p.add_argument('--respuestas', type=Path, default=ROOT / 'ecologica/respuestas-ecologica.json')
    p.add_argument('--evidencia-admision', action='append', help='Raíz completa con admision.json; repetible o separada por ;. Por defecto RIGE_EVIDENCIA_ADMISION.')
    a = p.parse_args()
    try:
        resultado = verificar(a.tanda, a.respuestas, admisiones=raices_admision(a.evidencia_admision))
    except (KeyError, OSError, ValueError, TypeError) as error:
        (a.tanda / 'DETENCION.txt').write_text(str(error) + '\n', encoding='utf-8')
        p.error(str(error))
    (a.tanda / 'validacion-base.json').write_text(json.dumps(resultado, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(resultado['hash_base'])


if __name__ == '__main__':
    main()
