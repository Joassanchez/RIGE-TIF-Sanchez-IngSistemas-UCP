# ADR-017 — Incorporar una interfaz de línea de comandos de solo lectura, con salida estructurada

- Estado: aceptado (retroactivo)
- Código en el Anexo III: D-17
- Fecha: AE1 (entregada el 03/09/2026)
- Capítulos afectados: apartado I.6.5
- Origen: Anexo III del informe de la AE1, A.III.1 y A.III.2

### Contexto
Decisión adoptada durante la elaboración del apartado I.6.5 del informe de la AE1.

### Alternativas evaluadas
- **Adoptada:** Incorporar una interfaz de línea de comandos de solo lectura, con salida estructurada.
- **Descartada:** Mantener la aplicación de escritorio como única interfaz, o incorporar además una biblioteca de integración.

### Análisis (trade-offs)
La decisión amplía el alcance declarado en la propuesta inicial y se funda en una necesidad relevada, no en una hipótesis del autor. El equipo consultado ya interroga la configuración de su propio entorno por vía programática, recurriendo a un agente de permisos elevados, práctica que consume tokens facturables y que no garantiza la exactitud del resultado, dado que el agente infiere en lugar de resolver. Se consideran tres opciones. La primera, no hacer nada y conservar la aplicación de escritorio como única interfaz, se descarta porque dejaría sin atender a un consumidor de la información que el relevamiento acredita existente y que hoy resuelve su necesidad de manera costosa e inexacta. La segunda, exponer una biblioteca de integración o un kit de desarrollo, se descarta para esta etapa porque comprometería una superficie de integración estable y un compromiso de compatibilidad que el plazo y la dotación del proyecto no admiten; queda como capacidad diferida. La tercera, un comando de solo lectura con salida estructurada, se adopta porque cubre el caso relevado con el menor compromiso de diseño y porque expone las mismas resoluciones que ya producen las funciones F2 y F4, de modo que no exige un objetivo específico propio ni un modelo separado. Consecuencias asumidas: la superficie de verificación se amplía, dado que los indicadores de OE-1 y OE-2 deben comprobar que ambas interfaces informan el mismo resultado; y el riesgo principal declarado en el apartado I.3.5 se agrava, porque una salida errónea consumida por otro agente carece de revisión humana intermedia.

### Recomendación y fundamento
La práctica relevada muestra un consumidor no humano ya existente; la biblioteca exigiría un compromiso de compatibilidad ajeno al alcance de esta etapa

### Decisión del autor
Incorporar una interfaz de línea de comandos de solo lectura, con salida estructurada.

### Consecuencias
Se refleja en el apartado I.6.5.

### Evidencia
Ver apartado I.6.5 y Anexo III.
