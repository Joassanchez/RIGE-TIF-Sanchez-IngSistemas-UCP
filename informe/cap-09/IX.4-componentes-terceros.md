## IX.4 · Componentes de terceros

Se admite una dependencia de ejecución solo si OpenCode la utiliza en la misma versión, para que RIGE interprete la configuración como la herramienta. Se fijan las versiones exactas de las dependencias del producto y se instala con el archivo de bloqueo sin cambios (ADR-062). Se descarta reimplementar el evaluador porque la documentación describe un mecanismo incompleto (Anexo III, D-06). RIGE adopta la licencia MIT, con publicación tras la aprobación del TIF; el archivo de licencia del código y el aviso de atribución se incorporan antes de la etiqueta entregada (ADR-057).

La Tabla IX.6 declara los componentes incorporados al producto y los prerrequisitos de ejecución.

| **Componente** | **Versión** | **Licencia** | **Forma de incorporación** | **Motivo de la elección** |
|---|---|---|---|---|
| Evaluador de permisos de OpenCode (seis funciones) | Etiqueta 1.18.25 | MIT (OpenCode, 2026) | Copia atribuida, con licencia y avisos: cuerpo literal, firmas adaptadas, con la lista de cambios y los resúmenes SHA-256 | Coincidencia por construcción con la herramienta (IX.1) |
| Reglas y agentes nativos de OpenCode | Etiqueta 1.18.25 | MIT (OpenCode, 2026) | Transcriptos como datos | Reproducir los valores implícitos sin ejecutar la herramienta |
| `jsonc-parser` | 3.3.1 | MIT (Microsoft, s. f.-d) | Dependencia de ejecución del adaptador | El mismo analizador y versión que utiliza OpenCode |
| Bun (entorno de ejecución, SQLite, pruebas y servidor integrados) | 1.3.14 | MIT para el código propio; incluye JavaScriptCore bajo LGPL-2 (Oven, s. f.-a) | Prerrequisito de ejecución instalado por el usuario, fuera de la distribución de RIGE | El entorno de ejecución con que se compila la herramienta (IX.1) |
| SQLite, embebido en Bun | 3.53.0 (incluida en Bun 1.3.14; medida el 08/11/2026 en Windows; en Linux, sin medir) | Dominio público (Hipp, s. f.) | A través del módulo de SQLite de Bun | Almacén con esquema por guion en un motor real (IX.2) |

*Tabla IX.6. Componentes de terceros incorporados al producto, con versión, licencia, forma de incorporación y motivo. Fuente: elaboración propia sobre los archivos de licencia y el registro de fuentes.*

La Tabla IX.7 reúne los componentes de desarrollo y verificación, que quedan fuera de la distribución del producto.

| **Componente** | **Versión** | **Licencia** | **Uso y motivo de la elección** |
|---|---|---|---|
| TypeScript | 7.0.2 | Apache-2.0 (Microsoft, s. f.-b) | Verificación de tipos con la versión fijada (ADR-062). Escáner propio de las guardas de arquitectura, sin herramientas externas (ADR-070) |
| Tipos de Bun (`@types/bun` y `bun-types`) | 1.3.14 | MIT | Tipos del mismo entorno de ejecución fijado (ADR-062) |
| Tipos de Node.js (`@types/node`) y `undici-types` | 26.6.3 y 8.9.0 | MIT | Dependencias transitivas de los tipos de Bun, sin elección propia |
| Acciones del canal: checkout, setup-bun y setup-node | Versiones mayores 5, 2 y 5 | MIT (GitHub, s. f.-e; Oven, s. f.-b; GitHub, s. f.-f) | Canal de integración continua con las acciones oficiales del servicio y del entorno de ejecución adoptados (ADR-032, eje 4) |
| Node.js y OpenCode publicado | 22 y 1.18.25 | MIT (Node.js, s. f.-a; OpenCode, 2026) | Instalación de la herramienta real como referencia nativa del canal (ADR-102) |
| Imagen Ubuntu 26.04 | Fijada por resumen | Licencias de la distribución | Contenedor de referencia (IX.3). Base común del oráculo y las mediciones (ADR-054) |

*Tabla IX.7. Componentes de terceros de desarrollo y verificación, no distribuidos con el producto. Fuente: elaboración propia sobre el archivo de bloqueo y el registro de fuentes.*

El canal usa versiones mayores de las acciones y Node.js 22 sin fijar el número menor, porque son herramientas del canal; las dependencias del producto fijan versiones exactas. La versión 24.21.0 de Node.js es la alternativa de la matriz (IX.1); la 22 solo instala OpenCode publicado en el canal y la 26.6.3 corresponde a tipos transitivos. Los costos y las versiones de Docker Desktop y WSL se tratan en X.4.

MIT, Apache-2.0 y el dominio público son compatibles con la licencia MIT adoptada para RIGE (OpenCode, 2026; Microsoft, s. f.-b; Hipp, s. f.). La copia del evaluador conserva su licencia y el aviso de copyright: cuerpo literal, firmas adaptadas, con la lista de cambios y los resúmenes SHA-256. El componente LGPL-2 de Bun permanece separado de RIGE (Oven, s. f.-a). Las licencias de los componentes incorporados admiten distribuir RIGE sin exigir la publicación de su código.

El inventario de componentes corresponde al 08/11/2026 y se vuelve a verificar sobre la etiqueta entregada (registro de la evidencia, Anexo I, A.I.11).
