#!/usr/bin/env python3
"""Genera la Figura 2 del Cap. IV (mapa de posicionamiento de las soluciones relevadas).

Fuente de los datos: nómina del 01/10/2026 (01-relevamiento/nomina-competidores-20261001.md,
33 herramientas) con la clasificación aprobada por el autor y ADR-075. Ejes de IV.4: profundidad de la
explicación (0 a 3) y granularidad de la procedencia (0 a 2). Las herramientas que comparten posición se
agrupan en un solo marcador con su cantidad; la forma del marcador distingue si operan sobre OpenCode.

Uso: python tools/figura_mapeo_competencia.py --destino <carpeta> [--nombre figura-mapeo-competencia.png]
Como los demás scripts de tools/, no fija destinos y nunca sobrescribe un archivo existente.
"""
import argparse, pathlib, sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.patches import Rectangle

plt.rcParams["font.family"] = "serif"
plt.rcParams["font.serif"] = ["Times New Roman", "Liberation Serif", "DejaVu Serif"]

D = 0.13  # desplazamiento horizontal cuando dos marcadores comparten posición

# (x, y, opera sobre OpenCode, etiqueta, desplazamiento de la etiqueta (dx, dy), alineación)
PUNTOS = [
    (0 - D, 0, True, "OCCM, CC Switch\ny agnix (3)", (-0.08, -0.24), "right"),
    (0 + D, 0, False, "Gestores, sincronizadores,\nlinters y escáneres de\notras herramientas (17)", (-0.05, 0.33), "left"),
    (1 - D, 0, True, "Comando nativo de\nconfiguración fusionada", (0.0, -0.24), "right"),
    (1 + D, 0, False, "Gemini CLI, Cline\ny Goose (3)", (0.08, 0.22), "left"),
    (2, 0, True, "Comando nativo de\nresolución por agente", (0.08, -0.24), "left"),
    (3, 0, False, "Codex,\nexecpolicy check", (-0.10, 0.22), "right"),
    (1, 1, False, "Extensión para Claude Code\n(Onufriichuk, 2026), Codex config/read\ny funciones nativas de Claude Code,\nCursor, Copilot y Aider (6)", (0.08, 0.34), "left"),
    (3, 1, False, "Amp,\npermissions test", (-0.10, -0.22), "right"),
]


def dibujar(salida):
    fig, ax = plt.subplots(figsize=(9.3, 7.0))
    ax.add_patch(Rectangle((2.5, 1.5), 1.0, 0.85, color="#e5e5e5", zorder=0, lw=0))
    ax.text(3.45, 2.25, "Cuadrante sin ocupación", fontsize=12, style="italic", color="#555",
            ha="right", va="center")
    for x in range(4):
        ax.axvline(x, color="#d9d9d9", lw=0.8, zorder=0)
    for y in range(3):
        ax.axhline(y, color="#d9d9d9", lw=0.8, zorder=0)

    for x, y, propio, etiqueta, (dx, dy), ha in PUNTOS:
        if propio:
            ax.plot(x, y, "o", ms=13, color="black", zorder=3)
        else:
            ax.plot(x, y, "s", ms=11, mfc="white", mec="black", mew=1.8, zorder=3)
        ax.text(x + dx, y + dy, etiqueta, fontsize=11.5, ha=ha, va="center", zorder=4)

    ax.plot(3, 2, "*", ms=26, color="black", zorder=3)
    ax.text(2.88, 2.08, "RIGE", fontsize=13, weight="bold", ha="right", va="center")

    ax.set_xlim(-0.95, 3.5)
    ax.set_ylim(-0.5, 2.5)
    ax.set_xticks(range(4))
    ax.set_xticklabels(["0\nNo resuelve\n(edita o valida)", "1\nResultado\nfusionado",
                        "2\nLista valores o\nreglas en orden", "3\nEvalúa la decisión\ncon regla determinante"],
                       fontsize=11)
    ax.set_yticks(range(3))
    ax.set_yticklabels(["0 · Ninguna", "1 · Por alcance\no capa", "2 · Por declaración:\nentrada, archivo\ny posición"],
                       fontsize=11)
    ax.set_xlabel("Profundidad de la explicación", fontsize=14, labelpad=10)
    ax.set_ylabel("Granularidad de la procedencia", fontsize=14, labelpad=10)
    for lado in ("top", "right"):
        ax.spines[lado].set_visible(False)
    ax.tick_params(length=4)

    leyenda = [
        Line2D([], [], marker="o", ls="", ms=10, color="black", label="Opera sobre OpenCode"),
        Line2D([], [], marker="s", ls="", ms=9, mfc="white", mec="black", mew=1.6,
               label="Opera sobre otra herramienta"),
    ]
    ax.legend(handles=leyenda, loc="upper left", bbox_to_anchor=(0.0, 1.0), frameon=False, fontsize=11)

    fig.tight_layout()
    fig.savefig(salida, dpi=220, bbox_inches="tight", facecolor="white")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--destino", required=True, help="Carpeta de salida")
    ap.add_argument("--nombre", default="figura-mapeo-competencia.png", help="Nombre del archivo")
    args = ap.parse_args()
    destino = pathlib.Path(args.destino)
    destino.mkdir(parents=True, exist_ok=True)
    salida = destino / args.nombre
    if salida.exists():
        sys.exit(f"Ya existe {salida}: no se sobrescribe. Elegí otro --nombre o borrá el anterior.")
    dibujar(salida)
    print(salida)


if __name__ == "__main__":
    main()
