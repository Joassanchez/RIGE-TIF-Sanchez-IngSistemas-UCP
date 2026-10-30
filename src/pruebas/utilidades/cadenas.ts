import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Cadena } from "../../paquetes/nucleo/resolucion/tipos";
import { copiarEscenario, type OpcionesEscenario } from "./escenario";
import { crearEntornoAislado } from "./entorno-aislado";
import { marcadorRelativoRaiz, normalizarRutas } from "../../herramientas/referencias-nativas/comparar";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { resolver } from "../../paquetes/nucleo/resolucion/resolver";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";

export interface ReferenciaCadenas {
  procedencia: { directorio: string; hogar: string; OPENCODE_CONFIG?: string; git?: OpcionesEscenario["git"] };
  cadenas: Record<string, { permission: string; pattern: string; action: string }[]>;
}

export function consultarCadenas(nombre: string) {
  const referencia = JSON.parse(readFileSync(join(import.meta.dir, "../escenarios", nombre, "REFERENCIA.json"), "utf8")) as ReferenciaCadenas;
  const copia = copiarEscenario(nombre, { git: referencia.procedencia.git ?? "raiz" });
  try {
    const hogar = join(copia.raiz, referencia.procedencia.hogar);
    const env = { ...crearEntornoAislado(hogar, process.env), XDG_CONFIG_HOME: join(hogar, ".config"),
      TEMP: join(hogar, "tmp"), TMP: join(hogar, "tmp"), TMPDIR: join(hogar, "tmp"), ProgramData: hogar };
    if (referencia.procedencia.OPENCODE_CONFIG) Object.assign(env, { OPENCODE_CONFIG: join(copia.raiz, referencia.procedencia.OPENCODE_CONFIG) });
    const entorno = new EntornoLecturaSistema({ plataforma: process.platform, entorno: env });
    const proyecto = join(copia.raiz, referencia.procedencia.directorio);
    const contexto = adaptadorOpenCode.contexto(proyecto, entorno);
    if (!contexto.exito) throw new Error(contexto.error.mensaje);
    const resolucion = resolver(adaptadorOpenCode, proyecto, entorno, contexto.valor);
    if (!resolucion.exito) throw new Error(resolucion.error.mensaje);
    const cadenas: Record<string, Cadena> = Object.fromEntries(Object.keys(referencia.cadenas).map(agente => {
      const resultado = adaptadorOpenCode.cadena(resolucion.valor, agente, contexto.valor);
      if (!resultado.exito) throw new Error(resultado.error.mensaje);
      return [agente, resultado.valor];
    }));
    return { referencia, cadenas, raiz: copia.raiz, normalizar: (valor: unknown) => normalizarRutas(valor, {
      hogar, data: join(hogar, "opencode"), tmp: join(hogar, "tmp/opencode"), "hogar-relativo-raiz": marcadorRelativoRaiz(proyecto, hogar),
    }) };
  } finally { copia.borrar(); }
}
