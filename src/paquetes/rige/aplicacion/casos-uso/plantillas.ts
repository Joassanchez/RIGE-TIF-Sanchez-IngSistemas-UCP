export function plantillasDe(
  adaptador: { readonly reglas: Readonly<Record<string, string>> },
  codigos: Iterable<string>,
): Record<string, string> {
  const unicos = [...new Set(codigos)].sort();
  return Object.fromEntries(
    unicos.map(codigo => {
      if (!Object.hasOwn(adaptador.reglas, codigo)) {
        throw new Error(`Regla sin plantilla: ${codigo}`);
      }
      return [codigo, adaptador.reglas[codigo]!];
    }),
  );
}
