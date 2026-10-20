#!/usr/bin/env python3
"""Admisión ADR-098: sin agente, sin abortar ni admitir capturas incompletas."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'herramientas'))
from corregir_ecologica import corregir


def leer_captura(carpeta):
    datos = {f.stem[7:]: json.loads(f.read_text(encoding='utf-8')) for f in carpeta.glob('agente-*.json')}
    for archivo, key in [('archivos.json', '__archivos__'), ('config.json', '__config__'), ('sistema.json', '__sistema__')]:
        if (carpeta / archivo).exists():
            datos[key] = json.loads((carpeta / archivo).read_text(encoding='utf-8'))
    return datos


def evaluar(tareas, root, casos=None):
    seleccion = json.loads((root / 'captura.json').read_text(encoding='utf-8'))
    digest = hashlib.sha256((ROOT / 'ecologica/espec.py').read_bytes()).hexdigest()
    if seleccion.get('hash_espec') != digest:
        raise ValueError('Captura de otra especificación')
    capturados = seleccion['casos']
    if not capturados or len(set(capturados)) != len(capturados) or not set(capturados) <= tareas.keys():
        raise ValueError('Selección inválida')
    casos = capturados if casos is None else casos
    if not casos or len(set(casos)) != len(casos) or set(casos) != set(capturados):
        raise ValueError('--casos debe coincidir con la partición de captura.json, sin vacíos ni duplicados')
    salida, filas = {}, []
    for tid in casos:
        t = tareas[tid]
        estados, oraculos, detalles, errores = {}, {}, {}, []
        for variante in ['base', *t['variantes']]:
            carpeta = root / tid / variante
            try:
                if (carpeta / 'error.txt').exists():
                    raise ValueError((carpeta / 'error.txt').read_text(encoding='utf-8'))
                estados[variante] = leer_captura(carpeta)
                oraculos[variante] = json.loads((carpeta / 'oraculo.json').read_text(encoding='utf-8'))
            except (OSError, ValueError, TypeError) as e:
                errores.append(variante + ': ' + str(e))
        for variante in ['base', *t['variantes']]:
            if variante not in estados or 'base' not in estados or variante not in oraculos or 'base' not in oraculos:
                detalles[variante] = dict(resultado='error de captura')
                continue
            r = corregir(dict(caso=tid, respuesta_textual='{"hecho":true,"cambios":[],"impedimento":""}'),
                t, estados['base'], estados[variante], dict(antes=oraculos['base'], despues=oraculos[variante]),
                oraculos.get('correcta') if 'objetivo' in t else None)
            if r.get('fallo_preparacion'):
                errores.append(variante + ': ' + r.get('motivo', 'evidencia incompleta'))
            detalles[variante] = r
            filas.append(dict(tarea=tid, variante=variante, **r))
        motivos = list(errores)
        if detalles['base'].get('objetivo_alcanzado') is not False:
            motivos.append('Base no acredita objetivo incumplido')
        if detalles['base'].get('colateral_guarda'):
            motivos.append('Guardas de base incoherentes')
        for variante in t['variantes']:
            r = detalles[variante]
            if variante == 'correcta':
                valido = r.get('objetivo_alcanzado') is True and not r.get('colateral_guarda') and not r.get('fallo_preparacion')
            elif variante == 'obvia':
                valido = r.get('resultado') == 'correcta'
            else:
                valido = r.get('resultado') == 'sin_efecto' or bool(r.get('colaterales'))
            if not valido:
                motivos.append(variante + ': no reproduce el contraste requerido')
        salida[tid] = dict(resultado='no_admitida' if motivos else 'admitida',
            referencia_bateria=f'{tid}/correcta/oraculo.json' if 'objetivo' in t else None,
            captura_completa=not errores,
            motivo='; '.join(motivos) if motivos else 'Base, correcta y contrastes nativos verificados',
            estrato=t['estrato'], familia=t['familia'], variantes=detalles)
    return dict(adr='ADR-098', regla_colaterales='ADR-098, punto 6', valido=all(t['resultado'] == 'admitida' for t in salida.values()),
        tareas=salida, filas=filas, hash_espec=digest,
        hashes_evidencia={p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(root.rglob('*')) if p.is_file() and not p.name.startswith('admision')})


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('capturas', type=Path)
    p.add_argument('--casos', help='Ids de la partición; deben coincidir con captura.json.')
    a = p.parse_args()
    spec = importlib.util.spec_from_file_location('med12_espec', ROOT / 'ecologica/espec.py')
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    admision = a.capturas / 'admision.json'
    if admision.exists():
        p.error('Ya existe admision.json; conservar evidencia y usar una captura nueva')
    try:
        datos = evaluar(m.T, a.capturas, [c.strip() for c in a.casos.split(',')] if a.casos is not None else None)
    except (OSError, KeyError, ValueError, TypeError) as error:
        p.error(str(error))
    admision.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return int(not datos['valido'])


if __name__ == '__main__':
    sys.exit(main())
