export type Resultado<T, E> =
  | { readonly exito: true; readonly valor: T }
  | { readonly exito: false; readonly error: E };
