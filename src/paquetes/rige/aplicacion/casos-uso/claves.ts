export { rutaDesdeTexto } from "@rige/nucleo/resolucion/proyectar";

// Conserva la forma con puntos cuando es inequívoca; en otro caso usa JSON Pointer.
export function textoDesdeRuta(ruta: readonly string[]): string {
  return ruta.every(segmento => !/[./~]/.test(segmento)) ? ruta.join(".")
    : "/" + ruta.map(segmento => segmento.replaceAll("~", "~0").replaceAll("/", "~1")).join("/");
}
