# ADR-082 — Línea de base con `gpt-6.1-sol` como único modelo disponible: k = 3 fijado antes de medir, sin piloto, Charles con `gpt-6.1-sol`, catálogo de modelos congelado y P3 como tanda opcional posterior

- Estado: aceptado (13/10/2026)
- Fecha: 13/10/2026
- Capítulos afectados: Cap. I (I.3, diseño de la línea de base); Cap. II (II.2, II.3: ejecutores y modelos); Cap. V (V.2, medición); Anexo VI (A.VI.7, A.VI.8); Anexo III (D-41); diseño de la medición (`01-relevamiento/linea-base/DISENO-medicion-agentes.md` §3.3, §8 y §9; `vm/medir.sh`)
- Origen: fase 0 con el proveedor real (13/10/2026, `01-relevamiento/linea-base/verificacion/20261013-fase0/`) y decisiones del autor en la sesión del 13/10/2026 (k = 3; primero dos tandas; P3 solo con su aprobación; sin piloto; catálogo congelado)
- Modifica: ADR-079 (§4 estabilidad y k; §7 modelos de los ejecutores); ADR-076 (modelos secundarios, condición 3)
- Relacionado: ADR-053, ADR-054 (contenedor), ADR-078

### Contexto

Datos de la fase 0 (`verificacion/20261013-fase0/LEEME.md`):

1. Con la suscripción ChatGPT Plus, OpenCode 1.18.25 ofrece 17 modelos `openai/*`. El único `gpt-6` es **`gpt-6.1-sol`** (con sus variantes de velocidad `-fast` y `-ultrafast`).
2. **`gpt-6-astra` y `gpt-6-luna` no están disponibles:** `ProviderModelNotFoundError: Model not found: openai/gpt-6-luna. Did you mean: gpt-5.6-luna…`. Los dos figuran en models.dev, pero OpenCode no los ofrece para la suscripción. ADR-076 anticipaba el riesgo solo para `gpt-6-astra`.
3. **Charles queda sin su modelo:** la referente lo configura con `gpt-6-luna`.
4. **El catálogo incluido en la 1.18.25 no conoce ningún `gpt-6`.** La imagen desactiva la descarga de modelos (`OPENCODE_DISABLE_MODELS_FETCH=1`), así que `gpt-6.1-sol` falla. Con el catálogo del 13/10/2026 en el caché del evaluador, la ejecución de práctica es correcta.
5. **Piloto:** según ADR-079, §4, consume 240 ejecuciones (24 × 10) para fijar k, más que las dos tandas de la línea de base juntas. La suscripción no publica límites garantizados: «los mensajes por ventana de cinco horas son estimaciones del proveedor» (`tarifas-congeladas-20261001.json`), y Codex comparte el cupo.

### Alternativas evaluadas

- **Eje K · Repeticiones:**
  - K-A: regla de k sobre el piloto (ADR-079, §4);
  - K-B: k = 3 fijado por el autor antes de medir, sin piloto;
  - K-C: k = 3 fijado, con un piloto solo descriptivo.
- **Eje M · Modelos no disponibles:**
  - M-A: sustituir `gpt-6-luna` por `gpt-5.6-luna` en `build` y en Charles;
  - M-B: un único modelo, `gpt-6.1-sol`, para los dos ejecutores; P3 declarada perdida;
  - M-C: M-B, más una tanda posterior `build` + `gpt-5.6-luna` (P3 hacia abajo), condicionada a la aprobación del autor.
- **Eje T · Catálogo de modelos:**
  - T-A: activar la descarga en vivo durante la medición;
  - T-B: congelar el catálogo del 13/10/2026 y registrar su hash en cada tanda.

### Análisis (trade-offs)

**Eje K**
- **K-A** fija k con evidencia de estabilidad, pero cuesta 240 ejecuciones de una cuota sin límite conocido.
- **K-B** fija k antes de conocer los datos, así que no es un ajuste con los datos a la vista. El costo es la pregunta de la crítica de I.2: «con k = 3, una sola ejecución decide un éxito». La respuesta pasa a ser la cuota declarada, más la tasa por caso informada sin binarizar (0/3 a 3/3), que deja ver la inestabilidad.
- **K-C** aporta estabilidad descriptiva, pero a un costo desproporcionado cuando k ya está fijo.

**Eje M**
- **M-A** conserva la estructura de tres tandas, pero:
  - mezcla una generación anterior con el nivel bajo;
  - exige una tarifa que no está congelada;
  - deja P3 con dos niveles de generaciones distintas.
- **M-B** no sustituye ningún modelo.
  - Compara Charles con `build` usando el mismo modelo, que es la lógica de ADR-079 («mide el efecto conjunto de la instrucción, los permisos y las ayudas»).
  - Mide con el modelo más capaz que ofrece la suscripción. Es el escenario más exigente para el proyecto: si `gpt-6.1-sol` se equivoca, el problema no se explica por falta de capacidad.
  - Costo: Charles corre con un modelo más capaz que el de la referente (se declara como cambio de la variante), y P3 queda sin responder.
- **M-C** recupera P3 hacia abajo sin comprometer la medición principal. Se corre al final, conforme al orden de recorte de ADR-079, condición 3. Hacia arriba no hay modelo disponible.

**Eje T**
- **T-A** puede cambiar el catálogo entre tandas, y la medición no se puede reproducir.
- **T-B** fija los identificadores y los límites de los modelos igual que las tarifas congeladas.

### Recomendación y fundamento

**K-B + M-C + T-B.**

1. **k = 3** para todos los ejecutores y modelos, fijado por el autor el 13/10/2026 antes de medir. **Sin piloto.** ADR-079, §4, deja de aplicarse: la regla de concordancia y el piloto de 24 × 10. Los casos inestables se identifican descriptivamente en la línea de base (tasa de 1/3 o 2/3) y se informan sin excluirlos. El umbral de la mitad no cambia.
2. **Línea de base en dos tandas, en este orden:**
   - `build` + `gpt-6.1-sol` (principal, sin recorte);
   - Charles + `gpt-6.1-sol`.

   Son 144 ejecuciones (24 × 3 × 2).
3. **Charles con `gpt-6.1-sol`.** El modelo se agrega a los cambios declarados de la variante (ADR-079, §7), con la causa: el modelo de la referente no está disponible con la suscripción en 1.18.25. Se conservan su instrucción, su temperatura (0,2) y su estructura de permisos. Su clave efectiva en OpenCode es `[AUX] Charles`.
4. **P3:**
   - `gpt-6-astra` se declara perdido, sin reemplazo (ADR-076): no hay un modelo más capaz en la suscripción;
   - `build` + `gpt-5.6-luna` es una tanda posterior y opcional. Se corre solo con la aprobación del autor y con una tarifa de lista de una fuente registrada, y se informa como «menor capacidad y generación anterior», sin decidir el cumplimiento;
   - sin esa tanda, P3 se declara no respondida, por causa externa.
5. **Catálogo de modelos congelado:** `01-relevamiento/linea-base/catalogo-modelos-20261013.json`, copiado del caché del anfitrión el 13/10/2026. Va al contenedor por `docker cp`, como las tarifas, y su hash se registra en `tanda.json`. La descarga sigue desactivada.
6. **Tokens** (resultado de la fase 0, sin cambio de fórmula):
   - `input` excluye la caché leída (verificado);
   - la suscripción informa `reasoning = 0`, así que no se puede verificar si `output` incluye el razonamiento. Se declara como limitación del registro;
   - `razonamiento_reportado` se conserva por solicitud.

**Condiciones que invalidarían la decisión:**
1. OpenCode o la suscripción vuelven a ofrecer `gpt-6-luna` antes de medir. En ese caso se reevalúa M-C frente al diseño original.
2. La cuota no alcanza para las dos tandas. Se aplica ADR-079, condición 3: primero se reduce k de Charles, y nunca el del principal.
3. El docente objeta k = 3 sin piloto (LB-01).

### Decisión del autor

**Aceptado por el autor el 13/10/2026.** En la misma sesión el autor fijó k = 3, las dos tandas (`build` y Charles con `gpt-6.1-sol`), P3 condicionada a su aprobación posterior, la supresión del piloto y el catálogo congelado del 13/10/2026.

### Consecuencias

**Si se acepta:**
- **ADR-079:** §4 se reemplaza por el punto 1 de este registro; §7 cambia en los modelos (`build`: `gpt-6.1-sol`; Charles: `gpt-6.1-sol`).
- **ADR-076:** los modelos secundarios pasan a la tanda opcional del punto 4.
- **Diseño de la medición:** §3.3 (modelos), §8 y §9 (sin piloto) y §11 (entregables); los armoniza el ingeniero.
- **Arnés:** ficha `MED-5` del escritor:
  - catálogo congelado;
  - preparación del participante antes del hash;
  - Charles como `[AUX] Charles` y con `gpt-6.1-sol`;
  - detención ante un límite de cuota persistente, con reanudación.
- **Informe:**
  - I.3 y V.2: una sola familia y un único modelo, sin piloto, k = 3;
  - II.2 y II.3: Charles con el modelo cambiado;
  - A.VI.7 y A.VI.8: las amenazas «dependencia del modelo» y «una sola familia», actualizadas.
- **Anexo III:** D-41 se actualiza.

### Evidencia

- `01-relevamiento/linea-base/verificacion/20261013-fase0/` (LEEME y tres pasadas)
- `01-relevamiento/linea-base/tarifas-congeladas-20261001.json` (`nota_limites`)
- `00-gestion/decisiones/ADR-079-criterio-principal-casos-con-problema.md` (§4, §7, §8) y `ADR-076-medicion-suscripcion-chatgpt-tokens.md`
