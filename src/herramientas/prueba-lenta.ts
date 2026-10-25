import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { copiarProyectoTemporal } from "../pruebas/utilidades/proyecto-temporal";
import { crearEntornoAislado } from "../pruebas/utilidades/entorno-aislado";

const raizReal = resolve(import.meta.dir, "..");
const relativa = "paquetes/rige/aplicacion/puertos/almacen.ts";
const resumenReal = () => new Bun.CryptoHasher("sha256").update(readFileSync(join(raizReal, relativa))).digest("hex");
const resumen = resumenReal();
const copia = copiarProyectoTemporal(raizReal);
try {
  const fuente = join(copia.raiz, relativa);
  const original = readFileSync(fuente);
  async function comprobar() {
    const proceso = Bun.spawn([process.execPath, "run", "verificar"], {
      cwd: copia.raiz, env: crearEntornoAislado(copia.raiz, process.env), stdout: "pipe", stderr: "pipe",
    });
    const vigilancia = setInterval(() => assert.equal(resumenReal(), resumen), 20);
    try {
      const [codigo, salida, error] = await Promise.all([proceso.exited, new Response(proceso.stdout).text(), new Response(proceso.stderr).text()]);
      assert.equal(resumenReal(), resumen);
      return { codigo, texto: salida + error };
    } finally { clearInterval(vigilancia); }
  }
  writeFileSync(fuente, original.toString() + '\nconst sondaTipos: number = "incorrecto";\n');
  const rojo = await comprobar();
  assert.notEqual(rojo.codigo, 0);
  assert.match(rojo.texto, /TS2322/);
  writeFileSync(fuente, original);
  const verde = await comprobar();
  assert.equal(verde.codigo, 0, verde.texto);
  assert.ok(!verde.texto.includes("// paquetes/"));
  console.log("A7-1 K-6 M-3: rojo TS2322, verde verificar; fuente real intacto durante ambas corridas.");
} finally { copia.borrar(); }
