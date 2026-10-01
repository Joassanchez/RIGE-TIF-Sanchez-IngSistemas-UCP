import { resolve } from "node:path";
import { ConfiguracionSistema } from "../adaptadores/sistema/configuracion";
import { ExistenciaSistema } from "../adaptadores/sistema/existencia";
import { AlmacenSqlite } from "../adaptadores/almacen-sqlite/esquema";
import { prepararAlmacen } from "../aplicacion/casos-uso/preparar-almacen";
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
  return { exito: true, valor: { prepararAlmacen: () => prepararAlmacen(almacen) } };
}

process.exitCode = ejecutarCli(process.argv.slice(2), ensamblar, {
  escribirSalida: (texto) => { process.stdout.write(texto); },
  escribirError: (texto) => { process.stderr.write(texto); },
});
