import type { Hallazgo } from "./tipos";

function representarClave(clave: readonly string[]): string {
  return clave.map((segmento, indice) => /[./*\s"']/.test(segmento)
    ? `[${JSON.stringify(segmento)}]` : `${indice ? "." : ""}${segmento}`).join("");
}

export function explicarHallazgo(hallazgo: Hallazgo, plantillas: Readonly<Record<string, string>>): string {
  const plantilla = Object.hasOwn(plantillas, hallazgo.causa) ? plantillas[hallazgo.causa] : undefined;
  if (plantilla === undefined) throw new Error(`Hallazgo sin plantilla: ${hallazgo.causa}`);
  const valores: Readonly<Record<string, string | undefined>> = { ...hallazgo.parametros,
    entrada: hallazgo.entrada.referencia, posicion: `${hallazgo.posicion.linea}:${hallazgo.posicion.columna}`,
    clave: hallazgo.clave === null ? undefined : representarClave(hallazgo.clave) };
  return plantilla.replace(/\{([^{}]+)\}/g, (_, marcador: string) => {
    const valor = Object.hasOwn(valores, marcador) ? valores[marcador] : undefined;
    if (valor === undefined) throw new Error(`Marcador sin valor: ${marcador}`);
    return valor;
  });
}
