import type { ResumenPermisos } from "@rige/nucleo/contrato/adaptador";
import type { Cadena } from "@rige/nucleo/resolucion/tipos";
import type { ContextoOpenCode } from "./contexto";
import { permisos } from "./permisos";
import { match } from "./vendor/wildcard";

/** Solo el patron literal universal describe el efecto general; no se evalua un objetivo ficticio. */
export function resumirPermisos(cadenas: readonly Cadena[], contexto: ContextoOpenCode): ResumenPermisos {
  const principales = ["read", "edit", "bash", "webfetch", "task", "external_directory"];
  const observados = new Set(cadenas.flatMap(c => c.reglas.map(r => r.sujeto)).filter(s => !/[?*]/.test(s)));
  const sujetos = [...principales.filter(s => observados.has(s)), ...[...observados].filter(s => !principales.includes(s)).sort()];
  return { sujetos, filas: cadenas.map(cadena => ({ agente: cadena.agente, celdas: sujetos.map(sujeto => {
    if (cadena.ejesParciales.includes(sujeto)) return { sujeto, efecto: null, prevalece: null, motivo: "eje-parcialmente-observado" };
    const regla = cadena.reglas.findLast(r => r.patron === "*" && match(sujeto, r.sujeto, contexto.entorno.plataforma));
    return { sujeto, efecto: regla?.efecto ?? permisos.efectoPorDefecto, prevalece: regla?.indice ?? null, motivo: null };
  }) })) };
}
