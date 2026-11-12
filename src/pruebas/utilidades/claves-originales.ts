// Oraculo de prueba: lector de tokens propio, sin lector, AST ni posiciones de RIGE.
export interface ClaveOriginal {
  ruta: string[];
  ocurrencia: number;
  indice: number;
  inicioValor: number;
  finValor: number;
  hoja: boolean;
}

export function coordenadasOriginales(texto: string, indice: number) {
  const lineas = texto.slice(0, indice).split(/\r\n|\r|\n/);
  return { linea: lineas.length, columna: lineas.at(-1)!.length + 1 };
}

export function clavesOriginales(texto: string, prefijo: readonly string[] = []): ClaveOriginal[] {
  const tokens = [...texto.matchAll(/\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\[\s\S])*"|[{}\[\]:,]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|\S/g)]
    .filter(t => !t[0].startsWith("//") && !t[0].startsWith("/*"));
  const claves: ClaveOriginal[] = [];
  const ocurrencias = new Map<string, number>();
  let cursor = 0;
  function consumir(esperado?: string) {
    const token = tokens[cursor++];
    if (!token || (esperado !== undefined && token[0] !== esperado)) throw new Error("Texto de prueba JSONC invalido");
    return token;
  }
  function valor(ruta: string[]): void {
    const token = consumir();
    if (token[0] === "{") {
      while (tokens[cursor]?.[0] !== "}") {
        const nombre = consumir();
        const clave = JSON.parse(nombre[0]);
        if (typeof clave !== "string") throw new Error("Clave de prueba invalida");
        consumir(":");
        const camino = [...ruta, clave];
        const id = JSON.stringify(camino);
        const ocurrencia = ocurrencias.get(id) ?? 0;
        ocurrencias.set(id, ocurrencia + 1);
        const inicioValor = tokens[cursor]!.index!;
        const entrada: ClaveOriginal = { ruta: camino, ocurrencia, indice: nombre.index!, inicioValor, finValor: 0, hoja: false };
        claves.push(entrada);
        const antes = claves.length;
        valor(camino);
        const ultimo = tokens[cursor - 1]!;
        entrada.finValor = ultimo.index! + ultimo[0].length;
        entrada.hoja = claves.length === antes;
        if (tokens[cursor]?.[0] !== ",") break;
        consumir(",");
      }
      consumir("}");
    } else if (token[0] === "[") {
      // Las declaraciones de arrays se ubican en su clave, no en sus elementos.
      let profundidad = 1;
      while (profundidad) {
        const t = consumir()[0];
        if (t === "[") profundidad++;
        if (t === "]") profundidad--;
      }
    } else JSON.parse(token[0]);
  }
  valor([...prefijo]);
  if (cursor !== tokens.length) throw new Error("Tokens sobrantes en prueba JSONC");
  return claves;
}
