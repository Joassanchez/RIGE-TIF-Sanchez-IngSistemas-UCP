import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { borrarTemporal } from "./borrar-temporal";
import { crearEntornoAislado } from "./entorno-aislado";

const raiz = resolve(import.meta.dir, "../..");
const casos = [
  { codigo: 0, salida: "{}\n", pasa: true },
  { codigo: 1, salida: "{}\n", pasa: false },
  { codigo: 2, salida: "{}\n", pasa: false },
  { codigo: 70, salida: "{}\n", pasa: false },
  { codigo: 0, salida: " \r\n\t", pasa: false },
];

function crearSonda(temporal: string, trazado: boolean): string {
  const sonda = join(temporal, "sonda.ts");
  writeFileSync(sonda, `
          import { writeFileSync } from "node:fs";
          const original = Bun.spawnSync;
          const trazado = ${JSON.stringify(trazado)};
          if (trazado) {
            Object.defineProperty(process, "platform", { value: "linux" });
            const buscar = Bun.which;
            Bun.which = (nombre, opciones) => nombre === "strace" ? "/sonda/strace" : buscar(nombre, opciones);
          }
          Bun.spawnSync = (args, opciones) => {
            if (args.includes("paquetes/rige/arranque/rige.ts")) {
              if (trazado) {
                if (args[0] !== "strace") throw Error("CLI sin strace");
                if (!args.includes("-yy") || args[args.indexOf("-e") + 1] !== "trace=connect,sendto,sendmsg") {
                  throw Error("strace sin descriptores o sin las tres llamadas");
                }
                writeFileSync(args[args.indexOf("-o") + 1], process.env.SONDA_TRAZA ?? "");
              }
              const escenario = process.env.SONDA_ESCENARIO;
              const aplicarCaso = !escenario || (args.includes("hallazgos") && args.some(arg => arg.includes("rige-sin-red-" + escenario)));
              const caso = aplicarCaso ? JSON.parse(process.env.SONDA_RESULTADO) : { codigo: 0, salida: "{}" };
              return { exitCode: caso.codigo, signalCode: null,
                stdout: Buffer.from(caso.salida), stderr: Buffer.from("") };
            }
            return original(args, opciones);
          };
  `);
  return sonda;
}

describe("T5-05 controles negativos", () => {
  for (const patron of ["RNF-05 CA-1", "sin-red --salida seguido", "sin-red --comparar: una salida alterada"]) {
    test(`T5-05-c1: ${patron} diagnostica codigo, senal y colas de ambas salidas`, () => {
      const temporal = mkdtempSync(join(tmpdir(), "rige-sonda-diagnostico-"));
      try {
        const sonda = join(temporal, "sonda.ts");
        writeFileSync(sonda, `
          Object.defineProperty(process, "platform", { value: "linux" });
          const buscar = Bun.which;
          Bun.which = (nombre, opciones) => nombre === "strace" ? "/sonda/strace" : buscar(nombre, opciones);
          const original = Bun.spawnSync;
          Bun.spawnSync = (args, opciones) => args.includes("herramientas/sin-red.ts")
            ? { exitCode: 70, signalCode: "SIGTERM",
                stdout: Buffer.from("inicio-stdout\\n" + "linea\\n".repeat(30) + "final-stdout"),
                stderr: Buffer.from("inicio-stderr\\n" + "linea\\n".repeat(30) + "final-stderr") }
            : original(args, opciones);
        `);
        const resultado = Bun.spawnSync([process.execPath, "test", "--preload", sonda,
          "pruebas/aceptacion/RNF-05.test.ts", "--test-name-pattern", patron], {
          cwd: raiz, env: crearEntornoAislado(temporal, process.env),
          stdout: "pipe", stderr: "pipe", timeout: 30000,
        });
        expect(resultado.exitCode).not.toBe(0);
        const diagnostico = resultado.stderr.toString();
        for (const dato of ["exitCode=70", "signalCode=SIGTERM", "final-stdout", "final-stderr"]) {
          expect(diagnostico).toContain(dato);
        }
        expect(diagnostico).not.toContain("inicio-stdout");
        expect(diagnostico).not.toContain("inicio-stderr");
      } finally { borrarTemporal(temporal); }
    }, 45000);
  }

  for (const modo of ["N-2 R-1", "N-6 strace"]) {
    test(`${modo}: rechaza consultas fallidas o vacias aunque las dos corridas coincidan y la traza no tenga red`, () => {
      const temporal = mkdtempSync(join(tmpdir(), "rige-sonda-sin-red-"));
      try {
        const sonda = crearSonda(temporal, modo === "N-6 strace");
        const escenarios = modo === "N-6 strace" ? ["v2-decision", "v3-sustituciones", "v3-sin-efecto"] : [""];
        const entradas = escenarios.flatMap(escenario => casos.map(caso => ({ ...caso, escenario })));
        const resultados = entradas.map(caso => {
          const args = modo === "N-2 R-1"
            ? ["test", "pruebas/aceptacion/RNF-05.test.ts", "--test-name-pattern", "RNF-05 CA-2"]
            : ["herramientas/sin-red.ts", "--strace", "--escenario", "v2-decision",
              "--escenario", "v3-sustituciones", "--escenario", "v3-sin-efecto"];
          const invocacion = modo === "N-2 R-1"
            ? [process.execPath, "test", "--preload", sonda, ...args.slice(1)]
            : [process.execPath, "--preload", sonda, ...args];
          const resultado = Bun.spawnSync(invocacion, {
            cwd: raiz, env: { ...crearEntornoAislado(temporal, process.env), SONDA_RESULTADO: JSON.stringify(caso),
              SONDA_ESCENARIO: caso.escenario },
            stdout: "pipe", stderr: "pipe", timeout: 30000,
          });
          if (caso.pasa && resultado.exitCode !== 0) throw new Error(resultado.stderr.toString());
          return { ...caso, pasa: resultado.exitCode === 0 };
        });
        expect(resultados).toEqual(entradas);
      } finally { borrarTemporal(temporal); }
    }, 120000);
  }

  test("N-4: el comando rechaza envios externos o indeterminados e informa los locales por llamada", () => {
    const temporal = mkdtempSync(join(tmpdir(), "rige-sonda-traza-"));
    try {
      const sonda = crearSonda(temporal, true);
      const destinos = [
        { traza: 'sendto(3, "x", 1, 0, {sa_family=AF_INET, sin_addr=inet_addr("203.0.113.1")}, 16) = -1 EPERM (Operation not permitted)', codigo: 1 },
        { traza: 'sendmsg(3, {msg_name={sa_family=AF_INET6, inet_pton(AF_INET6, "2001:db8::1", &sin6_addr)}}, 0) = 1', codigo: 1 },
        { traza: 'sendto(3, "x", 1, 0, NULL, 0) = 1', codigo: 1 },
        { traza: 'sendmsg(3<UDP:[127.0.0.1:123->203.0.113.1:53]>, {msg_name=NULL}, 0) = 1', codigo: 1 },
        { traza: [
          'connect(3, {sa_family=AF_INET, sin_addr=inet_addr("127.2.3.4")}, 16) = 0',
          'sendto(4, "x", 1, 0, {sa_family=AF_UNIX, sun_path="/tmp/local"}, 16) = 1',
          'sendmsg(5<UDPv6:[[::1]:123->[::1]:53]>, {msg_name=NULL}, 0) = 1',
        ].join("\n"), codigo: 0 },
      ];
      let salidaLocal = "";
      const resultados = destinos.map(caso => {
        const resultado = Bun.spawnSync([process.execPath, "--preload", sonda, "herramientas/sin-red.ts",
          "--strace", "--escenario", "v2-decision"], {
          cwd: raiz, env: { ...crearEntornoAislado(temporal, process.env), SONDA_TRAZA: caso.traza,
            SONDA_RESULTADO: JSON.stringify({ codigo: 0, salida: "{}" }) },
          stdout: "pipe", stderr: "pipe", timeout: 30000,
        });
        if (caso.codigo === 0) salidaLocal = resultado.stdout.toString();
        return { ...caso, codigo: resultado.exitCode };
      });
      expect(resultados).toEqual(destinos);
      for (const [llamada, categoria] of [["connect", "loopbackIPv4"], ["sendto", "unix"], ["sendmsg", "loopbackIPv6"]]) {
        const linea = salidaLocal.split(/\r?\n/).find(l => l.startsWith(`${llamada}: `));
        expect(linea).toBeDefined();
        expect(JSON.parse(linea!.slice(linea!.indexOf(": ") + 2))[categoria!]).toBeGreaterThan(0);
      }
    } finally { borrarTemporal(temporal); }
  }, 120000);
});
