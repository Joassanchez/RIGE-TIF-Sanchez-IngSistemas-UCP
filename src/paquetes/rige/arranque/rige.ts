#!/usr/bin/env bun
import { resolve, join } from "node:path";
import { ConfiguracionSistema } from "../adaptadores/sistema/configuracion";
import { ExistenciaSistema } from "../adaptadores/sistema/existencia";
import { EntornoLecturaSistema } from "../adaptadores/sistema/entorno-lectura";
import { RelojSistema } from "../adaptadores/sistema/reloj";
import { AlmacenSqlite, archivoAlmacen } from "../adaptadores/almacen-sqlite/esquema";
import { RepositorioResolucionesSqlite } from "../adaptadores/almacen-sqlite/resoluciones";
import { adaptadorOpenCode } from "@rige/opencode/adaptador";
import { advertidas, limitesGenerales } from "@rige/opencode/reglas";
import { versionSoportada } from "@rige/opencode/descriptor";
import { prepararAlmacen } from "../aplicacion/casos-uso/preparar-almacen";
import { consultarEstado, describirAlmacen } from "../aplicacion/casos-uso/consultar-estado";
import { resolverProyecto } from "../aplicacion/casos-uso/resolver-proyecto";
import { consultarResolucion } from "../aplicacion/casos-uso/consultar-resolucion";
import { compararResoluciones, compararUltimasResoluciones } from "../aplicacion/casos-uso/comparar-resoluciones";
import { consultarProyectosRecientes } from "../aplicacion/casos-uso/consultar-proyectos-recientes";
import { consultarValores } from "../aplicacion/casos-uso/consultar-valores";
import { consultarPermiso } from "../aplicacion/casos-uso/consultar-permiso";
import { consultarReglas } from "../aplicacion/casos-uso/consultar-reglas";
import { consultarAgentes } from "../aplicacion/casos-uso/consultar-agentes";
import { consultarHallazgos } from "../aplicacion/casos-uso/consultar-hallazgos";
import { consultarEntradas } from "../aplicacion/casos-uso/consultar-entradas";
import { consultarPermisoGuardado, consultarAgentesGuardados, consultarReglasGuardadas } from "../aplicacion/casos-uso/consultar-guardada";
import { versionRige } from "../aplicacion/respuestas/estado";
import { iniciarServidor } from "../interfaces/web/servidor";
import { colorEnCanal, ejecutarCli, type CasosUsoCli } from "../interfaces/cli/ejecutar";
import type { MedicionAnalisis } from "../aplicacion/casos-uso/analizar-proyecto";
import type { Resultado } from "@rige/nucleo/resultado";
import type { ErrorUso } from "../aplicacion/errores";

interface AlmacenCargado {
  readonly almacen: AlmacenSqlite;
  readonly resoluciones: RepositorioResolucionesSqlite;
  readonly existencia: ExistenciaSistema;
  readonly dependencias: {
    readonly adaptador: typeof adaptadorOpenCode;
    readonly entorno: EntornoLecturaSistema;
    readonly rutas: EntornoLecturaSistema;
    readonly resoluciones: RepositorioResolucionesSqlite;
    readonly reloj: RelojSistema;
  };
  readonly directorioAlmacen: string;
  readonly puerto: number;
}

const hogar = (process.platform === "win32" ? process.env.USERPROFILE || process.env.HOME : process.env.HOME) || undefined;

const configuracion = new ConfiguracionSistema({
  entorno: process.env,
  plataforma: process.platform,
  rutaArchivo: resolve(import.meta.dir, "../../../rige.env"),
});

function ensamblar(medicion?: MedicionAnalisis): CasosUsoCli {
  const entorno = new EntornoLecturaSistema({ entorno: process.env, plataforma: process.platform });
  const consultas = { adaptador: adaptadorOpenCode, entorno, rutas: entorno, medicion };

  let almacenCargado: Resultado<AlmacenCargado, ErrorUso> | undefined;

  function obtenerAlmacen(): Resultado<AlmacenCargado, ErrorUso> {
    if (almacenCargado !== undefined) return almacenCargado;
    const resultado = configuracion.leer();
    if (!resultado.exito) {
      almacenCargado = resultado;
      return almacenCargado;
    }
    const existencia = new ExistenciaSistema();
    const almacen = new AlmacenSqlite(resultado.valor.directorioAlmacen, existencia);
    const resoluciones = new RepositorioResolucionesSqlite(resultado.valor.directorioAlmacen, existencia, versionRige);
    const dependencias = { adaptador: adaptadorOpenCode, entorno, rutas: entorno, resoluciones, reloj: new RelojSistema() };
    almacenCargado = {
      exito: true,
      valor: {
        almacen,
        resoluciones,
        existencia,
        dependencias,
        directorioAlmacen: resultado.valor.directorioAlmacen,
        puerto: resultado.valor.puerto,
      },
    };
    return almacenCargado;
  }

  function conAlmacen<T>(f: (a: AlmacenCargado) => Resultado<T, ErrorUso>): Resultado<T, ErrorUso> {
    const a = obtenerAlmacen();
    return a.exito ? f(a.valor) : a;
  }

  return {
    consultarReglas: solicitud => consultarReglas(consultas, solicitud),
    consultarValores: (proyecto, agente, clave) => consultarValores(consultas, proyecto, agente, clave),
    consultarPermiso: solicitud => consultarPermiso(consultas, solicitud),
    consultarAgentes: proyecto => consultarAgentes(consultas, proyecto),
    consultarEntradas: proyecto => consultarEntradas(consultas, proyecto),
    consultarHallazgos: (proyecto, opciones) => consultarHallazgos(consultas, proyecto, opciones),
    compararResoluciones: (desde, hasta, proyecto) => conAlmacen(a => desde === undefined && hasta === undefined
      ? compararUltimasResoluciones(a.dependencias, proyecto ?? "")
      : compararResoluciones(a.dependencias, desde ?? "", hasta ?? "")),
    consultarProyectosRecientes: proyecto => conAlmacen(a =>
      consultarProyectosRecientes(a.resoluciones, a.dependencias.rutas, proyecto)),
    prepararAlmacen: () => conAlmacen(a => prepararAlmacen(a.almacen)),
    consultarEstado: () => conAlmacen(a => consultarEstado(a.almacen)),
    describirAlmacen: () => conAlmacen(a => describirAlmacen(a.almacen, {
      ruta: join(resolve(a.directorioAlmacen), archivoAlmacen).replaceAll("\\", "/"),
      existe: ruta => a.existencia.existe(ruta),
    })),
    iniciarServidor: () => conAlmacen(({ dependencias, resoluciones, almacen, puerto }) => iniciarServidor(puerto, {
      compararResoluciones: (desde, hasta) => compararResoluciones(dependencias, desde, hasta),
      consultarProyectosRecientes: () => consultarProyectosRecientes(resoluciones),
      consultarReglas: (id, solicitud) => consultarReglasGuardadas(dependencias, id, solicitud),
      consultarEstado: () => consultarEstado(almacen),
      resolverProyecto: (proyecto, agente) => resolverProyecto(dependencias, proyecto, agente),
      consultarResolucion: (id, agente, clave) => consultarResolucion(resoluciones, id, agente, clave),
      consultarPermiso: (id, solicitud) => consultarPermisoGuardado(dependencias, id, solicitud),
      consultarAgentes: id => consultarAgentesGuardados(dependencias, id),
      consultarHallazgos: (proyecto, opciones) => consultarHallazgos(consultas, proyecto, opciones),
      consultarEntradas: proyecto => consultarEntradas(consultas, proyecto),
    }, { versionHerramienta: versionSoportada, reloj: dependencias.reloj, hogar })),
  };
}

process.exitCode = ejecutarCli(process.argv.slice(2), ensamblar, {
  versionHerramienta: versionSoportada,
  esConsola: process.stdout.isTTY === true,
  ancho: process.stdout.columns,
  colorHabilitado: colorEnCanal(process.stdout.isTTY === true, process.env),
  colorErrorHabilitado: colorEnCanal(process.stderr.isTTY === true, process.env),
  carpetaActual: process.cwd(),
  ...(hogar !== undefined ? { hogar } : {}),
  escribirSalida: (texto) => { process.stdout.write(texto); },
  escribirError: (texto) => { process.stderr.write(texto); },
}, advertidas, limitesGenerales);
