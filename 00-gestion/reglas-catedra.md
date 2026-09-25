# Reglas de la cátedra

Reglas transversales que aplican el redactor y controlan los revisores. Fuente: diseño del sistema, sección 11. Se actualizan cuando la cátedra publica una consigna nueva o el docente aclara algo (sección 4).

## 1. Redacción

- Impersonal, verbos en presente y en afirmativo (Art. 21.º).
- Sin desarrollos teóricos ni discusiones ajenas al proyecto; las alternativas propias se consignan en forma sintética, con la deliberación en el Anexo III.
- Sin errores de Ortografía y redacción.
- Criterio de formato uniforme.

## 2. Contenido transversal

- Problema con **cinco componentes** y **línea de base numérica**; criterio de éxito derivado de ella.
- **Tres preguntas** junto a todo dato estadístico.
- **Implicancia decisoria** en cada elemento de análisis.
- Separación entre **sector del problema** y **sector de los recursos**.
- Contactos con **persona, canal y motivo**.
- Cifras solo si existen en el repositorio; citas solo de fuentes registradas.

## 3. Formato (Arts. 20.º y 21.º)

| Aspecto | Exigencia |
|---------|-----------|
| Hoja | A4 |
| Márgenes | Superior e inferior 2,5 cm · izquierdo y derecho 3 cm |
| Interlineado | Doble |
| Tipografía | Times New Roman: cuerpo 12, justificado; notas y citas al pie 10; títulos, encabezado y pie a elección; texto en negro |
| Tablas e instrumentos | Calibri 9,5, interlineado simple (formato de la plantilla) |
| Carátulas | Cada capítulo en hoja aparte, numeral romano y título en mayúsculas, centrados; el texto empieza en la hoja siguiente sin repetir el título |
| Numeración | Correlativa; los anexos aparte, «página X de Y» |
| Láminas | Dentro del capítulo, numeradas como una página; normas IRAM |
| Unidades | SIMELA (Ley N.º 19.511) y recomendaciones del SI |
| Bibliografía | APA, con todas las fuentes citadas |
| Resumen | Máximo 600 palabras (Art. 22.2) |
| Nombre de archivo | `AAAAMMDD_InformeAEn_Equipo_vN` |

## 4. Aclaraciones del docente

Prevalecen sobre guías y plantillas en el punto aclarado. Los agentes las aplican sin volver a discutirlas.

| Tema | Aclaración |
|------|-----------|
| Extensión | La cantidad de páginas es libre, a criterio del autor. La extensión orientativa de guías y plantillas no se controla ni se objeta. |

## 5. Observaciones del AE1 que no deben reaparecer

Su reiteración se pondera negativamente en la dimensión 6:
- hoja carta en lugar de A4;
- capítulos sin la estructura de apartados de la plantilla;
- marcadores residuales de asistentes generativos (control manual del autor);
- campos de identificación sin completar;
- datos de identidad con valores distintos entre documentos (se previene con `datos-autor.yaml`);
- nombres de archivo ajenos a la nomenclatura.

## 6. Valores permitidos del Libro de trabajo

| Campo | Valores |
|-------|---------|
| Catálogo · Tipo | Funcional · No funcional |
| Catálogo · Categoría (no funcional) | Rendimiento · Fiabilidad · Seguridad · Usabilidad · Mantenibilidad · Portabilidad · Cumplimiento normativo |
| Catálogo · Prioridad | Must · Should · Could · Won't |
| Catálogo · Estado de validación | Validado · Pendiente · Rechazado por el referente |
| Catálogo · ¿Integra el MVP? | Sí · No |
| Entidades · Reclasificación | Entidad · Atributo de otra entidad · Rol de una entidad · Producto del sistema · Elemento del entorno |
| Reglas · Tipo | Restricción · Derivación · Existencia |
| Reglas · Estado | Validada · Pendiente · En disputa |
| Recursos · Tipo | Humanos · Físicos y materiales · Financieros · Tecnológicos · Otros |

Campos de cada ficha del catálogo: ID · Enunciado · Tipo · Categoría · Prioridad · Motivo de la prioridad · Criterio de aceptación (condición, acción, resultado con valores) · Trazabilidad (H-xx o acta) · Estado de validación · Iteración prevista · ¿Integra el MVP?

Un requisito sin criterio de aceptación comprobable no se computa.

## 7. Prototipo v1 (Guía de comprobación)

- `README.md` con ocho secciones: identificación · qué hace el prototipo · requisitos previos con versiones exactas · instalación · configuración · ejecución y verificación · estado del canal de construcción · declaración de herramientas auxiliares (herramienta, función y artefacto afectado).
- Archivo de variables de ejemplo sin credenciales reales; esquema de base reproducible por guion o migración.
- Caso de uso vertical de interfaz a persistencia y retorno, con una regla de negocio validada.
- CI en `.github/workflows/ci.yml`: instala, construye y ejecuta al menos una prueba ligada a un criterio de aceptación; al menos una corrida exitosa con fecha anterior o igual a la entrega.
- Etiqueta `v1` anotada y publicada; correcciones posteriores como `v1.1`, sin mover la publicada.

## 8. Ubicación de artefactos

Los scripts de `tools/` no fijan destinos: el agente elige la carpeta con esta tabla y la pasa con `--destino`. Cuando una consigna nueva exige otro artefacto, se agrega aquí su fila con la cita correspondiente.

| Artefacto | Fuente en el repositorio | Destino del generado | Tipo (nombre de archivo) | Consigna |
|---|---|---|---|---|
| Informe de la AE | `informe/` | `05-entregas/` | `InformeAEn` | Guía AE2, 10.2 |
| Libro de trabajo | `03-requisitos/libro/` + Instrumento 34 | `03-requisitos/` | `CatalogoRequisitos` | Guía AE2, 10.2 |
| Instrumento 32 · Lienzo | `instrumentos/instrumento-32-lienzo.md` | `02-analisis/` | `Instrumento32` | Cuadernillo AE2, recuadro inicial (`catedra/AE2-plantilla-instrumentos.md`) |
| Instrumento 33 · Rivalidad | `instrumentos/instrumento-33-rivalidad.md` | `02-analisis/` | `Instrumento33` | Cuadernillo AE2, recuadro inicial (`catedra/AE2-plantilla-instrumentos.md`) |
| Instrumento 34 · Recursos | `instrumentos/instrumento-34-recursos.md` | `03-requisitos/` | `Instrumento34` | Cuadernillo AE2, recuadro inicial (`catedra/AE2-plantilla-instrumentos.md`) |
| Instrumento 35 · Ficha del v1 | `instrumentos/instrumento-35-ficha-v1.md` | `src/` | `Instrumento35` | Cuadernillo AE2, recuadro inicial (`catedra/AE2-plantilla-instrumentos.md`) |

Nomenclatura: `AAAAMMDD_TipoDocumento_Equipo_vN.ext` (Guía AE2, 10.2). Los scripts la aplican y nunca sobrescriben un archivo existente.
