# Pendientes

Correcciones arrastradas y tareas abiertas. Formato: origen · sección · descripción · severidad. Se cierran tachándolas con la fecha, o eliminándolas en el commit que las resuelve.

## Urgentes — AE2 (entrega 01/10/2026, 23:59)

| # | Origen | Sección | Pendiente | Severidad |
|---|---|---|---|---|
| U-01 | Cap. V, Tabla 14 | `src/` | La iteración 1 cierra el 01/10 con el **prototipo v1 ejecutable**: caso de uso vertical, README de ocho secciones, CI con corrida exitosa y etiqueta `v1` publicada. `src/` está vacío. | bloqueante |
| U-02 | Plantilla AE2 | Cap. X | Redactar el **Capítulo X · Recursos del proyecto** y completar `03-requisitos/libro/recursos.md` (Instrumento 34). | bloqueante |
| U-03 | Cuadernillo de instrumentos | `02-analisis/` | Instrumentos 32 y 33 (lienzo y rivalidad) con plazo 24/09; Instrumento 34 con plazo 01/10; Instrumento 35 al cerrar la etiqueta `v1`. Hoy son plantillas vacías. | bloqueante |
| U-04 | Guía AE2, objeto 4 | Portafolio | Constancia de validación de requisitos (acta con fecha, participantes, observaciones y conformidad del referente). | bloqueante |
| U-05 | Guía AE2, objeto 3 | — | Enlace al tablero de gestión actualizado, organizado por la iteración del Cap. V. Completar `tablero` y `repositorio` en `informe/datos-autor.yaml`. | importante |

## Detectados en la migración (24/09/2026)

| # | Sección | Pendiente | Severidad |
|---|---|---|---|
| M-01 | Libro · RNF-08 | La categoría «Compatibilidad» no figura entre los valores permitidos de la cátedra (Rendimiento · Fiabilidad · Seguridad · Usabilidad · Mantenibilidad · Portabilidad · Cumplimiento normativo). Reclasificar o fundamentar. | importante |
| M-02 | Anexos | Numeración de anexos en conflicto: el AE1 usa Anexo I (datos relevados), II y III; el Cap. III usa Anexo I (catálogo) y V; el Cap. IV usa Anexo VI. Unificar la numeración del informe. | importante |
| M-03 | AE1 · II.6.1 y bibliografía | Asteriscos literales (`\*`) que en Word se ven como «*»: «\*Decisión que habilita:\*» y títulos de obras en la bibliografía. Pasarlos a cursiva real. | importante (formal) |
| M-04 | Bibliografía | La Ley N.º 27.506 figura con dos formatos distintos (AE1 y Cap. IV). Unificar. | menor |
| M-05 | Libro · catálogo | Falta el **estado de validación** de los 23 requisitos (campo obligatorio del Libro de trabajo). | importante |
| M-06 | Libro · catálogo | Los Should, Could y Won't figuran con iteración «Sin asignar» (no tienen horas en la Tabla 18). Confirmar si corresponde. | menor |
| M-07 | Citas | Las citas del texto están en forma literal. Convertirlas al formato `[@clave]` de `01-relevamiento/fuentes.md` y cargar `informe/referencias.bib`, para que la bibliografía se genere sola con las fuentes citadas. Hasta entonces se usa `informe/bibliografia.md`. | importante |
| M-08 | Registro de fuentes | Completar las tres preguntas de las 23 fuentes (hoy `[DATO PENDIENTE]`); correr el verificador de fuentes. | importante |
| M-09 | Cap. V · Figura 3 | El cronograma original estaba en página apaisada; en el armado se ajusta al ancho vertical. Revisar legibilidad. | menor |
| M-10 | Anexos I, V (Cap. III) | Las tablas de estos anexos duplican el Libro de trabajo. Definir si el armado las genera desde `03-requisitos/libro/`. | menor |
| M-11 | Armado | Numeración independiente de anexos («página X de Y») todavía no implementada en `tools/armar.py`. | importante (formal) |
| M-12 | ADR-023 | Caché por hash: pendiente la consulta al docente sobre la capa de persistencia. | menor |
| M-13 | Libro · reglas, glosario, entidades | Valores fuera de las listas de la cátedra detectados al exportar el libro: estado de regla «Verificada en ejecución» (permitidos: Validada · Pendiente · En disputa); «¿En disputa?» del glosario con texto en lugar de Sí/No; reclasificaciones de entidades con texto adicional («Atributo de Entrada, …»). Ajustar en `03-requisitos/libro/`. | importante |
| M-14 | `informe/datos-autor.yaml` | Confirmar el valor de «Equipo» para la nomenclatura de archivos (hoy «Sanchez»). | menor |

## Arrastrados de sesiones anteriores

| # | Sección | Pendiente |
|---|---|---|
| A-01 | AE1 | Propagar «entrada de configuración» (ADR-020), incluida la corrección «fuente ilegible» → «entrada ilegible». |
| A-02 | AE1 · I.5 e I.6.4 | Reflejar la interfaz de línea de comandos y el actor sistema externo. |
| A-03 | AE1 | Renumerar tablas para alinear con la AE2 y unificar los códigos de hallazgo entre documentos. |
| A-04 | Cap. III · RNF-06 y RNF-07 | Fijar plataformas (RNF-06) y tamaño del proyecto, equipo de referencia y tiempo máximo (RNF-07) antes del cierre de la iteración 1. |
| A-05 | Cap. III | Fechas del acta de validación (`[fecha]`). |
| A-06 | AE1 · A.I.5 | Transcripción de la entrevista, canal, fecha y duración (`[ ]`). |
| A-07 | Bitácora | Pegar en `00-gestion/bitacora.md` las entradas completas de la bitácora del AE1 y las de la AE2. |
