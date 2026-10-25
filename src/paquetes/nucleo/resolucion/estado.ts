import type { EstadoFusion } from "./estrategias";
import type { DeclaracionUbicada, RastroEnFusion } from "./tipos";

interface Nodo {
  readonly hijos: Map<string, Nodo>;
  rastro?: RastroEnFusion;
  historia: readonly DeclaracionUbicada[];
}
const nodo = (): Nodo => ({ hijos: new Map(), historia: [] });
const esIndice = (clave: string) => /^(0|[1-9][0-9]*)$/.test(clave) && Number(clave) < 4294967295;
function hijosOrdenados(actual: Nodo): readonly Nodo[] {
  const claves = [...actual.hijos.keys()];
  return [...claves.filter(esIndice).sort((a, b) => Number(a) - Number(b)), ...claves.filter(c => !esIndice(c))]
    .map(c => actual.hijos.get(c)!);
}
function hojas(actual: Nodo | undefined): readonly RastroEnFusion[] {
  if (!actual) return [];
  return actual.rastro ? [actual.rastro] : hijosOrdenados(actual).flatMap(hojas);
}

export class ArbolFusion implements EstadoFusion {
  private readonly raiz = nodo();
  readonly eliminadas: (RastroEnFusion & { readonly eliminacion: DeclaracionUbicada })[] = [];

  private buscar(ruta: readonly string[]): Nodo | undefined {
    let actual: Nodo | undefined = this.raiz;
    for (const segmento of ruta) actual = actual?.hijos.get(segmento);
    return actual;
  }
  obtener(ruta: readonly string[]): RastroEnFusion | undefined { return this.buscar(ruta)?.rastro; }
  hojasBajo(ruta: readonly string[]): readonly RastroEnFusion[] { return hojas(this.buscar(ruta)); }

  fijar(ruta: readonly string[], rastro: RastroEnFusion): void {
    let actual = this.raiz;
    const heredadas: DeclaracionUbicada[] = [];
    for (const segmento of ruta) {
      if (actual.rastro) {
        const valor = actual.rastro.valor;
        const vacio = valor !== null && typeof valor === "object" && !Array.isArray(valor) && Object.keys(valor).length === 0;
        actual.historia = vacio ? actual.rastro.desplazadas : [...actual.rastro.desplazadas, actual.rastro.determinante];
        delete actual.rastro;
      }
      heredadas.push(...actual.historia);
      if (!actual.hijos.has(segmento)) actual.hijos.set(segmento, nodo());
      actual = actual.hijos.get(segmento)!;
    }
    if (actual.hijos.size) throw new Error("El subárbol requiere una estrategia de reemplazo explícita");
    actual.rastro = { ...rastro, ruta: [...ruta], desplazadas: [...new Set([...heredadas, ...rastro.desplazadas])] };
  }
  vaciarBajo(ruta: readonly string[]): readonly RastroEnFusion[] {
    const actual = this.buscar(ruta);
    const anteriores = hojas(actual);
    if (actual) {
      actual.hijos.clear();
      delete actual.rastro;
      actual.historia = [];
    }
    return anteriores;
  }
  eliminarBajo(ruta: readonly string[]): readonly RastroEnFusion[] {
    const anteriores = this.hojasBajo(ruta);
    if (!ruta.length) { this.vaciarBajo(ruta); return anteriores; }
    // Solo se borra la clave indicada: sus antecesores conservan su posicion.
    this.buscar(ruta.slice(0, -1))?.hijos.delete(ruta.at(-1)!);
    for (let longitud = ruta.length - 1; longitud >= 0; longitud--) {
      const antecesor = this.buscar(ruta.slice(0, longitud));
      if (antecesor && !antecesor.hijos.size && !antecesor.rastro) antecesor.historia = [];
    }
    return anteriores;
  }
  registrarEliminadas(rastros: readonly RastroEnFusion[], causa: DeclaracionUbicada): void {
    this.eliminadas.push(...rastros.map(r => ({ ...r, eliminacion: causa })));
  }
}
