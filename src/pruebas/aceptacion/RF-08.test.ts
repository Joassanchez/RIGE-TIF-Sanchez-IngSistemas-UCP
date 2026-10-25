import { describe, expect, test } from "bun:test";
import { consultarPermisos } from "../utilidades/permisos";

function consultar(objetivos: string[]) {
  return consultarPermisos(objetivos.flatMap(objetivo => [
    { agente: "build", herramienta: "bash", objetivo },
    { agente: "build", sujeto: "bash", objetivo },
  ]), "ultima", "global", "v2-bash").respuestas;
}

describe("RF-08 CA-1", () => {
  test("compuestos sin decision y advertencia con motivos ordenados", () => {
    const casos: [string, string[]][] = [
      ["ls | grep a", ["tuberia"]], ["ls && rm -rf x", ["encadenamiento"]],
      ["ls; rm x", ["encadenamiento"]], ["echo a > f", ["redireccion"]],
      ["(cd x && ls)", ["subshell", "encadenamiento"]], ["echo $(whoami)", ["sustitucion"]],
      ["echo `id`", ["sustitucion"]], ['echo "$(id)"', ["sustitucion"]],
      ['echo "sin cerrar', ["no-analizable"]], ["ls \\", ["no-analizable"]],
      ["ls | cat | cat &\npwd", ["tuberia", "segundo-plano", "salto-de-linea"]],
    ];
    const respuestas = consultar(casos.map(([objetivo]) => objetivo));
    casos.forEach(([, motivos], i) => {
      for (const respuesta of respuestas.slice(i * 2, i * 2 + 2)) {
        expect(respuesta).toMatchObject({ decision: null, motivoSinDecision: "comando-compuesto",
          determinante: null, cadena: [], desplazadas: [], nativaAnulada: null });
        expect(respuesta.advertencias).toEqual(motivos);
        for (const motivo of motivos) expect(respuesta.reglas[motivo]).toContain(motivo);
      }
    });
  });
});

describe("RF-08 CA-2", () => {
  test("simples con comillas y escapes se deciden sobre el comando recortado", () => {
    const objetivos = ["ls -la", "  rm -rf x  ", 'echo "a|b"', "echo 'a && b'", 'grep "x;y" f', "echo '$(id)'", String.raw`echo a\|b`];
    const respuestas = consultar(objetivos);
    respuestas.forEach((respuesta, i) => {
      expect(respuesta.decision).toBe(Math.floor(i / 2) === 1 ? "deny" : "allow");
      expect(respuesta.motivoSinDecision).toBeNull();
      expect(respuesta.consulta.objetivo).toBe(objetivos[Math.floor(i / 2)]!);
      expect(respuesta.consulta.objetivoEvaluado).toBe(objetivos[Math.floor(i / 2)]!.trim());
      if (respuesta.decision === "deny") expect(respuesta.cadena.find(r => r.indice === respuesta.determinante))
        .toMatchObject({ sujeto: "bash", patron: "rm *", efecto: "deny" });
    });
  });
});

describe("RF-08 CA-3", () => {
  test("el caso de uso devuelve una respuesta serializable exitosa sin decision", () => {
    const respuestas = consultar(["ls && rm -rf x"]);
    for (const respuesta of JSON.parse(JSON.stringify(respuestas))) {
      expect(respuesta).toMatchObject({ esquema: 2, decision: null, motivoSinDecision: "comando-compuesto" });
      expect(respuesta.reglas["comando-compuesto"]).toBeString();
    }
  });
});
