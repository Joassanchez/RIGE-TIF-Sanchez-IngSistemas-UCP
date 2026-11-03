import net from "node:net";
import tls from "node:tls";
import { mock } from "bun:test";

function bloquear(): never { throw new Error("red deshabilitada (RNF-05)"); }

globalThis.fetch = Object.assign(bloquear, { preconnect: bloquear });
globalThis.WebSocket = bloquear as unknown as typeof WebSocket;
net.connect = bloquear;
net.createConnection = bloquear;
tls.connect = bloquear;
// Bun no publica createConnection en tls, pero se bloquea tambien ese alias.
Object.assign(tls, { createConnection: bloquear });
// Bun mantiene los exports nombrados aparte del objeto CommonJS.
mock.module("node:net", () => ({ ...net, default: net, connect: bloquear, createConnection: bloquear }));
mock.module("node:tls", () => ({ ...tls, default: tls, connect: bloquear, createConnection: bloquear }));
