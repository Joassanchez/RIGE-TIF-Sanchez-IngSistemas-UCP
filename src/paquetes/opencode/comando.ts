import type { ObjetivoPermiso } from "@rige/nucleo/contrato/adaptador";

type Motivo = "tuberia" | "encadenamiento" | "redireccion" | "subshell" | "sustitucion" | "segundo-plano" | "salto-de-linea" | "no-analizable";

/** Reconoce la frontera de analisis; no interpreta ni ejecuta el shell. */
export function analizarComando(texto: string): { comando: string; motivos: readonly Motivo[] } {
  const motivos = new Set<Motivo>();
  // Cada sustitucion guarda el contexto de comillas que debe restaurarse.
  const contextos: { cierre: string; comilla: string }[] = [];
  let comilla = "";
  for (let i = 0; i < texto.length; i++) {
    const caracter = texto[i]!;
    const siguiente = texto[i + 1];
    if (comilla === "'") {
      if (caracter === "'") comilla = "";
      continue;
    }
    if (caracter === "\\") {
      if (siguiente === undefined) motivos.add("no-analizable");
      i++;
      continue;
    }
    if (caracter === "\n" || caracter === "\r") motivos.add("salto-de-linea");
    if (caracter === '"') {
      comilla = comilla === '"' ? "" : '"';
      continue;
    }
    if (caracter === "'" && !comilla) { comilla = "'"; continue; }
    const contexto = contextos.at(-1);
    if (!comilla && caracter === contexto?.cierre) {
      comilla = contextos.pop()!.comilla;
      continue;
    }
    if (caracter === "`" || (siguiente === "(" && (caracter === "$" || (!comilla && (caracter === "<" || caracter === ">"))))) {
      motivos.add("sustitucion");
      contextos.push({ cierre: caracter === "`" ? "`" : ")", comilla });
      comilla = "";
      if (caracter !== "`") i++;
      continue;
    }
    if (comilla) continue;
    if (caracter === "|" && siguiente !== "|") {
      motivos.add("tuberia");
      if (siguiente === "&") i++;
    } else if ((caracter === "&" && siguiente === "&") || (caracter === "|" && siguiente === "|") || caracter === ";") {
      motivos.add("encadenamiento");
      if (caracter !== ";") i++;
    } else if (caracter === ">" || caracter === "<" || (caracter === "&" && siguiente === ">")) {
      motivos.add("redireccion");
      if (caracter === "&") i++;
    } else if (caracter === "&") motivos.add("segundo-plano");
    else if (caracter === "(" || caracter === ")") {
      motivos.add("subshell");
      if (caracter === "(" && contextos.length) contextos.push({ cierre: ")", comilla });
    }
  }
  if (comilla || contextos.length) motivos.add("no-analizable");
  return { comando: texto.trim(), motivos: [...motivos] };
}

export function prepararSujeto(sujeto: string, objetivo: string): ObjetivoPermiso {
  if (sujeto !== "bash") return { sujeto, objetivoEvaluado: objetivo, motivoSinDecision: null };
  const { comando, motivos } = analizarComando(objetivo);
  return { sujeto, objetivoEvaluado: comando, motivoSinDecision: motivos.length ? "comando-compuesto" : null,
    advertencias: motivos };
}
