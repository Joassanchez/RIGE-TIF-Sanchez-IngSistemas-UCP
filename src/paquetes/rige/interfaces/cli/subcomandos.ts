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
  RespuestaPermiso,
  RespuestaProyectosRecientes,
  RespuestaReglas,
  RespuestaValores,
} from "../../aplicacion/respuestas/contrato-generado";
import type { SolicitudReglas } from "../../aplicacion/casos-uso/consultar-reglas";
import type { ConsultarAgentes } from "../../aplicacion/casos-uso/consultar-agentes";
import type { ConsultarEntradas } from "../../aplicacion/casos-uso/consultar-entradas";
import type { ConsultarHallazgos } from "../../aplicacion/casos-uso/consultar-hallazgos";
import type { CompararResoluciones } from "../../aplicacion/casos-uso/comparar-resoluciones";
import type { ConsultarProyectosRecientes } from "../../aplicacion/casos-uso/consultar-proyectos-recientes";
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
  readonly compararResoluciones: CompararResoluciones;
  readonly consultarProyectosRecientes: ConsultarProyectosRecientes;
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

export interface DefinicionSubcomando<T, R> {
  readonly nombre: string;
  readonly opciones: readonly string[];
  readonly consultaProyecto: boolean;
  readonly uso: readonly [string, string, string];
  interpretar(crudas: OpcionesCrudas): string | T;
  ejecutar(casos: CasosUsoCli, o: T): Resultado<R, ErrorUso>;
  renderizar(respuesta: R, c: ContextoPresentacion): string;
}

function definir<T, R>(d: DefinicionSubcomando<T, R>): DefinicionSubcomando<unknown, unknown> {
  return d as DefinicionSubcomando<unknown, unknown>;
}

const noVacio = (valor: unknown): valor is string => typeof valor === "string" && Boolean(valor.trim());
const proyectoDe = (crudas: OpcionesCrudas): string | undefined => crudas.valores.proyecto ?? crudas.carpetaActual;
const sinOpciones = (): Record<string, never> => ({});
const usoProyecto = " [--proyecto <carpeta>]";

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
interface OpcionesHallazgos { readonly proyecto: string; readonly explicar: boolean }
interface OpcionesComparar { readonly desde: string; readonly hasta: string }

export const subcomandos: readonly DefinicionSubcomando<unknown, unknown>[] = [
  definir<OpcionesValores, RespuestaValores>({
    nombre: "valores",
    opciones: ["proyecto", "agente", "clave", "todo"],
    consultaProyecto: true,
    uso: [usoProyecto + " --agente <nombre> [--clave <clave>] [--todo]", "valores --agente build", "valores --agente build --clave temperature --json"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      const { agente, clave } = crudas.valores;
      if (!noVacio(proyecto) || !noVacio(agente) || (clave !== undefined && !noVacio(clave))) {
        return "valores requiere --agente no vacío; --proyecto y --clave son opcionales y no pueden estar vacíos.";
      }
      return { proyecto, agente, clave };
    },
    ejecutar(casos, o) {
      return casos.consultarValores(o.proyecto, o.agente, o.clave);
    },
    renderizar: renderizarValores,
  }),
  definir<OpcionesPermiso, RespuestaPermiso>({
    nombre: "permiso",
    opciones: ["proyecto", "agente", "herramienta", "sujeto", "objetivo", "lanzado-por", "explicar"],
    consultaProyecto: true,
    uso: [usoProyecto + " --agente <nombre> (--sujeto <sujeto> | --herramienta <nombre>) --objetivo <objetivo> [--lanzado-por <agente>] [--explicar]", "permiso --agente build --sujeto read --objetivo archivo.ts", 'permiso --agente build --herramienta bash --objetivo "git status" --explicar'],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      const { agente, objetivo, herramienta, sujeto, "lanzado-por": lanzadoPor, explicar } = crudas.valores;
      const mensaje = "permiso requiere --agente, --objetivo y --herramienta o --sujeto excluyentes; --proyecto y --lanzado-por son opcionales y no pueden estar vacíos.";
      if (!noVacio(proyecto) || !noVacio(agente) || !noVacio(objetivo)
        || (lanzadoPor !== undefined && !noVacio(lanzadoPor))) {
        return mensaje;
      }
      let seleccion: OpcionesPermiso["seleccion"];
      if (noVacio(herramienta) && sujeto === undefined) {
        seleccion = { herramienta };
      } else if (noVacio(sujeto) && herramienta === undefined) {
        seleccion = { sujeto };
      } else {
        return mensaje;
      }
      return { proyecto, agente, objetivo, seleccion, lanzadoPor, explicar: explicar === true };
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
    opciones: ["proyecto", "agente", "lanzado-por", "todo", "explicar"],
    consultaProyecto: true,
    uso: [usoProyecto + " --agente <nombre> [--lanzado-por <agente>] [--todo] [--explicar]", "reglas --agente build", "reglas --agente plan --explicar --texto"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      const { agente, "lanzado-por": lanzadoPor } = crudas.valores;
      if (!noVacio(proyecto) || !noVacio(agente) || (lanzadoPor !== undefined && !noVacio(lanzadoPor))) {
        return "reglas requiere --agente; --proyecto y --lanzado-por son opcionales y no pueden estar vacíos.";
      }
      return { proyecto, agente, lanzadoPor };
    },
    ejecutar(casos, o) {
      return casos.consultarReglas({ proyecto: o.proyecto, agente: o.agente, lanzadoPor: o.lanzadoPor });
    },
    renderizar: renderizarReglas,
  }),
  definir<OpcionesAgentes, RespuestaAgentes>({
    nombre: "agentes",
    opciones: ["proyecto", "explicar"],
    consultaProyecto: true,
    uso: [usoProyecto + " [--explicar]", "agentes", "agentes --proyecto ./proyecto --json"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      if (!noVacio(proyecto)) {
        return "agentes admite --proyecto opcional, no vacío.";
      }
      return { proyecto };
    },
    ejecutar(casos, o) {
      return casos.consultarAgentes(o.proyecto);
    },
    renderizar: renderizarAgentes,
  }),
  definir<OpcionesEntradas, RespuestaEntradas>({
    nombre: "entradas",
    opciones: ["proyecto", "todo"],
    consultaProyecto: true,
    uso: [usoProyecto + " [--todo]", "entradas", "entradas --proyecto ./proyecto --texto --todo"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      if (!noVacio(proyecto)) {
        return "entradas admite --proyecto opcional, no vacío.";
      }
      return { proyecto };
    },
    ejecutar(casos, o) {
      return casos.consultarEntradas(o.proyecto);
    },
    renderizar: renderizarEntradas,
  }),
  definir<OpcionesHallazgos, RespuestaHallazgos>({
    nombre: "hallazgos",
    opciones: ["proyecto", "explicar"],
    consultaProyecto: true,
    uso: [usoProyecto + " [--explicar]", "hallazgos", "hallazgos --explicar --json"],
    interpretar(crudas) {
      const proyecto = proyectoDe(crudas);
      if (!noVacio(proyecto)) {
        return "hallazgos admite --proyecto opcional, no vacío.";
      }
      return { proyecto, explicar: crudas.valores.explicar === true };
    },
    ejecutar(casos, o) {
      return casos.consultarHallazgos(o.proyecto, { explicar: o.explicar });
    },
    renderizar: renderizarHallazgos,
  }),
  definir<Record<string, never>, RespuestaProyectosRecientes>({
    nombre: "recientes",
    opciones: [],
    consultaProyecto: false,
    uso: ["", "recientes", "recientes --json"],
    interpretar: sinOpciones,
    ejecutar(casos) {
      return casos.consultarProyectosRecientes();
    },
    renderizar: renderizarRecientes,
  }),
  definir<OpcionesComparar, RespuestaComparacion>({
    nombre: "comparar",
    opciones: ["desde", "hasta", "agente"],
    consultaProyecto: false,
    uso: [" --desde <id> --hasta <id> [--agente <nombre>]", "comparar --desde 1 --hasta 2", "comparar --desde 1 --hasta 2 --agente build --texto"],
    interpretar(crudas) {
      const { desde, hasta, agente } = crudas.valores;
      if (!esIdResolucion(desde) || !esIdResolucion(hasta) || (agente !== undefined && !noVacio(agente))) {
        return "comparar requiere --desde y --hasta enteros positivos decimales seguros; --agente no puede estar vacío.";
      }
      return { desde, hasta };
    },
    ejecutar(casos, o) {
      return casos.compararResoluciones(o.desde, o.hasta);
    },
    renderizar: renderizarComparacion,
  }),
  definir<Record<string, never>, RespuestaEstadoCli>({
    nombre: "estado",
    opciones: [],
    consultaProyecto: false,
    uso: ["", "estado", "estado --json"],
    interpretar: sinOpciones,
    ejecutar(casos) {
      return casos.describirAlmacen();
    },
    renderizar: renderizarEstado,
  }),
  definir<Record<string, never>, RespuestaEstado>({
    nombre: "esquema",
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
