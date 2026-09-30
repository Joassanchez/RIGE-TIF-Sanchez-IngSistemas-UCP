# Prompt de contexto · v1 · Incremento 0 · Esqueleto que camina

- **Fecha:** 29/09/2026
- **Destino:** OpenCode 1.18.x con gentle-ai 3.7, agente `gentle-orchestrator`, abierto en `src/`
- **Método:** ADR-065, regla 3 (primer paso: el agente propone su documento ODD y se detiene)
- **Plan de referencia:** `00-gestion/revisiones/20260929_inc0-base-contexto.md`
- **Decisiones del autor (29/09/2026):** pasar el plan como referencia con una sección de diferencias obligatoria; RDD desactivado para este clon durante el incremento 0

## Antes de pegar el prompt (lo hace el autor)

1. Desactivar RDD solo para este clon. Sin `--scope`, el comando escribe la preferencia **global**:

   ```bash
   gentle-ai review mode disable --scope clone --cwd "C:/Users/Joa/Documents/RIGE-TIF-Sanchez-IngSistemas-UCP"
   gentle-ai review mode status --cwd "C:/Users/Joa/Documents/RIGE-TIF-Sanchez-IngSistemas-UCP"
   ```

   Resultado esperado: `receipt-driven development: off`, con `clone-local: off`.

2. Abrir OpenCode dentro de `src/` (`cd src` y `opencode`) y confirmar con Tab que el agente activo es `gentle-orchestrator`.
3. Pegar el bloque siguiente como **primer mensaje**, sin cambios.

## Resguardos que motivan el texto

Cada uno sale de la lectura del prompt del orquestador (`~/.config/opencode/opencode.json`, sección «Implementation Routing») y del `AGENTS.md` global de gentle-ai, hecha el 29/09/2026:

| Comportamiento por defecto de gentle-ai | Conflicto | Resguardo en el prompt |
|---|---|---|
| Crea el documento ODD e implementa acto seguido, sin pedir permiso | ADR-065, regla 3: detenerse después del documento | Autorización limitada al documento, y detención explícita |
| Inicializa CodeGraph en la raíz de git (la del repositorio) sin preguntar | `src/AGENTS.md` §7: no se escribe fuera de `src/`; `.codegraph/` no está en `.gitignore` | Prohibición de inicializar CodeGraph en este incremento |
| Escribe los artefactos en inglés | `src/AGENTS.md` fija español | Idioma del documento y del código, explícito |
| Si prevé más de ~400 líneas, pregunta por una cadena de PR | El autor une con `main`; sin PR | Estrategia de entrega fijada |
| Registra la ruta de cada tarea, no el modelo | ADR-065, regla 9; AR-11 y AR-14 | Columna de agente y modelo por tarea |
| El modo TDD se toma de la configuración o de una indicación explícita | Evitar `sdd-init` | Modo, fuente y ejecutor declarados |

---

## Prompt (pegar desde aquí)

```text
Incremento 0 de RIGE: «esqueleto que camina». Este mensaje autoriza UNA sola escritura: el documento ODD del incremento. NO autoriza escribir código, pruebas, configuración ni ningún otro archivo, ni crear ramas o commits. Cuando el documento esté escrito, detenete y esperá mi revisión. La implementación la autorizo en un mensaje posterior.

## 0. Antes de explorar
Listá los archivos de instrucciones que cargaste en esta sesión (AGENTS.md del proyecto y globales). Dentro de src/ prevalece src/AGENTS.md sobre las instrucciones globales: leelo completo antes de seguir.

## 1. Qué tenés que producir
El documento src/odd/tasks/inc0-esqueleto.md (y su copia en Engram, tópico odd/inc0-esqueleto/tasks), con la estructura habitual de ODD: objetivo, problema, por qué, alcance, restricciones, lista de tareas con ID estables (T0-01, T0-02, …), alcance autorizado, criterios de aceptación, verificaciones aplicables, progreso, evidencia y siguiente paso. Todo en español neutro y profesional.

Agregá dos secciones más:
- «Diferencias con el plan de referencia»: cada punto en el que tu documento se aparte del plan (sección 3), con su fundamento (ruta del ADR, de la ficha o de la documentación consultada). Si no hay diferencias en un punto, no lo menciones.
- «Dudas para el autor»: lo que no se resuelve con las fuentes. No elijas en silencio.

## 2. Objetivo del incremento
Que un tercero, en una máquina limpia con Ubuntu o Windows, pueda instalar RIGE, crear el esquema del almacén y arrancar el servidor siguiendo solo los comandos del README, y que el CI lo acredite en las dos plataformas. No hay lógica de resolución: la web responde una página fija.

## 3. Fuentes (rutas relativas a src/)
- Plan de referencia, redactado por el sistema de agentes del TIF: ../00-gestion/revisiones/20260929_inc0-base-contexto.md. Es una propuesta, no una orden: verificá cada punto contra los ADR y las fichas; si algo está mal o sobra, decilo en «Diferencias».
- ADR (en ../00-gestion/decisiones/): ADR-032 (stack), ADR-054 (plataformas), ADR-058 (arquitectura, paquetes, errores), ADR-061 (almacén y esquema), ADR-062 (scripts, dependencias, rige.env, versionado, arnés de pruebas, seguridad de la web), ADR-065 (método).
- Fichas: ../03-requisitos/libro/catalogo/RNF-03.md, RNF-05.md y RNF-09.md.
- Guía de comprobación de la cátedra: ../catedra/AE2-guia-comprobacion-v1.md (pasos 4 a 7 y §5).
- CI existente, que no se toca: ../.github/workflows/ci.yml.

## 4. Método
- TDD: estricto. Fuente: src/AGENTS.md §7 y ADR-065. Ejecutor: bun test. No ejecutes sdd-init ni uses el ciclo SDD ni openspec/.
- Rama: inc0-esqueleto, creada desde main recién cuando autorice la implementación. Un commit por tarea, Conventional Commits.
- Entrega: una sola rama, sin pull requests. Nunca subir, unir con main ni crear etiquetas; eso lo hago yo después de la revisión. Si el pronóstico supera las ~400 líneas, anotalo en el documento y no preguntes por estrategia de cadena.
- Declaración de herramientas: en la tabla de evidencia, por cada tarea, registrá la ruta (inline o delegada), el agente que la ejecutó y su modelo (según ~/.config/opencode/opencode.json, sin leer otra cosa de esa carpeta).

## 5. Restricciones
- No se escribe fuera de src/. En este incremento no inicialices CodeGraph (crearía .codegraph/ en la raíz del repositorio); usá las herramientas de archivos.
- No crees opencode.json, opencode.jsonc ni .opencode/ en ninguna carpeta del repositorio.
- Sin dependencias fuera de las que fija ADR-062.
- Identificadores, carpetas y mensajes en español, sin tildes ni ñ en los identificadores (src/AGENTS.md).

## 6. Detenete y preguntá si
- una fuente contradice a otra o a este mensaje;
- el plan de referencia exige algo que un ADR no respalda;
- hace falta escribir fuera de src/ o agregar una dependencia.

Cuando termines, respondé con: la ruta del documento, la cantidad de tareas, el pronóstico de líneas y la lista de «Dudas para el autor». Después detenete.
```
