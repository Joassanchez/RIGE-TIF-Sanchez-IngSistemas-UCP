# Verificación de H-18 · agentes que OpenCode 1.18.25 invoca sin declaración del usuario

| Campo | Valor |
|---|---|
| Fecha | 30/10/2026 |
| Ejecutó | Ingeniero del TIF (Claude Code, Opus 5.5), por delegación del autor |
| Binario | `opencode-ai@1.18.25` (npm), `opencode.exe`, SHA-256 `ef06e41a35795066e95acde276a42fbbf85d7a683c2787f6a19ed20bcde9b6ff`, el verificado en `src/herramientas/decisiones-nativas.ts` |
| Código | Tag `v1.18.25`, tarball verificado (SHA-256 `44e9530d7be172005c7d60aef317440eecb85d557d94cce7fa35c5a7b9d9da0b`) |
| Sostiene | Anexo VI, A.VI.3, resultado 18; trazabilidad H-18 → RF-16 (Anexo III, D-51) |

## 1. Código del tag (pila v1, la que usan `opencode run`, la TUI y la app)

| Agente nativo | Dónde se invoca por nombre | Cuándo |
|---|---|---|
| `title` | `packages/opencode/src/session/prompt.ts:216` (`agents.get("title")`) | En el primer mensaje real de cada sesión, para generar el título |
| `compaction` | `packages/opencode/src/session/compaction.ts:358` (`agents.get("compaction")`) | Cuando la sesión se compacta por desbordar el contexto |
| `summary` | Ninguna invocación por nombre en `packages/opencode/src` ni `packages/core/src` | Definido en `agent/agent.ts` (oculto, primario); no se encontró un llamador |

Los tres llevan `* → deny` en sus permisos (`agent/agent.ts`), así que no pueden ejecutar herramientas: el alcance de sus acciones es generar texto.

## 2. Ejecución

Entorno aislado: `HOME`, `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, `ProgramData` y `XDG_*` en un directorio temporal; `OPENCODE_DISABLE_EXTERNAL_SKILLS=true`; proyecto vacío con `git init`. Proveedor simulado local compatible con OpenAI (sin modelos, sin conexiones salientes), que registra el mensaje de sistema y la cantidad de herramientas de cada solicitud. Comando: `opencode --print-logs run --agent build "Hola"`.

Resultado (código de salida 0):

| Solicitud | Mensaje de sistema (inicio) | Herramientas ofrecidas |
|---|---|---|
| 1 | «You are a title generator. You output ONLY a thread title. Nothing else.» | 0 |
| 2 | «You are opencode, an interactive CLI tool that helps users with software engineering tasks.» | 10 |

Agentes que aparecen en el registro (`agent=`): `title` y `build`.

## 3. Conclusión

Con solo el agente `build` pedido y ninguna declaración, OpenCode 1.18.25 invoca el agente nativo `title` en cada sesión. `compaction` se invoca por código al compactar. `summary` está definido pero no tiene invocación por nombre en esta versión. RF-16 lista los nativos a partir de los objetos de `agent/agent.ts`, copiados literalmente en `src/paquetes/opencode/vendor/agentes-nativos.ts` (T2-05), y los contrasta con `opencode debug agent` en el oráculo de cadenas.

## 4. Guion usado

```ts
// H-18: registra que agentes internos llegan al proveedor simulado en una sesion de `opencode run`.
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const binario = process.argv[2]!;
const cache = process.argv[3]!;
const solicitudes: { sistema: string; herramientas: number }[] = [];
const servidor = Bun.serve({
  hostname: "127.0.0.1", port: 0,
  async fetch(req) {
    const cuerpo = await req.json() as { messages?: { role: string; content?: unknown }[]; tools?: unknown[] };
    const sis = cuerpo.messages?.filter(m => m.role === "system").map(m => typeof m.content === "string" ? m.content : JSON.stringify(m.content)).join(" | ") ?? "";
    solicitudes.push({ sistema: sis.slice(0, 160).replace(/\s+/g, " "), herramientas: cuerpo.tools?.length ?? 0 });
    const f = (d: unknown, fin: string | null) => `data: ${JSON.stringify({ id: "x", object: "chat.completion.chunk", created: 0, model: "m", choices: [{ index: 0, delta: d, finish_reason: fin }] })}\n\n`;
    return new Response(f({ role: "assistant", content: "ok" }, null) + f({}, "stop") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
const hogar = mkdtempSync(join(tmpdir(), "rige-h18-"));
const proyecto = join(hogar, "proyecto");
mkdirSync(proyecto, { recursive: true });
mkdirSync(join(hogar, "tmp"), { recursive: true });
const env: Record<string, string> = { PATH: process.env.PATH!, SystemRoot: process.env.SystemRoot ?? "" };
for (const n of ["HOME", "USERPROFILE", "XDG_DATA_HOME", "XDG_STATE_HOME", "APPDATA", "LOCALAPPDATA", "ProgramData"]) env[n] = hogar;
env.XDG_CONFIG_HOME = join(hogar, ".config");
env.XDG_CACHE_HOME = cache;
for (const n of ["TEMP", "TMP", "TMPDIR"]) env[n] = join(hogar, "tmp");
env.OPENCODE_DISABLE_EXTERNAL_SKILLS = "true";
const config = join(hogar, "proveedor-config.json");
writeFileSync(config, JSON.stringify({ provider: { simulado: { npm: "@ai-sdk/openai-compatible", name: "Simulado", options: { baseURL: `http://127.0.0.1:${servidor.port}/v1` }, models: { m: { name: "m", limit: { context: 32000, output: 2048 } } } } }, model: "simulado/m" }));
env.OPENCODE_CONFIG = config;
Bun.spawnSync(["git", "init", "--quiet"], { cwd: proyecto, env });
const p = Bun.spawn([binario, "--print-logs", "run", "--agent", "build", "Hola"], { cwd: proyecto, env, stdout: "pipe", stderr: "pipe", timeout: 120000 });
const [out, err, estado] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
servidor.stop(true);
const agentes = [...(out + err).matchAll(/agent=(\S+)/g)].map(m => m[1]);
console.log(JSON.stringify({ estado, solicitudes, agentesEnRegistro: [...new Set(agentes)] }, null, 2));
rmSync(hogar, { recursive: true, force: true });
```
