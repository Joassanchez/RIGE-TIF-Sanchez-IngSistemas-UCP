## I.5 · Descripción breve del Sistema de Información

RIGE es una plataforma local de solo lectura para el desarrollador que configura OpenCode 1.18.25 y los agentes que consultan esa configuración por encargo suyo. La configuración se distribuye entre archivos, variables de entorno y reglas y elementos nativos de la herramienta (apartado I.1.1). Hoy el estado efectivo se deduce a mano o se delega su consulta en un agente (apartado I.3).

La plataforma corre en el equipo del desarrollador y lee la configuración existente sin modificarla. Para cada valor informa qué rige, su procedencia y qué declaraciones quedan desplazadas. Ante una acción concreta, indica si el agente puede realizarla, debe pedir confirmación o la tiene prohibida, y qué regla determina esa decisión. Detecta defectos de configuración con su localización y explica sus causas. Un elemento se identifica como sin uso cuando ninguna declaración de un agente ni de un comando lo nombra.

El desarrollador y el agente obtienen las respuestas desde la terminal, mediante comandos de solo lectura con salida estructurada. La interfaz web local ofrece al desarrollador formularios y vistas de consulta sobre las mismas respuestas (apartado I.6.2). El agente consulta la configuración antes de operar y, después de modificarla, verifica la decisión resultante y los hallazgos antes de dar el cambio por hecho.
