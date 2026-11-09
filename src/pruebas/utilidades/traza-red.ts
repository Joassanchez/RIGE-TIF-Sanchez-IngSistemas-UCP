export type LlamadaRed = "connect" | "sendto" | "sendmsg";
export interface ConteoDestinos {
  externoIPv4: number;
  externoIPv6: number;
  loopbackIPv4: number;
  loopbackIPv6: number;
  unix: number;
  netlink: number;
  otras: number;
  indeterminados: number;
}
export type RecuentoRed = Record<LlamadaRed, ConteoDestinos>;
type Destino = keyof ConteoDestinos;

export function crearRecuentoRed(): RecuentoRed {
  const vacio = (): ConteoDestinos => ({ externoIPv4: 0, externoIPv6: 0, loopbackIPv4: 0,
    loopbackIPv6: 0, unix: 0, netlink: 0, otras: 0, indeterminados: 0 });
  return { connect: vacio(), sendto: vacio(), sendmsg: vacio() };
}

// Separa solo las comas del nivel superior: nunca interpreta el contenido enviado.
function separar(texto: string): string[] | null {
  const partes: string[] = [], pila: string[] = [];
  let inicio = 0, cadena = false;
  const cierres: Record<string, string> = { "(": ")", "[": "]", "{": "}", "<": ">" };
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]!;
    if (cadena) {
      if (c === "\\") i++;
      else if (c === '"') cadena = false;
    } else if (c === '"') cadena = true;
    else if (cierres[c]) pila.push(cierres[c]!);
    else if (c === ">" && texto[i - 1] === "-") continue; // par remoto de -yy
    else if ([")", "]", "}", ">"].includes(c)) {
      if (pila.pop() !== c) return null;
    } else if (c === "," && pila.length === 0) {
      partes.push(texto.slice(inicio, i).trim()); inicio = i + 1;
    }
  }
  if (cadena || pila.length) return null;
  partes.push(texto.slice(inicio).trim());
  return partes;
}

function octetos(ip: string): number[] | null {
  const partes = ip.split(".");
  return partes.length === 4 && partes.every(p => /^\d{1,3}$/.test(p) && Number(p) <= 255)
    ? partes.map(Number) : null;
}

function gruposIPv6(ip: string): number[] | null {
  ip = ip.split("%")[0]!.toLowerCase();
  if (ip.includes(".")) {
    const corte = ip.lastIndexOf(":"), v4 = octetos(ip.slice(corte + 1));
    if (!v4) return null;
    ip = ip.slice(0, corte + 1) + ((v4[0]! << 8) | v4[1]!).toString(16) + ":" + ((v4[2]! << 8) | v4[3]!).toString(16);
  }
  const lados = ip.split("::");
  if (lados.length > 2) return null;
  const izquierda = lados[0] ? lados[0].split(":") : [];
  const derecha = lados[1] ? lados[1].split(":") : [];
  const omitidos = 8 - izquierda.length - derecha.length;
  if (lados.length === 2 ? omitidos < 1 : omitidos !== 0) return null;
  if (![...izquierda, ...derecha].every(g => /^[0-9a-f]{1,4}$/.test(g))) return null;
  return [...izquierda.map(g => parseInt(g, 16)), ...Array<number>(omitidos).fill(0), ...derecha.map(g => parseInt(g, 16))];
}

function direccion(ip: string, familia: "AF_INET" | "AF_INET6"): Destino {
  if (familia === "AF_INET") {
    const v4 = octetos(ip);
    return !v4 ? "indeterminados" : v4[0] === 127 ? "loopbackIPv4" : "externoIPv4";
  }
  const v6 = gruposIPv6(ip);
  if (!v6) return "indeterminados";
  const loopback = v6.slice(0, 7).every(g => g === 0) && v6[7] === 1;
  // Las mapeadas conservan el conteo IPv6; 127/8 tambien se excluye en esta forma.
  const mapeadaLocal = v6.slice(0, 5).every(g => g === 0) && v6[5] === 0xffff && (v6[6]! >> 8) === 127;
  return loopback || mapeadaLocal ? "loopbackIPv6" : "externoIPv6";
}

function sockaddr(texto: string): Destino {
  if (!texto.startsWith("{") || !texto.endsWith("}")) return "indeterminados";
  const campos = separar(texto.slice(1, -1));
  const familia = campos?.find(c => /^sa_family=AF_\w+$/.test(c))?.slice("sa_family=".length);
  if (!campos || !familia) return "indeterminados";
  if (familia === "AF_UNIX") return "unix";
  if (familia === "AF_NETLINK") return "netlink";
  if (familia === "AF_INET") {
    const ip = campos.find(c => c.startsWith("sin_addr="))?.match(/^sin_addr=inet_addr\("([^"]+)"\)$/)?.[1];
    return ip ? direccion(ip, familia) : "indeterminados";
  }
  if (familia === "AF_INET6") {
    const ip = campos.find(c => c.startsWith("inet_pton("))?.match(/^inet_pton\(AF_INET6, "([^"]+)", &sin6_addr\)$/)?.[1];
    return ip ? direccion(ip, familia) : "indeterminados";
  }
  return "otras";
}

function parRemoto(descriptor: string): Destino {
  if (/^\d+<UNIX(?:-[A-Z]+)?:/.test(descriptor)) return "unix";
  if (/^\d+<NETLINK:/.test(descriptor)) return "netlink";
  const anotacion = descriptor.match(/^\d+<(?:TCP|UDP)(?:v6)?:\[(.*)\]>$/)?.[1];
  if (!anotacion?.includes("->")) return "indeterminados";
  const remoto = anotacion.slice(anotacion.lastIndexOf("->") + 2);
  const v6 = remoto.match(/^\[([^\]]+)\]:\d+$/)?.[1];
  if (v6) return direccion(v6, "AF_INET6");
  const v4 = remoto.match(/^([^:]+):\d+$/)?.[1];
  return v4 ? direccion(v4, "AF_INET") : "indeterminados";
}

function destino(llamada: LlamadaRed, linea: string): Destino {
  const cuerpo = linea.match(/^(?:connect|sendto|sendmsg)\((.*)\)\s+=/)?.[1];
  const args = cuerpo === undefined ? null : separar(cuerpo);
  if (!args) return "indeterminados";
  let explicito = args[llamada === "sendto" ? 4 : 1];
  if (llamada === "sendmsg") {
    const mensaje = args[1];
    const campos = mensaje?.startsWith("{") && mensaje.endsWith("}") ? separar(mensaje.slice(1, -1)) : null;
    explicito = campos?.find(c => c.startsWith("msg_name="))?.slice("msg_name=".length);
  }
  if (explicito === undefined) return "indeterminados";
  if (explicito === "NULL" && llamada !== "connect") return parRemoto(args[0] ?? "");
  return sockaddr(explicito);
}

export function contarTrazaRed(texto: string): RecuentoRed {
  const conteo = crearRecuentoRed();
  const pendientes = new Map<string, { llamada: LlamadaRed; fragmento: string }>();
  for (const original of texto.split(/\r?\n/)) {
    const prefijo = original.trim().match(/^(?:\[pid\s+(\d+)\]\s*|(\d+)\s+)?(.*)$/)!;
    const pid = prefijo[1] ?? prefijo[2] ?? "principal";
    const linea = prefijo[3]!;
    const reanudada = linea.match(/^<\.\.\. (connect|sendto|sendmsg) resumed>(.*)$/);
    if (reanudada) {
      const llamada = reanudada[1] as LlamadaRed, pendiente = pendientes.get(pid);
      if (pendiente?.llamada === llamada) {
        conteo[llamada][destino(llamada, pendiente.fragmento + reanudada[2])]++;
        pendientes.delete(pid);
      } else conteo[llamada].indeterminados++;
      continue;
    }
    const llamada = linea.match(/^(connect|sendto|sendmsg)\(/)?.[1] as LlamadaRed | undefined;
    if (!llamada) continue;
    if (linea.endsWith("<unfinished ...>")) {
      const previa = pendientes.get(pid);
      if (previa) conteo[previa.llamada].indeterminados++;
      pendientes.set(pid, { llamada, fragmento: linea.slice(0, -"<unfinished ...>".length) });
    } else conteo[llamada][destino(llamada, linea)]++;
  }
  for (const pendiente of pendientes.values()) conteo[pendiente.llamada].indeterminados++;
  return conteo;
}
