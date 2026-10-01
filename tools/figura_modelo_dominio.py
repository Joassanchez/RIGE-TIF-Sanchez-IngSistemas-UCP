#!/usr/bin/env python3
"""Genera la Figura 1 del Cap. III (modelo del dominio) como diagrama de clases conceptual UML.

Fuente de los datos: informe/cap-03/III.2-dominio-sistema-informacion.md, Tabla 2 (nueve
entidades) y Tabla 4 (trece relaciones con su multiplicidad UML, ADR-074), más la
especialización Agente → Elemento. Las cajas llevan solo el nombre: los atributos (Anexo V)
no se validaron con la referente y no se dibujan.

Uso: python tools/figura_modelo_dominio.py --destino <carpeta> [--nombre figura-modelo-dominio.png]
Como los demás scripts de tools/, no fija destinos y nunca sobrescribe un archivo existente.
"""
import argparse, pathlib, sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Polygon, Arc

AZUL, GRIS, FONDO = "#1f3864", "#555555", "#eef0f7"
W, H = 3.8, 0.8  # tamaño de cada caja

# Entidades: nombre → centro (x, y). Tres franjas: lo que se lee (izquierda), el hallazgo y la
# sustitución (centro) y lo que se resuelve (derecha).
ENT = {
    "Proyecto analizado": (3.0, 11.0),
    "Resolución": (3.0, 8.6),
    "Entrada de configuración": (3.0, 6.2),
    "Declaración": (3.0, 3.6),
    "Hallazgo": (9.5, 6.2),
    "Sustitución": (9.5, 3.6),
    "Regla de permiso": (9.5, 1.2),
    "Elemento": (16.0, 6.2),
    "Agente": (16.0, 3.6),
}


def borde(nombre, lado, d=0.0):
    """Punto sobre el borde de una caja: lado ∈ {arriba, abajo, izq, der}; d desplaza sobre el borde."""
    x, y = ENT[nombre]
    return {"arriba": (x + d, y + H / 2), "abajo": (x + d, y - H / 2),
            "izq": (x - W / 2, y + d), "der": (x + W / 2, y + d)}[lado]


def linea(ax, puntos, estilo="-"):
    xs, ys = zip(*puntos)
    ax.plot(xs, ys, color=GRIS, lw=1.1, ls=estilo, solid_capstyle="butt", zorder=1)


def texto(ax, x, y, t, tam=8.5, color="#222", ha="center", va="center", **kw):
    ax.text(x, y, t, fontsize=tam, color=color, ha=ha, va=va, zorder=4, **kw)


def nombre(ax, x, y, t):
    """Nombre de la asociación, en cursiva, con fondo blanco para que la línea no lo tache."""
    ax.text(x, y, t, fontsize=8.5, style="italic", color=AZUL, ha="center", va="center", zorder=4,
            bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none"))


def lazo(ax, ent, etiqueta, nota=None):
    """Asociación reflexiva dibujada a la derecha de la caja, con multiplicidad 0..* en ambos extremos."""
    x0, y0 = borde(ent, "der", 0.2)
    x1, y1 = borde(ent, "der", -0.2)
    linea(ax, [(x0, y0), (x0 + 0.7, y0), (x0 + 0.7, y1), (x1, y1)])
    texto(ax, x0 + 0.1, y0 + 0.17, "0..*", ha="left", tam=8)
    texto(ax, x1 + 0.1, y1 - 0.17, "0..*", ha="left", tam=8)
    texto(ax, x0 + 0.85, y0 + (0.05 if nota else -0.2), etiqueta, tam=8.5, color=AZUL, style="italic", ha="left")
    if nota:
        texto(ax, x0 + 0.85, y0 - 0.35, nota, tam=7.5, color=GRIS, ha="left")


def dibujar(salida: pathlib.Path):
    plt.rcParams.update({"font.family": "serif"})
    fig, ax = plt.subplots(figsize=(13, 8.2))
    ax.set_xlim(0.4, 20.9)
    ax.set_ylim(0.4, 11.8)
    ax.axis("off")

    for ent, (x, y) in ENT.items():
        ax.add_patch(Rectangle((x - W / 2, y - H / 2), W, H, fc=FONDO, ec=AZUL, lw=1.3, zorder=2))
        texto(ax, x, y, ent, tam=9, color=AZUL, weight="bold")

    # Proyecto analizado 1 — 1..* Resolución
    a, b = borde("Proyecto analizado", "abajo"), borde("Resolución", "arriba")
    linea(ax, [a, b]); nombre(ax, 3.0, 9.8, "se resuelve en")
    texto(ax, 3.25, a[1] - 0.25, "1", ha="left"); texto(ax, 3.25, b[1] + 0.25, "1..*", ha="left")

    # Resolución 1 — 1..* Entrada de configuración
    a, b = borde("Resolución", "abajo"), borde("Entrada de configuración", "arriba")
    linea(ax, [a, b]); nombre(ax, 3.0, 7.4, "lee")
    texto(ax, 3.25, a[1] - 0.25, "1", ha="left"); texto(ax, 3.25, b[1] + 0.25, "1..*", ha="left")

    # Entrada 1 — 0..* Declaración
    a, b = borde("Entrada de configuración", "abajo", -0.5), borde("Declaración", "arriba", -0.5)
    linea(ax, [a, b]); nombre(ax, 2.5, 4.9, "contiene")
    texto(ax, 2.3, a[1] - 0.25, "1", ha="right"); texto(ax, 2.3, b[1] + 0.25, "0..*", ha="right")

    # Declaración «es desplazada por» Declaración (0..1 — 0..1), lazo a la izquierda
    x0, y0 = borde("Declaración", "izq", 0.2); x1, y1 = borde("Declaración", "izq", -0.2)
    linea(ax, [(x0, y0), (x0 - 0.6, y0), (x0 - 0.6, y1), (x1, y1)])
    texto(ax, x0 - 0.62, y1 - 0.55, "es desplazada por", tam=8, color=AZUL, style="italic", ha="left")
    texto(ax, x0 - 0.1, y0 + 0.17, "0..1", ha="right", tam=8); texto(ax, x1 - 0.1, y1 - 0.17, "0..1", ha="right", tam=8)

    # Declaración 1 — 0..* Sustitución
    a, b = borde("Declaración", "der"), borde("Sustitución", "izq")
    linea(ax, [a, b]); nombre(ax, 6.15, 3.6, "contiene")
    texto(ax, a[0] + 0.15, a[1] + 0.2, "1", ha="left"); texto(ax, b[0] - 0.15, b[1] + 0.2, "0..*", ha="right")

    # Declaración 0..1 — 0..* Regla de permiso (origina)
    a, b = borde("Declaración", "abajo", 0.0), borde("Regla de permiso", "izq")
    linea(ax, [a, (a[0], b[1]), b]); nombre(ax, 5.9, 1.2, "origina")
    texto(ax, a[0] + 0.15, a[1] - 0.25, "0..1", ha="left"); texto(ax, b[0] - 0.15, b[1] + 0.2, "0..*", ha="right")

    # Resolución 1 — 0..* Hallazgo (produce)
    a, b = borde("Resolución", "der"), borde("Hallazgo", "arriba", -0.6)
    linea(ax, [a, (b[0], a[1]), b]); nombre(ax, 6.4, 8.6, "produce")
    texto(ax, a[0] + 0.15, a[1] + 0.22, "1", ha="left"); texto(ax, b[0] - 0.15, b[1] + 0.3, "0..*", ha="right")

    # Resolución 1 — 1..* Elemento (comprende)
    a, b = borde("Resolución", "arriba", 1.2), borde("Elemento", "arriba")
    linea(ax, [a, (a[0], 9.5), (b[0], 9.5), b]); nombre(ax, 12.8, 9.5, "comprende")
    texto(ax, a[0] + 0.15, a[1] + 0.22, "1", ha="left"); texto(ax, b[0] + 0.15, b[1] + 0.3, "1..*", ha="left")

    # Hallazgo 0..* — 1 {xor} Entrada | Declaración | Sustitución | Elemento (recae sobre)
    h, e = borde("Hallazgo", "izq"), borde("Entrada de configuración", "der")
    linea(ax, [h, e]); nombre(ax, 6.25, 6.2, "recae sobre")
    texto(ax, e[0] + 0.15, e[1] + 0.2, "1", ha="left"); texto(ax, h[0] - 0.15, h[1] + 0.2, "0..*", ha="right")
    h, el = borde("Hallazgo", "der"), borde("Elemento", "izq")
    linea(ax, [h, el]); nombre(ax, 12.75, 6.2, "recae sobre")
    texto(ax, el[0] - 0.15, el[1] + 0.2, "1", ha="right"); texto(ax, h[0] + 0.15, h[1] + 0.2, "0..*", ha="left")
    h, d = borde("Hallazgo", "abajo", -1.0), borde("Declaración", "arriba", 0.5)
    linea(ax, [h, (h[0], 4.95), (d[0], 4.95), d]); nombre(ax, 5.6, 4.95, "recae sobre")
    texto(ax, h[0] - 0.12, 5.25, "0..*", ha="right"); texto(ax, d[0] + 0.12, d[1] + 0.22, "1", ha="left")
    h, s = borde("Hallazgo", "abajo", 0.6), borde("Sustitución", "arriba", 0.6)
    linea(ax, [h, s]); nombre(ax, h[0], 4.65, "recae sobre")
    texto(ax, h[0] + 0.12, 5.25, "0..*", ha="left"); texto(ax, s[0] + 0.12, s[1] + 0.22, "1", ha="left")
    ax.add_patch(Arc(ENT["Hallazgo"], W + 0.9, 1.5, theta1=180, theta2=360, color=GRIS, ls="--", lw=0.9, zorder=1))
    texto(ax, 12.1, 5.55, "{xor}", tam=9, color=AZUL, style="italic")

    # Elemento 1..* — 0..* Declaración (se compone de), por debajo de la Sustitución
    a, b = borde("Elemento", "izq", -0.3), borde("Declaración", "abajo", 0.6)
    xr = 13.6
    linea(ax, [a, (xr, a[1]), (xr, 2.45), (b[0], 2.45), b]); nombre(ax, 9.5, 2.45, "se compone de")
    texto(ax, a[0] - 0.15, a[1] - 0.22, "1..*", ha="right"); texto(ax, b[0] + 0.12, b[1] - 0.25, "0..*", ha="left")

    # Elemento 0..* — 0..* Elemento (se relaciona con, diferida)
    lazo(ax, "Elemento", "se relaciona con", "(diferida, RF-13)")

    # Especialización Agente → Elemento (triángulo hueco en Elemento)
    a, b = borde("Agente", "arriba", 0.6), borde("Elemento", "abajo", 0.6)
    linea(ax, [a, (b[0], b[1] - 0.3)])
    ax.add_patch(Polygon([(b[0] - 0.18, b[1] - 0.3), (b[0] + 0.18, b[1] - 0.3), b],
                         closed=True, fc="white", ec=GRIS, lw=1.1, zorder=3))

    # Agente 1..* — 1..* Regla de permiso {ordenada} (evalúa)
    a, b = borde("Agente", "abajo"), borde("Regla de permiso", "der")
    linea(ax, [a, (a[0], b[1]), b]); nombre(ax, 13.6, 1.2, "evalúa")
    texto(ax, a[0] + 0.15, a[1] - 0.25, "1..*", ha="left"); texto(ax, b[0] + 0.15, b[1] + 0.2, "1..*", ha="left")
    texto(ax, b[0] + 0.15, b[1] - 0.22, "{ordenada}", ha="left", tam=8, color=AZUL, style="italic")

    # Agente 0..* — 0..* Agente (invoca)
    lazo(ax, "Agente", "invoca")

    fig.savefig(salida, dpi=220, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--destino", required=True, help="Carpeta de salida")
    ap.add_argument("--nombre", default="figura-modelo-dominio.png")
    args = ap.parse_args()
    destino = pathlib.Path(args.destino)
    destino.mkdir(parents=True, exist_ok=True)
    salida = destino / args.nombre
    if salida.exists():
        sys.exit(f"Ya existe {salida}; no se sobrescribe. Elegí otro --nombre o movelo.")
    dibujar(salida)
    print(f"Figura generada: {salida}")


if __name__ == "__main__":
    main()
