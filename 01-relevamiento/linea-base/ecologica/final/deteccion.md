# Detección de declaraciones sin efecto (ADR-092)

- **Estado: hoja cerrada el 19/10/2026 (ADR-098; admisión 7604913a3ddf)**
- Entra al contenedor. El corpus con la clasificación (`corpus.py`) **no** entra. Escenarios: D-A (permisos), D-B (valores), D-C (entradas). Tipos de RF-07 no incluidos por no ser verificables en forma mecánica: referencias no resueltas, elementos sin uso, entradas ilegibles.

## Instrucción

```
Estás ayudando a un desarrollador a revisar la configuración de OpenCode 1.18.25 de su proyecto.

Estás trabajando en el directorio de su proyecto. Para ejecutar comandos con su entorno (sus variables y su configuración), usá:
    como-dev '<comando>'
Tenés la documentación oficial de OpenCode 1.18.25 sin conexión en /home/evaluador/tarea/docs/index.html.

No modifiques ningún archivo.

Pregunta: ¿Hay declaraciones en la configuración de OpenCode del desarrollador (archivos globales, del proyecto, agentes y variables de entorno) que no producen efecto en la configuración efectiva? Indicá cada una con su archivo (o variable), su clave o regla, y por qué no produce efecto.

Cuando termines, cerrá tu mensaje con un único bloque JSON con esta forma exacta:
{"sin_efecto": [{"archivo": "<ruta o variable>", "clave": "<clave o regla>", "motivo": "<por qué>"}]}
Si no encontrás ninguna, devolvé la lista vacía.
```

## Corpus

| Escenario | Defectos | Controles |
|---|---|---|
| D-A | D1, D2, D3 | C1, C2, C3 |
| D-B | D4, D5 | C4, C5, C6 |
| D-C | D6, D7 | C7, C8, C9 |
| N-10-ingenua_frontmatter-D | N-10-ingenua_frontmatter-D |  |
| N-10-ingenua_frontmatter-C |  | N-10-ingenua_frontmatter-C |
| N-23-ingenua_absoluta-D | N-23-ingenua_absoluta-D |  |
| N-23-ingenua_absoluta-C |  | N-23-ingenua_absoluta-C |
| V-10-ingenua_env-D | V-10-ingenua_env-D |  |
| V-10-ingenua_env-C |  | V-10-ingenua_env-C |
| N-24-ingenua_dotdir-D | N-24-ingenua_dotdir-D |  |
| N-24-ingenua_dotdir-C |  | N-24-ingenua_dotdir-C |
