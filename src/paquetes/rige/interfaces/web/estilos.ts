// Recurso local estático. Sin fuentes, imágenes ni solicitudes a otros orígenes.
export const estilos = `
:root {
  color-scheme: light dark;
  --fondo: #f5f6fb; --superficie: #ffffff; --superficie-suave: #eef0f8;
  --texto: #202638; --secundario: #566078; --borde: #dce0ed;
  --acento: #4946c6; --acento-fuerte: #36339f; --acento-suave: #eeedff;
  --exito: #17613c; --exito-fondo: #e5f5eb; --peligro: #a12638; --peligro-fondo: #fcebee;
  --aviso: #805009; --aviso-fondo: #fff3d8; --neutro: #505a70; --neutro-fondo: #edf0f5;
  --sombra: 0 4px 24px #20264708, 0 1px 3px #20264705;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 16px; line-height: 1.6; color: var(--texto); background: var(--fondo);
}
@media (prefers-color-scheme: dark) {
  :root {
    --fondo: #10131e; --superficie: #1a1f2e; --superficie-suave: #21283a;
    --texto: #edf0fa; --secundario: #b1bbd1; --borde: #353e55;
    --acento: #b0aaff; --acento-fuerte: #c6c2ff; --acento-suave: #2c2950;
    --exito: #8ee0b0; --exito-fondo: #18382c; --peligro: #ffabb5; --peligro-fondo: #442430;
    --aviso: #f2cd83; --aviso-fondo: #3c301f; --neutro: #c0c9db; --neutro-fondo: #2a3142;
    --sombra: 0 4px 24px #00000020, 0 1px 3px #00000018;
  }
}
* { box-sizing: border-box; }
html, body { width: 100%; max-width: 100%; min-width: 0; overflow-x: clip; }
body { margin: 0; overflow-wrap: anywhere; background: radial-gradient(ellipse at 90% 8%, var(--acento-suave), transparent 40%); }
/* Los elementos flex/grid pueden contraerse por debajo del ancho de su contenido. */
main, .cabecera__interior, .pie, .rejilla, .grupo-campos, .resumen, .estadisticas,
.selector-agente, .acciones, nav, .consultas-rapidas, .historia li { min-width: 0; }
:where(main, .cabecera__interior, .pie, .rejilla, .grupo-campos, .resumen, .estadisticas,
  .selector-agente, .acciones, nav, .consultas-rapidas, .consulta-rapida, .historia li) > * { min-width: 0; max-width: 100%; }
a { color: var(--acento); text-underline-offset: .22em; }
a:hover { color: var(--acento-fuerte); }
:focus-visible { outline: 3px solid var(--acento); outline-offset: 4px; }
::selection { background: var(--acento-suave); color: var(--texto); }
h1, h2, h3, p { margin-top: 0; }
h1 { font-size: clamp(2rem, 4.5vw, 3.5rem); letter-spacing: -.045em; line-height: 1.12; margin-bottom: 1.25rem; text-wrap: balance; }
h2 { font-size: clamp(1.15rem, 2.5vw, 1.3rem); line-height: 1.3; letter-spacing: -.025em; margin-bottom: 1.25rem; }
h3 { font-size: clamp(1rem, 2vw, 1.05rem); }
p { margin-bottom: 1rem; }
small, .ayuda, .atenuado { color: var(--secundario); }
code, .monoespaciado, input { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
code { font-size: .87em; overflow-wrap: anywhere; }
.saltar { position: fixed; left: 1rem; top: -6rem; z-index: 10; padding: .7rem 1rem; background: var(--superficie); border-radius: .5rem; }
.saltar:focus { top: 1rem; }
.cabecera { background: var(--superficie); border-bottom: 1px solid var(--borde); }
.cabecera__interior { max-width: 1280px; padding: 1.15rem 2rem; margin: auto; display: flex; align-items: center; gap: 1.75rem; flex-wrap: wrap; }
.marca { display: inline-flex; align-items: center; gap: .65rem; color: var(--texto); font-weight: 800; letter-spacing: .03em; text-decoration: none; }
.marca__simbolo { display: grid; place-items: center; flex-shrink: 0; width: 2.4rem; height: 2.4rem; border-radius: .75rem; background: var(--acento); color: var(--superficie); font-size: 1.55rem; letter-spacing: -.1em; padding-right: .15em; }
.version { font-size: .7rem; font-weight: 600; color: var(--secundario); letter-spacing: 0; }
.subtitulo { font-size: .78rem; color: var(--secundario); margin: 0; flex: 1; }
nav { display: flex; gap: .35rem; flex-wrap: wrap; }
nav a { font-size: .85rem; font-weight: 650; padding: .5rem .8rem; border-radius: .5rem; text-decoration: none; color: var(--secundario); }
nav a:hover, nav a[aria-current="page"] { background: var(--acento-suave); color: var(--acento); }
main { max-width: 1280px; margin: auto; padding: 3rem 2rem 4rem; min-height: 70vh; }
.ceja { color: var(--acento); font-size: .72rem; text-transform: uppercase; font-weight: 750; letter-spacing: .16em; margin-bottom: 1rem; }
.hero { padding: 1.5rem 0 2rem; max-width: 780px; }
.hero .ceja::before { content: ""; display: inline-block; width: .5rem; height: .5rem; margin-right: .7rem; border-radius: 50%; background: var(--acento); box-shadow: 0 0 0 4px var(--acento-suave); }
.hero h1 { max-width: 700px; }
.hero > p:last-child { font-size: 1.1rem; color: var(--secundario); max-width: 600px; }
.rejilla { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 1.5rem; align-items: start; }
.rejilla > .tarjeta { margin-top: 0; }
.tarjeta { background: var(--superficie); border: 1px solid var(--borde); border-radius: 1rem; padding: 1.75rem; box-shadow: var(--sombra); min-width: 0; }
.tarjeta--principal { border-top: 3px solid var(--acento); }
.paso { display: inline-grid; place-items: center; width: 1.8rem; height: 1.8rem; border-radius: .5rem; font-size: .75rem; background: var(--acento-suave); color: var(--acento); margin-right: .5rem; vertical-align: middle; }
.grupo-campos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
form { margin: 0; }
label { display: flex; flex-direction: column; gap: .45rem; font-size: .85rem; font-weight: 650; margin-bottom: 1.1rem; min-width: 0; }
input { width: 100%; min-width: 0; padding: .8rem .9rem; font-size: .9rem; line-height: 1.4; border: 1px solid var(--borde); border-radius: .55rem; color: var(--texto); background: var(--fondo); transition: border-color .15s; }
input:hover { border-color: var(--secundario); }
select { width: 100%; min-width: 0; max-width: 100%; padding: .8rem .9rem; font: inherit; border: 1px solid var(--borde); border-radius: .55rem; color: var(--texto); background: var(--fondo); }
.selector-agente { display: flex; align-items: center; gap: 1rem; margin: 2rem 0; padding: 1rem 1.25rem; background: var(--superficie); border: 1px solid var(--borde); border-radius: .75rem; }
.selector-agente label { display: block; margin: 0; }
.selector-agente select { flex: 1; width: auto; max-width: 18rem; }
input::placeholder { color: var(--secundario); opacity: 1; }
input[type="hidden"] { display: none; }
.ayuda { font-size: .8rem; margin-top: -.5rem; }
.acciones { display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; }
button, .boton { display: inline-flex; align-items: center; justify-content: center; min-width: 0; max-width: 100%; white-space: normal; padding: .8rem 1.2rem; min-height: 44px; font: 650 .85rem/1.4 system-ui, sans-serif; color: var(--superficie); background: var(--acento); border: 1px solid transparent; border-radius: .55rem; cursor: pointer; text-decoration: none; transition: background .15s, transform .15s; }
button:hover, .boton:hover { background: var(--acento-fuerte); color: var(--superficie); transform: translateY(-1px); }
.boton--secundario { background: var(--superficie); color: var(--acento); border-color: var(--borde); }
.boton--secundario:hover { color: var(--acento-fuerte); background: var(--acento-suave); }
.cabecera-pagina { margin-bottom: 2rem; }
.cabecera-pagina h1 { font-size: clamp(2rem, 4vw, 2.7rem); }
.cabecera-pagina p { color: var(--secundario); overflow-wrap: anywhere; }
section + section, .bloque { margin-top: 2rem; }
.resumen { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.25rem; margin: 1.5rem 0 0; }
dt { font-size: .72rem; font-weight: 650; color: var(--secundario); text-transform: uppercase; letter-spacing: .06em; }
dd { margin: .25rem 0 1.25rem; overflow-wrap: anywhere; }
.resumen div { min-width: 0; }
.insignia { display: inline-block; border-radius: .4rem; padding: .2rem .55rem; font-size: .73rem; font-weight: 650; line-height: 1.6; background: var(--neutro-fondo); color: var(--neutro); overflow-wrap: anywhere; }
.insignia--permitida { background: var(--exito-fondo); color: var(--exito); }
.insignia--no-observada { background: var(--neutro-fondo); color: var(--neutro); border: 1px dotted var(--neutro); }
.mapa-vias details, .mapa-vias code { max-width: 100%; overflow-wrap: anywhere; }
.mapa-vias details { margin: 0; padding: .6rem; }
.insignia--denegada, .insignia--entrada-ilegible, .insignia--referencia-no-resuelta { background: var(--peligro-fondo); color: var(--peligro); }
.insignia--pregunta, .insignia--aviso, .insignia--regla-sin-efecto, .insignia--sustitucion-sin-valor { background: var(--aviso-fondo); color: var(--aviso); }
.insignia--neutra, .insignia--entrada-descartada, .insignia--elemento-sin-uso { background: var(--neutro-fondo); color: var(--neutro); }
.insignia--implicita { display: block; width: fit-content; color: var(--secundario); font-size: .65rem; font-weight: 500; margin-top: .4rem; }
.decision-principal .insignia { font-size: clamp(1.4rem, 3vw, 2rem); padding: .4rem 1rem; border-radius: .7rem; margin-bottom: 1rem; }
.aviso { padding: 1rem 1.2rem; border-radius: .6rem; border: 1px solid var(--borde); border-left: 3px solid var(--acento); font-size: .88rem; overflow-wrap: anywhere; background: var(--acento-suave); }
.aviso p:last-child { margin-bottom: 0; }
.aviso + .aviso { margin-top: .75rem; }
.aviso--advertencia { border-left-color: var(--aviso); background: var(--aviso-fondo); color: var(--aviso); }
.ficha-codigo { display: inline-block; padding: .35rem .55rem; border: 1px solid var(--borde); background: var(--superficie-suave); border-radius: .4rem; }
.consultas-rapidas { display: flex; flex-wrap: wrap; gap: .6rem; list-style: none; padding: 0; margin: 0; }
.consultas-rapidas li { margin: 0; max-width: 100%; }
.consulta-rapida { display: inline-flex; align-items: center; gap: .6rem; border: 1px solid var(--borde); border-radius: .55rem; padding: .6rem .75rem; max-width: 100%; background: var(--superficie); text-decoration: none; transition: background .15s, border-color .15s; }
.consulta-rapida:hover { background: var(--acento-suave); border-color: var(--acento); }
.ruta { display: inline-flex; flex-direction: column; vertical-align: top; min-width: 0; max-width: 100%; padding: .35rem .55rem; border: 1px solid var(--borde); background: var(--superficie-suave); border-radius: .4rem; overflow-wrap: anywhere; word-break: normal; hyphens: none; line-height: 1.6; }
.ruta__directorio { display: block; color: var(--secundario); font-size: .72rem; white-space: normal; }
.ruta__segmento, .ruta__archivo { min-width: 0; white-space: normal; overflow-wrap: anywhere; }
.ruta__archivo { order: -1; color: var(--texto); font-weight: 650; }
.motivo-origen { display: block; margin-top: .4rem; color: var(--secundario); }
.valor-desplazado { display: block; font-family: ui-monospace, monospace; margin-bottom: .25rem; }
.leyenda-reglas { margin-top: 1.5rem; padding: 1.25rem; background: var(--superficie); border: 1px solid var(--borde); border-radius: .75rem; font-size: .85rem; }
.leyenda-reglas dl { margin: 0; }
.leyenda-reglas dt { text-transform: none; letter-spacing: 0; }
.leyenda-reglas dd:last-child { margin-bottom: 0; }
.regla-detalle { margin: 0; padding: .75rem; min-width: 150px; }
.regla-detalle p { margin: .75rem 0 0; }
.tabla-contenedor { width: 100%; min-width: 0; max-width: 100%; overflow-x: auto; border: 1px solid var(--borde); border-radius: .75rem; background: var(--superficie); }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: .83rem; }
th { background: var(--superficie-suave); color: var(--secundario); font-size: .7rem; text-transform: uppercase; letter-spacing: .055em; white-space: nowrap; position: sticky; top: 0; }
td, th { padding: 1rem; vertical-align: top; border-bottom: 1px solid var(--borde); }
td { min-width: 100px; max-width: 380px; overflow-wrap: anywhere; }
tbody tr:nth-child(even) { background: var(--fondo); }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: var(--acento-suave); }
.fila--determinante { background: var(--acento-suave); box-shadow: inset 3px 0 var(--acento); }
tbody tr:target { background: var(--acento-suave); outline: 2px solid var(--acento); outline-offset: -2px; scroll-margin-top: 3rem; }
#valores td:nth-child(1), #valores td:nth-child(2) { font-family: ui-monospace, monospace; }
#valores td:nth-child(1) { white-space: nowrap; min-width: 11rem; overflow-wrap: normal; }
#valores td:nth-child(2) { color: var(--acento); font-size: 1rem; font-weight: 700; }
#valores td:nth-child(4) { color: var(--secundario); font-size: .78rem; }
ol, ul { padding-left: 1.25rem; }
li + li { margin-top: .5rem; }
td ol { margin: 0; min-width: 190px; }
.estadisticas { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 145px), 1fr)); gap: .75rem; margin: 1rem 0 2rem; }
.estadistica { background: var(--superficie); border: 1px solid var(--borde); border-radius: .75rem; padding: 1rem; min-width: 0; }
.estadistica strong { display: block; font-size: 2rem; line-height: 1.2; font-variant-numeric: tabular-nums; color: var(--acento); margin-bottom: .5rem; }
.estadistica span { font-size: .72rem; color: var(--secundario); overflow-wrap: anywhere; }
.estadistica .estadistica__nombre { display: block; min-height: 2.8em; font-size: .8rem; font-weight: 650; color: var(--texto); margin-bottom: .65rem; }
.estadistica small { display: block; font: .65rem/1.6 ui-monospace, monospace; overflow-wrap: anywhere; }
.estadistica--aviso { border-color: var(--aviso); background: var(--aviso-fondo); }
.estadistica--aviso strong { color: var(--aviso); }
.estadistica--cero { background: var(--fondo); border-style: dashed; }
.estadistica--cero strong { color: var(--secundario); }
.estadistica--cero .estadistica__nombre { color: var(--secundario); font-weight: 500; }
.estadisticas--elementos { grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 600px; }
.estadistica--mini { padding: .75rem 1rem; background: var(--superficie-suave); }
.estadistica--mini strong { font-size: 1.35rem; margin-bottom: .15rem; }
.estado-vacio { text-align: center; padding: 2.5rem 1.5rem; background: var(--superficie); border: 1px dashed var(--borde); border-radius: .8rem; color: var(--secundario); }
details { margin-top: 1rem; padding: 1.25rem; background: var(--superficie); border: 1px solid var(--borde); border-radius: .75rem; }
details + section { margin-top: 2rem; }
summary { cursor: pointer; font-size: .9rem; font-weight: 650; }
details[open] > summary { margin-bottom: 1.25rem; }
.historia { list-style: none; padding: 0; }
.historia li { display: flex; align-items: baseline; gap: .75rem; flex-wrap: wrap; padding: .85rem 1rem; border-bottom: 1px solid var(--borde); font-size: .85rem; }
.historia li:has([aria-current="page"]) { background: var(--acento-suave); border-radius: .5rem; }
.historia time { color: var(--secundario); font-size: .8rem; }
.pie { max-width: 1216px; margin: auto; padding: 1.5rem 0 2rem; border-top: 1px solid var(--borde); display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; font-size: .72rem; color: var(--secundario); }
.pie p { margin: 0; }
.punto { display: inline-block; width: .45rem; height: .45rem; border-radius: 50%; background: var(--exito); margin-right: .5rem; }
.pie__almacen { text-align: right; max-width: 65%; overflow-wrap: anywhere; }
.pagina-error { max-width: 700px; margin: 2rem auto; padding: clamp(1.5rem, 5vw, 3rem); }
.pagina-error h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); }
@media (max-width: 760px) {
  .selector-agente, .acciones { flex-direction: column; align-items: stretch; }
  form, button, .boton { width: 100%; }
  .selector-agente select { width: 100%; max-width: 100%; flex: auto; }
  main { padding: 2rem 1rem 3rem; }
  .cabecera__interior { padding: 1rem; gap: .75rem; flex-direction: column; align-items: stretch; }
  .marca { align-self: flex-start; }
  .subtitulo { flex: auto; font-size: .7rem; }
  nav { width: 100%; max-width: 100%; flex-wrap: nowrap; overflow-x: auto; padding: .25rem; }
  nav a { padding: .5rem .65rem; flex-shrink: 0; }
  .rejilla, .resumen, .grupo-campos { grid-template-columns: minmax(0, 1fr); }
  .grupo-campos { gap: 0; }
  .tarjeta { padding: 1.25rem; }
  .pie { margin: 0 1rem; }
  .pie__almacen { text-align: left; max-width: 100%; }
}
.pestanas { display: flex; flex-wrap: nowrap; gap: .5rem; width: 100%; min-width: 0; max-width: 100%; overflow-x: auto; padding: .5rem 0; margin-bottom: 1rem; }
.pestanas a { flex-shrink: 0; }
.filtros { margin: 2rem 0; }
#comando-cli { min-width: 0; max-width: 100%; }
#comando-cli pre { max-width: 100%; overflow-x: auto; padding: 1rem; background: var(--fondo); }
#comando-cli code { white-space: pre; overflow-wrap: normal; }
@media (max-width: 640px) {
  .tabla-tarjetas, .tabla-tarjetas tbody, .tabla-tarjetas tr, .tabla-tarjetas td { display: block; width: 100%; min-width: 0; max-width: 100%; }
  /* Conserva los encabezados para tecnologías de asistencia. */
  .tabla-tarjetas thead { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); }
  .tabla-tarjetas tr { padding: .75rem; border-bottom: 1px solid var(--borde); }
  .tabla-tarjetas td { padding: .5rem; border: 0; }
  .tabla-tarjetas td[data-etiqueta]::before { content: attr(data-etiqueta); display: block; font: 600 .75rem system-ui; color: var(--secundario); margin-bottom: .4rem; }
  #valores .tabla-tarjetas td:nth-child(1) { white-space: normal; min-width: 0; overflow-wrap: anywhere; }
  .tabla-tarjetas td ol, .tabla-tarjetas .regla-detalle { min-width: 0; }
}
@media (max-width: 420px) {
  .hero { padding-top: .5rem; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; } }
`;
