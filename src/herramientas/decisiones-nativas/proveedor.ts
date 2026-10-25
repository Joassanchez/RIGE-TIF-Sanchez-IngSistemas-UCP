/** Proveedor fijo de desarrollo: no consulta modelos ni abre conexiones salientes. */
export function crearProveedor(herramienta: string, argumentos: Record<string, unknown>) {
  let enviada = false;
  async function responder(solicitud: Request): Promise<Response> {
    if (new URL(solicitud.url).pathname !== "/v1/chat/completions" || solicitud.method !== "POST") return new Response("Ruta inexistente", { status: 404 });
    const cuerpo = await solicitud.json() as { messages?: { role: string; content?: unknown }[]; tools?: { function: { name: string } }[] };
    const titulo = cuerpo.messages?.some(m => m.role === "system" && typeof m.content === "string" && /title generator/i.test(m.content));
    const ofrecer = !titulo && !enviada && cuerpo.tools?.some(t => t.function.name === herramienta);
    const delta = ofrecer ? { tool_calls: [{ index: 0, id: "consulta_fija", type: "function", function: { name: herramienta, arguments: JSON.stringify(argumentos) } }] }
      : { content: titulo ? "Consulta de permisos" : "Consulta finalizada" };
    if (ofrecer) enviada = true;
    const fragmento = (delta: unknown, fin: string | null) => `data: ${JSON.stringify({ id: "chatcmpl-fijo", object: "chat.completion.chunk", created: 0, model: "permisos",
      choices: [{ index: 0, delta, finish_reason: fin }] })}\n\n`;
    return new Response(fragmento({ role: "assistant", ...delta }, null) + fragmento({}, ofrecer ? "tool_calls" : "stop") + "data: [DONE]\n\n",
      { headers: { "content-type": "text/event-stream; charset=utf-8" } });
  }
  const servidor = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: responder });
  return { servidor, responder };
}
