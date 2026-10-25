import type { Origen } from "../contrato/adaptador";
import type { ReglaCadena } from "../resolucion/tipos";
import type { RastroDecision } from "./tipos";

/** Textos y vocabulario aportados por el adaptador, sin politica en el motor. */
export interface PlantillasExplicacion {
  readonly determinante: string;
  readonly defecto: string;
  readonly desplazadas: string;
  readonly anulada: string;
  readonly origenes: Readonly<Record<Origen["tipo"], string>>;
  readonly efectos: Readonly<Record<string, string>>;
  /** Codigos de declaraciones que deben cerrar la explicacion, en este orden. */
  readonly cierre: readonly string[];
}

type Parametros = Partial<Record<"indice" | "sujeto" | "patron" | "efecto" | "archivo" | "linea" | "origen" | "total" | "desplazadas", string | number>>;
const marcadores = ["indice", "sujeto", "patron", "efecto", "archivo", "linea", "origen", "total", "desplazadas"];

function aplicar(texto: string, parametros: Parametros): string {
  // Se valida la plantilla antes de interpolar: los datos no se reinterpretan.
  if (/[{}]/.test(texto.replace(/\{[^{}]*\}/g, ""))) throw new Error("Marcador mal formado en plantilla.");
  return texto.replace(/\{([^{}]*)\}/g, (_, nombre: string) => {
    if (!marcadores.includes(nombre)) throw new Error("Marcador desconocido en plantilla.");
    const valor = parametros[nombre as keyof Parametros];
    if (valor === undefined) throw new Error(`Marcador sin valor: ${nombre}`);
    return String(valor);
  });
}

function obtener(catalogo: Readonly<Record<string, string>>, codigo: string): string {
  if (!Object.hasOwn(catalogo, codigo)) throw new Error(`Regla sin plantilla: ${codigo}`);
  return catalogo[codigo]!;
}

/** total corresponde a la cadena completa, no solo a las reglas coincidentes.
 * Nunca se accede al valor de una declaracion ni al contenido sustituido.
 */
export function explicar(rastro: RastroDecision, plantillas: PlantillasExplicacion & {
  readonly reglas: Readonly<Record<string, string>>;
}, total: number): readonly string[] {
  const base: Parametros = { total, desplazadas: rastro.desplazadas.length, sujeto: rastro.consulta.sujeto };
  if (rastro.decision !== null) base.efecto = obtener(plantillas.efectos, rastro.decision);
  function parametrosDe(regla: ReglaCadena): Parametros {
    const parametros: Parametros = { ...base, indice: regla.indice + 1, sujeto: regla.sujeto, patron: regla.patron,
      efecto: obtener(plantillas.efectos, regla.efecto) };
    if (regla.origen.tipo === "declarado") {
      if (regla.declaracion?.referencia !== null && regla.declaracion?.referencia !== undefined) parametros.archivo = regla.declaracion.referencia;
      parametros.linea = regla.origen.posicion.linea;
    }
    parametros.origen = aplicar(obtener(plantillas.origenes, regla.origen.tipo), parametros);
    if (regla.origen.tipo !== "declarado") aplicar(obtener(plantillas.reglas, regla.origen.regla), parametros);
    if (regla.declaracion) aplicar(obtener(plantillas.reglas, regla.declaracion.regla), parametros);
    return parametros;
  }
  const contextos = new Map(rastro.coincidentes.map(regla => [regla.indice, parametrosDe(regla)]));
  const oraciones: string[] = [];
  let parametros = base;
  if (rastro.decision === null) {
    if (rastro.motivoSinDecision === null) throw new Error("Falta el motivo sin decision.");
    oraciones.push(aplicar(obtener(plantillas.reglas, rastro.motivoSinDecision), parametros));
  } else if (rastro.determinante === null) {
    oraciones.push(aplicar(plantillas.defecto, parametros));
  } else {
    const contexto = contextos.get(rastro.determinante);
    if (!contexto) throw new Error("La determinante no esta entre las coincidentes.");
    parametros = contexto;
    oraciones.push(aplicar(plantillas.determinante, parametros));
    if (rastro.desplazadas.length) oraciones.push(aplicar(plantillas.desplazadas, parametros));
  }
  if (rastro.nativaAnulada !== null) {
    const nativa = rastro.coincidentes.find(r => r.indice === rastro.nativaAnulada!.regla);
    if (!nativa || nativa.origen.tipo !== "nativo") throw new Error("La regla nativa anulada no esta en el rastro.");
    oraciones.push(aplicar(plantillas.anulada, contextos.get(nativa.indice)!));
  }
  for (const codigo of [...new Set(rastro.advertencias)]) {
    oraciones.push(aplicar(obtener(plantillas.reglas, codigo), parametros));
  }
  const declaraciones = [...new Set(rastro.declaraciones)];
  for (const codigo of [...declaraciones.filter(c => !plantillas.cierre.includes(c)),
    ...plantillas.cierre.filter(c => declaraciones.includes(c))]) {
    oraciones.push(aplicar(obtener(plantillas.reglas, codigo), parametros));
  }
  return oraciones;
}
