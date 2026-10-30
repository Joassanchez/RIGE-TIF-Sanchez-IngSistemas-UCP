type Esquema = { readonly [clave: string]: unknown };
const soportadas = new Set(["$schema", "$id", "$defs", "$ref", "title", "description", "type", "properties", "required",
  "additionalProperties", "items", "enum", "const", "oneOf", "anyOf"]);
const objeto = (valor: unknown): valor is Esquema => valor !== null && typeof valor === "object" && !Array.isArray(valor);

/** Subconjunto explicito de JSON Schema 2020-12 para los contratos publicados. */
export function validarEsquema(esquema: unknown, valor: unknown): readonly string[] {
  if (!objeto(esquema)) throw new Error("Esquema invalido");
  const raiz = esquema;
  function referencia(ref: unknown): Esquema {
    if (typeof ref !== "string" || !ref.startsWith("#/")) throw new Error("Solo se admiten $ref locales");
    let destino: unknown = raiz;
    for (const segmento of ref.slice(2).split("/")) {
      const clave = segmento.replaceAll("~1", "/").replaceAll("~0", "~");
      if (!objeto(destino) || !Object.hasOwn(destino, clave)) throw new Error(`$ref inexistente: ${ref}`);
      destino = destino[clave];
    }
    if (!objeto(destino)) throw new Error(`$ref invalida: ${ref}`);
    return destino;
  }
  // Se revisan todas las ramas antes de validar, incluso propiedades ausentes.
  function comprobar(actual: Esquema): void {
    for (const clave of Object.keys(actual)) if (!soportadas.has(clave)) throw new Error(`Palabra clave no soportada: ${clave}`);
    if (actual.$ref !== undefined) referencia(actual.$ref);
    for (const clave of ["properties", "$defs"]) {
      if (objeto(actual[clave])) for (const hijo of Object.values(actual[clave])) {
        if (!objeto(hijo)) throw new Error("Subesquema invalido");
        comprobar(hijo);
      }
    }
    for (const clave of ["items", "additionalProperties"]) if (objeto(actual[clave])) comprobar(actual[clave]);
    for (const clave of ["anyOf", "oneOf"]) if (Array.isArray(actual[clave])) for (const hijo of actual[clave]) {
      if (!objeto(hijo)) throw new Error("Subesquema invalido");
      comprobar(hijo);
    }
  }
  comprobar(raiz);
  const iguales = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  function coincideTipo(tipo: unknown, dato: unknown): boolean {
    switch (tipo) {
      case "null": return dato === null;
      case "object": return objeto(dato);
      case "array": return Array.isArray(dato);
      case "string": return typeof dato === "string";
      case "boolean": return typeof dato === "boolean";
      case "number": return typeof dato === "number" && Number.isFinite(dato);
      case "integer": return typeof dato === "number" && Number.isInteger(dato);
      default: throw new Error(`Tipo no soportado: ${String(tipo)}`);
    }
  }
  function recorrer(actual: Esquema, dato: unknown, ruta: string): string[] {
    const errores: string[] = [];
    if (actual.$ref !== undefined) errores.push(...recorrer(referencia(actual.$ref), dato, ruta));
    if (actual.type !== undefined && !(Array.isArray(actual.type) ? actual.type : [actual.type]).some(t => coincideTipo(t, dato))) errores.push(`${ruta}: tipo incorrecto`);
    if (Object.hasOwn(actual, "const") && !iguales(actual.const, dato)) errores.push(`${ruta}: const incorrecta`);
    if (Array.isArray(actual.enum) && !actual.enum.some(v => iguales(v, dato))) errores.push(`${ruta}: fuera de enum`);
    for (const clave of ["anyOf", "oneOf"]) if (Array.isArray(actual[clave])) {
      const coincidentes = actual[clave].filter(e => recorrer(e as Esquema, dato, ruta).length === 0).length;
      if (clave === "oneOf" ? coincidentes !== 1 : coincidentes === 0) errores.push(`${ruta}: ${clave} incumplido`);
    }
    if (objeto(dato)) {
      const propiedades = objeto(actual.properties) ? actual.properties : {};
      if (Array.isArray(actual.required)) for (const clave of actual.required as string[]) {
        if (!Object.hasOwn(dato, clave)) errores.push(`${ruta}/${clave}: requerido`);
      }
      for (const [clave, contenido] of Object.entries(dato)) {
        if (Object.hasOwn(propiedades, clave)) errores.push(...recorrer(propiedades[clave] as Esquema, contenido, `${ruta}/${clave}`));
        else if (actual.additionalProperties === false) errores.push(`${ruta}/${clave}: propiedad extra`);
        else if (objeto(actual.additionalProperties)) errores.push(...recorrer(actual.additionalProperties, contenido, `${ruta}/${clave}`));
      }
    }
    if (Array.isArray(dato) && objeto(actual.items)) dato.forEach((contenido, indice) => errores.push(...recorrer(actual.items as Esquema, contenido, `${ruta}/${indice}`)));
    return errores;
  }
  return recorrer(raiz, valor, "$");
}
