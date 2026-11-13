import { nombreVia } from "./vocabulario";

interface RutaDescompuesta {
  readonly raizComparar: string;
  readonly raizMostrar: string;
  readonly segmentos: readonly string[];
  readonly normalizada: string;
}

function normalizarSeparadores(ruta: string): string {
  return ruta.replace(/\\/g, "/");
}

function descomponerRuta(ruta: string): RutaDescompuesta | null {
  const normal = normalizarSeparadores(ruta);
  let raizComparar: string;
  let raizMostrar: string;
  let cola: string;

  const unidad = normal.match(/^([a-zA-Z]):\/(.*)$/);
  if (unidad) {
    raizComparar = `${unidad[1]!.toLowerCase()}:/`;
    raizMostrar = `${unidad[1]!}:/`;
    cola = unidad[2] ?? "";
  } else {
    const unc = normal.match(/^\/\/([^/]+)\/([^/]+)(?:\/(.*))?$/);
    if (unc) {
      raizComparar = `//${unc[1]!.toLowerCase()}/${unc[2]!.toLowerCase()}/`;
      raizMostrar = `//${unc[1]!}/${unc[2]!}/`;
      cola = unc[3] ?? "";
    } else if (normal.startsWith("/")) {
      raizComparar = "/";
      raizMostrar = "/";
      cola = normal.slice(1);
    } else {
      return null;
    }
  }

  const segmentos: string[] = [];
  for (const seg of cola.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") {
      if (segmentos.length > 0) segmentos.pop();
    } else {
      segmentos.push(seg);
    }
  }

  return {
    raizComparar,
    raizMostrar,
    segmentos,
    normalizada: segmentos.length === 0 ? raizMostrar : `${raizMostrar}${segmentos.join("/")}`,
  };
}

function prefijoComun(a: readonly string[], b: readonly string[]): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/**
 * Formatea una ruta para presentacion visible en CLI y Web,
 * resolviendo respecto al proyecto y al directorio personal cuando corresponde.
 */
export function rutaVisible(
  referencia: string,
  proyecto?: string | null,
  hogar?: string | null,
): string {
  if (!referencia) return "";
  const ref = descomponerRuta(referencia);
  if (!ref) return normalizarSeparadores(referencia);

  const proy = proyecto ? descomponerRuta(proyecto) : null;
  const hog = hogar ? descomponerRuta(hogar) : null;
  const proyMismaRaiz = proy !== null && proy.raizComparar === ref.raizComparar;
  const hogMismaRaiz = hog !== null && hog.raizComparar === ref.raizComparar;

  const comunProy = proyMismaRaiz ? prefijoComun(ref.segmentos, proy.segmentos) : 0;
  const subiendo = proyMismaRaiz ? proy.segmentos.length - comunProy : 0;
  const bajando = proyMismaRaiz ? ref.segmentos.slice(comunProy) : [];

  if (proyMismaRaiz && subiendo === 0) {
    if (bajando.length === 0) return ".";
    if (bajando.length === 1) return `./${bajando[0]!}`;
    return bajando.join("/");
  }

  const comunHog = hogMismaRaiz ? prefijoComun(ref.segmentos, hog.segmentos) : 0;
  const dentroDeHogar = hog !== null && hogMismaRaiz && comunHog === hog.segmentos.length;
  const relativaProyecto =
    proyMismaRaiz &&
    bajando.length >= 1 &&
    (subiendo === 1 || comunProy === ref.segmentos.length - 1);

  if (dentroDeHogar) {
    if (relativaProyecto && comunProy > hog.segmentos.length) {
      return `${"../".repeat(subiendo)}${bajando.join("/")}`;
    }
    if (ref.segmentos.length === hog.segmentos.length) return "~";
    return `~/${ref.segmentos.slice(hog.segmentos.length).join("/")}`;
  }

  if (relativaProyecto && comunProy >= 1) {
    return `${"../".repeat(subiendo)}${bajando.join("/")}`;
  }

  return ref.normalizada;
}

/**
 * Extrae los dos ultimos segmentos de una ruta para distinguir proyectos homonimos.
 */
export function dosSegmentos(ruta: string): string {
  const normal = normalizarSeparadores(ruta);
  const partes = normal.split("/").filter(Boolean);
  if (partes.length === 0) return normal || "/";
  return partes.slice(-2).join("/");
}

function ubicacionRelativaProyecto(referencia: string, proyecto: string): string | null {
  const ref = descomponerRuta(referencia);
  const proy = descomponerRuta(proyecto);
  if (!ref || !proy || ref.raizComparar !== proy.raizComparar) return null;
  const comun = prefijoComun(ref.segmentos, proy.segmentos);
  if (comun === proy.segmentos.length) return "esta carpeta";
  if (comun >= ref.segmentos.length) return null;
  const enRaizAncestro = ref.segmentos.length - 1 === comun;
  const enCarpetaOpenCodeAncestro = ref.segmentos[comun] === ".opencode";
  if (!enRaizAncestro && !enCarpetaOpenCodeAncestro) return null;
  const niveles = proy.segmentos.length - comun;
  return niveles === 1 ? "carpeta superior" : `${niveles} carpetas arriba`;
}

/**
 * Formatea el rotulo visible de la via de una entrada; para la via `proyecto`
 * distingue si el archivo esta en la carpeta analizada o N niveles arriba.
 */
export function rotuloVia(
  via: string,
  referencia?: string | null,
  proyecto?: string | null,
  capitalizada = false,
): string {
  const base = nombreVia(via, capitalizada);
  if (via !== "proyecto" || !referencia || !proyecto) return base;
  const ubicacion = ubicacionRelativaProyecto(referencia, proyecto);
  return ubicacion ? `${base} · ${ubicacion}` : base;
}
