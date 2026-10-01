#!/usr/bin/env python3
"""Genera la Figura 3 del Cap. V (cronograma con dependencias) a partir de la Tabla 18.

Fuente de los datos: informe/cap-05/V.4-cronograma.md (Tablas 17 y 18, con ADR-046 y ADR-047) y
V.2 (hitos y entregables documentales). La iteración 1 se presenta por los incrementos 0 a 5 con que se construye el v1. Las barras técnicas se dimensionan en proporción
a las horas de cada tarea dentro de las fechas de su iteración; las de la reserva
documental, por sus fechas declaradas. La fase de cierre se dibuja rayada porque su
duración se estima.

Uso: python tools/figura_cronograma.py --destino <carpeta> [--nombre figura-cronograma-gantt.png]
Como los demás scripts de tools/, no fija destinos y nunca sobrescribe un archivo existente.
"""
import argparse, datetime as dt, pathlib, sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.patches import Patch
from matplotlib.lines import Line2D

AZUL, GRIS, ROJO, BANDA = "#1f3864", "#9aa5b8", "#b03a2e", "#eef0f7"
D = lambda s: dt.datetime.strptime(s + "/2026", "%d/%m/%Y")

# Iteraciones: (nombre, inicio, fin, [(id, tarea, horas, depende_de)])
# Las tareas sin dependencia dentro de la iteración arrancan al inicio; las demás, al
# terminar su predecesora. Horas: Tabla 18 corregida (ADR-046; ADR-064: RNF-09, RNF-10, RF-16 y estabilización de 11 h).
ITERACIONES = [
    # Iteración 1 por incrementos (U-01, tablero): mismas 35 h de la Tabla 18.
    ("Iteración 1", "21/09", "01/10", [
        ("inc0", "Inc. 0 · Esqueleto: repositorio, CI y entorno (RNF-03, RNF-09)", 8, None),
        ("inc1", "Inc. 1 · Núcleo: resolución con procedencia (RF-01)", 6, "inc0"),
        ("inc2", "Inc. 2 · Adaptador y resultados de referencia (RF-01)", 8, "inc1"),
        ("inc3", "Inc. 3 · Almacén (RF-17, RNF-01)", 4, "inc2"),
        ("ui1", "Inc. 4 · Web y recorrido de punta a punta", 5, "inc3"),
        ("inc5", "Inc. 5 · Archivo de lectura, clonado y etiqueta v1", 4, "ui1"),
    ]),
    # Iteración 2 (ADR-047): hasta el resultado de la línea de base (16/10) avanzan las tareas que no
    # dependen de él; después, el orden que fija la Tabla 13 («Confirma»: explicación y vista web antes
    # que RF-06, RF-08 y RF-09; «Reordena»: RF-06 al frente).
    ("Iteración 2", "02/10", "24/10", [
        ("evalu", "Incorporación del evaluador de permisos (RF-02, RNF-10)", 10, "inc5"),
        ("cadena", "Cadena de reglas y herencia (RF-02)", 10, "evalu"),
        ("cli", "Línea de comandos: valores y permisos (RF-03)", 10, "cadena"),
        ("h18", "Verificación de H-18 y trabajo de oráculo", 4, "cli"),
        ("agentes", "Listado de agentes (RF-16)", 3, "h18"),
        ("expl", "Explicación de permisos (RF-02)", 5, "agentes"),
        ("webp", "Vista web de permisos (RF-02)", 4, "expl"),
        ("ext", "RF-06, RF-08 y RF-09", 14, "webp"),
    ]),
    ("Iteración 3", "26/10", "07/11", [
        ("desc", "Descubrimiento y versión (RF-04, RF-05)", 10, "ext"),
        ("hall", "Hallazgos por ambas interfaces (RF-07)", 16, "desc"),
        ("esc", "Escenarios completos (RNF-02, RNF-04, RNF-05)", 4, "hall"),
    ]),
    ("Iteración 4", "09/11", "14/11", [
        ("estab", "Estabilización, clonado y acreditación de RNF-06 y RNF-07", 11, "esc"),
    ]),
]
# Las dependencias que no son entre tareas consecutivas (núcleo → hallazgos, cadena → hallazgos y
# cadena → RF-06) se declaran en el texto de V.4 y no se dibujan, para que la figura se lea.
EXTRA = []
LINEA_BASE = ("Resultado de la\nlínea de base", "16/10")  # V.1; Tabla 13 de IV.3

HITOS = [("v1", "01/10"), ("v2", "24/10"), ("v3", "07/11"), ("congelada", "14/11")]
CIERRE = ("15/11", "28/11")  # fase de cierre estimada (V.4, línea 16: dos semanas)

TECNICA_ESTIMADA = [("medfin", "Reverificación de casos y medición final", "estab")]
RESERVA = [
    ("Informe AE2 (III, IV, V y X)", "21/09", "01/10"),
    ("Línea de base: preparación (arnés, contenedor y piloto)", "02/10", "14/10"),
    ("Línea de base: ejecución (uno o dos días)", "15/10", "16/10"),
    ("Ventana de Mejora y correcciones del AE1", "09/10", "16/10"),
    ("Capítulos VI y IX", "13/10", "29/10"),
]
RESERVA_ESTIMADA = [("Capítulos de la AE4",)]


def planificar():
    """Devuelve {id: (etiqueta, inicio, fin)} con horas convertidas a días de su iteración."""
    plan = {}
    for _, ini, fin, tareas in ITERACIONES:
        i0, i1 = D(ini), D(fin) + dt.timedelta(days=1)
        horas_en_ruta = {}
        # longitud de la ruta más larga dentro de la iteración, para escalar horas a días
        for tid, _, h, dep in tareas:
            horas_en_ruta[tid] = h + (horas_en_ruta.get(dep, 0) if dep in horas_en_ruta else 0)
        escala = (i1 - i0) / max(horas_en_ruta.values())
        for tid, etiqueta, h, dep in tareas:
            comienzo = plan[dep][2] if dep in plan and plan[dep][2] >= i0 else i0
            plan[tid] = (etiqueta, comienzo, comienzo + escala * h)
    return plan


def dibujar(salida: pathlib.Path):
    plan = planificar()
    c0, c1 = D(CIERRE[0]), D(CIERRE[1])
    filas = [(tid, *plan[tid]) for _, _, _, ts in ITERACIONES for tid, *_ in ts]
    filas += [(tid, et, plan[dep][2], c1) for tid, et, dep in TECNICA_ESTIMADA]
    n_tec = len(filas)

    plt.rcParams.update({"font.family": "serif", "font.size": 10})
    fig, ax = plt.subplots(figsize=(11.5, 7.6), dpi=200)
    y = {}
    for k, (tid, et, a, b) in enumerate(filas):
        y[tid] = k
        estimada = tid in {t[0] for t in TECNICA_ESTIMADA}
        ax.barh(k, (b - a).total_seconds() / 86400, left=a, height=0.55,
                color="white" if estimada else AZUL, edgecolor=AZUL,
                hatch="///" if estimada else None, linewidth=1)
    etiquetas = [f[1] for f in filas]
    for j, (et, a, b) in enumerate(RESERVA):
        k = n_tec + j
        ax.barh(k, (D(b) + dt.timedelta(days=1) - D(a)).days, left=D(a), height=0.55, color=GRIS)
        etiquetas.append(et)
    for j, (et,) in enumerate(RESERVA_ESTIMADA):
        k = n_tec + len(RESERVA) + j
        ax.barh(k, (c1 - c0).days, left=c0, height=0.55, color="white", edgecolor=GRIS, hatch="///")
        etiquetas.append(et)

    # dependencias
    deps = [(dep, tid) for _, _, _, ts in ITERACIONES for tid, _, _, dep in ts if dep] + EXTRA
    deps += [(dep, tid) for tid, _, dep in TECNICA_ESTIMADA]
    fin = {tid: b for tid, _, _, b in filas}
    ini = {tid: a for tid, _, a, _ in filas}
    for o, d in deps:
        x0, x1 = fin[o], max(ini[d], fin[o]) + dt.timedelta(hours=6)
        ax.annotate("", xy=(x1, y[d] - 0.3), xytext=(x0, y[o]),
                    arrowprops=dict(arrowstyle="-|>", color=ROJO, lw=0.9,
                                    connectionstyle="angle,angleA=0,angleB=90,rad=0"))

    ax.axhline(n_tec - 0.5, color="#bbb", lw=0.8)

    # bandas de iteración e hitos
    total = len(etiquetas)
    for k, (nombre, a, b, _) in enumerate(ITERACIONES):
        if k % 2 == 0:
            ax.axvspan(D(a), D(b) + dt.timedelta(days=1), color=BANDA, zorder=0)
        ax.text(D(a) + (D(b) + dt.timedelta(days=1) - D(a)) / 2, total + 0.4,
                nombre.replace("Iteración ", "Iteración\n") if (D(b) - D(a)).days < 8 else nombre,
                ha="center", va="center", fontsize=8.5, color="#444")
    ax.axvspan(c0, c1, color=BANDA, zorder=0)
    ax.text(c0 + (c1 - c0) / 2, total + 0.4, "Fase de cierre\n(estimada)", ha="center", va="center", fontsize=8.5, color="#444")
    et_lb, f_lb = LINEA_BASE
    x_lb = D(f_lb) + dt.timedelta(days=1)
    ax.axvline(x_lb, color=GRIS, ls=":", lw=1.2)
    ax.text(x_lb, -2.0, et_lb, ha="center", va="center", fontsize=8, color="#555")
    for et, f in HITOS:
        x = D(f) + dt.timedelta(days=1)
        ax.axvline(x, color="#555", ls="--", lw=0.9)
        ax.plot([x], [-0.9], marker="D", ms=7, color="#333", clip_on=False, zorder=5)
        ax.text(x + dt.timedelta(hours=14), -0.9, et, ha="left", va="center", fontsize=10, color="#333")

    ax.set_yticks(range(total), etiquetas)
    ax.set_ylim(total + 1, -2.6)
    ax.set_xlim(D("21/09"), c1)
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=mdates.MO))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    leyenda = [Patch(color=AZUL, label="Tarea técnica"),
               Patch(facecolor="white", edgecolor=AZUL, hatch="///", label="Tarea técnica estimada"),
               Patch(color=GRIS, label="Tarea de la reserva documental"),
               Patch(facecolor="white", edgecolor=GRIS, hatch="///", label="Tarea documental estimada"),
               Line2D([], [], color=ROJO, marker=">", label="Dependencia"),
               Line2D([], [], color="#555", ls="--", marker="D", ms=5, label="Hito de la cadencia"),
               Line2D([], [], color=GRIS, ls=":", label="Resultado de la línea de base")]
    ax.legend(handles=leyenda, loc="upper center", bbox_to_anchor=(0.5, -0.07), ncol=3, frameon=False, fontsize=9)
    fig.tight_layout()
    fig.savefig(salida, bbox_inches="tight", facecolor="white")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--destino", required=True, help="Carpeta de salida")
    ap.add_argument("--nombre", default="figura-cronograma-gantt.png")
    a = ap.parse_args()
    destino = pathlib.Path(a.destino)
    destino.mkdir(parents=True, exist_ok=True)
    salida = destino / a.nombre
    if salida.exists():
        sys.exit(f"No se sobrescribe {salida}: elegí otra carpeta o nombre.")
    dibujar(salida)
    print(salida)


if __name__ == "__main__":
    main()
