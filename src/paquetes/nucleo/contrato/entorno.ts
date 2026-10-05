export type TipoRuta = "archivo" | "directorio" | "otro" | "inexistente";

export interface ArchivoLeido {
  readonly texto: string;
  readonly resumen: string;
}

export interface EntornoLectura {
  readonly plataforma: string;
  variable(nombre: string): string | undefined;
  tipo(ruta: string): TipoRuta;
  leer(ruta: string): ArchivoLeido;
  resumir(texto: string): string;
  unir(...partes: readonly string[]): string;
  padre(ruta: string): string;
  esAbsoluta(ruta: string): boolean;
  listar(directorio: string): readonly string[];
}
