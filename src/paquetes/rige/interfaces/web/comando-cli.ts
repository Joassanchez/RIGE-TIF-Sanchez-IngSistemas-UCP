import { html, type HtmlSeguro } from "./plantillas";

// Las opciones son nombres fijos de la CLI; cada valor se cita antes del escape HTML.
export function comandoCli(subcomando: "valores" | "permiso" | "agentes" | "entradas" | "hallazgos",
  opciones: Readonly<Record<string, string | true>>): HtmlSeguro {
  const comando = (citar: (valor: string) => string) => `bun run rige -- ${subcomando}` + Object.entries(opciones).map(([nombre, valor]) => valor === true
    ? ` --${nombre}`
    // parseArgs exige '=' para que un valor con guion inicial no sea otra opcion.
    : ` --${nombre}${valor.startsWith("-") ? "=" : " "}${citar(valor)}`).join("");
  const bash = comando(valor => "'" + valor.replaceAll("'", "'\"'\"'") + "'");
  const powershell = comando(valor => "'" + valor.replaceAll("'", "''") + "'");
  return html`<details id="comando-cli"><summary>Consultar por CLI con las entradas actuales</summary>
<p>No recupera esta foto; coincide si las entradas y el contexto no cambiaron</p>
<h3>Bash</h3><pre><code>${bash}</code></pre>
<h3>PowerShell 7.3+</h3><pre><code>${"& { $PSNativeCommandArgumentPassing = 'Standard'; " + powershell + " }"}</code></pre></details>`;
}
