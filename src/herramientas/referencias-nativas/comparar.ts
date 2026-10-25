export type Diferencia = { readonly clave: string; readonly esperado: unknown; readonly obtenido: unknown };

export function normalizar(salida: unknown): Record<string, unknown> {
  if (salida === null || typeof salida !== "object" || Array.isArray(salida)) {
    throw new Error("La salida nativa debe ser un objeto JSON.");
  }
  const resultado: Record<string, unknown> = {};
  function aplanar(objeto: object, prefijo: readonly string[]): void {
    for (const [clave, valor] of Object.entries(objeto)) {
      const segmento = prefijo.length ? clave : clave === "topP" ? "top_p" : clave === "maxSteps" ? "steps" : clave;
      const ruta = [...prefijo, segmento];
      if (valor !== null && typeof valor === "object" && !Array.isArray(valor)) aplanar(valor, ruta);
      else {
        // Las referencias del v1 usan puntos; los segmentos ambiguos se muestran como puntero JSON.
        const nombre = ruta.some((parte) => !parte || /[./~]/.test(parte))
          ? `/${ruta.map((parte) => parte.replaceAll("~", "~0").replaceAll("/", "~1")).join("/")}` : ruta.join(".");
        Object.defineProperty(resultado, nombre, { value: valor, enumerable: true, configurable: true });
      }
    }
  }
  aplanar(salida, []);
  return resultado;
}

export function comparar(esperado: Record<string, unknown>, obtenido: Record<string, unknown>): Diferencia[] {
  return Object.keys(esperado).filter(clave => !Object.hasOwn(obtenido, clave) || !iguales(esperado[clave], obtenido[clave]))
    .map(clave => ({ clave, esperado: esperado[clave], obtenido: obtenido[clave] }));
}

function iguales(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return false;
  const x = a as Record<string, unknown>, y = b as Record<string, unknown>;
  return Object.keys(x).length === Object.keys(y).length && Object.keys(x).every(k => Object.hasOwn(y, k) && iguales(x[k], y[k]));
}

export function normalizarRutas<T>(valor: T, rutas: { readonly data: string; readonly tmp: string; readonly hogar: string }): T {
  const marcadores = Object.entries(rutas).map(([nombre, ruta]) => [nombre, ruta.replaceAll("\\", "/").replace(/\/$/, "")] as const)
    .sort((a, b) => b[1].length - a[1].length);
  function recorrer(v: unknown): unknown {
    if (typeof v === "string") {
      const normalizada = v.replaceAll("\\", "/");
      const marcador = marcadores.find(([, ruta]) => normalizada === ruta || normalizada.startsWith(`${ruta}/`));
      return marcador ? `<${marcador[0]}>${normalizada.slice(marcador[1].length)}` : normalizada;
    }
    if (Array.isArray(v)) return v.map(recorrer);
    if (v !== null && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, contenido]) => [k, recorrer(contenido)]));
    return v;
  }
  return recorrer(valor) as T;
}
