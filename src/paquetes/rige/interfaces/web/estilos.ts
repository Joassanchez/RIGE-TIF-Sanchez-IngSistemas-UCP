// Recurso local estático. Sin fuentes, imágenes ni solicitudes a otros orígenes.
export const estilos = `
:root {
  color-scheme: light dark;
  --fondo: #f2f7f9; --superficie: #ffffff; --superficie-suave: #e6f0f3;
  --texto: #132229; --secundario: #4a5e67; --borde: #cfdee4;
  --borde-control: #6f8790;
  --marca: #0b6e85; --marca-fuerte: #075468; --marca-suave: #dcf0f5;
  --cabecera: #0b6e85; --cabecera-texto: #ffffff;
  --acento: #0b6e85; --acento-fuerte: #075468; --acento-suave: #dcf0f5;
  --exito: #0f5c36; --exito-fondo: #dff3e6; --peligro: #9b1c31; --peligro-fondo: #fde7ea;
  --aviso: #7a4a00; --aviso-fondo: #fdefc8; --neutro: #4f5560; --neutro-fondo: #e9ebee;
  --rige: #0b4a8f; --rige-fondo: #e3effc; --declarado: #7d3c00; --declarado-fondo: #fbe9d7;
  --desplazado: #5f5a66; --desplazado-fondo: #efedf3; --parcial: #5b3ea6; --parcial-fondo: #ece7fa;
  --boton-texto: #ffffff;
  font-family: "Segoe UI", system-ui, -apple-system, Roboto, sans-serif;
  font-size: 16px; line-height: 1.5; color: var(--texto); background: var(--fondo);
}
:root[data-tema="claro"] {
  color-scheme: light;
  --fondo: #f2f7f9; --superficie: #ffffff; --superficie-suave: #e6f0f3;
  --texto: #132229; --secundario: #4a5e67; --borde: #cfdee4;
  --borde-control: #6f8790;
  --marca: #0b6e85; --marca-fuerte: #075468; --marca-suave: #dcf0f5;
  --cabecera: #0b6e85; --cabecera-texto: #ffffff;
  --acento: #0b6e85; --acento-fuerte: #075468; --acento-suave: #dcf0f5;
  --exito: #0f5c36; --exito-fondo: #dff3e6; --peligro: #9b1c31; --peligro-fondo: #fde7ea;
  --aviso: #7a4a00; --aviso-fondo: #fdefc8; --neutro: #4f5560; --neutro-fondo: #e9ebee;
  --rige: #0b4a8f; --rige-fondo: #e3effc; --declarado: #7d3c00; --declarado-fondo: #fbe9d7;
  --desplazado: #5f5a66; --desplazado-fondo: #efedf3; --parcial: #5b3ea6; --parcial-fondo: #ece7fa;
  --boton-texto: #ffffff;
}
:root[data-tema="oscuro"] {
  color-scheme: dark;
  --fondo: #0c1a21; --superficie: #12252e; --superficie-suave: #18323d;
  --texto: #e2eef2; --secundario: #9fb7c0; --borde: #284552;
  --borde-control: #6f909b;
  --marca: #4cc3dc; --marca-fuerte: #82d9eb; --marca-suave: #123f4b;
  --cabecera: #0a2d38; --cabecera-texto: #e2eef2;
  --acento: #4cc3dc; --acento-fuerte: #82d9eb; --acento-suave: #123f4b;
  --exito: #86dfab; --exito-fondo: #143526; --peligro: #ffa8b3; --peligro-fondo: #45202b;
  --aviso: #f3cc7a; --aviso-fondo: #3a2c12; --neutro: #c3c8d0; --neutro-fondo: #2c3037;
  --rige: #9ccbff; --rige-fondo: #12304f; --declarado: #f7bf8a; --declarado-fondo: #3b2614;
  --desplazado: #b9b3c4; --desplazado-fondo: #2a2730; --parcial: #cdbcff; --parcial-fondo: #2c2447;
  --boton-texto: #0c1a21;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-tema]) {
    color-scheme: dark;
    --fondo: #0c1a21; --superficie: #12252e; --superficie-suave: #18323d;
    --texto: #e2eef2; --secundario: #9fb7c0; --borde: #284552;
    --borde-control: #6f909b;
    --marca: #4cc3dc; --marca-fuerte: #82d9eb; --marca-suave: #123f4b;
    --cabecera: #0a2d38; --cabecera-texto: #e2eef2;
    --acento: #4cc3dc; --acento-fuerte: #82d9eb; --acento-suave: #123f4b;
    --exito: #86dfab; --exito-fondo: #143526; --peligro: #ffa8b3; --peligro-fondo: #45202b;
    --aviso: #f3cc7a; --aviso-fondo: #3a2c12; --neutro: #c3c8d0; --neutro-fondo: #2c3037;
    --rige: #9ccbff; --rige-fondo: #12304f; --declarado: #f7bf8a; --declarado-fondo: #3b2614;
    --desplazado: #b9b3c4; --desplazado-fondo: #2a2730; --parcial: #cdbcff; --parcial-fondo: #2c2447;
    --boton-texto: #0c1a21;
  }
}
* { box-sizing: border-box; }
html, body { width: 100%; max-width: 100%; min-width: 0; overflow-x: clip; }
body { margin: 0; overflow-wrap: anywhere; background: var(--fondo); }
/* Los elementos flex/grid pueden contraerse por debajo del ancho de su contenido. */
main, .cabecera__interior, .pie, .contexto, .estadisticas,
.selector-agente, .acciones, nav, .consultas-rapidas, .historia li { min-width: 0; }
:where(main, .cabecera__interior, .pie, .contexto, .estadisticas,
  .selector-agente, .acciones, nav, .consultas-rapidas, .consulta-rapida, .historia li) > * { min-width: 0; max-width: 100%; }
a { color: var(--acento); text-underline-offset: .22em; }
a:hover { color: var(--acento-fuerte); }
:focus-visible { outline: 3px solid var(--acento); outline-offset: 4px; }
::selection { background: var(--acento-suave); color: var(--texto); }
h1, h2, h3, p { margin-top: 0; }
h1 { font-size: 1.75rem; letter-spacing: -.045em; line-height: 1.12; margin-bottom: 1.25rem; text-wrap: balance; }
h2 { font-size: 1.25rem; line-height: 1.3; letter-spacing: -.025em; margin-bottom: 1.25rem; border-left: 3px solid var(--marca); padding-left: .6rem; }
h3 { font-size: 1rem; font-weight: 600; }
p { margin-bottom: 1rem; }
small, .atenuado { color: var(--secundario); }
code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .87em; overflow-wrap: anywhere; }
.oculto-visual, .visualmente-oculto { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.saltar { position: fixed; left: 1rem; top: -6rem; z-index: 10; padding: .7rem 1rem; background: var(--superficie); color: var(--acento); border: 2px solid var(--acento); border-radius: .5rem; font-weight: 650; }
.saltar:focus { top: 1rem; }
.cabecera { background: var(--cabecera); color: var(--cabecera-texto); border-bottom: 1px solid var(--borde); }
.cabecera__interior { max-width: 1100px; padding: 1.15rem 2rem; margin: auto; display: flex; align-items: center; gap: 1.25rem 1.75rem; flex-wrap: wrap; }
.cabecera :focus-visible { outline-color: var(--cabecera-texto); }
.marca { display: inline-flex; align-items: center; gap: .65rem; min-height: 24px; padding: .2rem .35rem; color: var(--cabecera-texto); font-weight: 800; letter-spacing: .03em; text-decoration: none; }
nav { display: flex; gap: .35rem; flex-wrap: wrap; }
nav a { font-size: .85rem; font-weight: 650; padding: .5rem .8rem; border-radius: .5rem; text-decoration: none; color: var(--secundario); }
nav a:hover { background: var(--marca-suave); color: var(--marca-fuerte); }
nav a[aria-current="page"], nav a[aria-current="page"]:hover { background: var(--marca); color: var(--boton-texto); }
.selector-tema { display: inline-flex; align-items: center; gap: .25rem; flex-wrap: wrap; margin-left: auto; }
.selector-tema a { display: inline-flex; align-items: center; min-height: 24px; padding: .2rem .55rem; border-radius: .5rem; font-size: .8rem; font-weight: 600; text-decoration: none; color: var(--cabecera-texto); border: 1px solid transparent; }
.selector-tema a:hover { text-decoration: underline; border-color: var(--cabecera-texto); }
.selector-tema a[aria-current="true"] { background: var(--cabecera-texto); color: var(--cabecera); text-decoration: none; }
main { max-width: 1100px; margin: auto; padding: 3rem 2rem 4rem; min-height: 70vh; }
.hero { background: var(--marca-suave); border: 1px solid var(--borde); border-radius: .5rem; padding: 1.5rem; margin-bottom: 2rem; }
.hero h1 { max-width: 700px; margin-bottom: 1rem; }
.tarjeta { background: var(--superficie); border: 1px solid var(--borde); border-radius: .5rem; padding: 1.5rem; min-width: 0; }
form { margin: 0; }
label { display: flex; flex-direction: column; gap: .5rem; font-size: .85rem; font-weight: 500; margin-bottom: 1rem; min-width: 0; }
input { width: 100%; min-width: 0; padding: .75rem .9rem; font: inherit; font-weight: 500; border: 1px solid var(--borde-control); border-radius: .5rem; color: var(--texto); background: var(--fondo); transition: border-color .15s; }
input:hover { border-color: var(--secundario); }
select { width: 100%; min-width: 0; max-width: 100%; padding: .75rem .9rem; font: inherit; font-weight: 500; border: 1px solid var(--borde-control); border-radius: .5rem; color: var(--texto); background: var(--fondo); }
.selector-agente { display: flex; align-items: center; gap: 1rem; margin: 2rem 0; padding: 1rem 1.25rem; background: var(--superficie); border: 1px solid var(--borde); border-radius: .5rem; }
.selector-agente label { display: block; margin: 0; }
.selector-agente select { flex: 1; width: auto; max-width: 18rem; }
input::placeholder { color: var(--secundario); opacity: 1; font-weight: 400; }
input[type="hidden"] { display: none; }
.acciones { display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; }
button, .boton { display: inline-flex; align-items: center; justify-content: center; min-width: 0; max-width: 100%; white-space: normal; padding: .75rem 1.2rem; min-height: 44px; font: 600 1rem/1.5 "Segoe UI", system-ui, -apple-system, Roboto, sans-serif; color: var(--boton-texto); background: var(--marca); border: 1px solid transparent; border-radius: .5rem; cursor: pointer; text-decoration: none; transition: background .15s, transform .15s; }
button:hover, .boton:hover { background: var(--marca-fuerte); color: var(--boton-texto); }
.boton--secundario { min-height: 36px; padding: .4rem .7rem; font-size: .875rem; background: var(--superficie); color: var(--marca); border-color: var(--marca); }
.boton--secundario:hover { color: var(--marca-fuerte); background: var(--marca-suave); border-color: var(--marca-fuerte); }
.cabecera-pagina { margin-bottom: 2rem; }
.cabecera-pagina h1 { font-size: 1.75rem; }
.cabecera-pagina p { color: var(--secundario); overflow-wrap: anywhere; }
section + section, .bloque { margin-top: 2rem; }
dt { font-size: .72rem; font-weight: 500; color: var(--secundario); letter-spacing: .06em; }
dd { margin: .25rem 0 1.25rem; font-weight: 600; overflow-wrap: anywhere; }
.insignia { display: inline-block; border-radius: .5rem; padding: .2rem .55rem; font-size: .73rem; font-weight: 650; line-height: 1.6; background: var(--neutro-fondo); color: var(--neutro); white-space: nowrap; overflow-wrap: normal; }
.insignia--permitida, .rol--permitida { background: var(--exito-fondo); color: var(--exito); }
.insignia--no-observada { background: var(--neutro-fondo); color: var(--neutro); border: 1px dotted var(--neutro); }
.mapa-vias { overflow-wrap: anywhere; }
.grupos-entradas { display: grid; gap: 1.5rem; margin-top: 1rem; }
.grupo-entradas { background: var(--superficie); border: 1px solid var(--borde); border-left: 4px solid var(--neutro); border-radius: .5rem; padding: 1.25rem; margin-top: 0; min-width: 0; }
.grupo-entradas--presente { border-left-color: var(--marca); }
.grupo-entradas--presente h3 { color: var(--marca); margin-bottom: .75rem; }
.grupo-entradas--ausente { border-left-color: var(--neutro); }
.grupo-entradas--no-observada { border-left-color: var(--parcial); }
.grupo-entradas > summary { font-size: 1rem; font-weight: 650; }
.grupo-entradas--no-observada > summary { color: var(--parcial); }
.grupo-entradas--ausente > summary { color: var(--neutro); }
.revisados-via + .revisados-via { margin-top: 1.25rem; }
.insignia--denegada, .rol--denegada, .insignia--entrada-ilegible, .insignia--referencia-no-resuelta { background: var(--peligro-fondo); color: var(--peligro); }
.insignia--pregunta, .rol--pregunta, .insignia--regla-sin-efecto, .insignia--sustitucion-sin-valor { background: var(--aviso-fondo); color: var(--aviso); }
.insignia--neutra, .insignia--aviso, .insignia--pista, .rol--pista, .insignia--estructura, .insignia--nativo, .rol--nativo, .insignia--entrada-descartada, .insignia--elemento-sin-uso { background: var(--neutro-fondo); color: var(--neutro); }
.insignia--rige, .rol--rige { background: var(--rige-fondo); color: var(--rige); }
.insignia--declarado, .rol--declarado { background: var(--declarado-fondo); color: var(--declarado); }
.insignia--desplazado, .rol--desplazado { background: var(--desplazado-fondo); color: var(--desplazado); }
.insignia--parcial, .rol--parcial { background: var(--parcial-fondo); color: var(--parcial); border: 1px dotted var(--parcial); }
.decision-principal h2, .decision-principal p { color: var(--texto); }
.decision-principal .insignia { display: inline-flex; align-items: center; gap: .5rem; font-size: clamp(1.5rem, 3.2vw, 2.25rem); padding: 0; background: transparent; border-radius: .5rem; margin-bottom: .75rem; }
.tarjeta--marca { border-left: 3px solid var(--marca); }
.aviso { padding: 1rem 1.2rem; border-radius: .5rem; border: 1px solid var(--borde); border-left: 3px solid var(--borde); font-size: .88rem; overflow-wrap: anywhere; background: var(--acento-suave); }
.aviso p:last-child { margin-bottom: 0; }
.aviso + .aviso { margin-top: .75rem; }
.aviso--advertencia { border-left-color: var(--aviso); background: var(--aviso-fondo); color: var(--aviso); }
.ficha-codigo { display: inline-block; padding: .35rem .55rem; border: 1px solid var(--borde); background: var(--superficie-suave); border-radius: .5rem; }
.consultas-rapidas { display: flex; flex-wrap: wrap; gap: .5rem; list-style: none; padding: 0; margin: 0; }
.consultas-rapidas li { margin: 0; max-width: 100%; }
.consulta-rapida { display: inline-flex; align-items: center; gap: .5rem; border: 1px solid var(--borde); border-radius: .5rem; padding: .5rem .75rem; max-width: 100%; background: var(--superficie); text-decoration: none; transition: background .15s, border-color .15s; }
.consulta-rapida:hover { background: var(--acento-suave); border-color: var(--acento); }
.ruta { display: inline-flex; flex-direction: column; vertical-align: top; min-width: 0; max-width: 100%; padding: .35rem .55rem; border: 1px solid var(--borde); background: var(--superficie-suave); border-radius: .5rem; overflow-wrap: anywhere; word-break: normal; hyphens: none; line-height: 1.6; }
.ruta__directorio { display: block; color: var(--secundario); font-size: .72rem; white-space: normal; }
.ruta__segmento, .ruta__archivo { min-width: 0; white-space: normal; overflow-wrap: anywhere; }
.ruta__archivo { order: -1; color: var(--texto); font-weight: 650; }
.cadena-desplazadas { list-style: none; margin: 0; padding: 0; display: grid; gap: .5rem; }
.declaracion-desplazada { display: flex; flex-wrap: wrap; align-items: baseline; gap: .5rem; color: var(--secundario); }
.valor-desplazado { font-family: ui-monospace, monospace; font-weight: 600; color: var(--secundario); }
.declaracion-desplazada + .declaracion-desplazada { margin-top: 0; }
.procedencia-chip { display: inline-block; padding: .35rem .6rem; border: 1px solid var(--borde); border-left: 3px solid var(--neutro); border-radius: .5rem; background: var(--superficie-suave); color: var(--texto); font-size: .83rem; font-weight: 500; line-height: 1.4; max-width: 100%; overflow-wrap: anywhere; }
.procedencia-chip--declarado { border-left-color: var(--declarado); }
.procedencia-chip--nativo { border-left-color: var(--neutro); }
.procedencia-chip--pequena { padding: .25rem .5rem; font-size: .75rem; }
.notas-reglas { margin: .5rem 0 0; padding-left: 1.25rem; color: var(--secundario); font-size: .85rem; }
.notas-reglas li + li { margin-top: .5rem; }
.tabla-contenedor { width: 100%; min-width: 0; max-width: 100%; overflow-x: auto; border: 1px solid var(--borde); border-radius: .5rem; background: var(--superficie); }
.tabla-matriz { width: max-content; min-width: 100%; }
.tabla-matriz td { min-width: 5.5rem; padding: 0; border-left: 1px solid var(--borde); text-align: center; vertical-align: middle; }
.tabla-matriz th[scope="col"] { padding: .6rem .5rem; font-size: .78rem; }
.tabla-matriz thead th:first-child { position: sticky; left: 0; z-index: 2; }
.tabla-matriz th[scope="row"] { position: sticky; left: 0; z-index: 1; min-width: 12rem; max-width: 20rem; white-space: normal; }
.tabla-matriz .insignia { white-space: nowrap; }
.regla-prevalece { font-size: .72rem; }
.fila--seleccionada { background: var(--marca-suave); outline: 2px solid var(--marca); outline-offset: -2px; }
.fila--seleccionada th[scope="row"] { background: var(--marca-suave); }
.celda-matriz { padding: 0; }
.matriz__efectos, .matriz__estados { display: inline-flex; align-items: center; flex-wrap: wrap; gap: .4rem; }
.matriz__efectos { justify-content: center; width: 100%; min-height: 2.5rem; padding: .5rem; font-size: 1.1rem; font-weight: 700; text-decoration: none; color: inherit; }
.matriz__efectos:hover { text-decoration: none; outline: 2px solid var(--marca); outline-offset: -2px; }
.matriz__estados { display: flex; margin-top: .4rem; }
.leyenda-matriz { list-style: none; padding: 0; margin: .75rem 0 1rem; display: flex; flex-wrap: wrap; gap: .5rem; }
.leyenda-chip { display: inline-flex; align-items: center; gap: .4rem; padding: .25rem .6rem; border-radius: .5rem; font-size: .8rem; font-weight: 600; }
.lista-chips { display: flex; flex-direction: column; gap: .25rem; }
.lista-chips__rotulo { font-size: .75rem; color: var(--secundario); }
.chips { display: flex; flex-wrap: wrap; gap: .5rem; }
.chip { display: inline-flex; align-items: center; padding: .15rem .5rem; border: 1px solid var(--borde); border-radius: .5rem; background: var(--superficie-suave); color: var(--texto); font-size: .8rem; }
.tabla-valores { table-layout: fixed; }
.tabla-valores td { overflow-wrap: anywhere; word-break: normal; }
.tabla-cadena td[data-etiqueta="Sujeto"] { min-width: 12rem; overflow-wrap: normal; }
.tabla-cadena td[data-etiqueta="Sujeto"] code { overflow-wrap: normal; }
.tabla-cadena td[data-etiqueta="Patrón"] code { overflow-wrap: anywhere; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: .83rem; }
th { background: var(--superficie-suave); color: var(--secundario); font-size: .875rem; white-space: nowrap; }
td, th { padding: 1rem; vertical-align: top; border-bottom: 1px solid var(--borde); }
td { min-width: 100px; max-width: 380px; overflow-wrap: anywhere; }
tbody tr:nth-child(even) { background: var(--fondo); }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: var(--acento-suave); }
.fila--determinante { background: var(--superficie-suave); outline: 1px solid var(--borde); }
tbody tr:target { background: var(--acento-suave); outline: 2px solid var(--acento); outline-offset: -2px; scroll-margin-top: 3rem; }
#valores td[data-etiqueta="Clave"], #valores td[data-etiqueta="Valor"] { font-family: ui-monospace, monospace; }
#valores td[data-etiqueta="Clave"] { white-space: nowrap; min-width: 11rem; font-weight: 600; overflow-wrap: normal; }
#valores td[data-etiqueta="Valor"] { color: var(--rige); font-size: 1rem; font-weight: 700; }
#valores td[data-etiqueta="Desplazadas"] { color: var(--secundario); font-size: .83rem; }
#valores .tabla-contenedor + .notas-reglas { margin-top: .5rem; }
#valores-fabrica > p { margin-bottom: .5rem; }
ol, ul { padding-left: 1.25rem; }
li + li { margin-top: .5rem; }
.estadisticas { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 145px), 1fr)); gap: .75rem; margin: 1rem 0 2rem; }
.estadistica { background: var(--superficie); border: 1px solid var(--borde); border-radius: .5rem; padding: 1rem; min-width: 0; }
.estadistica strong { display: block; font-size: 2rem; line-height: 1.2; font-variant-numeric: tabular-nums; color: var(--texto); margin-bottom: .5rem; }
.estadistica span { font-size: .8rem; color: var(--secundario); overflow-wrap: anywhere; }
.estadistica.rol--pregunta > *, .estadistica.rol--denegada > * { color: inherit; }
.estadistica .estadistica__nombre { display: block; min-height: 2.8em; font-size: .8rem; font-weight: 650; color: var(--texto); margin-bottom: .65rem; }
.estadistica small { display: block; font: .75rem/1.5 "Segoe UI", system-ui, sans-serif; overflow-wrap: anywhere; }
.estadistica--aviso { border-color: var(--borde); background: var(--superficie-suave); }
.estadistica--aviso strong { color: var(--texto); }
.estado-vacio { text-align: center; padding: 2.5rem 1.5rem; background: var(--superficie); border: 1px dashed var(--borde); border-radius: .5rem; color: var(--secundario); }
details { margin-top: 1rem; padding: 0; background: transparent; border: 0; }
details + section { margin-top: 2rem; }
summary { cursor: pointer; font-size: .9rem; font-weight: 600; min-height: 24px; padding: .25rem 0; color: var(--acento); }
summary:hover { color: var(--acento-fuerte); text-decoration: underline; }
details[open] > summary { margin-bottom: .75rem; }
.historia { list-style: none; padding: 0; }
.historia li { display: flex; align-items: baseline; gap: .75rem; flex-wrap: wrap; padding: .85rem 1rem; border-bottom: 1px solid var(--borde); font-size: .85rem; }
.historia li:has([aria-current="page"]) { background: var(--acento-suave); border-radius: .5rem; }
.pie { max-width: 1036px; margin: auto; padding: 1.5rem 0 2rem; border-top: 1px solid var(--borde); display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; font-size: .72rem; color: var(--secundario); }
.pie p { margin: 0; }
.pagina-error { max-width: 700px; margin: 2rem auto; padding: clamp(1.5rem, 5vw, 3rem); }
.pagina-error h1 { font-size: 1.75rem; }
.pestanas { display: flex; flex-wrap: nowrap; gap: .5rem; width: 100%; min-width: 0; max-width: 100%; overflow-x: auto; padding: .5rem 0; margin-bottom: 1rem; }
.pestanas a { flex-shrink: 0; }
.resumen-cambios { display: flex; flex-wrap: wrap; gap: .75rem; margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--borde); border-radius: .5rem; background: var(--superficie); }
.resumen-cambios .insignia { font-size: .9rem; }
.fotos-comparadas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; margin: 1.5rem 0; }
.fotos-comparadas h2 { margin-bottom: .5rem; }
#ayuda-analizar { margin-top: 1rem; margin-bottom: 0; }
#comando-cli, #ver-json, #entradas-leidas { min-width: 0; max-width: 100%; }
#comando-cli pre, #ver-json pre { max-width: 100%; overflow-x: auto; padding: 1rem; background: var(--fondo); }
#comando-cli code, #ver-json code { white-space: pre; overflow-wrap: normal; }
.pie-desarrolladores { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid var(--borde); display: flex; flex-wrap: wrap; align-items: baseline; gap: .35rem .75rem; font-size: .8rem; color: var(--secundario); min-width: 0; }
.pie-desarrolladores__rotulo { font-weight: 600; color: var(--secundario); }
.pie-desarrolladores__ruta { margin-left: auto; overflow-wrap: anywhere; }
.pie-desarrolladores details { margin-top: 0; flex: 0 0 auto; }
.pie-desarrolladores details[open] { flex-basis: 100%; width: 100%; margin-top: .5rem; }
.pie-desarrolladores summary { font-size: .8rem; font-weight: 500; color: var(--secundario); padding: .15rem 0; }
.pie-desarrolladores summary:hover { color: var(--acento-fuerte); }
.migas { display: flex; flex-wrap: wrap; gap: .5rem; align-items: baseline; font-size: .875rem; flex: 1 1 auto; min-width: 0; }
.migas a { display: inline-flex; align-items: center; min-height: 24px; padding: .2rem .35rem; font-weight: 400; color: var(--cabecera-texto); }
.migas a:hover { background: transparent; color: var(--cabecera-texto); text-decoration: underline; }
.migas span { overflow-wrap: anywhere; }
.migas__proyecto { max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; direction: rtl; unicode-bidi: plaintext; text-align: left; }
.recientes { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.recientes li { display: flex; flex-direction: column; align-items: stretch; justify-content: space-between; padding: 1rem; gap: .75rem; position: relative; border-radius: .5rem; border-top: 3px solid var(--marca); line-height: 1.35; }
.reciente__foto { display: grid; grid-template-columns: minmax(0, 1fr); flex: 1 1 0; min-width: 0; overflow-wrap: anywhere; gap: .25rem; text-decoration: none; color: var(--texto); }
.reciente__foto::after { content: ""; position: absolute; inset: 0; border-radius: .5rem; }
.reciente__foto strong { font-size: 1rem; font-weight: 600; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; direction: rtl; unicode-bidi: plaintext; text-align: left; }
.reciente__foto code, .reciente__foto span { font-size: .875rem; color: var(--secundario); }
.reciente__foto code { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; direction: rtl; unicode-bidi: plaintext; text-align: left; }
.reciente__foto span { text-align: left; }
.reciente__foto:focus-visible { outline-offset: -3px; }
.reciente__acciones { position: relative; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.reciente__ver { display: inline-flex; align-items: center; min-height: 24px; font-size: .85rem; font-weight: 600; }
.reciente__reanalizar { position: relative; z-index: 1; flex-shrink: 0; display: inline-flex; align-items: center; min-height: 24px; padding: .2rem .45rem; font-size: .8rem; }
.formulario-permiso { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr)); gap: 1rem; align-items: end; margin: 1.5rem 0; }
.formulario-permiso label { display: flex; flex-direction: column; overflow-wrap: normal; margin: 0; }
.formulario-permiso button { align-self: end; }
.fila--desplazada { color: var(--secundario); }
.fila--declarado { border-left: 3px solid var(--declarado); }
.fila--declarado td:first-child { border-left: 3px solid var(--declarado); }
.fila--nativo { color: var(--texto); border-left: 3px solid var(--neutro); }
.fila--nativo td:first-child { border-left: 3px solid var(--neutro); }
.hallazgo { margin: 1rem 0; }
.hallazgo p:last-child { margin-bottom: 0; }
.hallazgo:target { outline: 2px solid var(--acento); outline-offset: 3px; }
#analizar-proyecto { padding: 1rem; margin-top: 1rem; margin-bottom: 0; }
#analizar-proyecto h2 { margin-bottom: .75rem; }
#analizar-proyecto form { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 1rem; }
#analizar-proyecto label { margin: 0; font-size: 1rem; font-weight: 600; }
#analizar-proyecto button { padding: .6rem 1.25rem; background: var(--marca); color: var(--boton-texto); border-color: var(--marca); font-weight: 600; }
#analizar-proyecto details { padding: 0; margin-top: .75rem; }
.codigo-error { display: block; color: var(--secundario); }
.procedencia { display: inline-block; font-size: .875rem; font-weight: 400; letter-spacing: normal; margin-left: .5rem; }
.fila-agente { position: relative; }
.agente-enlace { color: var(--texto); font-weight: 600; text-decoration: none; }
.agente-enlace::after { content: ""; position: absolute; inset: 0; }
.agente-enlace:hover { text-decoration: underline; }
.fila-agente:focus-within { outline: 2px solid var(--acento); outline-offset: -2px; background: var(--acento-suave); }
.hallazgos-resumen { display: grid; gap: .5rem; }
.hallazgo-resumen { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; align-items: baseline; gap: .75rem; padding: .75rem 1rem; border: 1px solid var(--borde); border-radius: .5rem; background: var(--superficie); }
.hallazgo-resumen > * { min-width: 0; }
.barra-agente { display: flex; justify-content: space-between; gap: 1rem; align-items: center; min-width: 0; }
.identidad-agente { display: flex; align-items: baseline; flex-wrap: wrap; gap: .5rem; min-width: 0; }
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
.barra-analisis { border-bottom: 1px solid var(--borde); padding-bottom: .75rem; margin-bottom: 1.5rem; }
.contexto { display: flex; flex-wrap: wrap; align-items: baseline; gap: .5rem; color: var(--secundario); font-size: .875rem; margin: .4rem 0 1rem; overflow-wrap: anywhere; }
.contexto > div { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: .35rem; min-width: 0; max-width: 100%; padding: .2rem .5rem; background: var(--superficie-suave); border: 1px solid var(--borde); border-radius: .5rem; }
.contexto dt { font-size: .75rem; letter-spacing: .04em; color: var(--secundario); }
.contexto dd { margin: 0; font-weight: 600; color: var(--texto); }
.contexto__cambio { border-color: var(--marca); background: var(--marca-suave); }
.bandas-resumen { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 1rem 0 2rem; }
.banda { background: var(--superficie-suave); border: 1px solid var(--borde); border-top: 3px solid var(--marca); border-radius: .5rem; padding: 1rem; min-width: 0; }
.banda h3 { font-size: .85rem; letter-spacing: .04em; color: var(--secundario); margin: 0 0 1rem; }
.banda .estadisticas { margin: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.formulario-comparar { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem 1rem; margin: 1rem 0; padding: .9rem 1rem; border: 1px solid var(--borde); border-radius: .5rem; background: var(--superficie); }
.formulario-comparar label { display: flex; flex-direction: column; gap: .3rem; font-size: .85rem; color: var(--secundario); }
@media (min-width: 641px) {
  .tabla-comparacion td[data-etiqueta="Antes"], .tabla-comparacion td[data-etiqueta="Después"] { width: 30%; }
}
@media (max-width: 900px) {
  .barra-agente { flex-direction: column; align-items: stretch; }
  .barra-agente .selector-agente { align-self: flex-start; flex-direction: row; align-items: center; flex-wrap: wrap; }
}
@media (max-width: 760px) {
  .selector-agente, .acciones { flex-direction: column; align-items: stretch; }
  form, button, .boton { width: 100%; }
  .selector-agente select { width: 100%; max-width: 100%; flex: auto; }
  main { padding: 2rem 1rem 3rem; }
  .cabecera__interior { padding: 1rem; gap: .75rem; flex-direction: column; align-items: stretch; }
  .marca { align-self: flex-start; }
  .selector-tema { margin-left: 0; }
  nav { width: 100%; max-width: 100%; flex-wrap: nowrap; overflow-x: auto; padding: .25rem; }
  nav a { padding: .5rem .65rem; flex-shrink: 0; }
  .tarjeta { padding: 1.25rem; }
  .pie { margin: 0 1rem; }
  .formulario-permiso { grid-template-columns: minmax(0, 1fr); }
  #analizar-proyecto form { grid-template-columns: minmax(0, 1fr); }
  .bandas-resumen { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 699px) {
  /* Una fila por agente; los sujetos siguen asociados a sus efectos. */
  .tabla-matriz, .tabla-matriz tbody, .tabla-matriz td, .tabla-matriz th[scope="row"] { display: block; width: 100%; min-width: 0; max-width: 100%; }
  .tabla-matriz thead { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); }
  .tabla-matriz thead th { position: static; }
  .tabla-matriz tbody { padding: .5rem; }
  .tabla-matriz tr { display: grid; grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); gap: .25rem .5rem; width: 100%; min-width: 0; max-width: 100%; padding: .75rem; border: 1px solid var(--borde); border-radius: .5rem; margin-bottom: .75rem; }
  .tabla-matriz tr:last-child { margin-bottom: 0; }
  .tabla-matriz th[scope="row"] { grid-column: 1 / -1; position: static; padding: .5rem; border: 0; }
  .tabla-matriz td { padding: .5rem; border: 0; border-radius: .5rem; }
  .tabla-matriz td[data-etiqueta]::before { content: attr(data-etiqueta); display: block; font: 500 .875rem ui-monospace, monospace; color: inherit; margin-bottom: .4rem; }
}
@media (max-width: 640px) {
  .decision-principal { overflow-x: auto; }
  .decision-principal .insignia { font-size: clamp(1rem, 4vw, 1.5rem); padding: 0; }
  .fotos-comparadas { grid-template-columns: minmax(0, 1fr); }
  .recientes li { flex-direction: column; align-items: stretch; padding: 1rem; gap: .75rem; }
  .reciente__foto { grid-template-columns: minmax(0, 1fr); }
  .reciente__foto code { grid-column: 1; grid-row: auto; }
  .reciente__foto span { text-align: left; }
  .reciente__reanalizar { align-self: flex-start; }
  .insignia { white-space: normal; overflow-wrap: anywhere; }
  .tabla-tarjetas, .tabla-tarjetas tbody, .tabla-tarjetas tr, .tabla-tarjetas td { display: block; width: 100%; min-width: 0; max-width: 100%; }
  /* Conserva los encabezados para tecnologías de asistencia. */
  .tabla-tarjetas thead { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); }
  .tabla-tarjetas thead th { position: static; }
  .tabla-tarjetas tr { padding: .75rem; border-bottom: 1px solid var(--borde); }
  .tabla-tarjetas td { padding: .5rem; border: 0; }
  .tabla-tarjetas td[data-etiqueta]::before { content: attr(data-etiqueta); display: block; font: 500 .75rem system-ui; color: var(--secundario); margin-bottom: .4rem; }
  #valores .tabla-tarjetas td[data-etiqueta="Clave"] { white-space: normal; min-width: 0; overflow-wrap: anywhere; }
  .hallazgo-resumen { grid-template-columns: minmax(0, 1fr) auto; }
  .hallazgo-resumen > span:nth-child(2) { grid-row: 2; grid-column: 1 / -1; }
}
@media (max-width: 420px) {
  .hero { padding: 1rem; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; } }
`;
