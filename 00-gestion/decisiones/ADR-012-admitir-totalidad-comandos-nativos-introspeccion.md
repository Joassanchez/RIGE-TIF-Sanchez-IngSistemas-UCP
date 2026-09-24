# ADR-012 — Admitir la totalidad de los comandos nativos de introspección

- Estado: aceptado (retroactivo)
- Código en el Anexo III: D-12
- Fecha: AE1 (entregada el 03/09/2026)
- Capítulos afectados: apartado II.2.1
- Origen: Anexo III del informe de la AE1, A.III.1 y A.III.2

### Contexto
Decisión adoptada durante la elaboración del apartado II.2.1 del informe de la AE1.

### Alternativas evaluadas
- **Adoptada:** Admitir la totalidad de los comandos nativos de introspección.
- **Descartada:** Prohibirlos durante la medición.

### Análisis (trade-offs)
La decisión cambia respecto del diseño inicial, que prohibía los comandos nativos de introspección. Dos razones motivan el cambio. La primera es de validez: prohibir una función propia de la herramienta produce un escenario que no corresponde al procedimiento manual vigente, y la línea de base así obtenida sobrestimaría el problema. La segunda es de equidad entre participantes: varios de esos comandos no figuran en la documentación de la versión y se descubren consultando la ayuda, de modo que la restricción habría dejado librada al azar una ventaja considerable. La mitigación consiste en construir los casos de modo que ningún comando nativo entregue a la vez el valor y su procedencia, condición que se verifica caso por caso antes de la primera sesión. Consecuencia asumida: la línea de base resulta más exigente y la mejora que la plataforma deba demostrar es mayor.

### Recomendación y fundamento
Impedir el uso de una función propia de la herramienta vuelve el escenario artificial e indefendible; los casos se construyen, en cambio, de modo que ninguno entregue la respuesta completa

### Decisión del autor
Admitir la totalidad de los comandos nativos de introspección.

### Consecuencias
Se refleja en el apartado II.2.1.

### Evidencia
Ver apartado II.2.1 y Anexo III.
