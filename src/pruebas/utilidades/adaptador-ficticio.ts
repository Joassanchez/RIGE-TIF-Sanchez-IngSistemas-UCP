import type { Adaptador, Declaracion, ValorJson } from "../../paquetes/nucleo/contrato/adaptador";
import type { Estrategia } from "../../paquetes/nucleo/resolucion/estrategias";

const primera: Estrategia = (anterior, nueva, ruta) => ({
  ruta,
  valor: anterior ? anterior.valor : nueva.valor,
  determinante: anterior ? anterior.determinante : nueva,
  motivo: "primera-declaracion",
  desplazadas: anterior ? [...anterior.desplazadas, nueva] : [],
});

export const adaptadorFicticio: Adaptador = {
  identidad: { herramienta: "ficticia", version: "1" },
  prefijoAgente: ["perfiles"],
  reglas: { "primera-declaracion": "Se conserva la primera declaracion aplicada." },
  estrategias: { primera },
  ubicar: (proyecto, entorno) => ({ exito: true, valor: ["capa-b", "capa-a"].map((via) => ({
    via, referencia: entorno.unir(proyecto, `${via}.json`), condicion: "observada",
  })) }),
  leer(_, texto) {
    const objeto = JSON.parse(texto) as Record<string, ValorJson>;
    const declaraciones: Declaracion[] = Object.entries(objeto).map(([clave, valor]) => {
      const desplazamiento = texto.indexOf(JSON.stringify(clave));
      const anterior = texto.slice(0, desplazamiento);
      return {
        ruta: ["perfiles", "a", clave], valor,
        posicion: { linea: anterior.split("\n").length, columna: desplazamiento - anterior.lastIndexOf("\n") },
      };
    });
    return { exito: true, valor: declaraciones };
  },
  secuenciar: (lecturas) => ({ exito: true, valor: {
    aplicaciones: lecturas.flatMap((lectura) => lectura.declaraciones.map((declaracion) => ({
      orden: lectura.orden, declaracion, estrategia: "primera", regla: "primera-declaracion",
    }))), noResueltas: [],
  } }),
};
