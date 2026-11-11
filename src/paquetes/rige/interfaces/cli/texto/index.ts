import type { RespuestaValores, RespuestaPermiso, RespuestaReglas, RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos,
  RespuestaComparacion, RespuestaProyectosRecientes } from "../../../aplicacion/respuestas/contrato-generado";
import type { RespuestaEstado } from "../../../aplicacion/respuestas/estado";

export interface ContextoPresentacion {
  readonly formato: "json" | "texto";
  readonly ancho: number;
  readonly esConsola: boolean;
  readonly colorHabilitado: boolean;
  readonly todo: boolean;
  readonly proyectoDesdeCarpetaActual: boolean;
  readonly explicar?: boolean;
  readonly agente?: string | undefined;
}
export interface RespuestaEstadoCli {
  readonly esquema: 2;
  readonly almacen: { readonly ruta: string; readonly existe: boolean; readonly versionEsquema: number | null };
}
const nombre = (ruta: string) => ruta.replaceAll("\\", "/").split("/").filter(Boolean).at(-1) ?? ruta;
const seguro = (texto: string) => texto.replace(/[\x00-\x1f\x7f]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
const valor = (dato: unknown) => seguro(typeof dato === "string" ? dato : JSON.stringify(dato));
const ancho = (c: ContextoPresentacion) => Math.max(40, Number.isFinite(c.ancho) && c.ancho > 0 ? Math.floor(c.ancho) : 100);
const longitud = (s: string) => Array.from(s).length;
function recortar(s: string, limite: number): string { return longitud(s) <= limite ? s : Array.from(s).slice(0, limite - 1).join("") + "…"; }
function tabla(cabecera: string[], filas: string[][], c: ContextoPresentacion): string[] {
  const maximoColumnas = Math.max(2, Math.floor((ancho(c) + 3) / 9));
  if (cabecera.length > maximoColumnas) {
    const bloques: string[] = [];
    for (let inicio = 1; inicio < cabecera.length; inicio += maximoColumnas - 1) {
      const fin = inicio + maximoColumnas - 1;
      bloques.push(...tabla([cabecera[0]!, ...cabecera.slice(inicio, fin)], filas.map(f => [f[0]!, ...f.slice(inicio, fin)]), c));
    }
    return bloques;
  }
  const todas = [cabecera, ...filas].map(fila => fila.map(seguro));
  const tamanos = cabecera.map((_, i) => Math.max(...todas.map(fila => longitud(fila[i] ?? ""))));
  while (tamanos.reduce((a, b) => a + b, 0) + (cabecera.length - 1) * 3 > ancho(c)) {
    const maximo = Math.max(...tamanos); const i = tamanos.indexOf(maximo);
    tamanos[i]!--;
  }
  return todas.map(fila => fila.map((s, i) => { const t = recortar(s, tamanos[i]!); return t + " ".repeat(tamanos[i]! - longitud(t)); }).join(" · ").trimEnd());
}
function terminar(lineas: readonly string[], c: ContextoPresentacion): string {
  const color = c.esConsola && c.colorHabilitado;
  function envolver(linea: string): string[] {
    const partes: string[] = [];
    let resto = Array.from(linea);
    while (resto.length > ancho(c)) {
      const espacio = resto.slice(0, ancho(c) + 1).lastIndexOf(" ");
      const fin = espacio > 0 ? espacio : ancho(c);
      partes.push(resto.slice(0, fin).join(""));
      resto = resto.slice(fin + (espacio > 0 ? 1 : 0));
    }
    return [...partes, resto.join("")];
  }
  return [...lineas, "Respuesta completa: --json"].flatMap(envolver).map(texto => {
    if (!color) return texto;
    const codigo = texto === "Respuesta completa: --json" ? 90 : texto.startsWith("✓") ? 32 : texto.startsWith("?") ? 33 : texto.startsWith("✗") ? 31 : undefined;
    return codigo === undefined ? texto : `\x1b[${codigo}m${texto}\x1b[0m`;
  }).join("\n") + "\n";
}
function proyecto(r: { readonly proyecto: string; readonly agente?: string }, c: ContextoPresentacion): string[] {
  return [...(r.agente === undefined ? [] : [`Agente: ${seguro(r.agente)}`]),
    `Proyecto: ${seguro(nombre(r.proyecto))}${c.proyectoDesdeCarpetaActual ? " (carpeta actual)" : ""}`];
}
type Declaracion = RespuestaValores["valores"][number]["rastro"]["determinante"];
function ubicacion(d: Declaracion | null, origen?: RespuestaPermiso["cadena"][number]["origen"]): string {
  const o = d?.origen ?? origen;
  if (o === undefined) return "sin archivo";
  if (o.tipo !== "declarado") return `${o.tipo}: ${seguro(o.regla)}`;
  return `${d?.referencia === null || d?.referencia === undefined ? "sin archivo" : seguro(nombre(d.referencia))}:${o.posicion.linea}:${o.posicion.columna}${d?.via ? ` [${seguro(d.via)}]` : ""}`;
}
function limites(r: { readonly declaraciones: readonly string[]; readonly reglas: Readonly<Record<string, string>> }): string[] {
  // Incluye límites declarados aunque no se emitan también como advertencias por stderr.
  return r.declaraciones.map(codigo => `Aviso: ${seguro(r.reglas[codigo] ?? codigo)}`);
}
function noResueltas(rutas: RespuestaValores["noResueltas"]): string[] {
  return rutas.map(r => `No resuelta: ${seguro(r.ruta.join("."))}: ${seguro(r.regla)}`);
}
export function renderizarValores(r: RespuestaValores, c: ContextoPresentacion): string {
  const visibles = r.valores.filter(v => c.todo || r.ruta !== null || v.rastro.determinante.origen.tipo === "declarado");
  const filas = visibles.map(v => [v.clave, valor(v.rastro.valor), `${ubicacion(v.rastro.determinante)} (desplaza: ${v.rastro.desplazadas.length ? ubicacion(v.rastro.desplazadas.at(-1)!) : "ninguna"})`]);
  const ocultos = r.valores.length - visibles.length;
  return terminar([...proyecto(r, c), ...tabla(["CLAVE", "VALOR", "LO DETERMINA"], filas, c),
    ...(ocultos ? [`+ ${ocultos} valores de fábrica (--todo)`] : []), ...(r.motivo ? [r.motivo] : []), ...noResueltas(r.noResueltas), ...limites(r)], c);
}
const efecto = (e: string | null) => e === "allow" ? "✓ PERMITIDO" : e === "ask" ? "? PREGUNTA" : e === "deny" ? "✗ DENEGADO" : "— SIN DECISIÓN";
function regla(r: RespuestaPermiso["cadena"][number]): string { return `#${r.indice} ${seguro(r.sujeto)} ${seguro(r.patron)} → ${seguro(r.efecto)} · ${ubicacion(r.declaracion, r.origen)}`; }
export function renderizarPermiso(r: RespuestaPermiso, c: ContextoPresentacion): string {
  const determinante = r.cadena.find(regla => regla.indice === r.determinante);
  const desplazadas = r.cadena.filter(regla => r.desplazadas.includes(regla.indice) && (r.determinante === null || regla.indice < r.determinante));
  return terminar([efecto(r.decision) + (r.decision === null ? `: ${seguro(r.motivoSinDecision ?? "sin motivo")}` : ""),
    ...proyecto(r, c), `Consulta: ${seguro(r.consulta.sujeto)} · ${seguro(r.consulta.objetivo)}`,
    `Decide: ${determinante ? regla(determinante) : "ninguna"}`, `Desplaza: ${desplazadas.length ? regla(desplazadas.at(-1)!) : "ninguna"}`,
    ...(r.nativaAnulada ? [`Protección nativa anulada: #${r.nativaAnulada.regla} por #${r.nativaAnulada.por}`] : []),
    ...(c.explicar ? [...(r.explicacion ?? []).map(seguro), "Cadena coincidente:", ...r.cadena.filter(regla => regla.indice === r.determinante || r.desplazadas.includes(regla.indice)).map(regla)] : []),
    ...r.advertencias.map(a => `Advertencia: ${seguro(r.reglas[a] ?? a)}`), ...limites(r)], c);
}
export function renderizarReglas(r: RespuestaReglas, c: ContextoPresentacion): string {
  const filas = r.matriz.filas.map(f => [f.agente, ...r.matriz.sujetos.map(s => {
    const celda = f.celdas.find(celda => celda.sujeto === s);
    if (!celda || celda.efecto === null) return f.ejesParciales.includes(s) || celda?.motivo === "parcial" ? "◐" : "—";
    return f.ejesParciales.includes(s) ? "◐" : efecto(celda.efecto).split(" ")[0]!;
  })]);
  return terminar([...proyecto(r, c), ...tabla(["AGENTE", ...r.matriz.sujetos], filas, c),
    "✓ permitido · ? pregunta · ✗ denegado", "◐ parcial, sin decisión sobre un objetivo · — sin decisión",
    ...r.matriz.filas.flatMap(f => [...(f.error ? [`${f.agente}: ${f.error.mensaje}`] : []), ...f.celdas.filter(celda => celda.motivo !== null).map(celda => `${f.agente}/${celda.sujeto}: ${celda.motivo}`), ...f.advertencias.map(a => `${f.agente}: ${a}`)]).map(seguro),
    ...r.matriz.noObservados.map(a => `No observado: ${seguro(a.nombre)}: ${seguro(a.motivo ?? "sin dato")}`), ...r.matriz.motivos.map(seguro),
    ...(r.ejesParciales.length ? [`Ejes parciales: ${r.ejesParciales.map(seguro).join(", ")}`] : []),
    ...(c.todo ? ["Cadena completa:", ...r.cadena.map(regla)] : []), ...r.advertencias.map(a => `Advertencia: ${seguro(a)}`), ...limites(r)], c);
}
export function renderizarAgentes(r: RespuestaAgentes, c: ContextoPresentacion): string {
  return terminar([...proyecto(r, c), ...tabla(["AGENTE", "ORIGEN", "MODO", "OCULTO"], r.agentes.map(a => [a.nombre, a.origen, a.modo, a.oculto ? "sí" : "no"]), c),
    ...r.eliminados.map(a => `Eliminado: ${seguro(a.nombre)} · ${ubicacion(a.declaracion)}`), ...(r.incompleta ? [`Análisis incompleto: ${r.motivos.map(seguro).join(", ")}`] : []), ...limites(r)], c);
}
export function renderizarEntradas(r: RespuestaEntradas, c: ContextoPresentacion): string {
  return terminar([...proyecto(r, c), "Precedencia: la de abajo prevalece",
    ...tabla(["VÍA", "ENTRADA", "CONDICIÓN"], r.entradas.map(e => [e.via, nombre(e.referencia), e.legibilidad === "ilegible" ? "ilegible" : e.condicion]), c),
    ...(r.vias ?? []).map(v => `${seguro(v.via)}: ${v.estado} (${v.cantidad})`), ...limites(r)], c);
}
export function renderizarHallazgos(r: RespuestaHallazgos, c: ContextoPresentacion): string {
  const grupos = [...new Set(r.hallazgos.map(h => h.tipo))];
  return terminar([...proyecto(r, c), ...(r.incompleta ? [`Análisis incompleto: ${r.motivos.map(seguro).join(", ")}`] : []),
    ...(r.hallazgos.length ? grupos.flatMap(tipo => [tipo, ...r.hallazgos.filter(h => h.tipo === tipo).map(h => `${seguro(nombre(h.entrada.referencia))}:${h.posicion.linea}:${h.posicion.columna} · ${seguro(h.causa)}${c.explicar && h.explicacion ? ` · ${seguro(h.explicacion)}` : ""}`)]) : ["Sin hallazgos"]), ...limites(r)], c);
}
export function renderizarRecientes(r: RespuestaProyectosRecientes, c: ContextoPresentacion): string {
  return terminar(r.proyectos.length ? tabla(["PROYECTO", "FOTO", "INSTANTE", "CANTIDAD"], r.proyectos.map(p => [nombre(p.proyecto), String(p.id), p.instante, String(p.cantidad)]), c) : ["Sin proyectos recientes"], c);
}
export function renderizarComparacion(r: RespuestaComparacion, c: ContextoPresentacion): string {
  return terminar([...proyecto(r, c), `Comparación: #${r.desde.id} (${seguro(r.desde.instante)}) → #${r.hasta.id} (${seguro(r.hasta.instante)})`,
    ...(r.parcial ? ["Análisis incompleto: comparación parcial"] : []),
    ...["agregados", "quitados", "inciertos"].flatMap(tipo => { const lista = r.agentes[tipo as "agregados" | "quitados" | "inciertos"].filter(a => !c.agente || a === c.agente); return lista.length ? [`Agentes ${tipo}: ${lista.map(seguro).join(", ")}`] : []; }),
    ...r.comparaciones.filter(a => !c.agente || a.agente === c.agente).flatMap(a => [seguro(a.agente), ...(a.cambios.length
      ? tabla(["CLAVE", "ANTES", "DESPUÉS"], a.cambios.map(v => [v.ruta.join("."), v.antes ? `${valor(v.antes.valor)} · ${ubicacion(v.antes.determinante)}` : "—", v.despues ? `${valor(v.despues.valor)} · ${ubicacion(v.despues.determinante)}` : "—"]), c)
      : ["Sin cambios"])]),
    ...[r.desde, r.hasta].flatMap(f => [...noResueltas(f.noComparables), ...f.motivosAgentes.map(seguro)])], c);
}
export function renderizarEstado(r: RespuestaEstadoCli | RespuestaEstado, c: ContextoPresentacion): string {
  return terminar(["Almacén: " + seguro(r.almacen.ruta), `Existe: ${"existe" in r.almacen ? r.almacen.existe ? "sí" : "no" : "sí"}`, `Versión de esquema: ${r.almacen.versionEsquema ?? "sin esquema"}`], c);
}
export function renderizarServidor(r: { readonly direccion: string }, c: ContextoPresentacion): string { return terminar([`RIGE: ${seguro(r.direccion)}`], c); }

export function renderizar(comando: string, respuesta: object, c: ContextoPresentacion): string {
  switch (comando) {
    case "valores": return renderizarValores(respuesta as RespuestaValores, c);
    case "permiso": return renderizarPermiso(respuesta as RespuestaPermiso, c);
    case "reglas": return renderizarReglas(respuesta as RespuestaReglas, c);
    case "agentes": return renderizarAgentes(respuesta as RespuestaAgentes, c);
    case "entradas": return renderizarEntradas(respuesta as RespuestaEntradas, c);
    case "hallazgos": return renderizarHallazgos(respuesta as RespuestaHallazgos, c);
    case "recientes": return renderizarRecientes(respuesta as RespuestaProyectosRecientes, c);
    case "comparar": return renderizarComparacion(respuesta as RespuestaComparacion, c);
    case "estado": case "esquema": return renderizarEstado(respuesta as RespuestaEstado, c);
    case "servir": return renderizarServidor(respuesta as { readonly direccion: string }, c);
    default: throw new Error(`Sin renderizador: ${comando}`);
  }
}
