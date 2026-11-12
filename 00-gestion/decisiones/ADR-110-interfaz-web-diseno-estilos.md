# ADR-110 — Diseño visual y de uso de la interfaz web local

- Estado: propuesto
- Fecha: 09/11/2026
- Capítulos afectados: IX (IX.1 y IX.3, interfaz), XIII (inventario), manual de despliegue §6 y §8
- Origen: sesión del 09/11/2026. El autor, al recorrer la interfaz en Docker, la juzgó impresentable y pidió mejorar UI y UX; eligió tema claro y oscuro automático y alcance de UI y UX completo

### Contexto

La interfaz web de RIGE (`src/paquetes/rige/interfaces/web/`) entrega HTML sin ningún estilo: formularios y tablas con la apariencia por defecto del navegador. La CSP vigente, `default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`, impide cargar cualquier hoja de estilos. Las restricciones que siguen en pie son: sin JavaScript ejecutable en el cliente y solo GET local (RNF-09, ADR-061), sin red (RNF-05, que excluye fuentes o bibliotecas externas), los mismos datos en la CLI y en la web (RF-03 CA-4) y el JSON de la respuesta embebido como dato no ejecutable. La interfaz se usa en la demostración del coloquio y en la comprobación de la cátedra (guía 07, §2, paso 10).

### Alternativas evaluadas

- **E-A:** hoja de estilos propia servida por RIGE en `GET /estilos.css` y CSP con `style-src 'self'`.
- **E-B:** `<style>` en línea autorizado por su resumen (`style-src 'sha256-…'`).
- **E-C:** `style-src 'unsafe-inline'`, con estilos en línea en cada página.
- **E-D:** conservar el HTML sin estilos.

### Análisis (trade-offs)

- **E-A** mantiene la CSP estricta: solo se agrega el origen propio para estilos, sin ejecutar nada. Una ruta GET más, con las mismas cabeceras de seguridad. El navegador la guarda en caché.
- **E-B** también es estricta, pero obliga a recalcular el resumen ante cada cambio del CSS y repite la hoja en cada respuesta.
- **E-C** debilita la CSP sin necesidad.
- **E-D** deja una interfaz que el propio autor juzga impresentable para la demostración y la comprobación.

El diseño se resuelve sin JavaScript: `<details>` para el detalle técnico plegable, `prefers-color-scheme` para el tema y tipografías del sistema.

### Recomendación y fundamento

**E-A**, con:

- un diseño común (encabezado con marca, versión y navegación, contenido y pie con almacén, esquema y la leyenda «local · solo lectura · sin red»);
- tema claro y oscuro automático;
- insignias de color por decisión y por tipo de hallazgo;
- el dato principal antes que el detalle;
- detalle técnico plegable, estados vacíos y páginas de error legibles;
- contraste AA y foco visible.

No cambian los datos, los contratos JSON, el JSON embebido ni la CLI.

**Condición que la invalidaría:** que la ruta de estilos o el cambio de CSP abran una vía de ejecución o de acceso desde otro origen (RNF-09 CA-1 a CA-3), o que el cambio altere la paridad con la CLI (RF-03 CA-4) o la medición final. En ese caso se vuelve a la CSP anterior.

### Decisión del autor

[Pendiente: aceptar o rechazar. El autor eligió el 09/11/2026 la dirección visual y el alcance, y delegó en el ingeniero la decisión técnica E-A.]

### Consecuencias

- **`src/`:** ficha T5-08. La CSP de `respuesta.ts` agrega `style-src 'self'`, y se actualizan las pruebas que la fijan (`respuesta.test.ts`, `recorrido-v1.test.ts`). Se agregan la ruta `/estilos.css` y un diseño común en las páginas.
- **Etiqueta:** el cambio entra antes de `v1.0.0`. La medición final no usa la web (los brazos consultan por CLI), por lo que su preregistro no cambia.
- **Informe:** IX.3 y el inventario del Cap. XIII mencionan la hoja de estilos propia; el manual (§6) describe la pantalla de inicio nueva.

### Evidencia

`src/paquetes/rige/interfaces/web/respuesta.ts:17` (CSP vigente); `paginas/inicio.ts` (HTML sin estilos); recorrido del autor en Docker del 09/11/2026.
