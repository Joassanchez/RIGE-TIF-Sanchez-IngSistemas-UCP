import { resolve } from "node:path";
import { ConfiguracionSistema } from "../adaptadores/sistema/configuracion";
import { ExistenciaSistema } from "../adaptadores/sistema/existencia";
import { EntornoLecturaSistema } from "../adaptadores/sistema/entorno-lectura";
import { RelojSistema } from "../adaptadores/sistema/reloj";
import { AlmacenSqlite } from "../adaptadores/almacen-sqlite/esquema";
import { RepositorioResolucionesSqlite } from "../adaptadores/almacen-sqlite/resoluciones";
import { adaptadorOpenCode } from "@rige/opencode/adaptador";
import { advertidas } from "@rige/opencode/reglas";
import { prepararAlmacen } from "../aplicacion/casos-uso/preparar-almacen";
import { consultarEstado } from "../aplicacion/casos-uso/consultar-estado";
import { resolverProyecto } from "../aplicacion/casos-uso/resolver-proyecto";
import { consultarResolucion } from "../aplicacion/casos-uso/consultar-resolucion";
import { compararResoluciones } from "../aplicacion/casos-uso/comparar-resoluciones";
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
import { ejecutarCli, type Ensamblado } from "../interfaces/cli/ejecutar";
import type { MedicionAnalisis } from "../aplicacion/casos-uso/analizar-proyecto";

const configuracion = new ConfiguracionSistema({
  entorno: process.env,
  plataforma: process.platform,
  rutaArchivo: resolve(import.meta.dir, "../../../rige.env"),
});

function ensamblar(comando: string, medicion?: MedicionAnalisis): Ensamblado {
  const entorno = new EntornoLecturaSistema({ entorno: process.env, plataforma: process.platform });
  const consultas = { adaptador: adaptadorOpenCode, entorno, rutas: entorno, medicion };
  const casosConsulta = {
    consultarReglas: (solicitud: Parameters<typeof consultarReglas>[1]) => consultarReglas(consultas, solicitud),
    consultarValores: (proyecto: string, agente: string, clave: string | undefined) => consultarValores(consultas, proyecto, agente, clave),
    consultarPermiso: (solicitud: Parameters<typeof consultarPermiso>[1]) => consultarPermiso(consultas, solicitud),
    consultarAgentes: (proyecto: string) => consultarAgentes(consultas, proyecto),
    consultarEntradas: (proyecto: string) => consultarEntradas(consultas, proyecto),
    consultarHallazgos: (proyecto: string, opciones?: { readonly explicar?: boolean }) => consultarHallazgos(consultas, proyecto, opciones),
  };
  if (["valores", "permiso", "reglas", "agentes", "entradas", "hallazgos"].includes(comando)) {
    const noEnsamblado = (): never => { throw new Error("Caso ajeno a una consulta en memoria"); };
    return { exito: true, valor: { ...casosConsulta, prepararAlmacen: noEnsamblado,
      compararResoluciones: noEnsamblado, consultarProyectosRecientes: noEnsamblado,
      consultarEstado: noEnsamblado, iniciarServidor: noEnsamblado } };
  }
  const resultado = configuracion.leer();
  if (!resultado.exito) return resultado;
  const almacen = new AlmacenSqlite(resultado.valor.directorioAlmacen, new ExistenciaSistema());
  const resoluciones = new RepositorioResolucionesSqlite(resultado.valor.directorioAlmacen, new ExistenciaSistema(), versionRige);
  const dependencias = { adaptador: adaptadorOpenCode, entorno, rutas: entorno, resoluciones, reloj: new RelojSistema() };
  return {
    exito: true, valor: {
      compararResoluciones: (desde, hasta) => compararResoluciones(dependencias, desde, hasta),
      consultarProyectosRecientes: () => consultarProyectosRecientes(resoluciones),
      consultarReglas: solicitud => consultarReglas(dependencias, solicitud),
      consultarValores: (proyecto, agente, clave) => consultarValores(dependencias, proyecto, agente, clave),
      consultarPermiso: solicitud => consultarPermiso(dependencias, solicitud),
      consultarAgentes: (proyecto) => consultarAgentes(dependencias, proyecto),
      consultarHallazgos: (proyecto, opciones) => consultarHallazgos(consultas, proyecto, opciones),
      consultarEntradas: proyecto => consultarEntradas(consultas, proyecto),
      prepararAlmacen: () => prepararAlmacen(almacen),
      consultarEstado: () => consultarEstado(almacen),
      iniciarServidor: () => iniciarServidor(resultado.valor.puerto, {
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
      }),
    },
  };
}

process.exitCode = ejecutarCli(process.argv.slice(2), ensamblar, {
  escribirSalida: (texto) => { process.stdout.write(texto); },
  escribirError: (texto) => { process.stderr.write(texto); },
}, advertidas);
