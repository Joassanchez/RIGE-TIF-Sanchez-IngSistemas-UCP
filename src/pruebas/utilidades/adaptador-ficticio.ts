import type { Adaptador, Declaracion, ValorJson } from "../../paquetes/nucleo/contrato/adaptador";
import type { Estrategia } from "../../paquetes/nucleo/resolucion/estrategias";

const primera: Estrategia = (estado, nueva, ruta) => {
  const anterior = estado.obtener(ruta);
  estado.fijar(ruta, { ruta,
    valor: anterior ? anterior.valor : nueva.valor,
    determinante: anterior ? anterior.determinante : nueva,
    motivo: "primera-declaracion",
    desplazadas: anterior ? [...anterior.desplazadas, nueva] : [],
  });
};

export const adaptadorFicticio: Adaptador = {
  identidad: { herramienta: "ficticia", version: "1" },
  prefijoAgente: ["perfiles"],
  reglas: { "primera-declaracion": "Se conserva la primera declaracion aplicada.", "base-ficticia": "Base de la herramienta ficticia.",
    "retirada-ficticia": "Se retira el grupo indicado por la capa." },
  estrategias: { primera },
  ubicar: (proyecto, entorno) => ({ exito: true, valor: ["capa-b", "capa-a"].map((via) => ({
    via, referencia: entorno.unir(proyecto, `${via}.json`), condicion: "observada",
  })) }),
  leer(_, texto) {
    const objeto = JSON.parse(texto) as Record<string, ValorJson>;
    const declaraciones: Declaracion[] = [];
    function recorrer(objeto: { readonly [clave: string]: ValorJson }, prefijo: readonly string[]): void {
      for (const [clave, valor] of Object.entries(objeto)) {
        const ruta = [...prefijo, clave];
        if (valor !== null && typeof valor === "object" && !Array.isArray(valor) && Object.keys(valor).length) {
          recorrer(valor as { readonly [clave: string]: ValorJson }, ruta);
          continue;
        }
        const desplazamiento = texto.indexOf(JSON.stringify(clave));
        const anterior = texto.slice(0, desplazamiento);
        declaraciones.push({
          ruta, valor,
          posicion: { linea: anterior.split("\n").length, columna: desplazamiento - anterior.lastIndexOf("\n") },
        });
      }
    }
    recorrer(objeto, ["perfiles", "a"]);
    return { exito: true, valor: declaraciones };
  },
  secuenciar: (lecturas) => ({ exito: true, valor: {
    aplicaciones: [...lecturas.flatMap((lectura) => lectura.declaraciones.map((declaracion) => ({
      origen: { tipo: "declarado" as const, orden: lectura.orden, posicion: declaracion.posicion },
      ruta: declaracion.ruta.at(-1) === "retirar" && typeof declaracion.valor === "string"
        ? ["perfiles", "a", declaracion.valor] : declaracion.ruta,
      valor: declaracion.valor,
      estrategia: declaracion.ruta.at(-1) === "retirar" ? "eliminacion" : "primera",
      regla: declaracion.ruta.at(-1) === "retirar" ? "retirada-ficticia" : "primera-declaracion",
    }))), { origen: { tipo: "nativo", regla: "base-ficticia" }, ruta: ["base"], valor: true,
      estrategia: "primera", regla: "base-ficticia" }], noResueltas: [],
  } }),
};
