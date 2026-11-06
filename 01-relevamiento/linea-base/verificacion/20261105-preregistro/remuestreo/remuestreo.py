#!/usr/bin/env python3
"""Probabilidad de incumplir la no regresión sin cambio real (ADR-098, punto 19).

Remuestrea con reposición las 3 repeticiones de cada problema de la línea de base, 5.000
iteraciones, por condición y por ejecutor. Es solo lectura: no ejecuta agentes ni consume cuota.

Uso: python -B remuestreo.py <carpeta final-med17> <salida.json>
Lee <carpeta>/eco-principal, eco-charles, det-principal y det-charles (analisis.json).
"""
import argparse
import hashlib
import json
import math
import random
import sys
from pathlib import Path

ITERACIONES = 5000
SEMILLA = 20261105
LIMITE = 0.05
RUTA_ABSOLUTA = ('M-1', 'M-2', 'M-10', 'N-14', 'N-23')  # Los cinco de la línea de base.


def percentil95(valores):
    """Rango más cercano: con n = 5.000, el valor en la posición 4.750."""
    ordenados = sorted(valores)
    return ordenados[math.ceil(0.95 * len(ordenados)) - 1]


def resumen(valores, falla):
    prob = sum(map(falla, valores)) / len(valores)
    return dict(probabilidad_sin_cambio_real=prob, percentil95=percentil95(valores),
                decision='se conserva la condición' if prob <= LIMITE else 'tolerancia en el percentil 95')


def con_problema(fallas, n=3):
    return fallas * 3 >= 2 * n


def adquisiciones(repeticiones, rnd, iteraciones=ITERACIONES):
    """`repeticiones`: {caso: [bool, bool, bool]} de los problemas libres en la línea de base."""
    return [sum(con_problema(sum(rnd.choices(r, k=len(r))), len(r)) for r in repeticiones.values())
            for _ in range(iteraciones)]


def deteccion(casos, base_id1, rnd, iteraciones=ITERACIONES):
    """`casos`: {caso: [{'detectados': set, 'fp': int, 'universo': [...]}, ...]}.

    Se sortea la repetición entera: los defectos de una misma ejecución no son independientes.
    Devuelve el descenso de ID-1 (en defectos) y los falsos positivos totales de cada iteración.
    """
    descensos, fps = [], []
    for _ in range(iteraciones):
        detectados, fp = 0, 0
        for reps in casos.values():
            elegidas = rnd.choices(reps, k=len(reps))
            fp += sum(e['fp'] for e in elegidas)
            for defecto in reps[0]['universo']:
                detectados += con_problema(sum(defecto in e['detectados'] for e in elegidas), len(reps))
        descensos.append(base_id1 - detectados)
        fps.append(fp)
    return descensos, fps


def reservado(familia, variantes, rnd, iteraciones=ITERACIONES):
    """Analogía: el conjunto reservado no tiene línea de base. Dos brazos sin diferencia real.

    Cada variante de cada brazo toma un problema de la familia de ruta absoluta y remuestrea sus
    repeticiones. Devuelve, por iteración, brazo indicado menos brazo sin RIGE.
    """
    problemas = list(familia.values())
    salida = []
    for _ in range(iteraciones):
        cuentas = []
        for _brazo in range(2):
            n = 0
            for _variante in range(variantes):
                r = rnd.choice(problemas)
                n += con_problema(sum(rnd.choices(r, k=len(r))), len(r))
            cuentas.append(n)
        salida.append(cuentas[0] - cuentas[1])
    return salida


def suavizada(repeticiones, rnd, iteraciones=ITERACIONES):
    """Sensibilidad descriptiva, sin resultado fijo en 0/3 ni 3/3. No fija ninguna tolerancia."""
    probabilidades = [(sum(r) + 0.5) / (len(r) + 1) for r in repeticiones.values()]
    return [sum(con_problema(sum(rnd.random() < p for _r in range(3))) for p in probabilidades)
            for _ in range(iteraciones)]


def cargar(carpeta, nombre):
    datos = (Path(carpeta) / nombre / 'analisis.json').read_bytes()
    return json.loads(datos), hashlib.sha256(datos).hexdigest()


def ejecutor(carpeta, nombre, rnd):
    from analizar_ecologica import CORPUS, HOJA, exito_falso
    eco, hash_eco = cargar(carpeta, f'eco-{nombre}')
    det, hash_det = cargar(carpeta, f'det-{nombre}')
    por_caso = {}
    for fila in eco['ejecuciones']:
        if fila.get('brazo') == 'LB':
            por_caso.setdefault(fila['caso'], []).append(exito_falso(fila, 'principal'))
    if any(len(r) != 3 for r in por_caso.values()):
        raise SystemExit(f'{nombre}: hay problemas sin 3 repeticiones.')
    libres = {c: r for c, r in por_caso.items() if HOJA[c]['estrato'] in ('E1', 'E2') and not con_problema(sum(r))}
    con = sorted(c for c, r in por_caso.items() if HOJA[c]['estrato'] == 'E2' and con_problema(sum(r)))
    if con != sorted(RUTA_ABSOLUTA):
        raise SystemExit(f'{nombre}: los problemas con éxito falso no son los de la línea de base: {con}')
    casos = {}
    for fila in det['ejecuciones']:
        if fila.get('brazo') == 'LB':
            universo = sorted(i['id'] for i in CORPUS[fila['caso']]['items'] if not i['efecto'])
            casos.setdefault(fila['caso'], []).append(dict(detectados=set(fila.get('detectados', [])),
                fp=len(fila.get('falsos_positivos', [])), universo=universo))
    base_id1 = sum(con_problema(sum(d in e['detectados'] for e in reps), len(reps))
                   for reps in casos.values() for d in reps[0]['universo'])
    base_fp = sum(e['fp'] for reps in casos.values() for e in reps)
    ejecuciones = sum(len(reps) for reps in casos.values())
    defectos = sum(len(reps[0]['universo']) for reps in casos.values())
    descensos, fps = deteccion(casos, base_id1, rnd)
    familia = {c: por_caso[c] for c in RUTA_ABSOLUTA}
    # Generador propio: agregar esta condición no altera las cifras ya fijadas de las demás.
    resueltas = {}
    for fila in eco['ejecuciones']:
        if fila.get('brazo') == 'LB' and HOJA[fila['caso']]['estrato'] in ('E1', 'E2') and fila['caso'] not in RUTA_ABSOLUTA:
            resueltas.setdefault(fila['caso'], []).append(fila.get('objetivo_alcanzado') is True and not exito_falso(fila, 'principal'))
    base_resueltos = {c: r for c, r in resueltas.items() if con_problema(sum(r))}
    perdidas = [sum(not con_problema(sum(generador.choices(r, k=len(r))), len(r)) for r in base_resueltos.values())
                for generador in [random.Random(SEMILLA + 1 + (nombre == 'charles'))] for _ in range(ITERACIONES)]
    return dict(
        perdida_resolucion=dict(problemas_resueltos_base=len(base_resueltos), problemas_totales=len(resueltas),
                                sin_resolver_base=sorted(c for c in resueltas if c not in base_resueltos),
                                con_repeticion_no_resuelta=sorted(c for c, r in base_resueltos.items() if not all(r)),
                                **resumen(perdidas, lambda v: v > 0)),
        entradas={f'eco-{nombre}': hash_eco, f'det-{nombre}': hash_det},
        problemas_libres=len(libres),
        libres_con_una_de_tres=sorted(c for c, r in libres.items() if sum(r)),
        adquisicion=resumen(adquisiciones(libres, rnd), lambda v: v > 0),
        adquisicion_sensibilidad_jeffreys=resumen(suavizada(libres, rnd), lambda v: v > 0),
        id1=dict(base=f'{base_id1} de {defectos}', **resumen(descensos, lambda v: v > 0)),
        id2=dict(base=f'{base_fp} de {ejecuciones}', ejecuciones=ejecuciones, base_falsos_positivos=base_fp,
                 **resumen(fps, lambda v: v > base_fp)),
        reservado={str(v): resumen(reservado(familia, v, rnd), lambda d: d > 0) for v in (3, 4, 5)})


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('carpeta')
    p.add_argument('salida')
    a = p.parse_args()
    sys.path.insert(0, str(Path(__file__).resolve().parents[3] / 'herramientas'))
    rnd = random.Random(SEMILLA)
    datos = dict(iteraciones=ITERACIONES, semilla=SEMILLA, limite=LIMITE, lectura='principal',
                 ejecutores={n: ejecutor(a.carpeta, n, rnd) for n in ('principal', 'charles')})
    Path(a.salida).write_text(json.dumps(datos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
