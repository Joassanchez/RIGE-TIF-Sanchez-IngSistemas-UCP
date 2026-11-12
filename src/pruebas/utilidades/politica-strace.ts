export function politicaStrace(entrada: {
  readonly plataforma: string;
  readonly tieneStrace: boolean;
  readonly ci: string | undefined;
}): { readonly accion: "ejecutar" | "omitir" | "fallar"; readonly motivo: string } {
  if (entrada.plataforma !== "linux") return { accion: "omitir", motivo: `strace solo en Linux; plataforma ${entrada.plataforma}` };
  if (entrada.tieneStrace) return { accion: "ejecutar", motivo: "Linux con strace" };
  if (entrada.ci === "true") return { accion: "fallar", motivo: "Linux sin strace en CI=true: instale strace antes de bun test." };
  return { accion: "omitir", motivo: "Linux sin strace fuera de CI=true" };
}
