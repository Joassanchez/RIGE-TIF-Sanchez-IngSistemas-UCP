# ADR-103 — RF-09 también advierte cuando una declaración anula una protección nativa de confirmación (`ask`)

- Estado: aceptado (30/10/2026)
- Fecha: 30/10/2026
- Capítulos afectados: Cap. III (III.5, RF-09, y la regla RD-07 si se cita su forma); Anexo I (ficha de RF-09). Afecta el Libro de trabajo (`catalogo/RF-09.md`), `src/` (núcleo: `permisos/decidir.ts`) y el registro de cambios para la referente.
- Origen: propuesta de V2-01 («extender RF-09 y RD-07 a la protección nativa `ask` de `.env`»), sesión del 30/10/2026. Lo propuso el ingeniero y el autor lo aceptó en la misma sesión.

### Contexto

1. **[D] RF-09:** «RIGE advierte cuando una declaración del usuario desactiva una regla nativa de protección del agente». Su CA-1 es el caso de `plan`: la regla nativa deniega la edición y una declaración global la permite. Su motivo de prioridad es el efecto de seguridad más grave del AE1 (I.1.3): una línea de permiso amplio anula, sin advertencia, la restricción que define a un agente.
2. **[D] La protección nativa de `.env` en 1.18.25 es `ask`, no `deny`.** Los valores por defecto de todos los agentes incluyen `read: { "*": allow, "*.env": ask, "*.env.*": ask, "*.env.example": allow }` (`packages/opencode/src/agent/agent.ts:129-135`, tag verificado).
3. **[D] La implementación de v2** advierte solo cuando la nativa desplazada tiene el efecto más restrictivo (rango 0 del orden de efectos, `deny`) y la determinante declarada es más permisiva (`src/paquetes/nucleo/permisos/decidir.ts:28-30`, commit `d237d1f`, T2-16: «RF-09 limitado a `deny`», como el catálogo).
4. **[D] RF-07 CA-1** ya incluye la variante «`.env` con protección nativa» en el entorno de los hallazgos, y la línea de base midió la exposición de archivos como problema (ADR-098).

### Alternativas evaluadas

- **P-A:** mantener RF-09 limitado a `deny`.
- **P-B:** advertir siempre que la determinante declarada sea más permisiva que la última regla nativa desplazada, sea esta `deny` o `ask`.
- **P-C:** tratar el caso de `ask` como un tipo de hallazgo de RF-07, sin tocar RF-09.

### Análisis (trade-offs)

- **P-A** deja sin advertencia el caso más común: con un `"read": "allow"` del usuario, que es una línea habitual, el agente lee `.env` sin preguntar. Es el mismo mecanismo que justifica la prioridad de RF-09 (una línea amplia anula una protección sin aviso), con un efecto de exposición de credenciales.
- **P-B** reutiliza el cálculo vigente: solo cambia la comparación de «nativa con rango 0» a «rango de la nativa menor que el de la determinante», sobre el orden de efectos que ya aporta el adaptador. `deny` a `ask` también se advierte, porque debilita la protección. No hay advertencia cuando la nativa es `allow` o cuando la declaración repite el mismo efecto.
- **P-C** separa dos casos con la misma causa, en dos capacidades con salida distinta (la advertencia va en la decisión y el hallazgo en la vista de hallazgos), y obliga a explicar al tribunal por qué `deny` y `ask` se tratan distinto.

### Recomendación y fundamento

**P-B.** Una declaración que vuelve más permisiva una regla nativa de protección se advierte, sea la protección una denegación o una confirmación. Se mantiene la condición de que la determinante sea declarada y desplace a la última nativa coincidente.

**Cambios en el catálogo** (Libro de trabajo; con el registro R-12 para la referente):
- **Enunciado:** «RIGE advierte cuando una declaración del usuario desactiva o debilita una regla nativa de protección, de denegación o de confirmación».
- **CA-3 nuevo:** «Dado el agente `build` con la regla nativa de lectura `*.env` → `ask` y una declaración global del usuario `read` → `allow`, la consulta de lectura de `.env` informa la decisión «permitida» y advierte que la declaración debilita la protección nativa, con la regla nativa y la declaración que la anula, su archivo y su línea».
- CA-1 y CA-2 no cambian.

**Condición que la invalidaría:** que la advertencia aparezca en controles correctos del manifiesto (ADR-080) donde la declaración del usuario es la intención documentada, en una proporción que la vuelva ruido. En ese caso se limita a los patrones nativos con nombre de archivo (`*.env`, `*.env.*`), con un ADR de reemplazo.

### Decisión del autor

Aceptado por el autor el 30/10/2026, en la sesión del día, junto con las demás recomendaciones de la iteración 3 («te acepto todo»).

### Consecuencias

- **Libro de trabajo:** RF-09 con el enunciado y el CA-3 nuevos (30/10/2026); fila R-12 en `01-relevamiento/validacion/registro-cambios-referente.md`.
- **Informe (redactor):** III.5 y Anexo I con la ficha nueva de RF-09, en la propagación de la iteración 3.
- **`src/` (iteración 3):** la comparación de `decidir.ts` pasa de «nativa con rango 0» a «rango de la nativa menor que el de la determinante». El escenario de `.env` con `read: allow` lleva su referencia del binario: decisión nativa «permitida» sin preguntar.

### Evidencia

- Código del tag `v1.18.25` (tarball verificado, SHA-256 `44e9530d…`): `packages/opencode/src/agent/agent.ts:129-135`.
- `src/paquetes/nucleo/permisos/decidir.ts:28-36` en la rama `v2-permisos` (`3ae11e1`).
