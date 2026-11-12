import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { consultarValores } from "../../paquetes/rige/aplicacion/casos-uso/consultar-valores";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import { consultarAgentes } from "../../paquetes/rige/aplicacion/casos-uso/consultar-agentes";
import { validarEsquema } from "../utilidades/validar-esquema";
import { capturarRegresionT512 } from "../utilidades/regresion-t5-12";

const raizEscenarios = join(import.meta.dir, "../escenarios");
const dirEsquemasV2 = join(import.meta.dir, "../esquemas-v2");
const dirEsquemasV3 = join(import.meta.dir, "../../esquemas/salida");

const temporales: ReturnType<typeof copiarEscenario>[] = [];
afterEach(() => { for (const t of temporales.splice(0)) t.borrar(); });

function preparar(nombre: string, opciones: OpcionesEscenario = {}) {
  const rutaRef = join(raizEscenarios, nombre, "REFERENCIA.json");
  const referencia = existsSync(rutaRef)
    ? JSON.parse(readFileSync(rutaRef, "utf8"))
    : { procedencia: { directorio: "proyecto", hogar: "hogar", git: "proyecto" } };
  const copia = copiarEscenario(nombre, { git: referencia.procedencia?.git ?? "raiz", ...opciones });
  temporales.push(copia);
  const env = entornoDeReferencia(referencia, copia);
  const proyecto = join(copia.raiz, referencia.procedencia?.directorio ?? "proyecto");
  return {
    ...copia,
    referencia,
    proyecto,
    env,
    dependencias: () => ({
      adaptador: adaptadorOpenCode,
      entorno: new EntornoLecturaSistema({ plataforma: process.platform, entorno: env }),
      rutas: { canonica: (ruta: string) => (ruta === proyecto ? ruta : null) },
    }),
  };
}

function proyectarContratoV2(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(proyectarContratoV2);
  if (valor !== null && typeof valor === "object") {
    const obj = valor as Record<string, unknown>;
    const nuevo: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === "localizacion" || k === "sustituciones") continue;
      if (k === "herramienta" && typeof v === "object") continue;
      if (k === "legibilidad") continue;
      if (k === "error" && obj.condicion !== undefined) continue;
      nuevo[k] = proyectarContratoV2(v);
    }
    return nuevo;
  }
  return valor;
}

function comprobarSubesquema(
  subV2: any,
  subActual: any,
  versionActual: number,
  ruta: string,
): { compatible: boolean; motivo?: string } {
  if (!subV2 || typeof subV2 !== "object") return { compatible: true };
  if (!subActual || typeof subActual !== "object") {
    if (versionActual < 3) return { compatible: false, motivo: `${ruta}: subesquema ausente con esquema < 3` };
    return { compatible: true };
  }

  if (Array.isArray(subV2.required)) {
    const reqActual = new Set(Array.isArray(subActual.required) ? subActual.required : []);
    for (const r of subV2.required) {
      if (!reqActual.has(r)) {
        if (versionActual < 3) return { compatible: false, motivo: `${ruta}/${r}: propiedad obligatoria eliminada con esquema < 3` };
      }
    }
  }

  for (const r of subActual.required ?? []) {
    if (!(subV2.required ?? []).includes(r) && versionActual < 3)
      return { compatible: false, motivo: `${ruta}/${r}: propiedad obligatoria nueva con esquema < 3` };
  }

  if (subV2.type && subActual.type && subV2.type !== subActual.type) {
    if (versionActual < 3) return { compatible: false, motivo: `${ruta}: tipo cambiado de ${subV2.type} a ${subActual.type} con esquema < 3` };
  }

  if (Array.isArray(subV2.enum)) {
    const enumActual = new Set(Array.isArray(subActual.enum) ? subActual.enum : []);
    for (const val of subV2.enum) {
      if (!enumActual.has(val)) {
        if (versionActual < 3) return { compatible: false, motivo: `${ruta}: valor enum '${val}' eliminado con esquema < 3` };
      }
    }
  }

  if (subV2.properties && typeof subV2.properties === "object") {
    const propsActual = subActual.properties ?? {};
    for (const [clave, defV2] of Object.entries(subV2.properties)) {
      if (propsActual[clave]) {
        const res = comprobarSubesquema(defV2, propsActual[clave], versionActual, `${ruta}/${clave}`);
        if (!res.compatible) return res;
      }
    }
  }

  if (subV2.items && typeof subV2.items === "object") {
    const res = comprobarSubesquema(subV2.items, subActual.items, versionActual, `${ruta}[]`);
    if (!res.compatible) return res;
  }

  if (subV2.$defs && typeof subV2.$defs === "object") {
    const defsActual = subActual.$defs ?? {};
    for (const [clave, defV2] of Object.entries(subV2.$defs)) {
      if (defsActual[clave]) {
        const res = comprobarSubesquema(defV2, defsActual[clave], versionActual, `${ruta}/$defs/${clave}`);
        if (!res.compatible) return res;
      }
    }
  }

  return { compatible: true };
}

function comprobarCompatibilidadEsquema(
  esquemaV2: Record<string, unknown>,
  esquemaActual: Record<string, unknown>,
): { compatible: boolean; motivo?: string } {
  const propEsquema = (esquemaActual.properties as Record<string, any> | undefined)?.esquema;
  const versionActual = propEsquema?.const ?? propEsquema?.minimum ?? 2;
  return comprobarSubesquema(esquemaV2, esquemaActual, versionActual, "$");
}

describe("T5-12 M-2 RNF-08 PC-04 PC-05", () => {
  const anterior = JSON.parse(readFileSync(join(import.meta.dir, "../datos/entradas-esquema-4118a09.json"), "utf8"));
  const congeladas = JSON.parse(readFileSync(join(import.meta.dir, "../datos/salidas-4118a09-t5-12.json"), "utf8"));
  test("contrato opcional compatible, respuesta anterior y nueva validas y controles negativos", () => {
    const actual = JSON.parse(readFileSync(join(dirEsquemasV3, "entradas.json"), "utf8"));
    expect(congeladas.procedencia.commit).toBe("4118a09");
    const vieja = JSON.parse(congeladas.casos[0].salida);
    expect(vieja.vias).toBeUndefined();
    expect(validarEsquema(anterior, vieja)).toEqual([]);
    expect(comprobarCompatibilidadEsquema(anterior, actual)).toEqual({ compatible: true });
    expect(actual.additionalProperties).toBe(false);
    expect(actual.required).not.toContain("vias");
    expect(actual.properties.vias).toBeDefined();
    expect(validarEsquema(actual, vieja)).toEqual([]);
    const nueva = { ...vieja, vias: [{ via: "capa", estado: "ausente", cantidad: 0, revisados: ["/x"] }] };
    expect(validarEsquema(actual, nueva)).toEqual([]);
    const obligatorio = structuredClone(actual);
    obligatorio.required.push("vias");
    expect(comprobarCompatibilidadEsquema(anterior, obligatorio).compatible).toBe(false);
    for (const cambio of [{ estado: "inventado" }, { cantidad: "0" }, { revisados: [7] }]) {
      expect(validarEsquema(actual, { ...nueva, vias: [{ ...nueva.vias[0], ...cambio }] }).length).toBeGreaterThan(0);
    }
  });
  test("CLI conserva valores, permiso, errores y campos anteriores de entradas byte a byte", () => {
    const { casos } = capturarRegresionT512();
    expect(casos).toHaveLength(congeladas.casos.length);
    for (const [i, caso] of casos.entries()) {
      if (i === 0) {
        const { vias, ...resto } = JSON.parse(caso.salida);
        expect(vias).toHaveLength(11);
        expect({ ...caso, salida: JSON.stringify(resto) + "\n" }).toEqual(congeladas.casos[i]);
      } else expect(caso).toEqual(congeladas.casos[i]);
    }
  });
});

describe("T3-10 R-4 RNF-08 CA-1 CA-2", () => {
  const historicas = JSON.parse(readFileSync(join(import.meta.dir, "../datos/salidas-ee7cbf5.json"), "utf8"));
  test("V-1 CA-1: el 100% de las diez salidas congeladas de ee7cbf5 valida contra el contrato vigente", () => {
    expect(historicas.procedencia.commit).toBe("ee7cbf5");
    expect(historicas.casos).toHaveLength(10);
    for (const caso of historicas.casos) {
      const esquema = JSON.parse(readFileSync(join(dirEsquemasV3, `${caso.codigo === 0 ? caso.comando : "error"}.json`), "utf8"));
      expect(validarEsquema(esquema, JSON.parse(caso.codigo === 0 ? caso.salida : caso.error))).toEqual([]);
    }
    // entradas y hallazgos nacieron en iteracion 3: sus contratos se ejercen en T3-07 R-7.
  });
  const esquemaV2Valores = JSON.parse(readFileSync(join(dirEsquemasV2, "valores.json"), "utf8"));
  const esquemaV2Permiso = JSON.parse(readFileSync(join(dirEsquemasV2, "permiso.json"), "utf8"));
  const esquemaV2Agentes = JSON.parse(readFileSync(join(dirEsquemasV2, "agentes.json"), "utf8"));
  const esquemaV2Error = JSON.parse(readFileSync(join(dirEsquemasV2, "error.json"), "utf8"));

  const esquemaV3Valores = JSON.parse(readFileSync(join(dirEsquemasV3, "valores.json"), "utf8"));
  const esquemaV3Permiso = JSON.parse(readFileSync(join(dirEsquemasV3, "permiso.json"), "utf8"));
  const esquemaV3Agentes = JSON.parse(readFileSync(join(dirEsquemasV3, "agentes.json"), "utf8"));
  const esquemaV3Error = JSON.parse(readFileSync(join(dirEsquemasV3, "error.json"), "utf8"));

  const escenariosCompatibles = readdirSync(raizEscenarios).filter(n => {
    if (!/^(?:v1|v2)-/.test(n)) return false;
    const rutaRef = join(raizEscenarios, n, "REFERENCIA.json");
    if (!existsSync(rutaRef)) return false;
    return !JSON.parse(readFileSync(rutaRef, "utf8")).procedencia?.fallaEsperada;
  });

  test("CA-1: respuestas de v1-* y v2-* proyectadas a v2 validan contra esquemas-v2 y el 100% valida contra v3", () => {
    expect(escenariosCompatibles.length).toBeGreaterThan(0);

    for (const nombre of escenariosCompatibles) {
      const e = preparar(nombre);
      const deps = e.dependencias();

      // Valores
      const rVal = consultarValores(deps, e.proyecto, "build", undefined);
      expect(rVal.exito).toBe(true);
      if (rVal.exito) {
        // Valida contra esquema v3 actual
        expect(validarEsquema(esquemaV3Valores, rVal.valor)).toEqual([]);
        // Proyectada a v2 valida contra esquema v2
        const projVal = proyectarContratoV2(rVal.valor);
        expect(validarEsquema(esquemaV2Valores, projVal)).toEqual([]);
      }

      // Permiso
      const rPerm = consultarPermiso(deps, {
        proyecto: e.proyecto,
        agente: "build",
        sujeto: "read",
        objetivo: "src/a.js",
      });
      expect(rPerm.exito).toBe(true);
      if (rPerm.exito) {
        expect(validarEsquema(esquemaV3Permiso, rPerm.valor)).toEqual([]);
        const projPerm = proyectarContratoV2(rPerm.valor);
        expect(validarEsquema(esquemaV2Permiso, projPerm)).toEqual([]);
      }

      // Agentes
      const rAg = consultarAgentes(deps, e.proyecto);
      expect(rAg.exito).toBe(true);
      if (rAg.exito) {
        expect(validarEsquema(esquemaV3Agentes, rAg.valor)).toEqual([]);
        const projAg = proyectarContratoV2(rAg.valor);
        expect(validarEsquema(esquemaV2Agentes, projAg)).toEqual([]);
      }
    }
  });

  test("V-1 CA-2: verificador de compatibilidad de esquemas entre v2 y actual", () => {
    // Todos los esquemas actuales son compatibles con v2 declarando esquema 2
    expect(comprobarCompatibilidadEsquema(esquemaV2Valores, esquemaV3Valores)).toEqual({ compatible: true });
    expect(comprobarCompatibilidadEsquema(esquemaV2Permiso, esquemaV3Permiso)).toEqual({ compatible: true });
    expect(comprobarCompatibilidadEsquema(esquemaV2Agentes, esquemaV3Agentes)).toEqual({ compatible: true });
    expect(comprobarCompatibilidadEsquema(esquemaV2Error, esquemaV3Error)).toEqual({ compatible: true });

    const obligatorioNuevo = structuredClone(esquemaV3Valores);
    obligatorioNuevo.properties.nuevo = { type: "string" };
    obligatorioNuevo.required.push("nuevo");
    expect(comprobarCompatibilidadEsquema(esquemaV2Valores, obligatorioNuevo).compatible).toBe(false);
    obligatorioNuevo.properties.esquema = { const: 3 };
    expect(comprobarCompatibilidadEsquema(esquemaV2Valores, obligatorioNuevo).compatible).toBe(true);

    // Modificación de prueba: quitar propiedad obligatoria manteniendo esquema 2 -> rechaza
    const modificadoIncompatible = structuredClone(esquemaV3Valores);
    delete modificadoIncompatible.properties.entradas;
    modificadoIncompatible.required = (modificadoIncompatible.required as string[]).filter((r: string) => r !== "entradas");
    modificadoIncompatible.properties.esquema = { const: 2 };

    const compIncompatible = comprobarCompatibilidadEsquema(esquemaV2Valores, modificadoIncompatible);
    expect(compIncompatible.compatible).toBe(false);

    // Mismo esquema modificado pero declarando esquema 3 -> acepta
    const modificadoAceptable = structuredClone(modificadoIncompatible);
    modificadoAceptable.properties.esquema = { const: 3 };
    const compAceptable = comprobarCompatibilidadEsquema(esquemaV2Valores, modificadoAceptable);
    expect(compAceptable.compatible).toBe(true);

    // Modificación de prueba: cambio de tipo con esquema 2 -> rechaza; con esquema 3 -> acepta
    const modTipoIncompatible = structuredClone(esquemaV3Valores);
    modTipoIncompatible.properties.proyecto = { type: "number" };
    modTipoIncompatible.properties.esquema = { const: 2 };
    expect(comprobarCompatibilidadEsquema(esquemaV2Valores, modTipoIncompatible).compatible).toBe(false);
    modTipoIncompatible.properties.esquema = { const: 3 };
    expect(comprobarCompatibilidadEsquema(esquemaV2Valores, modTipoIncompatible).compatible).toBe(true);

    // Modificación de prueba: enum pierde valores con esquema 2 -> rechaza; con esquema 3 -> acepta
    const modEnumIncompatible = structuredClone(esquemaV3Agentes);
    modEnumIncompatible.properties.agentes.items.properties.origen = { enum: ["nativo"] }; // perdió "declarado"
    modEnumIncompatible.properties.esquema = { const: 2 };
    expect(comprobarCompatibilidadEsquema(esquemaV2Agentes, modEnumIncompatible).compatible).toBe(false);
    modEnumIncompatible.properties.esquema = { const: 3 };
    expect(comprobarCompatibilidadEsquema(esquemaV2Agentes, modEnumIncompatible).compatible).toBe(true);

    // Salida con esquema 1 se rechaza contra esquemas actuales
    const e = preparar("v1-precedencia");
    const rVal = consultarValores(e.dependencias(), e.proyecto, "build", undefined);
    expect(rVal.exito).toBe(true);
    if (!rVal.exito) throw new Error(rVal.error.mensaje);
    const salidaEsquema1 = { ...rVal.valor, esquema: 1 };
    const erroresEsquema1 = validarEsquema(esquemaV3Valores, salidaEsquema1);
    expect(erroresEsquema1.length).toBeGreaterThan(0);
  });
});
