import type { RespuestaEntradas } from "../../../aplicacion/respuestas/contrato-generado";
import { rutaVisible } from "../../presentacion/rutas";
import { condicionEntrada, estadoVia, nombreVia, plural } from "../../presentacion/vocabulario";
import {
  type CeldaTabla,
  type ContextoPresentacion,
  pintar,
  proyecto,
  tabla,
  seguro,
  limites,
  terminar,
  unirBloques,
} from "./formato";

function carpetaAncestro(rutaNorm: string, proyectoNorm: string): string | null {
  const proy = proyectoNorm.replace(/\/+$/, "") || "/";
  let carpeta: string;
  if (rutaNorm.endsWith("/.opencode")) {
    carpeta = rutaNorm.slice(0, -"/.opencode".length) || "/";
  } else {
    const idx = rutaNorm.lastIndexOf("/");
    if (idx === -1) return null;
    carpeta = rutaNorm.slice(0, idx) || "/";
  }
  const norm = (s: string) => s.replace(/^([a-zA-Z]):/, (_, u: string) => `${u.toLowerCase()}:`);
  const cComp = norm(carpeta);
  const pComp = norm(proy);
  if (cComp === pComp) return null;
  if (cComp === "/" ? pComp.startsWith("/") : pComp.startsWith(`${cComp}/`)) return carpeta;
  return null;
}

export function renderizarEntradas(r: RespuestaEntradas, c: ContextoPresentacion): string {
  const ctx: ContextoPresentacion = { ...c, proyecto: c.proyecto ?? r.proyecto };
  const proyNorm = ctx.proyecto ? ctx.proyecto.replaceAll("\\", "/") : undefined;
  const filas: CeldaTabla[][] = r.entradas.map(e => [
    nombreVia(e.via),
    { texto: rutaVisible(e.referencia, ctx.proyecto, ctx.hogar), rol: "declarado" },
    e.legibilidad === "ilegible" ? { texto: "ilegible", rol: "denegada" } : condicionEntrada(e.condicion),
  ]);

  const ordenTabla = [...new Set(r.entradas.map(e => e.via))];
  const viasOrdenadas = [...(r.vias ?? [])].sort((a, b) => {
    const ia = ordenTabla.indexOf(a.via);
    const ib = ordenTabla.indexOf(b.via);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return 0;
  });

  const indivisiblesRevisados: string[] = [];
  const lineasVias = viasOrdenadas.flatMap(v => {
    const cabecera = `${seguro(nombreVia(v.via))}: ${estadoVia(v.estado)} (${v.cantidad})`;
    if (!ctx.todo || v.estado !== "presente") return [cabecera];
    const entradasVia = new Set(
      r.entradas.filter(e => e.via === v.via).map(e => e.referencia.replaceAll("\\", "/"))
    );
    const items = v.revisados.map(rev => {
      const revNorm = rev.replaceAll("\\", "/");
      const anc = !entradasVia.has(revNorm) && proyNorm ? carpetaAncestro(revNorm, proyNorm) : null;
      return { rev, anc };
    });
    const carpetasAncestros = new Set(items.filter(x => x.anc !== null).map(x => x.anc!));
    const colapsar = carpetasAncestros.size > 1;
    const visibles = colapsar ? items.filter(x => x.anc === null) : items;
    const lineasRev = visibles.map(({ rev }) => {
      const vis = seguro(rutaVisible(rev, ctx.proyecto, ctx.hogar));
      indivisiblesRevisados.push(seguro(rev), vis);
      return `  ${vis}`;
    });
    if (colapsar) {
      const n = carpetasAncestros.size;
      lineasRev.push(
        `  ${pintar("estructura", `+ ${n} ${plural(n, "carpeta superior", "carpetas superiores")} sin archivo`, ctx)}`
      );
    }
    return [cabecera, ...lineasRev];
  });

  const lineas = unirBloques([
    proyecto(r, ctx),
    [
      "Precedencia: la de abajo prevalece",
      ...tabla(["VÍA", "ENTRADA", "CONDICIÓN"], filas, ctx, {
        elasticas: [],
        apilado: ([via, entrada, condicion]) => [
          pintar("declarado", entrada!, ctx),
          `  ${via!} · ${condicion === "ilegible" ? pintar("denegada", condicion, ctx) : condicion!}`,
        ],
      }),
    ],
    lineasVias,
    limites(r, ctx),
  ]);

  const indivisibles = [
    ...r.entradas.map(e => seguro(rutaVisible(e.referencia, ctx.proyecto, ctx.hogar))),
    ...indivisiblesRevisados,
  ];
  return terminar(lineas, ctx, indivisibles);
}
