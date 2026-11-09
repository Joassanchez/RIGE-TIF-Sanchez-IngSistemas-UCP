import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { copiarEscenario, type OpcionesEscenario } from "../utilidades/escenario";
import { entornoDeReferencia } from "../utilidades/entorno-referencia";
import { lanzar, lanzarServidor } from "../utilidades/subproceso";
import { solicitarLocal } from "../utilidades/cliente-http-local";
import { validarEsquema } from "../utilidades/validar-esquema";
import { adaptadorOpenCode } from "../../paquetes/opencode/adaptador";
import { EntornoLecturaSistema } from "../../paquetes/rige/adaptadores/sistema/entorno-lectura";
import { crearEntornoMemoria } from "../utilidades/entorno-memoria";
import { consultarValores } from "../../paquetes/rige/aplicacion/casos-uso/consultar-valores";
import { respuestaValores } from "../../paquetes/rige/aplicacion/casos-uso/proyectar-valores";
import { consultarPermiso } from "../../paquetes/rige/aplicacion/casos-uso/consultar-permiso";
import { consultarAgentes } from "../../paquetes/rige/aplicacion/casos-uso/consultar-agentes";
import { consultarEntradas } from "../../paquetes/rige/aplicacion/casos-uso/consultar-entradas";
import { consultarHallazgos } from "../../paquetes/rige/aplicacion/casos-uso/consultar-hallazgos";
import type { DeclaracionUbicada, Resolucion } from "../../paquetes/nucleo/resolucion/tipos";
import { clavesOriginales, coordenadasOriginales, type ClaveOriginal } from "../utilidades/claves-originales";
import type { Manifiesto } from "../../herramientas/cobertura";

const raizEscenarios = join(import.meta.dir, "../escenarios");
const temporales: ReturnType<typeof copiarEscenario>[] = [];
afterEach(() => { for (const t of temporales.splice(0)) t.borrar(); });

function preparar(nombre: string, opciones: OpcionesEscenario = {}) {
  const rutaRef = join(raizEscenarios, nombre, "REFERENCIA.json");
  const referencia = existsSync(rutaRef) ? JSON.parse(readFileSync(rutaRef, "utf8")) : { procedencia: { directorio: "proyecto", hogar: "hogar", git: "proyecto" } };
  const copia = copiarEscenario(nombre, { git: referencia.procedencia?.git ?? "raiz", ...opciones });
  temporales.push(copia);
  const env = entornoDeReferencia(referencia, copia);
  const proyecto = join(copia.raiz, referencia.procedencia?.directorio ?? "proyecto");
  return {
    ...copia, referencia, proyecto, env,
    dependencias: () => ({
      adaptador: adaptadorOpenCode,
      entorno: new EntornoLecturaSistema({ plataforma: process.platform, entorno: env }),
      rutas: { canonica: (ruta: string) => ruta === proyecto ? ruta : null },
    }),
  };
}

function datosWeb(cuerpo: string) {
  const bloque = /<script type="application\/json" id="respuesta">([^]*?)<\/script>/.exec(cuerpo);
  expect(bloque).not.toBeNull();
  return JSON.parse(bloque![1]!);
}

const esPrefijo = (a: readonly string[], b: readonly string[]) => a.length <= b.length && a.every((s, i) => s === b[i]);
const nativos = ["build", "plan", "general", "explore", "compaction", "summary", "title"];
const inventario = (JSON.parse(readFileSync(join(raizEscenarios, "MANIFIESTO.json"), "utf8")) as Manifiesto).defectosSembrados;

function fuentesOriginales(e: ReturnType<typeof preparar>) {
  const textos = new Map<string, string>();
  for (const relativa of new Bun.Glob("**/*").scanSync({ cwd: e.raiz, onlyFiles: true, dot: true })) {
    if (!/\.jsonc?$/.test(relativa)) continue;
    const ref = join(e.raiz, relativa).replaceAll("\\", "/");
    textos.set(ref, readFileSync(ref, "utf8"));
  }
  for (const variable of ["OPENCODE_CONFIG_CONTENT", "OPENCODE_PERMISSION"]) {
    if (e.env[variable] !== undefined) textos.set(variable, e.env[variable]!);
  }
  const claves = new Map<string, ClaveOriginal[]>();
  for (const [ref, texto] of textos) claves.set(ref, clavesOriginales(texto, ref === "OPENCODE_PERMISSION" ? ["permission"] : []));
  return { textos, claves };
}

function comprobarUbicacion(d: DeclaracionUbicada, ref: string, original: ClaveOriginal, texto: string) {
  const posicion = coordenadasOriginales(texto, original.indice);
  expect(d.referencia).toBe(ref);
  expect(d.origen).toMatchObject({ tipo: "declarado", posicion });
  expect(d.localizacion).toBe(`${ref}:${posicion.linea}:${posicion.columna}`);
}

// La ruta y la ocurrencia se obtienen de las claves del texto original, nunca de
// las coordenadas publicadas. Se conservan todos los hermanos desplazados al cambiar de forma.
function comprobarRastro(declaraciones: readonly DeclaracionUbicada[], ruta: readonly string[], fuentes: ReturnType<typeof fuentesOriginales>) {
  const grupos = new Map<string, DeclaracionUbicada[]>();
  for (const d of declaraciones) {
    if (d.origen.tipo !== "declarado") { expect(d.localizacion).toBeUndefined(); continue; }
    expect(d.referencia).not.toBeNull();
    const grupo = grupos.get(d.referencia!) ?? [];
    grupo.push(d);
    grupos.set(d.referencia!, grupo);
  }
  for (const [ref, grupo] of grupos) {
    const originales = fuentes.claves.get(ref)!.filter(c => c.hoja && (esPrefijo(c.ruta, ruta) || esPrefijo(ruta, c.ruta)));
    expect(originales.length, `${ref} ${JSON.stringify(ruta)}`).toBe(grupo.length);
    grupo.forEach((d, i) => comprobarUbicacion(d, ref, originales[i]!, fuentes.textos.get(ref)!));
  }
}

describe("RF-12 CA-1 T3-07 R-5", () => {
  const escenariosValidos = readdirSync(raizEscenarios).filter(n => {
    if (!/^(?:v1|v2|v3)-/.test(n)) return false;
    const rutaRef = join(raizEscenarios, n, "REFERENCIA.json");
    if (!existsSync(rutaRef)) return true;
    return !JSON.parse(readFileSync(rutaRef, "utf8")).procedencia?.fallaEsperada;
  });

  for (const nombre of escenariosValidos) test(`V-6 ${nombre}: todas las localizaciones publicadas coinciden con ruta y ocurrencia originales`, () => {
    const e = preparar(nombre);
    const deps = e.dependencias();
    const fuentes = fuentesOriginales(e);
    const hojas = [...fuentes.claves.entries()].flatMap(([ref, claves]) => claves.filter(c => c.hoja).map(c => ({ ...c, ref })));
    const nombres = new Set([...nativos, ...hojas.filter(c => c.ruta[0] === "agent").map(c => c.ruta[1]!)]);
    const deshabilitados = new Set(hojas.filter(c => c.ruta[0] === "agent" && c.ruta[2] === "disable"
      && fuentes.textos.get(c.ref)!.slice(c.inicioValor, c.finValor) === "true").map(c => c.ruta[1]!));
    let declaradas = 0;
    for (const agente of nombres) {
      if (deshabilitados.has(agente)) continue; // comprobadas abajo por eliminacion.
      const valores = consultarValores(deps, e.proyecto, agente, undefined);
      expect(valores.exito).toBe(true);
      if (!valores.exito) throw new Error(`${nombre}/${agente}: ${valores.error.mensaje}`);
      for (const { rastro } of valores.valor.valores) {
        const declaraciones = [...rastro.desplazadas, rastro.determinante];
        comprobarRastro(declaraciones, rastro.ruta, fuentes);
        declaradas += declaraciones.filter(d => d.origen.tipo === "declarado").length;
      }
      // Consultas independientes de las coordenadas; incluyen patrones y sujetos
      // de las entradas para cubrir tambien las cadenas distintas de read/build.
      const permisos = hojas.filter(c => c.ruta[0] === "permission" || esPrefijo(["agent", agente, "permission"], c.ruta));
      const consultas = [{ sujeto: "read", objetivo: "src/a.js" }, ...permisos.map(c => {
        const segmentos = c.ruta.slice(c.ruta[0] === "permission" ? 1 : 3);
        return { sujeto: segmentos[0] ?? "read", objetivo: (segmentos[1] ?? "src/a.js").replaceAll("*", "a").replaceAll("?", "b") };
      })];
      for (const consulta of consultas) {
        const permiso = consultarPermiso(deps, { proyecto: e.proyecto, agente, ...consulta });
        expect(permiso.exito).toBe(true);
        if (!permiso.exito) throw new Error(`${nombre}/${agente}: ${permiso.error.mensaje}`);
        const usados = new Map<string, number>();
        for (const regla of permiso.valor.cadena) {
          const d = regla.declaracion;
          if (!d) { expect(regla.origen.tipo).not.toBe("declarado"); continue; }
          if (d.origen.tipo !== "declarado") { expect(d.localizacion).toBeUndefined(); continue; }
          const candidatos = permisos.filter(c => {
            const segmentos = c.ruta.slice(c.ruta[0] === "permission" ? 1 : 3);
            const patron = segmentos[1] ?? "*";
            const expandido = patron.startsWith("~/") ? `${e.env.HOME!.replaceAll("\\", "/")}/${patron.slice(2)}` : patron;
            return c.ref === d.referencia && (segmentos[0] ?? "*") === regla.sujeto && expandido === regla.patron;
          }).sort((a, b) => Number(a.ruta[0] === "agent") - Number(b.ruta[0] === "agent") || a.indice - b.indice);
          const id = JSON.stringify([d.referencia, regla.sujeto, regla.patron]);
          const ocurrencia = usados.get(id) ?? 0;
          const original = candidatos[ocurrencia];
          expect(original, `${nombre} ${id} ocurrencia ${ocurrencia}`).toBeDefined();
          comprobarUbicacion(d, original!.ref, original!, fuentes.textos.get(original!.ref)!);
          usados.set(id, ocurrencia + 1);
          declaradas++;
        }
      }
    }
    const agentes = consultarAgentes(deps, e.proyecto);
    expect(agentes.exito).toBe(true);
    if (!agentes.exito) throw new Error(agentes.error.mensaje);
    expect(agentes.valor.eliminados.map(a => a.nombre).sort()).toEqual([...deshabilitados].sort());
    for (const eliminado of agentes.valor.eliminados) {
      comprobarRastro([eliminado.declaracion], ["agent", eliminado.nombre, "disable"], fuentes);
      declaradas++;
    }

    const hallazgos = consultarHallazgos(deps, e.proyecto);
    expect(hallazgos.exito).toBe(true);
    if (!hallazgos.exito) throw new Error(hallazgos.error.mensaje);
    const defectos = inventario.filter(d => d.escenario === nombre);
    expect(hallazgos.valor.hallazgos).toHaveLength(defectos.length);
    for (const defecto of defectos) {
      const ref = "variable" in defecto.localizacion ? defecto.localizacion.variable
        : join(e.raiz, defecto.localizacion.archivo).replaceAll("\\", "/");
      const ruta = defecto.clave?.map(s => s.replaceAll("<RAIZ>", e.raiz.replaceAll("\\", "/"))) ?? null;
      const coincidentes = hallazgos.valor.hallazgos.filter(h => h.tipo === defecto.tipo && h.causa === defecto.causa
        && h.entrada.referencia === ref && JSON.stringify(h.clave) === JSON.stringify(ruta));
      expect(coincidentes).toHaveLength(1);
      const h = coincidentes[0]!;
      const texto = fuentes.textos.get(ref)!;
      let indice: number;
      if (defecto.causa === "permiso-invalido") {
        // JSON estricto rechaza el cierre que sigue a la coma final de este documento.
        expect(h.entrada.referencia).toBe("OPENCODE_PERMISSION");
        const cierreInvalido = /,\s*}/.exec(texto);
        expect(cierreInvalido).not.toBeNull();
        indice = cierreInvalido!.index + cierreInvalido![0].indexOf("}");
      } else {
        const originales = fuentes.claves.get(ref)!.filter(c => JSON.stringify(c.ruta) === JSON.stringify(ruta));
        expect(originales).toHaveLength(1);
        const original = originales[0]!;
        indice = original.indice;
        if (defecto.causa === "variable-sin-valor") {
          // El token de este defecto figura en el original de general.description.
          const token = "{env:RIGE_PRUEBA_SIN_DEFINIR}";
          expect(e.env.RIGE_PRUEBA_SIN_DEFINIR).toBeUndefined();
          const valor = texto.slice(original.inicioValor, original.finValor);
          expect(valor.split(token)).toHaveLength(2);
          indice = original.inicioValor + valor.indexOf(token);
        }
      }
      const posicion = coordenadasOriginales(texto, indice);
      expect(h.posicion).toEqual(posicion);
      expect(h.localizacion).toBe(`${h.entrada.referencia}:${posicion.linea}:${posicion.columna}`);
    }
    // Estos dos escenarios solo prueban Git invalido y contienen un proyecto vacio.
    if (["v2-worktree-dir-invalido-anidado", "v2-worktree-gitfile-roto"].includes(nombre)) expect(declaradas).toBe(0);
    else expect(declaradas).toBeGreaterThan(0);
  });
});
describe("RF-12 CA-2 T3-07 R-6", () => {
  test("la misma declaracion tiene la misma localizacion en la CLI y en la web, y las paginas no arman .posicion.linea por su cuenta", async () => {
    const dirPaginas = join(import.meta.dir, "../../paquetes/rige/interfaces/web/paginas");
    for (const archivo of readdirSync(dirPaginas).filter(f => f.endsWith(".ts") && !f.endsWith(".test.ts"))) {
      const codigo = readFileSync(join(dirPaginas, archivo), "utf8");
      expect(codigo).not.toContain(".posicion.linea");
    }

    const decision = preparar("v2-decision");
    writeFileSync(join(decision.proyecto, "opencode.json"), '{\n  "agent": {\n    "build": {\n      "temperature": 0.2\n    }\n  }\n}');
    expect(lanzar(decision.raiz, ["esquema"], decision.env).codigo).toBe(0);

    const cliValores = lanzar(decision.raiz, ["valores", "--proyecto", decision.proyecto, "--agente", "build"], decision.env);
    expect(cliValores.codigo).toBe(0);
    const rCliValores = JSON.parse(cliValores.salida);

    const cliPermiso = lanzar(decision.raiz, ["permiso", "--proyecto", decision.proyecto, "--agente", "build", "--sujeto", "read", "--objetivo", ".env", "--explicar"], decision.env);
    expect(cliPermiso.codigo).toBe(0);
    const rCliPermiso = JSON.parse(cliPermiso.salida);

    const servidorDecision = await lanzarServidor(decision.raiz, decision.env);
    try {
      const alta = await solicitarLocal({
        host: "127.0.0.1",
        puerto: servidorDecision.puerto,
        ruta: `/resolver?proyecto=${encodeURIComponent(decision.proyecto)}&agente=build`,
      });
      expect(alta.estado).toBe(303);
      const id = /\/resoluciones\/(\d+)/.exec(String(alta.cabeceras.location))![1]!;

      const pagValores = await solicitarLocal({ host: "127.0.0.1", puerto: servidorDecision.puerto, ruta: `/resoluciones/${id}?agente=build` });
      expect(pagValores.estado).toBe(200);
      const rWebValores = datosWeb(pagValores.cuerpo);
      expect(rWebValores).toEqual(rCliValores);
      const tempDet = rCliValores.valores.find((v: { clave: string }) => v.clave === "temperature").rastro.determinante;
      expect(typeof tempDet.localizacion).toBe("string");
      expect(pagValores.cuerpo).toContain(tempDet.localizacion);

      const pagPermiso = await solicitarLocal({ host: "127.0.0.1", puerto: servidorDecision.puerto, ruta: `/permiso?id=${id}&agente=build&sujeto=read&objetivo=.env` });
      expect(pagPermiso.estado).toBe(200);
      const rWebPermiso = datosWeb(pagPermiso.cuerpo);
      expect(rWebPermiso).toEqual(rCliPermiso);
      const reglaDecl = rCliPermiso.cadena.find((r: { origen: { tipo: string } }) => r.origen.tipo === "declarado");
      expect(typeof reglaDecl.declaracion.localizacion).toBe("string");
      expect(pagPermiso.cuerpo).toContain(reglaDecl.declaracion.localizacion);
    } finally {
      await servidorDecision.detener();
    }

    const sinEfecto = preparar("v3-sin-efecto");
    expect(lanzar(sinEfecto.raiz, ["esquema"], sinEfecto.env).codigo).toBe(0);
    const cliHall = lanzar(sinEfecto.raiz, ["hallazgos", "--proyecto", sinEfecto.proyecto, "--explicar"], sinEfecto.env);
    expect(cliHall.codigo).toBe(0);
    const rCliHall = JSON.parse(cliHall.salida);
    expect(rCliHall.hallazgos.length).toBeGreaterThan(0);

    const servidorHall = await lanzarServidor(sinEfecto.raiz, sinEfecto.env);
    try {
      const pagHall = await solicitarLocal({
        host: "127.0.0.1",
        puerto: servidorHall.puerto,
        ruta: `/hallazgos?proyecto=${encodeURIComponent(sinEfecto.proyecto)}`,
      });
      expect(pagHall.estado).toBe(200);
      const rWebHall = datosWeb(pagHall.cuerpo);
      expect(rWebHall).toEqual(rCliHall);
      for (const h of rCliHall.hallazgos) {
        expect(typeof h.localizacion).toBe("string");
        expect(pagHall.cuerpo).toContain(h.localizacion);
      }
    } finally {
      await servidorHall.detener();
    }
  }, 30000);
});

function quitarLocalizacionDeclaraciones(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(quitarLocalizacionDeclaraciones);
  if (valor !== null && typeof valor === "object") {
    const obj = valor as Record<string, unknown>;
    const esDeclaracion = "origen" in obj && "via" in obj && "referencia" in obj && "regla" in obj;
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([k]) => !(esDeclaracion && k === "localizacion"))
        .map(([k, v]) => [k, quitarLocalizacionDeclaraciones(v)]),
    );
  }
  return valor;
}

describe("T3-07 R-7", () => {
  test("V-1 esquema aditivo en valores, permiso, agentes, entradas y hallazgos; rechazo de esquema 1; localizacion calculada sobre resolucion-t3-03.json", async () => {
    const esquemas: Record<string, unknown> = {};
    for (const nombre of ["valores", "permiso", "agentes", "entradas", "hallazgos"]) {
      const ruta = join(import.meta.dir, `../../esquemas/salida/${nombre}.json`);
      expect(existsSync(ruta)).toBe(true);
      esquemas[nombre] = await Bun.file(ruta).json();
    }

    const e = preparar("v2-agentes");
    const deps = e.dependencias();
    const rVal = consultarValores(deps, e.proyecto, "build", undefined);
    const rPerm = consultarPermiso(deps, { proyecto: e.proyecto, agente: "build", sujeto: "read", objetivo: "a", explicar: true });
    const rAg = consultarAgentes(deps, e.proyecto);
    const rEnt = consultarEntradas(deps, e.proyecto);
    const rHallCon = consultarHallazgos(deps, e.proyecto, { explicar: true });
    const rHallSin = consultarHallazgos(deps, e.proyecto, { explicar: false });

    for (const [nombre, res] of [
      ["valores", rVal],
      ["permiso", rPerm],
      ["agentes", rAg],
      ["entradas", rEnt],
      ["hallazgos", rHallCon],
      ["hallazgos", rHallSin],
    ] as const) {
      expect(res.exito).toBe(true);
      if (!res.exito) throw new Error(res.error.mensaje);
      expect(validarEsquema(esquemas[nombre], res.valor)).toEqual([]);
      if (nombre === "valores" || nombre === "permiso" || nombre === "agentes") {
        const sinLoc = quitarLocalizacionDeclaraciones(res.valor);
        expect(validarEsquema(esquemas[nombre], sinLoc)).toEqual([]);
      }
      expect(validarEsquema(esquemas[nombre], { ...res.valor, esquema: 1 }).length).toBeGreaterThan(0);
    }

    if (!rHallSin.exito) throw new Error(rHallSin.error.mensaje);
    for (const h of rHallSin.valor.hallazgos) {
      expect("explicacion" in h).toBe(false);
      expect(typeof h.localizacion).toBe("string");
    }

    const guardada = JSON.parse(readFileSync(join(import.meta.dir, "../datos/resolucion-t3-03.json"), "utf8")) as Resolucion;
    const entornoGuardada = crearEntornoMemoria({
      archivos: {},
      directorios: ["/p", "/h", "/h/.config", "/h/.config/opencode"],
      variables: { HOME: "/h" },
    });
    const depsGuardada = { adaptador: adaptadorOpenCode, entorno: entornoGuardada, rutas: { canonica: () => "/p" }, resolucion: guardada };

    const valGuardada = respuestaValores(guardada, "build", undefined);
    expect(valGuardada.exito).toBe(true);
    if (!valGuardada.exito) throw new Error(valGuardada.error.mensaje);
    const descRastro = valGuardada.valor.valores.find(v => v.clave === "description")!.rastro;
    expect((descRastro.determinante as DeclaracionUbicada).localizacion).toBe("/p/opencode.json:1:20");
    expect((descRastro.desplazadas[0] as DeclaracionUbicada).localizacion).toBeUndefined();

    const guardadaConPermiso: Resolucion = {
      ...guardada,
      valores: [
        ...guardada.valores,
        {
          ruta: ["agent", "build", "permission", "bash", "git status"],
          valor: "allow",
          determinante: {
            origen: { tipo: "declarado", orden: 1, posicion: { linea: 1, columna: 35 } },
            via: "proyecto",
            referencia: "/p/opencode.json",
            valor: "allow",
            regla: "orden-de-aplicacion",
          },
          motivo: "entrada-posterior",
          desplazadas: [],
          indiceFusion: guardada.valores.length,
        },
      ],
    };
    const permGuardada = consultarPermiso({ ...depsGuardada, resolucion: guardadaConPermiso }, { proyecto: "/p", agente: "build", sujeto: "bash", objetivo: "git status", explicar: true });
    expect(permGuardada.exito).toBe(true);
    if (!permGuardada.exito) throw new Error(permGuardada.error.mensaje);
    const declaradasPerm = permGuardada.valor.cadena.filter(r => r.origen.tipo === "declarado");
    expect(declaradasPerm.length).toBeGreaterThan(0);
    for (const r of declaradasPerm) {
      if (r.origen.tipo !== "declarado") continue;
      expect((r.declaracion as DeclaracionUbicada | null)?.localizacion).toBe(`${r.declaracion?.referencia}:${r.origen.posicion.linea}:${r.origen.posicion.columna}`);
    }

    const guardadaConEliminado: Resolucion = {
      ...guardada,
      eliminadas: [{
        ruta: ["agent", "explore"],
        valor: { disable: true },
        determinante: descRastro.determinante,
        motivo: "entrada-posterior",
        desplazadas: [],
        ordenEliminacion: 0,
        eliminacion: {
          origen: { tipo: "declarado", orden: 1, posicion: { linea: 1, columna: 45 } },
          via: "proyecto",
          referencia: "/p/opencode.json",
          valor: true,
          regla: "agente-deshabilitado",
        },
      }],
    };
    const agGuardada = consultarAgentes({ ...depsGuardada, resolucion: guardadaConEliminado }, "/p");
    expect(agGuardada.exito).toBe(true);
    if (!agGuardada.exito) throw new Error(agGuardada.error.mensaje);
    expect(agGuardada.valor.eliminados).toHaveLength(1);
    expect((agGuardada.valor.eliminados[0]!.declaracion as DeclaracionUbicada).localizacion).toBe("/p/opencode.json:1:45");
  });
});

describe("T3-07 R-8", () => {
  test("la explicacion de permisos incluye ruta:linea:columna en el origen declarado", () => {
    const e = preparar("v2-decision");
    const r = consultarPermiso(e.dependencias(), { proyecto: e.proyecto, agente: "build", sujeto: "read", objetivo: ".env", explicar: true });
    expect(r.exito).toBe(true);
    if (!r.exito) throw new Error(r.error.mensaje);
    const det = r.valor.cadena.find(regla => regla.indice === r.valor.determinante)!;
    expect(det.origen.tipo).toBe("declarado");
    if (det.origen.tipo !== "declarado") throw new Error("Se esperaba origen declarado");
    const locEsperada = `${det.declaracion!.referencia}:${det.origen.posicion.linea}:${det.origen.posicion.columna}`;
    expect(r.valor.explicacion?.join(" ")).toContain(`declarada en ${locEsperada}`);
  });
});
