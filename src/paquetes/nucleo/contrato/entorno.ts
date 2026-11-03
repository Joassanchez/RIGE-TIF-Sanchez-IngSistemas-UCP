export type TipoRuta = "archivo" | "directorio" | "otro" | "inexistente";

export interface ArchivoLeido {
  readonly texto: string;
  readonly resumen: string;
}

export interface EntornoLectura {
  readonly plataforma: string;
  /** Operaciones puras con la semantica de la plataforma solicitada. */
  rutasPara(plataforma: string): Pick<EntornoLectura, "unir" | "relativa" | "padre" | "esAbsoluta">;
  /** Valor literal, incluso vacio o con espacios; undefined solo si no existe. */
  variable(nombre: string): string | undefined;
  tipo(ruta: string): TipoRuta;
  examinar(ruta: string): TipoRuta | "inaccesible";
  leer(ruta: string): ArchivoLeido;
  /** Ruta fisica con los enlaces resueltos; la ruta existe. */
  real(ruta: string): string;
  resumir(texto: string): string;
  unir(...partes: readonly string[]): string;
  relativa(desde: string, hasta: string): string;
  padre(ruta: string): string;
  esAbsoluta(ruta: string): boolean;
  listar(directorio: string): readonly string[];
}
