import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { delimiter, join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { copiarEscenario, type OpcionesEscenario } from "../pruebas/utilidades/escenario";
import { entornoDeReferencia, type ReferenciaEntorno } from "../pruebas/utilidades/entorno-referencia";
import { crearInstalacionOpenCode } from "../pruebas/utilidades/instalacion-opencode";

// Utilidad de demostracion: solo escribe copias y almacen en temporales del sistema.
// No integra el producto ni ejecuta OpenCode o Git.
const fuente = resolve(import.meta.dir, "..");
const argumentos = process.argv.slice(2);
const desde = argumentos[0] === "--desde";
const preparar = argumentos.includes("--preparar");
const separador = argumentos.indexOf("--");
const opciones = argumentos.slice(0, separador < 0 ? argumentos.length : separador);
const indiceVersion = opciones.indexOf("--version");
let raiz: string;
let proyecto: string;
let borrar: (() => void) | undefined;
let id: string;
let version: string;
if (desde) {
  raiz = realpathSync.native(resolve(argumentos[1]!));
  const nombre = relative(realpathSync.native(tmpdir()), raiz);
  if (!nombre.startsWith("rige-escenario-") || nombre.includes(sep)) throw new Error("La demostración debe estar en un temporal propio.");
  ({ id, version } = JSON.parse(readFileSync(join(raiz, "demostracion.json"), "utf8")));
  proyecto = join(raiz, "proyecto");
} else {
  id = argumentos[0]!;
  const manifiesto = JSON.parse(readFileSync(join(fuente, "pruebas/escenarios/MANIFIESTO.json"), "utf8"));
  if (!manifiesto.escenarios.some((e: { id: string }) => e.id === id)) throw new Error("Indique un escenario del manifiesto.");
  version = indiceVersion < 0 ? "1.18.25" : opciones[indiceVersion + 1]!;
  const referencia = JSON.parse(readFileSync(join(fuente, "pruebas/escenarios", id, "REFERENCIA.json"), "utf8"));
  const git: NonNullable<OpcionesEscenario["git"]> = referencia.procedencia.git ?? "raiz";
  const copia = copiarEscenario(id, { git });
  ({ raiz, proyecto, borrar } = copia);
  writeFileSync(join(raiz, "demostracion.json"), JSON.stringify({ id, version }));
}
try {
  const referencia = JSON.parse(readFileSync(join(fuente, "pruebas/escenarios", id, "REFERENCIA.json"), "utf8")) as ReferenciaEntorno;
  const entorno = entornoDeReferencia(referencia, { raiz });
  const instalacion = join(raiz, "instalacion-falsa");
  crearInstalacionOpenCode(instalacion, version);
  entorno.PATH = instalacion + delimiter + (entorno.PATH ?? "");
  // El puerto se admite solo como opcion de esta utilidad; las pruebas usan uno libre.
  const indicePuerto = opciones.indexOf("--puerto");
  entorno.RIGE_PUERTO = indicePuerto < 0 ? "4747" : opciones[indicePuerto + 1]!;
  if (preparar) {
    console.log(JSON.stringify({ raiz, proyecto, almacen: entorno.RIGE_ALMACEN, versionFicticia: version }));
  } else {
    const comando = separador < 0 ? [] : argumentos.slice(separador + 1);
    if (!comando.length) throw new Error("Use --preparar o -- <subcomando y opciones de RIGE>.");
    const ejecutar = (args: string[]) => Bun.spawn([process.execPath, join(fuente, "paquetes/rige/arranque/rige.ts"), ...args], {
      cwd: fuente, env: entorno, stdout: "inherit", stderr: "inherit",
    });
    if (comando[0] === "servir") {
      if (!desde) throw new Error("Para servir, prepare una copia y use --desde <raiz>; asi puede reiniciarla.");
      const esquema = ejecutar(["esquema"]);
      const codigo = await esquema.exited;
      if (codigo !== 0) throw new Error("No se pudo preparar el almacén de demostración.");
      console.error(JSON.stringify({ proyecto, almacen: entorno.RIGE_ALMACEN }));
    }
    const proceso = ejecutar([comando[0]!, ...(["servir", "esquema"].includes(comando[0]!) ? [] : ["--proyecto", proyecto]), ...comando.slice(1)]);
    const detener = () => proceso.kill();
    process.on("SIGINT", detener);
    process.on("SIGTERM", detener);
    try { process.exitCode = await proceso.exited; }
    finally { process.off("SIGINT", detener); process.off("SIGTERM", detener); }
  }
} finally {
  if (!preparar && !desde) borrar?.();
}
