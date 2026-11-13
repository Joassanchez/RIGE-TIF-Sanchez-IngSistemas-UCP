import type { Resultado } from "../../aplicacion/respuestas/resultado";
import type { ErrorUso } from "../../aplicacion/errores";
import type { RespuestaEstado, RespuestaEstadoCli } from "../../aplicacion/respuestas/estado";
import { versionEsquemaSalida } from "../../aplicacion/respuestas/valores";
import type { ConsultarValores } from "../../aplicacion/casos-uso/consultar-valores";
import type { SolicitudConsultaPermiso } from "../../aplicacion/casos-uso/consultar-permiso";
import type {
  RespuestaAgentes,
  RespuestaComparacion,
  RespuestaEntradas,
  RespuestaHallazgos,
  RespuestaHistorialProyecto,
  RespuestaPermiso,
  RespuestaProyectosRecientes,
  RespuestaReglas,
  RespuestaValores,
} from "../../aplicacion/respuestas/contrato-generado";
import type { SolicitudReglas } from "../../aplicacion/casos-uso/consultar-reglas";
import type { ConsultarAgentes } from "../../aplicacion/casos-uso/consultar-agentes";
import type { ConsultarEntradas } from "../../aplicacion/casos-uso/consultar-entradas";
import type { ConsultarHallazgos } from "../../aplicacion/casos-uso/consultar-hallazgos";
import { esIdResolucion } from "../../aplicacion/casos-uso/id-resolucion";
import type { ContextoPresentacion } from "./texto/formato";
import { renderizarValores } from "./texto/valores";
import { renderizarPermiso } from "./texto/permiso";
import { renderizarReglas } from "./texto/reglas";
import { renderizarAgentes } from "./texto/agentes";
import { renderizarEntradas } from "./texto/entradas";
import { renderizarHallazgos } from "./texto/hallazgos";
import { renderizarRecientes } from "./texto/recientes";
import { renderizarComparacion } from "./texto/comparacion";
import { renderizarEstado } from "./texto/estado";
import { renderizarServidor } from "./texto/servidor";

export interface CasosUsoCli {
  readonly compararResoluciones: (desde: string | undefined, hasta: string | undefined, proyecto?: string) => Resultado<RespuestaComparacion, ErrorUso>;
  readonly consultarProyectosRecientes: (proyecto?: string) => Resultado<RespuestaProyectosRecientes | RespuestaHistorialProyecto, ErrorUso>;
  readonly consultarReglas: (solicitud: SolicitudReglas) => Resultado<RespuestaReglas, ErrorUso>;
  readonly consultarValores: ConsultarValores;
  readonly consultarPermiso: (solicitud: SolicitudConsultaPermiso) => Resultado<RespuestaPermiso, ErrorUso>;
  readonly consultarAgentes: ConsultarAgentes;
  readonly consultarEntradas: ConsultarEntradas;
  readonly consultarHallazgos: ConsultarHallazgos;
  readonly prepararAlmacen: () => Resultado<RespuestaEstado, ErrorUso>;
  readonly consultarEstado: () => Resultado<RespuestaEstado, ErrorUso>;
  readonly describirAlmacen: () => Resultado<RespuestaEstadoCli, ErrorUso>;
  readonly iniciarServidor: () => Resultado<{ readonly direccion: string }, ErrorUso>;
}

export const definicionOpciones = {
  depurar: { type: "boolean" },
  proyecto: { type: "string" },
  agente: { type: "string" },
  clave: { type: "string" },
  herramienta: { type: "string" },
  sujeto: { type: "string" },
  objetivo: { type: "string" },
  "lanzado-por": { type: "string" },
  explicar: { type: "boolean" },
  estricto: { type: "boolean" },
  tiempos: { type: "boolean" },
  desde: { type: "string" },
  hasta: { type: "string" },
  json: { type: "boolean" },
  texto: { type: "boolean" },
  todo: { type: "boolean" },
} as const;

export interface OpcionesCrudas {
  readonly valores: {
    readonly [K in keyof typeof definicionOpciones]?:
      (typeof definicionOpciones)[K]["type"] extends "boolean" ? boolean | undefined : string | undefined;
  };
  readonly carpetaActual?: string | undefined;
}

export type GrupoSubcomando = "consultar" | "historial" | "almacen";

export interface ErrorInterpretacion {
  readonly json: string;
  readonly texto: string;
}

export function esErrorInterpretacion(valor: unknown): valor is ErrorInterpretacion {
  return typeof valor === "object" && valor !== null && "json" in valor && "texto" in valor;
}

export interface DefinicionSubcomando<T, R> {
  readonly nombre: string;
  readonly grupo: GrupoSubcomando;
  readonly resumen: string;
  readonly opciones: readonly string[];
  readonly obligatorias?: readonly string[];
  readonly descripcionesOpciones?: Readonly<Record<string, string>>;
  readonly notaAyuda?: string;
  readonly consultaProyecto: boolean;
  readonly uso: readonly [string, string, string];
  interpretar(crudas: OpcionesCrudas): ErrorInterpretacion | T;
  ejecutar(casos: CasosUsoCli, o: T): Resultado<R, ErrorUso>;
  renderizar(respuesta: R, c: ContextoPresentacion): string;
  readonly codigoSalida?: (respuesta: R, o: T) => number;
}

function definir<T, R>(d: DefinicionSubcomando<T, R>): DefinicionSubcomando<unknown, unknown> {
  return d as DefinicionSubcomando<unknown, unknown>;
}

const noVacio = (valor: unknown): valor is string => typeof valor === "string" && Boolean(valor.trim());
const proyectoDe = (crudas: OpcionesCrudas): string | undefined => crudas.valores.proyecto ?? crudas.carpetaActual;
const sinOpciones = (): Record<string, never> => ({});
const usoProyecto = " [--proyecto <carpeta>]";

function causaProyecto(crudas: OpcionesCrudas, proyecto: string | undefined): string | undefined {
  if (crudas.valores.proyecto !== undefined && !noVacio(crudas.valores.proyecto)) return "--proyecto no puede estar vacío.";
  if (!noVacio(proyecto)) return "Falta --proyecto.";
  return undefined;
}

function causaOpcionalNoVacia(nombre: string, valor: string | undefined, genero: "m" | "f" = "m"): string | undefined {
  if (valor !== undefined && !noVacio(valor)) return `--${nombre} no puede estar ${genero === "f" ? "vacía" : "vacío"}.`;
  return undefined;
}

interface OpcionesValores { readonly proyecto: string; readonly agente: string; readonly clave: string | undefined }
interface OpcionesPermiso {
  readonly proyecto: string;
  readonly agente: string;
  readonly objetivo: string;
  readonly seleccion: { readonly herramienta: string } | { readonly sujeto: string };
  readonly lanzadoPor: string | undefined;
  readonly explicar: boolean;
}
interface OpcionesReglas { readonly proyecto: string; readonly agente: string; readonly lanzadoPor: string | undefined }
interface OpcionesAgentes { readonly proyecto: string }
interface OpcionesEntradas { readonly proyecto: string }
interface OpcionesHallazgos { readonly proyecto: string; readonly explicar: boolean; readonly estricto: boolean }
interface OpcionesRecientes { readonly proyecto: string | undefined }
interface OpcionesComparar { readonly desde: string | undefined; readonly hasta: string | undefined; readonly proyecto: string | undefined }

export const subcomandos: readonly DefinicionSubcomando<unknown, unknown>[] = [
  definir<OpcionesValores, RespuestaValores>({
    nombre: "valores",
    grupo: "consultar",
    resumen: "Claves efectivas de configuración de un agente y su procedencia",
    opciones: ["proyecto", "agente", "clave", "todo"],
    obligatorias: ["agente"],
    consultaProyecto: true,
    uso: [usoProyecto + " --agente <nombre> [--clave <clave>] [--todo]", "valores --agente build", "valores --agente build --clave temperature --json"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      const { agente, clave } = crudas.valores;
      const json = "valores requiere --agente no vacío; --proyecto y --clave son opcionales y no pueden estar vacíos.";
      const causa = causaProyecto(crudas, proyecto)
        ?? (agente === undefined ? "Falta --agente." : !noVacio(agente) ? "--agente no puede estar vacío." : undefined)
        ?? causaOpcionalNoVacia("clave", clave, "f");
      if (causa) return { json, texto: causa };
      return { proyecto: proyecto!, agente: agente!, clave };
    },
    ejecutar(casos, o) {
      return casos.consultarValores(o.proyecto, o.agente, o.clave);
    },
    renderizar: renderizarValores,
  }),
  definir<OpcionesPermiso, RespuestaPermiso>({
    nombre: "permiso",
    grupo: "consultar",
    resumen: "Decisión de permiso para un agente, sujeto/herramienta y objetivo",
    opciones: ["proyecto", "agente", "herramienta", "sujeto", "objetivo", "lanzado-por", "explicar"],
    obligatorias: ["agente", "objetivo"],
    consultaProyecto: true,
    uso: [usoProyecto + " --agente <nombre> (--sujeto <sujeto> | --herramienta <nombre>) --objetivo <objetivo> [--lanzado-por <agente>] [--explicar]", "permiso --agente build --sujeto read --objetivo archivo.ts", 'permiso --agente build --herramienta bash --objetivo "git status" --explicar'],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      const { agente, objetivo, herramienta, sujeto, "lanzado-por": lanzadoPor, explicar } = crudas.valores;
      const json = "permiso requiere --agente, --objetivo y --herramienta o --sujeto excluyentes; --proyecto y --lanzado-por son opcionales y no pueden estar vacíos.";
      const causa = causaProyecto(crudas, proyecto)
        ?? (objetivo === undefined ? "Falta --objetivo." : !noVacio(objetivo) ? "--objetivo no puede estar vacío." : undefined)
        ?? (agente === undefined ? "Falta --agente." : !noVacio(agente) ? "--agente no puede estar vacío." : undefined)
        ?? causaOpcionalNoVacia("lanzado-por", lanzadoPor)
        ?? (herramienta !== undefined && sujeto !== undefined ? "--sujeto y --herramienta son excluyentes." : undefined)
        ?? (herramienta === undefined && sujeto === undefined ? "Falta --sujeto o --herramienta." : undefined)
        ?? causaOpcionalNoVacia("herramienta", herramienta, "f")
        ?? causaOpcionalNoVacia("sujeto", sujeto);
      if (causa) return { json, texto: causa };
      const seleccion: OpcionesPermiso["seleccion"] = noVacio(herramienta) ? { herramienta } : { sujeto: sujeto! };
      return { proyecto: proyecto!, agente: agente!, objetivo: objetivo!, seleccion, lanzadoPor, explicar: explicar === true };
    },
    ejecutar(casos, o) {
      return casos.consultarPermiso({
        proyecto: o.proyecto,
        agente: o.agente,
        ...o.seleccion,
        objetivo: o.objetivo,
        lanzadoPor: o.lanzadoPor,
        explicar: o.explicar,
      });
    },
    renderizar: renderizarPermiso,
  }),
  definir<OpcionesReglas, RespuestaReglas>({
    nombre: "reglas",
    grupo: "consultar",
    resumen: "Cadena ordenada de reglas de permiso de un agente",
    opciones: ["proyecto", "agente", "lanzado-por", "todo", "explicar"],
    obligatorias: ["agente"],
    consultaProyecto: true,
    uso: [usoProyecto + " --agente <nombre> [--lanzado-por <agente>] [--todo] [--explicar]", "reglas --agente build", "reglas --agente plan --explicar --texto"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      const { agente, "lanzado-por": lanzadoPor } = crudas.valores;
      const json = "reglas requiere --agente; --proyecto y --lanzado-por son opcionales y no pueden estar vacíos.";
      const causa = causaProyecto(crudas, proyecto)
        ?? (agente === undefined ? "Falta --agente." : !noVacio(agente) ? "--agente no puede estar vacío." : undefined)
        ?? causaOpcionalNoVacia("lanzado-por", lanzadoPor);
      if (causa) return { json, texto: causa };
      return { proyecto: proyecto!, agente: agente!, lanzadoPor };
    },
    ejecutar(casos, o) {
      return casos.consultarReglas({ proyecto: o.proyecto, agente: o.agente, lanzadoPor: o.lanzadoPor });
    },
    renderizar: renderizarReglas,
  }),
  definir<OpcionesAgentes, RespuestaAgentes>({
    nombre: "agentes",
    grupo: "consultar",
    resumen: "Agentes efectivos del proyecto, modo y estado de resolución",
    opciones: ["proyecto", "explicar"],
    consultaProyecto: true,
    uso: [usoProyecto + " [--explicar]", "agentes", "agentes --proyecto ./proyecto --json"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      const causa = causaProyecto(crudas, proyecto);
      if (causa) return { json: "agentes admite --proyecto opcional, no vacío.", texto: causa };
      return { proyecto: proyecto! };
    },
    ejecutar(casos, o) {
      return casos.consultarAgentes(o.proyecto);
    },
    renderizar: renderizarAgentes,
  }),
  definir<OpcionesEntradas, RespuestaEntradas>({
    nombre: "entradas",
    grupo: "consultar",
    resumen: "Vías y archivos de configuración leídos y resumen de entradas",
    opciones: ["proyecto", "todo"],
    consultaProyecto: true,
    uso: [usoProyecto + " [--todo]", "entradas", "entradas --proyecto ./proyecto --texto --todo"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      const causa = causaProyecto(crudas, proyecto);
      if (causa) return { json: "entradas admite --proyecto opcional, no vacío.", texto: causa };
      return { proyecto: proyecto! };
    },
    ejecutar(casos, o) {
      return casos.consultarEntradas(o.proyecto);
    },
    renderizar: renderizarEntradas,
  }),
  definir<OpcionesHallazgos, RespuestaHallazgos>({
    nombre: "hallazgos",
    grupo: "consultar",
    resumen: "Defectos, conflictos y advertencias detectados en la configuración",
    opciones: ["proyecto", "explicar", "estricto"],
    consultaProyecto: true,
    uso: [usoProyecto + " [--explicar] [--estricto]", "hallazgos", "hallazgos --explicar --estricto --json"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      const causa = causaProyecto(crudas, proyecto);
      if (causa) return { json: "hallazgos admite --proyecto opcional, no vacío.", texto: causa };
      return { proyecto: proyecto!, explicar: crudas.valores.explicar === true, estricto: crudas.valores.estricto === true };
    },
    ejecutar(casos, o) {
      return casos.consultarHallazgos(o.proyecto, { explicar: o.explicar });
    },
    renderizar: renderizarHallazgos,
    codigoSalida: (r, o) => (o.estricto && r.hallazgos.length > 0 ? 3 : 0),
  }),
  definir<OpcionesRecientes, RespuestaProyectosRecientes | RespuestaHistorialProyecto>({
    nombre: "recientes",
    grupo: "historial",
    resumen: "Último análisis guardado de cada proyecto o historial de uno",
    opciones: ["proyecto"],
    descripcionesOpciones: {
      proyecto: "Carpeta del proyecto cuyo historial completo se lista",
    },
    consultaProyecto: false,
    uso: [" [--proyecto <carpeta>]", "recientes", "recientes --proyecto ./proyecto --json"],
    interpretar(crudas) {
      const { proyecto } = crudas.valores;
      const causa = causaOpcionalNoVacia("proyecto", proyecto);
      if (causa) return { json: "recientes admite --proyecto opcional, no vacío.", texto: causa };
      return { proyecto };
    },
    ejecutar(casos, o) {
      return casos.consultarProyectosRecientes(o.proyecto);
    },
    renderizar: renderizarRecientes,
  }),
  definir<OpcionesComparar, RespuestaComparacion>({
    nombre: "comparar",
    grupo: "historial",
    resumen: "Diferencias entre dos análisis guardados del mismo proyecto",
    opciones: ["desde", "hasta", "agente"],
    descripcionesOpciones: {
      agente: "Agente a consultar (filtra solo el texto)",
    },
    notaAyuda: "Sin --desde ni --hasta compara los dos últimos análisis del proyecto actual; los números se ven con `rige recientes --proyecto <carpeta>`.",
    consultaProyecto: false,
    uso: [" [--desde <id> --hasta <id>] [--agente <nombre>]", "comparar", "comparar --desde 1 --hasta 2 --agente build --texto"],
    interpretar(crudas) {
      const { desde, hasta, agente } = crudas.valores;
      const json = "comparar requiere --desde y --hasta enteros positivos decimales seguros; --agente no puede estar vacío.";
      const causaAgente = causaOpcionalNoVacia("agente", agente);
      if (desde === undefined && hasta === undefined) {
        const causa = (!noVacio(crudas.carpetaActual) ? "Falta la carpeta actual del proyecto." : undefined) ?? causaAgente;
        if (causa) return { json, texto: causa };
        return { desde: undefined, hasta: undefined, proyecto: crudas.carpetaActual };
      }
      const causa = (desde === undefined ? "Falta --desde." : !esIdResolucion(desde) ? "--desde debe ser un entero positivo." : undefined)
        ?? (hasta === undefined ? "Falta --hasta." : !esIdResolucion(hasta) ? "--hasta debe ser un entero positivo." : undefined)
        ?? causaAgente;
      if (causa) return { json, texto: causa };
      return { desde: desde!, hasta: hasta!, proyecto: undefined };
    },
    ejecutar(casos, o) {
      return casos.compararResoluciones(o.desde, o.hasta, o.proyecto);
    },
    renderizar: renderizarComparacion,
  }),
  definir<Record<string, never>, RespuestaEstadoCli>({
    nombre: "estado",
    grupo: "almacen",
    resumen: "Estado del almacén local y de su esquema",
    opciones: [],
    consultaProyecto: false,
    uso: ["", "estado", "estado --json"],
    interpretar: sinOpciones,
    ejecutar(casos) {
      return casos.describirAlmacen();
    },
    renderizar: (respuesta, c) => renderizarEstado(respuesta, c, false),
  }),
  definir<Record<string, never>, RespuestaEstado>({
    nombre: "esquema",
    grupo: "almacen",
    resumen: "Crea o verifica el esquema del almacén SQLite",
    opciones: [],
    consultaProyecto: false,
    uso: ["", "esquema", "esquema --json"],
    interpretar: sinOpciones,
    ejecutar(casos) {
      return casos.prepararAlmacen();
    },
    renderizar: renderizarEstado,
  }),
  definir<Record<string, never>, { readonly esquema: typeof versionEsquemaSalida; readonly direccion: string }>({
    nombre: "servir",
    grupo: "almacen",
    resumen: "Inicia la interfaz web local de solo lectura",
    opciones: [],
    consultaProyecto: false,
    uso: ["", "servir", "servir --texto"],
    interpretar: sinOpciones,
    ejecutar(casos) {
      const estado = casos.consultarEstado();
      if (!estado.exito) return estado;
      const servidor = casos.iniciarServidor();
      if (!servidor.exito) return servidor;
      return { exito: true, valor: { esquema: versionEsquemaSalida, direccion: servidor.valor.direccion } };
    },
    renderizar: renderizarServidor,
  }),
];

export const ordenFaltaSubcomando: readonly string[] = [
  "comparar", "recientes", "reglas", "esquema", "valores", "agentes", "entradas", "hallazgos", "permiso", "servir",
];
