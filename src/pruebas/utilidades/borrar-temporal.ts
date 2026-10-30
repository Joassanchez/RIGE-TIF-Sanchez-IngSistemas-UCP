import { rmSync } from "node:fs";

interface Operaciones {
  readonly borrar: (ruta: string) => void;
  readonly esperar: (ms: number) => void;
  readonly advertir: (texto: string) => void;
}
const operaciones: Operaciones = {
  borrar: ruta => rmSync(ruta, { recursive: true, force: true }),
  esperar: ms => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); },
  advertir: texto => console.warn(texto),
};

export function borrarTemporal(ruta: string, acciones: Operaciones = operaciones): void {
  for (let intento = 0; ; intento++) {
    try { acciones.borrar(ruta); return; }
    catch (error) {
      const codigo = error !== null && typeof error === "object" && "code" in error ? error.code : undefined;
      if (intento < 10 && ["EBUSY", "EPERM", "ENOTEMPTY"].includes(String(codigo))) acciones.esperar(50);
      else { acciones.advertir(`No se pudo borrar el temporal ${ruta}: ${String(error)}`); return; }
    }
  }
}
