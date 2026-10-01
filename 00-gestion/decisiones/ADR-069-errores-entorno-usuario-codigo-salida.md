# ADR-069 — Errores del entorno del usuario: error de uso (código 1) cuando RIGE puede detectarlos antes de operar

- Estado: aceptado (01/10/2026)
- Fecha: 30/09/2026
- Capítulos afectados: ninguno del cuerpo del AE2. Precisa el contrato de salida de la CLI (ADR-058) y los códigos estables de ADR-066. Afecta `src/paquetes/rige/adaptadores/` y `src/pruebas/aceptacion/arranque.test.ts` (regla A-4 de la ficha T0-11a)
- Origen: revisión del incremento 0 (`/revisar-codigo incremento inc0-esqueleto`, 30/09/2026), punto 12 de `critico-codigo`

### Contexto

ADR-058 separa el error de uso (código 1, «JSON de error con código estable») de la falla interna (código 70, defecto o infraestructura). ADR-066 asignó `configuracion-invalida` a «variable no admitida o valor inválido». Ninguno dice qué hacer cuando el valor tiene formato válido pero **el entorno no lo admite**. Dato del repositorio: con `RIGE_ALMACEN` apuntando a un **archivo** regular, `bun run esquema` termina con 70 (`interno`). La regla A-4 de T0-11a lo fija así, y la usa como el caso de prueba de la falla interna. Es un error que el usuario corrige cambiando una variable, igual que un puerto ocupado (ADR-066, `puerto-ocupado`, código 1).

### Alternativas evaluadas

- **E-A:** se mantiene: todo lo que lanza una excepción del sistema operativo es 70.
- **E-B:** los errores del entorno que RIGE puede **detectar antes de operar** se informan como `configuracion-invalida` (código 1), con un mensaje que nombra la variable. Por ejemplo: `RIGE_ALMACEN` existe y no es un directorio, o no se puede crear su directorio padre por un componente que es un archivo. Lo que ocurre durante la operación (permisos, disco lleno, base corrupta) sigue siendo 70.
- **E-C:** un código estable nuevo, `entorno-invalido`, de error de uso.

### Análisis (trade-offs)

- **E-A** contradice el propósito del contrato: un agente que consume la CLI lee 70 como «defecto de RIGE», cuando el arreglo es del usuario. El tribunal puede preguntarlo y no hay respuesta.
- **E-B** usa el código que ya existe para «valor inválido». Cuesta una comprobación explícita en el adaptador de sistema (lectura con `statSync`, admitida por la regla de solo lectura) y cambiar el caso de prueba de la falla interna. Para ese caso queda la base corrupta, que es una falla real y ya está probada en T0-09.
- **E-C** agrega un código sin diferencia práctica con `configuracion-invalida` para quien lo consume.

### Recomendación y fundamento

**E-B.** Criterio de clasificación que se agrega al contrato de salida:
- **Código 1:** el usuario puede corregirlo cambiando una variable y RIGE lo detecta antes de operar.
- **Código 70:** todo lo demás.

`RIGE_ALMACEN` que existe y no es un directorio pasa a ser `configuracion-invalida`, con un mensaje que nombra `RIGE_ALMACEN`. El caso de prueba de la falla interna (A-4) pasa a una base `rige.db` con contenido que no es SQLite.

**Condición que invalidaría la recomendación:** que la comprobación previa no pueda hacerse sin escribir, lo que violaría la regla de solo lectura del adaptador de sistema; o que el esquema de salida de la iteración 2 fije otra categoría.

### Decisión del autor

Aceptado por el autor el 01/10/2026 (`/aceptar ADR-069`), con la recomendación E-B completa. Se programa como ficha al comienzo del incremento 1 o como corrección del incremento 0.

### Consecuencias

- Ficha nueva (después de la aceptación): comprobación en `adaptadores/sistema/configuracion.ts` y nueva redacción de A-4.
- `src/README.md` §6: sin cambios, porque ya lista `configuracion-invalida`.
- `src/AGENTS.md` §5 (lo edita el autor): agregar el criterio de clasificación debajo de la tabla del contrato.

### Evidencia

- `src/pruebas/aceptacion/arranque.test.ts`, A-4 (archivo regular → 70), commit `f173541`.
- ADR-058, contrato de salida; ADR-066, punto 1.
- Informe de `critico-codigo` del 30/09/2026 (en el chat; ADR-067: las revisiones de código no se archivan).
