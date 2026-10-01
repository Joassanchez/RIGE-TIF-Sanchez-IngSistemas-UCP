import { resolve } from "node:path";
import { ConfiguracionSistema } from "../adaptadores/sistema/configuracion";
import { ExistenciaSistema } from "../adaptadores/sistema/existencia";
import { AlmacenSqlite } from "../adaptadores/almacen-sqlite/esquema";
import { prepararAlmacen } from "../aplicacion/casos-uso/preparar-almacen";
import { consultarEstado } from "../aplicacion/casos-uso/consultar-estado";
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
  return {
    exito: true, valor: {
      prepararAlmacen: () => prepararAlmacen(almacen),
      consultarEstado: () => consultarEstado(almacen),
      iniciarServidor: () => iniciarServidor(resultado.valor.puerto, () => consultarEstado(almacen)),
    },
  };
}

process.exitCode = ejecutarCli(process.argv.slice(2), ensamblar, {
  escribirSalida: (texto) => { process.stdout.write(texto); },
  escribirError: (texto) => { process.stderr.write(texto); },
});
