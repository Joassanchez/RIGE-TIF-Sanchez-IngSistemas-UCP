// Recurso local estático. Sin fuentes, imágenes ni solicitudes a otros orígenes.
export const estilos = `
:root {
  color-scheme: light dark;
  --fondo: #f7f7f8; --superficie: #ffffff; --superficie-suave: #eeeeef;
  --texto: #242425; --secundario: #58585b; --borde: #dcdcdf;
  --borde-control: #858589;
  --acento: #4545a6; --acento-fuerte: #343480; --acento-suave: #eeeeef;
  --exito: #17613c; --exito-fondo: #e5f5eb; --peligro: #a12638; --peligro-fondo: #fcebee;
  --aviso: #805009; --aviso-fondo: #fff3d8; --neutro: #555558; --neutro-fondo: #eeeeef;
  --boton-texto: #ffffff;
  font-family: "Segoe UI", system-ui, -apple-system, Roboto, sans-serif;
  font-size: 16px; line-height: 1.5; color: var(--texto); background: var(--fondo);
}
@media (prefers-color-scheme: dark) {
  :root {
    --fondo: #181819; --superficie: #222223; --superficie-suave: #2c2c2e;
    --texto: #ededee; --secundario: #bbbbbf; --borde: #464649;
    --borde-control: #818185;
    --acento: #b8b8ff; --acento-fuerte: #d0d0ff; --acento-suave: #2c2c2e;
    --exito: #8ee0b0; --exito-fondo: #18382c; --peligro: #ffabb5; --peligro-fondo: #442430;
    --aviso: #f2cd83; --aviso-fondo: #3c301f; --neutro: #c5c5c8; --neutro-fondo: #303032;
    --boton-texto: #181819;
  }
}
* { box-sizing: border-box; }
html, body { width: 100%; max-width: 100%; min-width: 0; overflow-x: clip; }
body { margin: 0; overflow-wrap: anywhere; background: var(--fondo); }
/* Los elementos flex/grid pueden contraerse por debajo del ancho de su contenido. */
main, .cabecera__interior, .pie, .resumen, .estadisticas,
.selector-agente, .acciones, nav, .consultas-rapidas, .historia li { min-width: 0; }
:where(main, .cabecera__interior, .pie, .resumen, .estadisticas,
  .selector-agente, .acciones, nav, .consultas-rapidas, .consulta-rapida, .historia li) > * { min-width: 0; max-width: 100%; }
a { color: var(--acento); text-underline-offset: .22em; }
a:hover { color: var(--acento-fuerte); }
:focus-visible { outline: 3px solid var(--acento); outline-offset: 4px; }
::selection { background: var(--acento-suave); color: var(--texto); }
h1, h2, h3, p { margin-top: 0; }
h1 { font-size: 1.75rem; letter-spacing: -.045em; line-height: 1.12; margin-bottom: 1.25rem; text-wrap: balance; }
h2 { font-size: 1.25rem; line-height: 1.3; letter-spacing: -.025em; margin-bottom: 1.25rem; }
h3 { font-size: 1rem; font-weight: 600; }
p { margin-bottom: 1rem; }
small, .atenuado { color: var(--secundario); }
code, .monoespaciado { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
code { font-size: .87em; overflow-wrap: anywhere; }
.saltar { position: fixed; left: 1rem; top: -6rem; z-index: 10; padding: .7rem 1rem; background: var(--superficie); border-radius: .5rem; }
.saltar:focus { top: 1rem; }
.cabecera { background: var(--superficie); border-bottom: 1px solid var(--borde); }
.cabecera__interior { max-width: 1100px; padding: 1.15rem 2rem; margin: auto; display: flex; align-items: center; gap: 1.75rem; flex-wrap: wrap; }
.marca { display: inline-flex; align-items: center; gap: .65rem; color: var(--texto); font-weight: 800; letter-spacing: .03em; text-decoration: none; }
.version { font-size: .7rem; font-weight: 600; color: var(--secundario); letter-spacing: 0; }
nav { display: flex; gap: .35rem; flex-wrap: wrap; }
nav a { font-size: .85rem; font-weight: 650; padding: .5rem .8rem; border-radius: .5rem; text-decoration: none; color: var(--secundario); }
nav a:hover, nav a[aria-current="page"] { background: var(--acento-suave); color: var(--acento); }
main { max-width: 1100px; margin: auto; padding: 3rem 2rem 4rem; min-height: 70vh; }
.ceja { color: var(--acento); font-size: .875rem; font-weight: 600; margin-bottom: 1rem; }
.hero { padding: 1.5rem 0 2rem; max-width: 780px; }
.hero h1 { max-width: 700px; }
.tarjeta { background: var(--superficie); border: 1px solid var(--borde); border-radius: 1rem; padding: 1.75rem; min-width: 0; }
.tarjeta--principal { border-color: var(--borde); }
form { margin: 0; }
label { display: flex; flex-direction: column; gap: .45rem; font-size: .85rem; font-weight: 650; margin-bottom: 1.1rem; min-width: 0; }
input { width: 100%; min-width: 0; padding: .8rem .9rem; font: inherit; border: 1px solid var(--borde-control); border-radius: .55rem; color: var(--texto); background: var(--fondo); transition: border-color .15s; }
input:hover { border-color: var(--secundario); }
select { width: 100%; min-width: 0; max-width: 100%; padding: .8rem .9rem; font: inherit; border: 1px solid var(--borde-control); border-radius: .55rem; color: var(--texto); background: var(--fondo); }
.selector-agente { display: flex; align-items: center; gap: 1rem; margin: 2rem 0; padding: 1rem 1.25rem; background: var(--superficie); border: 1px solid var(--borde); border-radius: .75rem; }
.selector-agente label { display: block; margin: 0; }
.selector-agente select { flex: 1; width: auto; max-width: 18rem; }
input::placeholder { color: var(--secundario); opacity: 1; font-weight: 400; }
input[type="hidden"] { display: none; }
.acciones { display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; }
button, .boton { display: inline-flex; align-items: center; justify-content: center; min-width: 0; max-width: 100%; white-space: normal; padding: .8rem 1.2rem; min-height: 44px; font: 600 1rem/1.5 "Segoe UI", system-ui, -apple-system, Roboto, sans-serif; color: var(--boton-texto); background: var(--acento); border: 1px solid transparent; border-radius: .55rem; cursor: pointer; text-decoration: none; transition: background .15s, transform .15s; }
button:hover, .boton:hover { background: var(--acento-fuerte); color: var(--boton-texto); }
.boton--secundario { min-height: 36px; padding: .4rem .7rem; font-size: .875rem; background: var(--superficie); color: var(--acento); border-color: var(--borde-control); }
.boton--secundario:hover { color: var(--acento-fuerte); background: var(--acento-suave); }
.cabecera-pagina { margin-bottom: 2rem; }
.cabecera-pagina h1 { font-size: 1.75rem; }
.cabecera-pagina p { color: var(--secundario); overflow-wrap: anywhere; }
section + section, .bloque { margin-top: 2rem; }
.resumen { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.25rem; margin: 1.5rem 0 0; }
dt { font-size: .72rem; font-weight: 650; color: var(--secundario); letter-spacing: .06em; }
dd { margin: .25rem 0 1.25rem; overflow-wrap: anywhere; }
.resumen div { min-width: 0; }
.insignia { display: inline-block; border-radius: .4rem; padding: .2rem .55rem; font-size: .73rem; font-weight: 650; line-height: 1.6; background: var(--neutro-fondo); color: var(--neutro); white-space: nowrap; overflow-wrap: normal; }
.insignia--permitida { background: var(--exito-fondo); color: var(--exito); }
.insignia--no-observada { background: var(--neutro-fondo); color: var(--neutro); border: 1px dotted var(--neutro); }
.mapa-vias details, .mapa-vias code { max-width: 100%; overflow-wrap: anywhere; }
.mapa-vias details { margin: 0; padding: .6rem; }
.insignia--denegada, .insignia--entrada-ilegible, .insignia--referencia-no-resuelta { background: var(--peligro-fondo); color: var(--peligro); }
.insignia--pregunta, .insignia--regla-sin-efecto, .insignia--sustitucion-sin-valor { background: var(--aviso-fondo); color: var(--aviso); }
.insignia--neutra, .insignia--aviso, .insignia--entrada-descartada, .insignia--elemento-sin-uso { background: var(--neutro-fondo); color: var(--neutro); }
.decision-principal .insignia { font-size: clamp(1.4rem, 3vw, 2rem); padding: .4rem 1rem; border-radius: .7rem; margin-bottom: 1rem; }
.aviso { padding: 1rem 1.2rem; border-radius: .6rem; border: 1px solid var(--borde); border-left: 3px solid var(--borde); font-size: .88rem; overflow-wrap: anywhere; background: var(--acento-suave); }
.aviso p:last-child { margin-bottom: 0; }
.aviso + .aviso { margin-top: .75rem; }
.aviso--advertencia { border-left-color: var(--secundario); background: var(--superficie-suave); color: var(--texto); }
.ficha-codigo { display: inline-block; padding: .35rem .55rem; border: 1px solid var(--borde); background: var(--superficie-suave); border-radius: .4rem; }
.consultas-rapidas { display: flex; flex-wrap: wrap; gap: .6rem; list-style: none; padding: 0; margin: 0; }
.consultas-rapidas li { margin: 0; max-width: 100%; }
.consulta-rapida { display: inline-flex; align-items: center; gap: .6rem; border: 1px solid var(--borde); border-radius: .55rem; padding: .6rem .75rem; max-width: 100%; background: var(--superficie); text-decoration: none; transition: background .15s, border-color .15s; }
.consulta-rapida:hover { background: var(--acento-suave); border-color: var(--acento); }
.ruta { display: inline-flex; flex-direction: column; vertical-align: top; min-width: 0; max-width: 100%; padding: .35rem .55rem; border: 1px solid var(--borde); background: var(--superficie-suave); border-radius: .4rem; overflow-wrap: anywhere; word-break: normal; hyphens: none; line-height: 1.6; }
.ruta__directorio { display: block; color: var(--secundario); font-size: .72rem; white-space: normal; }
.ruta__segmento, .ruta__archivo { min-width: 0; white-space: normal; overflow-wrap: anywhere; }
.ruta__archivo { order: -1; color: var(--texto); font-weight: 650; }
.valor-desplazado { font-family: ui-monospace, monospace; }
.declaracion-desplazada + .declaracion-desplazada { margin-top: .4rem; }
.regla-detalle { margin: 0; padding: .75rem; min-width: 150px; }
.regla-detalle p { margin: .75rem 0 0; }
.tabla-contenedor { width: 100%; min-width: 0; max-width: 100%; overflow-x: auto; border: 1px solid var(--borde); border-radius: .75rem; background: var(--superficie); }
.tabla-matriz { width: max-content; min-width: 100%; }
.tabla-matriz td { min-width: 16rem; }
.tabla-matriz th[scope="row"] { min-width: 12rem; max-width: 20rem; white-space: normal; }
.tabla-matriz .insignia { white-space: nowrap; }
.matriz__efectos, .matriz__estados { display: inline-flex; align-items: center; flex-wrap: wrap; gap: .4rem; }
.matriz__estados { display: flex; margin-top: .4rem; }
.tabla-valores { table-layout: fixed; }
.tabla-valores td { overflow-wrap: anywhere; word-break: normal; }
.tabla-cadena td[data-etiqueta="Sujeto"] { min-width: 12rem; overflow-wrap: normal; }
.tabla-cadena td[data-etiqueta="Sujeto"] code { overflow-wrap: normal; }
.tabla-cadena td[data-etiqueta="Patrón"] code { overflow-wrap: anywhere; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: .83rem; }
th { background: var(--superficie-suave); color: var(--secundario); font-size: .875rem; white-space: nowrap; position: sticky; top: 0; }
td, th { padding: 1rem; vertical-align: top; border-bottom: 1px solid var(--borde); }
td { min-width: 100px; max-width: 380px; overflow-wrap: anywhere; }
tbody tr:nth-child(even) { background: var(--fondo); }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: var(--acento-suave); }
.fila--determinante { background: var(--superficie-suave); outline: 1px solid var(--borde); }
tbody tr:target { background: var(--acento-suave); outline: 2px solid var(--acento); outline-offset: -2px; scroll-margin-top: 3rem; }
#valores td:nth-child(1), #valores td:nth-child(2) { font-family: ui-monospace, monospace; }
#valores td:nth-child(1) { white-space: nowrap; min-width: 11rem; overflow-wrap: normal; }
#valores td:nth-child(2) { color: var(--texto); font-size: 1rem; font-weight: 700; }
#valores td:nth-child(4) { color: var(--secundario); font-size: .78rem; }
ol, ul { padding-left: 1.25rem; }
li + li { margin-top: .5rem; }
.estadisticas { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 145px), 1fr)); gap: .75rem; margin: 1rem 0 2rem; }
.estadistica { background: var(--superficie); border: 1px solid var(--borde); border-radius: .75rem; padding: 1rem; min-width: 0; }
.estadistica strong { display: block; font-size: 2rem; line-height: 1.2; font-variant-numeric: tabular-nums; color: var(--texto); margin-bottom: .5rem; }
.estadistica span { font-size: .72rem; color: var(--secundario); overflow-wrap: anywhere; }
.estadistica .estadistica__nombre { display: block; min-height: 2.8em; font-size: .8rem; font-weight: 650; color: var(--texto); margin-bottom: .65rem; }
.estadistica small { display: block; font: .75rem/1.5 "Segoe UI", system-ui, sans-serif; overflow-wrap: anywhere; }
.estadistica--aviso { border-color: var(--borde); background: var(--superficie-suave); }
.estadistica--aviso strong { color: var(--texto); }
.estado-vacio { text-align: center; padding: 2.5rem 1.5rem; background: var(--superficie); border: 1px dashed var(--borde); border-radius: .8rem; color: var(--secundario); }
details { margin-top: 1rem; padding: 1.25rem; background: var(--superficie); border: 1px solid var(--borde); border-radius: .75rem; }
details + section { margin-top: 2rem; }
summary { cursor: pointer; font-size: .9rem; font-weight: 650; }
details[open] > summary { margin-bottom: 1.25rem; }
.historia { list-style: none; padding: 0; }
.historia li { display: flex; align-items: baseline; gap: .75rem; flex-wrap: wrap; padding: .85rem 1rem; border-bottom: 1px solid var(--borde); font-size: .85rem; }
.historia li:has([aria-current="page"]) { background: var(--acento-suave); border-radius: .5rem; }
.pie { max-width: 1036px; margin: auto; padding: 1.5rem 0 2rem; border-top: 1px solid var(--borde); display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; font-size: .72rem; color: var(--secundario); }
.pie p { margin: 0; }
.pagina-error { max-width: 700px; margin: 2rem auto; padding: clamp(1.5rem, 5vw, 3rem); }
.pagina-error h1 { font-size: 1.75rem; }
@media (max-width: 760px) {
  .selector-agente, .acciones { flex-direction: column; align-items: stretch; }
  form, button, .boton { width: 100%; }
  .selector-agente select { width: 100%; max-width: 100%; flex: auto; }
  main { padding: 2rem 1rem 3rem; }
  .cabecera__interior { padding: 1rem; gap: .75rem; flex-direction: column; align-items: stretch; }
  .marca { align-self: flex-start; }
  nav { width: 100%; max-width: 100%; flex-wrap: nowrap; overflow-x: auto; padding: .25rem; }
  nav a { padding: .5rem .65rem; flex-shrink: 0; }
  .resumen { grid-template-columns: minmax(0, 1fr); }
  .tarjeta { padding: 1.25rem; }
  .pie { margin: 0 1rem; }
}
.pestanas { display: flex; flex-wrap: nowrap; gap: .5rem; width: 100%; min-width: 0; max-width: 100%; overflow-x: auto; padding: .5rem 0; margin-bottom: 1rem; }
.pestanas a { flex-shrink: 0; }
.resumen-cambios { display: flex; flex-wrap: wrap; gap: .75rem; margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--borde); border-radius: .75rem; background: var(--superficie); }
.resumen-cambios .insignia { font-size: .9rem; }
.fotos-comparadas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; margin: 1.5rem 0; }
.fotos-comparadas h2 { margin-bottom: .5rem; }
@media (min-width: 641px) {
  .tabla-comparacion td[data-etiqueta="Antes"], .tabla-comparacion td[data-etiqueta="Después"] { width: 30%; }
}
.grupo-vias th { position: static; color: var(--texto); }
#ayuda-analizar { margin-top: 1rem; margin-bottom: 0; }
#comando-cli { min-width: 0; max-width: 100%; }
#comando-cli pre { max-width: 100%; overflow-x: auto; padding: 1rem; background: var(--fondo); }
#comando-cli code { white-space: pre; overflow-wrap: normal; }
@media (max-width: 640px) {
  .decision-principal { overflow-x: auto; }
  .decision-principal .insignia { font-size: clamp(.9rem, 4vw, 1.4rem); padding: .4rem .6rem; }
  .fotos-comparadas { grid-template-columns: minmax(0, 1fr); }
  .recientes li { flex-direction: column; align-items: stretch; padding: 1rem; gap: .75rem; border: 1px solid var(--borde); border-radius: .75rem; background: var(--fondo); }
  .tabla-tarjetas, .tabla-tarjetas tbody, .tabla-tarjetas tr, .tabla-tarjetas td { display: block; width: 100%; min-width: 0; max-width: 100%; }
  /* Conserva los encabezados para tecnologías de asistencia. */
  .tabla-tarjetas thead { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); }
  .tabla-tarjetas thead th { position: static; }
  .grupo-vias th { display: block; width: 100%; white-space: normal; }
  .tabla-tarjetas tr { padding: .75rem; border-bottom: 1px solid var(--borde); }
  .tabla-tarjetas td { padding: .5rem; border: 0; }
  .tabla-tarjetas td[data-etiqueta]::before { content: attr(data-etiqueta); display: block; font: 600 .75rem system-ui; color: var(--secundario); margin-bottom: .4rem; }
  #valores .tabla-tarjetas td:nth-child(1) { white-space: normal; min-width: 0; overflow-wrap: anywhere; }
  .tabla-tarjetas .regla-detalle { min-width: 0; }
}
@media (max-width: 420px) {
  .hero { padding-top: .5rem; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; } }
.migas { display: flex; flex-wrap: wrap; gap: .5rem; align-items: baseline; font-size: .875rem; }
.migas a { padding: 0; font-weight: 400; }
.migas span { overflow-wrap: anywhere; }
.recientes { list-style: none; padding: 0; display: grid; gap: .35rem; }
.recientes li { display: flex; flex-direction: row; align-items: center; padding: .25rem .85rem; gap: 1rem; position: relative; border-radius: .5rem; line-height: 1.35; }
.reciente__foto { display: grid; grid-template-columns: minmax(0, 1fr) auto; flex: 1 1 0; min-width: 0; overflow-wrap: anywhere; gap: 0 1rem; text-decoration: none; color: var(--texto); }
.reciente__foto::after { content: ""; position: absolute; inset: 0; border-radius: 1rem; }
.reciente__foto strong { font-size: 1rem; font-weight: 600; }
.reciente__foto code, .reciente__foto span { font-size: .875rem; color: var(--secundario); }
.reciente__foto code { grid-column: 1 / -1; grid-row: 2; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.reciente__foto span { text-align: right; }
.reciente__foto:focus-visible { outline-offset: -3px; }
.reciente__reanalizar { position: relative; z-index: 1; flex-shrink: 0; font-size: .8rem; }
.formulario-permiso { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr)); gap: 1rem; align-items: end; margin: 1.5rem 0; }
.formulario-permiso label { display: flex; flex-direction: column; overflow-wrap: normal; margin: 0; }
.formulario-permiso button { align-self: end; }
.fila--desplazada { color: var(--secundario); }
.hallazgo { margin: 1rem 0; }
.hallazgo p:last-child { margin-bottom: 0; }
.hallazgo:target { outline: 2px solid var(--acento); outline-offset: 3px; }
#analizar-proyecto { padding: 1rem; }
#analizar-proyecto h2 { margin-bottom: .75rem; }
#analizar-proyecto form { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 1rem; }
#analizar-proyecto label { margin: 0; }
#analizar-proyecto details { padding: .65rem; }
.hero:has(+ #analizar-proyecto) { padding: 0 0 .75rem; }
.hero:has(+ #analizar-proyecto) h1 { margin-bottom: .75rem; }
@media (max-width: 760px) {
  .formulario-permiso { grid-template-columns: minmax(0, 1fr); }
  #analizar-proyecto form { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 640px) {
  .recientes li { flex-direction: column; align-items: stretch; gap: .5rem; }
  .reciente__foto { grid-template-columns: minmax(0, 1fr); }
  .reciente__foto code { grid-column: 1; grid-row: auto; }
  .reciente__foto span { text-align: left; }
  .reciente__reanalizar { align-self: flex-start; }
  .insignia { white-space: normal; overflow-wrap: anywhere; }
}
.codigo-error { display: block; color: var(--secundario); }
.metadatos-proyecto { font-size: .875rem; }
.metadatos-acciones p { flex: 1; margin-bottom: 0; }
.procedencia { display: inline-block; font-size: .875rem; font-weight: 400; letter-spacing: normal; margin-left: .5rem; }
.estadisticas--resumen { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr); align-items: stretch; margin-top: 2rem; }
.estadisticas--resumen .estadistica { padding: .65rem .85rem; }
.estadisticas--resumen .estadistica strong { margin-bottom: .1rem; }
.cifras-actuales { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; position: relative; min-width: 0; }
.cifras-actuales__rotulo { position: absolute; bottom: calc(100% + .25rem); font-size: .75rem; }
.fila-agente { position: relative; }
.agente-enlace { color: var(--texto); font-weight: 600; text-decoration: none; }
.agente-enlace::after { content: ""; position: absolute; inset: 0; }
.agente-enlace:hover { text-decoration: underline; }
.fila-agente:focus-within { outline: 2px solid var(--acento); outline-offset: -2px; background: var(--acento-suave); }
.hallazgos-resumen { display: grid; gap: .5rem; }
.hallazgo-resumen { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; align-items: baseline; gap: .75rem; padding: .75rem 1rem; border: 1px solid var(--borde); border-radius: .5rem; background: var(--superficie); }
.hallazgo-resumen > * { min-width: 0; }
.barra-agente { display: flex; justify-content: space-between; gap: 1rem; align-items: center; min-width: 0; }
.identidad-agente { display: flex; align-items: baseline; flex-wrap: wrap; gap: .6rem; min-width: 0; }
.identidad-agente h1 { margin-bottom: 0; }
.barra-agente .selector-agente { margin: 0; padding: 0; border: 0; background: transparent; gap: .5rem; flex-shrink: 0; max-width: 100%; }
.barra-agente .selector-agente select { max-width: 10rem; }
.barra-agente .selector-agente select, .barra-agente .selector-agente button { padding: .4rem .6rem; font-size: .875rem; }
.barra-agente + p { margin-top: .75rem; }
.barra-busqueda { display: flex; align-items: end; gap: .5rem; margin-bottom: 1rem; max-width: 35rem; }
.barra-busqueda label { flex: 1; margin: 0; }
.barra-busqueda button { width: auto; }
.sujetos-permiso { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: .75rem; }
.sujetos-permiso > div { padding: .75rem; border: 1px solid var(--borde); border-radius: .5rem; min-width: 0; background: var(--superficie); }
.sujetos-permiso dt { font-size: .875rem; letter-spacing: 0; overflow-wrap: anywhere; }
.sujetos-permiso dd { margin-bottom: 0; }
.sujetos-permiso a { text-decoration: none; }
.leyenda-parcial { color: var(--secundario); font-size: .875rem; }
.acciones--pie { margin-top: 1rem; }
@media (max-width: 900px) {
  .barra-agente { flex-direction: column; align-items: stretch; }
  .barra-agente .selector-agente { align-self: flex-start; flex-direction: row; align-items: center; flex-wrap: wrap; }
}
@media (max-width: 640px) {
  .estadisticas--resumen { grid-template-columns: minmax(0, 1fr); }
  .cifras-actuales { margin-top: 1.25rem; }
  .hallazgo-resumen { grid-template-columns: minmax(0, 1fr) auto; }
  .hallazgo-resumen > span:nth-child(2) { grid-row: 2; grid-column: 1 / -1; }
}
@media (max-width: 699px) {
  /* Una fila por agente; los sujetos siguen asociados a sus efectos. */
  .tabla-matriz, .tabla-matriz tbody, .tabla-matriz tr, .tabla-matriz td, .tabla-matriz th[scope="row"] { display: block; width: 100%; min-width: 0; max-width: 100%; }
  .tabla-matriz thead { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); }
  .tabla-matriz thead th { position: static; }
  .tabla-matriz tbody { padding: .5rem; }
  .tabla-matriz tr { padding: .75rem; border: 1px solid var(--borde); border-radius: .6rem; margin-bottom: .75rem; }
  .tabla-matriz tr:last-child { margin-bottom: 0; }
  .tabla-matriz th[scope="row"] { position: static; padding: .5rem; border: 0; }
  .tabla-matriz td { padding: .5rem; border: 0; }
  .tabla-matriz td[data-etiqueta]::before { content: attr(data-etiqueta); display: block; font: 600 .875rem ui-monospace, monospace; color: var(--secundario); margin-bottom: .4rem; }
}
`;
