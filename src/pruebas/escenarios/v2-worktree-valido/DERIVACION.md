# Decisiones derivadas a mano

Los casos de `decisiones` transcriben RF-02 CA-9 y ADR-088. Se contrastan
con las cadenas de `opencode debug agent <agente>` registradas en esta
referencia. No se ejecuto vendor ni permisos.evaluar para producirlos.
Las herramientas read consultan read; edit, write y apply_patch consultan edit.
El recurso se hace relativo al worktree. Fuera del directorio del proyecto
y del worktree no se toma decision. Sin VCS, el worktree / no amplia el arbol.
Las reglas se recorren en el orden capturado; prevalece la ultima coincidente.
Los patrones de env conservan las excepciones posteriores, y los patrones
absolutos se interpretan sobre el recurso relativo, como declara ADR-088.

Las capturas historicas `captura-binario-20261014.txt` fueron manuales y no
son reproducidas por el arnes actual. `decisionesNativas`, si esta presente,
conserva por separado los comandos y resultados reproducibles de T2-14.
