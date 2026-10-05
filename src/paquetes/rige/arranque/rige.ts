import { resolve } from "node:path";
import { ConfiguracionSistema } from "../adaptadores/sistema/configuracion";
import { ExistenciaSistema } from "../adaptadores/sistema/existencia";
import { EntornoLecturaSistema } from "../adaptadores/sistema/entorno-lectura";
import { RelojSistema } from "../adaptadores/sistema/reloj";
import { AlmacenSqlite } from "../adaptadores/almacen-sqlite/esquema";
import { RepositorioResolucionesSqlite } from "../adaptadores/almacen-sqlite/resoluciones";
import { adaptadorOpenCode } from "@rige/opencode/adaptador";
import { prepararAlmacen } from "../aplicacion/casos-uso/preparar-almacen";
import { consultarEstado } from "../aplicacion/casos-uso/consultar-estado";
import { resolverProyecto } from "../aplicacion/casos-uso/resolver-proyecto";
import { consultarResolucion } from "../aplicacion/casos-uso/consultar-resolucion";
import { versionRige } from "../aplicacion/respuestas/estado";
import { iniciarServidor } from "../interfaces/web/servidor";
import { ejecutarCli, type Ensamblado } from "../interfaces/cli/ejecutar";

const configuracion = new ConfiguracionSistema({
  entorno: process.env,
  plataforma: process.platform,
  rutaArchivo: resolve(import.meta.dir, "../../../rige.env"),
});

function ensamblar(): Ensamblado {
  const resultado = configuracion.leer();
  if (!resultado.exito) return resultado;
  const almacen = new AlmacenSqlite(resultado.valor.directorioAlmacen, new ExistenciaSistema());
  const entorno = new EntornoLecturaSistema({ entorno: process.env, plataforma: process.platform });
  const resoluciones = new RepositorioResolucionesSqlite(resultado.valor.directorioAlmacen, new ExistenciaSistema(), versionRige);
  const dependencias = { adaptador: adaptadorOpenCode, entorno, rutas: entorno, resoluciones, reloj: new RelojSistema() };
  return {
    exito: true, valor: {
      prepararAlmacen: () => prepararAlmacen(almacen),
      consultarEstado: () => consultarEstado(almacen),
      iniciarServidor: () => iniciarServidor(resultado.valor.puerto, {
        consultarEstado: () => consultarEstado(almacen),
        resolverProyecto: (proyecto) => resolverProyecto(dependencias, proyecto),
        consultarResolucion: (id, agente, clave) => consultarResolucion(resoluciones, id, agente, clave),
      }),
    },
  };
}

process.exitCode = ejecutarCli(process.argv.slice(2), ensamblar, {
  escribirSalida: (texto) => { process.stdout.write(texto); },
  escribirError: (texto) => { process.stderr.write(texto); },
});
