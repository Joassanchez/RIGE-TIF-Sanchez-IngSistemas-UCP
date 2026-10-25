// Copyright (c) 2025 opencode. Licencia MIT: ver ./LICENSE.
// Copia de opencode v1.18.25, packages/core/src/util/wildcard.ts:3-16. Ver ./PROCEDENCIA.md.
export function match(input: string, pattern: string, plataforma: string) {
  const normalized = input.replaceAll("\\", "/")
  let escaped = pattern
    .replaceAll("\\", "/")
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".")

  if (escaped.endsWith(" .*")) escaped = escaped.slice(0, -3) + "( .*)?"

  return new RegExp("^" + escaped + "$", plataforma === "win32" ? "si" : "s").test(normalized)
}
