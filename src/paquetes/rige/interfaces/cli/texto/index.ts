import type { RespuestaValores, RespuestaPermiso, RespuestaReglas, RespuestaAgentes, RespuestaEntradas, RespuestaHallazgos,
  RespuestaComparacion, RespuestaProyectosRecientes } from "../../../aplicacion/respuestas/contrato-generado";
import type { RespuestaEstado } from "../../../aplicacion/respuestas/estado";
import { fechaLocal } from "../../presentacion/fechas";

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
const atenuar = (s: string, c: ContextoPresentacion) => c.esConsola && c.colorHabilitado ? `\x1b[90m${s}\x1b[0m` : s;
// Las filas ya están compuestas por columnas: no se envuelven como párrafos.
type Linea = string | { readonly tabla: string };
function tabla(cabecera: string[], filas: string[][], c: ContextoPresentacion, variable = true, marcas: readonly string[] = []): Linea[] {
  const maximoColumnas = Math.max(2, Math.floor((ancho(c) + 3) / 9));
  if (cabecera.length > maximoColumnas) {
    const bloques: Linea[] = [];
    for (let inicio = 1; inicio < cabecera.length; inicio += maximoColumnas - 1) {
      const fin = inicio + maximoColumnas - 1;
      bloques.push(...tabla([cabecera[0]!, ...cabecera.slice(inicio, fin)], filas.map(f => [f[0]!, ...f.slice(inicio, fin)]), c, variable));
    }
    return bloques;
  }
  const todas = [cabecera.map(s => s.toUpperCase()), ...filas].map(fila => fila.map(seguro));
  const tamanos = cabecera.map((_, i) => Math.max(...todas.map(fila => longitud(fila[i] ?? ""))));
  const ultima = cabecera.length - 1;
  if (variable) {
    const disponible = ancho(c) - tamanos.slice(0, -1).reduce((a, b) => a + b, 0) - ultima * 2;
    tamanos[ultima] = Math.min(tamanos[ultima]!, Math.max(longitud(cabecera[ultima]!), disponible));
  }
  const componer = (fila: string[]) => fila.map((s, i) => {
    const t = variable && i === ultima ? recortar(s, tamanos[i]!) : s;
    return t + " ".repeat(Math.max(0, tamanos[i]! - longitud(t)));
  }).join("  ").trimEnd();
  return [{ tabla: atenuar(componer(todas[0]!), c) },
    { tabla: atenuar(tamanos.map(n => "-".repeat(n)).join("  "), c) },
    ...todas.slice(1).map((fila, i) => ({ tabla: componer(fila) + (marcas[i] ? `  ${atenuar(seguro(marcas[i]!), c)}` : "") }))];
}
function terminar(lineas: readonly Linea[], c: ContextoPresentacion, indivisibles: readonly string[] = []): string {
  const color = c.esConsola && c.colorHabilitado;
  const protegidos = [...new Set(indivisibles)].filter(s => s.includes(" "));
  function envolver(linea: string): string[] {
    if (longitud(linea) <= ancho(c)) return [linea];
    // Los espacios interiores de una ruta conocida también pertenecen a la ruta.
    const rangos: { inicio: number; fin: number }[] = [];
    for (const texto of protegidos) {
      for (let inicio = linea.indexOf(texto); inicio !== -1; inicio = linea.indexOf(texto, inicio + texto.length)) {
        rangos.push({ inicio, fin: inicio + texto.length });
      }
    }
    const palabras: string[] = [];
    let inicio = 0;
    for (let i = 0; i <= linea.length; i++) {
      if (i === linea.length || (linea[i] === " " && !rangos.some(r => i >= r.inicio && i < r.fin))) {
        if (i > inicio) palabras.push(linea.slice(inicio, i));
        inicio = i + 1;
      }
    }
    const partes: string[] = [];
    let actual = "";
    for (const palabra of palabras) {
      if (actual && longitud(actual) + 1 + longitud(palabra) > ancho(c)) { partes.push(actual); actual = ""; }
      actual += (actual ? " " : "") + palabra;
    }
    return [...partes, actual];
  }
  return [...lineas, "Respuesta completa: --json"].flatMap(linea => typeof linea === "string" ? envolver(linea) : [linea.tabla]).map(texto => {
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
function referencias(declaraciones: readonly (Declaracion | null)[]): string[] {
  return declaraciones.flatMap(d => d?.referencia ? [seguro(d.referencia), seguro(nombre(d.referencia))] : []);
}
function ubicacion(d: Declaracion | null, origen?: RespuestaPermiso["cadena"][number]["origen"]): string {
  const o = d?.origen ?? origen;
  if (o === undefined) return "sin archivo";
  if (o.tipo === "nativo") {
    const tipos: Readonly<Record<string, string>> = { "nativa-general": "general", "nativa-agente": "agente", "nativa-final": "final", "denegacion-subagente": "final" };
    return tipos[o.regla] ? `OpenCode · ${tipos[o.regla]}` : "OpenCode";
  }
  if (o.tipo !== "declarado") return `${o.tipo}: ${seguro(o.regla)}`;
  return `${d?.referencia === null || d?.referencia === undefined ? "sin archivo" : seguro(nombre(d.referencia))}:${o.posicion.linea}:${o.posicion.columna}${d?.via ? ` (${seguro(d.via)})` : ""}`;
}
const limitesGenerales = new Set(["aprobaciones-permanentes-excluidas", "sesion-no-interactiva-excluida", "numeracion-sin-directorios-externos"]);
function limites(r: { readonly declaraciones: readonly string[]; readonly reglas: Readonly<Record<string, string>> }, c?: ContextoPresentacion): string[] {
  // Incluye límites declarados aunque no se emitan también como advertencias por stderr.
  return r.declaraciones.filter(codigo => c === undefined || c.explicar || !limitesGenerales.has(codigo)).map(codigo => `Aviso: ${seguro(r.reglas[codigo] ?? codigo)}`);
}
function noResueltas(rutas: RespuestaValores["noResueltas"]): string[] {
  return rutas.map(r => `No resuelta: ${seguro(r.ruta.join("."))}: ${seguro(r.regla)}`);
}
export function renderizarValores(r: RespuestaValores, c: ContextoPresentacion): string {
  const visibles = r.valores.filter(v => c.todo || r.ruta !== null || v.rastro.determinante.origen.tipo === "declarado");
  const filas = visibles.map(v => [v.clave, valor(v.rastro.valor),
    v.rastro.desplazadas.length ? recortar(valor(v.rastro.desplazadas.at(-1)!.valor), 16) : "ninguna", ubicacion(v.rastro.determinante)]);
  const ocultos = r.valores.length - visibles.length;
  return terminar([...proyecto(r, c), ...tabla(["CLAVE", "VALOR", "ANTES", "LO DETERMINA"], filas, c),
    ...(c.todo ? visibles.filter(v => v.rastro.desplazadas.length).flatMap(v => [
      `Desplazadas de ${seguro(v.clave)}:`, ...v.rastro.desplazadas.map(d => `${valor(d.valor)} · ${ubicacion(d)}`)]) : []),
    ...(ocultos ? [`+ ${ocultos} valores de fábrica (--todo)`] : []), ...(r.motivo ? [r.motivo] : []), ...noResueltas(r.noResueltas), ...limites(r)], c,
    referencias(visibles.flatMap(v => [v.rastro.determinante, ...v.rastro.desplazadas])));
}
const efecto = (e: string | null) => e === "allow" ? "✓ PERMITIDO" : e === "ask" ? "? PREGUNTA" : e === "deny" ? "✗ DENEGADO" : "— SIN DECISIÓN";
function regla(r: RespuestaPermiso["cadena"][number]): string { return `#${r.indice + 1} ${seguro(r.sujeto)} ${seguro(r.patron)} → ${seguro(r.efecto)} · ${ubicacion(r.declaracion, r.origen)}`; }
export function renderizarPermiso(r: RespuestaPermiso, c: ContextoPresentacion): string {
  const determinante = r.cadena.find(regla => regla.indice === r.determinante);
  const desplazadas = r.cadena.filter(regla => r.desplazadas.includes(regla.indice) && (r.determinante === null || regla.indice < r.determinante));
  return terminar([efecto(r.decision) + (r.decision === null ? `: ${seguro(r.motivoSinDecision ?? "sin motivo")}` : ""),
    ...proyecto(r, c), `Consulta: ${seguro(r.consulta.sujeto)} · ${seguro(r.consulta.objetivo)}`,
    `Decide: ${determinante ? regla(determinante) : "ninguna"}`, `Desplaza: ${desplazadas.length ? regla(desplazadas.at(-1)!) : "ninguna"}`,
    ...(r.nativaAnulada ? [`Protección nativa anulada: #${r.nativaAnulada.regla + 1} por #${r.nativaAnulada.por + 1}`] : []),
    ...(c.explicar ? [...(r.explicacion ?? []).map(seguro), "Cadena coincidente:", ...r.cadena.filter(regla => regla.indice === r.determinante || r.desplazadas.includes(regla.indice)).map(regla)] : []),
    ...r.advertencias.filter(a => c.explicar || !limitesGenerales.has(a)).map(a => `Advertencia: ${seguro(r.reglas[a] ?? a)}`), ...limites(r, c)], c,
    [seguro(r.consulta.objetivo), ...r.cadena.map(r => seguro(r.patron)), ...referencias(r.cadena.map(r => r.declaracion))]);
}
export function renderizarReglas(r: RespuestaReglas, c: ContextoPresentacion): string {
  const explicarCodigo = (codigo: string) => seguro(r.reglas[codigo] ?? codigo.replaceAll("-", " "));
  const visible = (codigo: string) => c.explicar || !limitesGenerales.has(codigo);
  const comunes = (obtener: (f: RespuestaReglas["matriz"]["filas"][number]) => readonly string[]) =>
    r.matriz.filas.length ? [...new Set(obtener(r.matriz.filas[0]!))].filter(s => r.matriz.filas.every(f => obtener(f).includes(s))) : [];
  const ejesComunes = comunes(f => f.ejesParciales);
  const avisosComunes = comunes(f => [...f.declaraciones, ...f.advertencias]).filter(visible);
  const motivo = (codigo: string) => codigo === "parcial" || codigo === "eje-parcialmente-observado"
    ? "parcial; no hay decisión sin un objetivo concreto" : explicarCodigo(codigo);
  const filas = r.matriz.filas.map(f => [f.agente, ...r.matriz.sujetos.map(s => {
    const celda = f.celdas.find(celda => celda.sujeto === s);
    if (!celda || celda.efecto === null) return f.ejesParciales.includes(s) || celda?.motivo === "parcial" ? "◐" : "—";
    return f.ejesParciales.includes(s) ? "◐" : efecto(celda.efecto).split(" ")[0]!;
  })]);
  return terminar([...proyecto(r, c), ...tabla(["AGENTE", ...r.matriz.sujetos], filas, c, false),
    "✓ permitido · ? pregunta · ✗ denegado", "◐ parcial, sin decisión sobre un objetivo · — sin decisión",
    ...ejesComunes.map(s => `${seguro(s)}: parcial en todos los agentes; no hay decisión sin un objetivo concreto`),
    ...(avisosComunes.length ? [`Todos los agentes: ${avisosComunes.map(explicarCodigo).join("; ")}`] : []),
    ...r.matriz.filas.flatMap(f => [...(f.error ? [`${seguro(f.agente)}: ${seguro(f.error.mensaje)}`] : []),
      ...f.ejesParciales.filter(s => !ejesComunes.includes(s)).map(s => `${seguro(f.agente)}/${seguro(s)}: ${motivo("parcial")}`),
      ...f.celdas.filter(celda => celda.motivo !== null && !f.ejesParciales.includes(celda.sujeto)).map(celda => `${seguro(f.agente)}/${seguro(celda.sujeto)}: ${motivo(celda.motivo!)}`),
      ...[...new Set([...f.declaraciones, ...f.advertencias])].filter(a => visible(a) && !avisosComunes.includes(a)).map(a => `${seguro(f.agente)}: ${explicarCodigo(a)}`)]),
    ...r.matriz.noObservados.map(a => `No observado: ${seguro(a.nombre)}: ${explicarCodigo(a.motivo ?? "sin dato")}`), ...r.matriz.motivos.map(explicarCodigo),
    ...(c.todo ? ["Cadena completa:", ...r.cadena.map(regla)] : []),
    ...[...new Set([...r.declaraciones, ...r.advertencias])].filter(a => visible(a)
      && !r.matriz.filas.some(f => f.declaraciones.includes(a) || f.advertencias.includes(a))).map(a => `Aviso: ${explicarCodigo(a)}`)], c,
    [...r.cadena.map(r => seguro(r.patron)), ...referencias(r.cadena.map(r => r.declaracion))]);
}
export function renderizarAgentes(r: RespuestaAgentes, c: ContextoPresentacion): string {
  const modos: Readonly<Record<string, string>> = { primary: "Principal", subagent: "Subagente", all: "Ambos" };
  return terminar([...proyecto(r, c), ...tabla(["AGENTE", "ORIGEN", "MODO"], r.agentes.map(a => [a.nombre, a.origen, modos[a.modo] ?? a.modo]), c, false, r.agentes.map(a => a.oculto ? "oculto" : "")),
    ...r.eliminados.map(a => `Eliminado: ${seguro(a.nombre)} · ${ubicacion(a.declaracion)}`), ...(r.incompleta ? [`Análisis incompleto: ${r.motivos.map(seguro).join(", ")}`] : []), ...limites(r)], c,
    referencias(r.eliminados.map(a => a.declaracion)));
}
export function renderizarEntradas(r: RespuestaEntradas, c: ContextoPresentacion): string {
  return terminar([...proyecto(r, c), "Precedencia: la de abajo prevalece",
    ...tabla(["VÍA", "ENTRADA", "CONDICIÓN"], r.entradas.map(e => [e.via, nombre(e.referencia), e.legibilidad === "ilegible" ? "ilegible" : e.condicion]), c),
    ...(r.vias ?? []).map(v => `${seguro(v.via)}: ${v.estado} (${v.cantidad})`), ...limites(r)], c);
}
export function renderizarHallazgos(r: RespuestaHallazgos, c: ContextoPresentacion): string {
  const grupos = [...new Set(r.hallazgos.map(h => h.tipo))];
  return terminar([...proyecto(r, c), ...(r.incompleta ? [`Análisis incompleto: ${r.motivos.map(seguro).join(", ")}`] : []),
    ...(r.hallazgos.length ? grupos.flatMap(tipo => [tipo, ...r.hallazgos.filter(h => h.tipo === tipo).map(h => `${seguro(nombre(h.entrada.referencia))}:${h.posicion.linea}:${h.posicion.columna} · ${seguro(h.causa)}${c.explicar && h.explicacion ? ` · ${seguro(h.explicacion)}` : ""}`)]) : ["Sin hallazgos"]), ...limites(r)], c,
    r.hallazgos.flatMap(h => [seguro(h.entrada.referencia), seguro(nombre(h.entrada.referencia))]));
}
export function renderizarRecientes(r: RespuestaProyectosRecientes, c: ContextoPresentacion): string {
  return terminar(r.proyectos.length ? tabla(["PROYECTO", "FOTO", "INSTANTE", "CANTIDAD"], r.proyectos.map(p => [nombre(p.proyecto), String(p.id), fechaLocal(p.instante), String(p.cantidad)]), c, false) : ["Sin proyectos recientes"], c);
}
export function renderizarComparacion(r: RespuestaComparacion, c: ContextoPresentacion): string {
  const agentes = r.comparaciones.filter(a => !c.agente || a.agente === c.agente);
  const sinCambios = agentes.filter(a => !a.cambios.length).map(a => seguro(a.agente));
  return terminar([...proyecto(r, { ...c, proyectoDesdeCarpetaActual: false }),
    `Cambios entre ${fechaLocal(r.desde.instante)} y ${fechaLocal(r.hasta.instante)} ${atenuar(`(#${r.desde.id}, #${r.hasta.id})`, c)}`,
    `${r.resumen.cambiadas} cambiadas · ${r.resumen.agregadas} agregadas · ${r.resumen.quitadas} quitadas · ${r.resumen.sinCambio} sin cambio`,
    ...(r.parcial ? ["Análisis incompleto: comparación parcial"] : []),
    ...["agregados", "quitados", "inciertos"].flatMap(tipo => { const lista = r.agentes[tipo as "agregados" | "quitados" | "inciertos"].filter(a => !c.agente || a === c.agente); return lista.length ? [`Agentes ${tipo}: ${lista.map(seguro).join(", ")}`] : []; }),
    ...(sinCambios.length ? [`Sin cambios en: ${sinCambios.join(", ")}`] : []),
    ...agentes.filter(a => a.cambios.length).flatMap(a => [seguro(a.agente),
      ...tabla(["CLAVE", "ANTES", "DESPUÉS", "LO DETERMINA"], a.cambios.map(v => [v.ruta.join("."),
        v.antes ? valor(v.antes.valor) : "—", v.despues ? valor(v.despues.valor) : "—",
        ubicacion(v.despues?.determinante ?? v.antes?.determinante ?? null)]), c)]),
    ...[r.desde, r.hasta].flatMap(f => [...noResueltas(f.noComparables), ...f.motivosAgentes.map(seguro)])], c);
}
export function renderizarEstado(r: RespuestaEstadoCli | RespuestaEstado, c: ContextoPresentacion): string {
  return terminar(["Almacén: " + seguro(r.almacen.ruta), `Existe: ${"existe" in r.almacen ? r.almacen.existe ? "sí" : "no" : "sí"}`, `Versión de esquema: ${r.almacen.versionEsquema ?? "sin esquema"}`], c, [seguro(r.almacen.ruta)]);
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
