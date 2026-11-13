export type RolPresentacion =
  | "permitida"
  | "pregunta"
  | "denegada"
  | "rige"
  | "declarado"
  | "nativo"
  | "desplazado"
  | "parcial"
  | "estructura"
  | "pista";

export const rolesSignificado = {
  efectos: {
    allow: "permitida",
    ask: "pregunta",
    deny: "denegada",
  },
  origenes: {
    declarado: "declarado",
    nativo: "nativo",
    implicito: "nativo",
  },
  cambios: {
    agregada: "permitida",
    quitada: "denegada",
    cambiada: "pregunta",
  },
} as const satisfies Record<string, Readonly<Record<string, RolPresentacion>>>;

export function rolEfecto(codigo: string | null | undefined): RolPresentacion {
  if (!codigo) return "pista";
  return (rolesSignificado.efectos as Readonly<Record<string, RolPresentacion>>)[codigo] ?? "pista";
}

export function rolOrigen(
  origen: string | { readonly tipo: string } | null | undefined
): RolPresentacion {
  if (!origen) return "pista";
  const tipo = typeof origen === "string" ? origen : origen.tipo;
  return (rolesSignificado.origenes as Readonly<Record<string, RolPresentacion>>)[tipo] ?? "pista";
}

export function rolCambio(tipo: string | null | undefined): RolPresentacion {
  if (!tipo) return "pista";
  return (rolesSignificado.cambios as Readonly<Record<string, RolPresentacion>>)[tipo] ?? "pista";
}
