/** Solo las exclusiones que aplican los comparadores actuales; no son alcance del producto. */
const exclusiones = [
  ...[
    ["v2-cadena", "revisor"], ["v2-subagente", "vacio"], ["v3-sustituciones", "revisor"],
    ["v3-control-sustituciones", "revisor"], ["v3-herramientas", "a"], ["v3-herramientas", "b"], ["v3-herramientas", "c"],
  ].map(([escenario, agente]) => ({ comparador: "RNF-02", escenario, agente, clave: "name",
    motivo: "name sintetico del agente declarado no se proyecta como valor efectivo" })),
  { comparador: "RNF-06", escenario: "v1-vias", agente: "build", clave: "steps",
    motivo: "maxSteps no resuelto: agent.build.steps queda fuera-del-v1" },
];
export function exclusionValor(comparador: "RNF-02" | "RNF-06", escenario: string, agente: string, clave: string): string | undefined {
  return exclusiones.find(e => e.comparador === comparador && e.escenario === escenario && e.agente === agente && e.clave === clave)?.motivo;
}
