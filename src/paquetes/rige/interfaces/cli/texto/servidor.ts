import {
  type ContextoPresentacion,
  seguro,
  terminar,
} from "./formato";

export function renderizarServidor(r: { readonly direccion: string }, c: ContextoPresentacion): string {
  return terminar([`RIGE: ${seguro(r.direccion)}`], c);
}
