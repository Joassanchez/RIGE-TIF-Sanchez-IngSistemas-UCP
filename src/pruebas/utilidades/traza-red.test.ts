import { describe, expect, test } from "bun:test";
import { contarTrazaRed, type ConteoDestinos, type LlamadaRed } from "./traza-red";

const vacio = (): ConteoDestinos => ({ externoIPv4: 0, externoIPv6: 0, loopbackIPv4: 0, loopbackIPv6: 0,
  unix: 0, netlink: 0, otras: 0, indeterminados: 0 });
const ipv4 = (ip: string) => `{sa_family=AF_INET, sin_port=htons(443), sin_addr=inet_addr("${ip}")}`;
const ipv6 = (ip: string) => `{sa_family=AF_INET6, sin6_port=htons(443), inet_pton(AF_INET6, "${ip}", &sin6_addr)}`;
const llamadas: LlamadaRed[] = ["connect", "sendto", "sendmsg"];
function llamada(tipo: LlamadaRed, destino: string, descriptor = "3"): string {
  const contenido = JSON.stringify('AF_INET, {sa_family=AF_INET6}, msg_name=NULL, "cita"');
  const args = tipo === "connect" ? `${descriptor}, ${destino}, 128`
    : tipo === "sendto" ? `${descriptor}, ${contenido}, 56, 0, ${destino}, 128`
    : `${descriptor}, {msg_name=${destino}, msg_namelen=128, msg_iov=[{iov_base=${contenido}, iov_len=56}], msg_iovlen=1, msg_controllen=0, msg_flags=0}, 0`;
  return `${tipo}(${args}) = -1 ECONNREFUSED (Connection refused)`;
}

describe("T5-05 N-4 clasifica el destino de las tres llamadas, incluidos intentos fallidos", () => {
  const destinos: [string, keyof ConteoDestinos][] = [
    [ipv4("203.0.113.1"), "externoIPv4"], [ipv6("2001:db8::1"), "externoIPv6"],
    [ipv4("127.0.0.1"), "loopbackIPv4"], [ipv4("127.255.1.2"), "loopbackIPv4"],
    [ipv4("128.0.0.1"), "externoIPv4"], [ipv4("0.0.0.0"), "externoIPv4"],
    [ipv6("::1"), "loopbackIPv6"], [ipv6("0:0:0:0:0:0:0:1"), "loopbackIPv6"],
    [ipv6("::ffff:127.3.2.1"), "loopbackIPv6"], [ipv6("0:0:0:0:0:ffff:7fff:102"), "loopbackIPv6"],
    [ipv6("::ffff:203.0.113.1"), "externoIPv6"], [ipv6("::ffff:cb00:7101"), "externoIPv6"],
    [ipv6("::127.0.0.1"), "externoIPv6"],
    ['{sa_family=AF_UNIX, sun_path="/AF_INET/AF_INET6"}', "unix"],
    ['{sa_family=AF_NETLINK, nl_pid=0, nl_groups=0}', "netlink"],
    ['{sa_family=AF_UNSPEC}', "otras"], ["0x1234", "indeterminados"],
  ];
  for (const tipo of llamadas) {
    for (const [destino, categoria] of destinos) {
      test(`${tipo}: ${destino} -> ${categoria}`, () => {
        const esperado = { connect: vacio(), sendto: vacio(), sendmsg: vacio() };
        esperado[tipo][categoria] = 1;
        // El descriptor contradice a veces el sockaddr: manda el destino explicito.
        expect(contarTrazaRed(llamada(tipo, destino, "3<TCP:[127.0.0.1:12->203.0.113.2:443]>"))).toEqual(esperado);
      });
    }
  }

  for (const tipo of ["sendto", "sendmsg"] as const) {
    for (const [descriptor, categoria] of [
      ["3<UDP:[192.0.2.1:123->203.0.113.2:53]>", "externoIPv4"],
      ["3<TCP:[192.0.2.1:123->127.12.3.4:53]>", "loopbackIPv4"],
      ["4<UDPv6:[[::1]:123->[2001:db8::1]:53]>", "externoIPv6"],
      ["4<TCPv6:[[2001:db8::1]:123->[::1]:53]>", "loopbackIPv6"],
      ["4<UDPv6:[[::1]:123->[::ffff:127.0.0.2]:53]>", "loopbackIPv6"],
      ["5<UNIX-STREAM:[123->456]>", "unix"], ["6<NETLINK:[ROUTE:123]>", "netlink"],
      ["3", "indeterminados"], ["3<UDP:[127.0.0.1:123]>", "indeterminados"],
    ] as const) {
      test(`${tipo} NULL: usa el par remoto de -yy ${descriptor}`, () => {
        expect(contarTrazaRed(llamada(tipo, "NULL", descriptor))[tipo]).toEqual({ ...vacio(), [categoria]: 1 });
      });
    }
  }

  test("unfinished/resumed de cada llamada, intercaladas por PID, cuentan una vez", () => {
    const completas = llamadas.map((tipo, i) => `${100 + i} ${llamada(tipo, i === 1 ? ipv6("::1") : ipv4("203.0.113.1"))}`);
    const partidas = completas.map((linea, i) => {
      const corte = linea.indexOf(",") + 1;
      return [linea.slice(0, corte) + " <unfinished ...>", `[pid ${100 + i}] <... ${llamadas[i]} resumed>` + linea.slice(corte)];
    });
    expect(contarTrazaRed([...partidas.map(par => par[0]), ...partidas.map(par => par[1])].join("\n")))
      .toEqual(contarTrazaRed(completas.join("\n")));
    const conteo = contarTrazaRed(completas.join("\n"));
    expect(conteo.connect.externoIPv4).toBe(1);
    expect(conteo.sendto.loopbackIPv6).toBe(1);
    expect(conteo.sendmsg.externoIPv4).toBe(1);
  });

  test("trazas incompletas, reanudaciones huerfanas y direcciones truncadas son indeterminadas", () => {
    const conteo = contarTrazaRed('20 connect(3, <unfinished ...>\n21 <... sendto resumed> NULL, 0) = 1\n22 sendmsg(3, {msg_name=???}, 0) = 1');
    expect(conteo.connect.indeterminados).toBe(1);
    expect(conteo.sendto.indeterminados).toBe(1);
    expect(conteo.sendmsg.indeterminados).toBe(1);
  });

  test("no interpreta texto de payloads o salidas del proceso como una llamada", () => {
    expect(contarTrazaRed('123 +++ exited with 0 +++\n--- SIGCHLD ---\ntexto AF_INET connect(3, NULL)'))
      .toEqual({ connect: vacio(), sendto: vacio(), sendmsg: vacio() });
  });
});
