export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    const aChar = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j++) {
      const bChar = b.charCodeAt(j - 1);
      const costo = aChar === bChar ? 0 : 1;
      curr[j] = Math.min(
        prev[j]! + 1,
        curr[j - 1]! + 1,
        prev[j - 1]! + costo
      );
    }
    const temp = prev;
    prev = curr;
    curr = temp;
  }
  return prev[b.length]!;
}

export function sugerir(entrada: string, candidatos: readonly string[]): string | undefined {
  let mejorCandidato: string | undefined;
  let menorDistancia = Infinity;

  for (const c of candidatos) {
    if (c === entrada) continue;
    const dist = levenshtein(entrada, c);
    const esPrefijo = entrada.length >= 3 && c.startsWith(entrada);
    if (dist > 2 && !esPrefijo) continue;

    const distanciaEfectiva = esPrefijo ? Math.min(dist, 2) : dist;
    if (distanciaEfectiva < menorDistancia) {
      menorDistancia = distanciaEfectiva;
      mejorCandidato = c;
    }
  }

  return mejorCandidato;
}
