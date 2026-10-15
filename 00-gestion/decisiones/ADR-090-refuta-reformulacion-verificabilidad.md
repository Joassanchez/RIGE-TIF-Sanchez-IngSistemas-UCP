# ADR-090 — Aplicación de «Refuta» (IV.3, Tabla 10) y reformulación del problema hacia la verificabilidad del efecto de la configuración

- Estado: aceptado (14/10/2026)
- Fecha: 14/10/2026
- **Decidido después de conocer los resultados** de la línea de base de atribución, de modificación, de las sondas y de P3. Lo que se aplica (la consecuencia de «Refuta») estaba fijado antes de medir.
- Capítulos afectados: Cap. I (I.1.3, I.2.3, I.2.4, I.3.1 a I.3.5); Cap. II (II.2, II.3, II.6.3); Cap. IV (IV.3, IV.4); Cap. V (V.1, V.2, V.4); Anexo VI (A.VI.7, A.VI.8); Anexo III (D-41); libro (RF-02, RF-07)
- Origen: sesión del 14/10/2026; segunda crítica de la línea de base (subagente `critico`, informada en el chat)
- Reabre: ADR-078 (objeto de la medición y condición 4), ADR-079 §3 (restricción de la rama N a los dos ejecutores), ADR-053 (condición 1). Reemplazado en el criterio por ADR-093
- Relacionado: ADR-084 a ADR-089, ADR-091 a ADR-093

### Contexto

1. **[D]** Atribución, adjudicación vigente (ADR-087 enmendado): `build` + `gpt-6.1-sol` 72/72, rama N; Charles 70/72, rama P (C-4e); P3 (`gpt-5.6-luna`) 70/72, rama N. IV.3 da «Refuta» para el ejecutor principal (`verificacion/20261014-adjudicacion-autor/`).
2. **[D]** La Tabla 10 de IV.3, fijada antes de medir, dice para «Refuta»: «se revisan la selección del flujo y la meta del objetivo general». La condición 4 de ADR-078 decía que si el agente acierta casi todo C-2 a C-4 sin más tokens que en C-1, «delegar no es un problema». ADR-079 limitó esa consecuencia a que los dos ejecutores cayeran en N; Charles quedó en P por un solo caso.
3. **[D]** Lo que sí se observó: al modificar permisos, el agente escribe reglas que OpenCode no aplica y declara éxito (16/144 en la línea de base, ADR-086; 13/24 en la sonda E sin ruta en la instrucción, ADR-089). `opencode debug agent` muestra la regla agregada pero no evalúa si coincide con la acción (ADR-086, punto 5).
4. **[D]** Varias incidencias reales de OpenCode describen declaraciones ignoradas en silencio (Anexo VI, A.VI.6). No dan prevalencia.
5. **[D]** El procedimiento delegado consume una mediana de 62.890 tokens por consulta de atribución en `build`; la línea de base usó cerca del 85 % de una ventana de 5 horas de la suscripción.

### Alternativas evaluadas

- **A:** sostener el problema de atribución con la restricción de ADR-079 (Charles en P).
- **B:** reformular hacia el costo de tokens solo.
- **C:** reformular hacia la verificabilidad del efecto (declaraciones sin efecto y certificación falsa), con medición nueva; tokens como secundario medidos en la misma medición.
- **D:** declarar el proyecto como producto con hallazgo negativo, sin problema medido.

### Análisis (trade-offs)

- **A** se lee como cobertura: la regla que se aplica para no reevaluar depende de un caso con 2/3 en un ejecutor secundario. Contradice la Tabla 10 aplicada al principal.
- **B** tiene una magnitud baja en dinero (unos USD 0,05 por consulta) y no corresponde a un error: el agente ya acierta.
- **C** apunta al único fallo sistemático observado, que la introspección nativa no detecta y que cubren requisitos ya validados (RF-02, CA-9; RF-07; OE-2; OE-3). Exige una medición nueva y ecológica (ADR-091, ADR-092), porque la de modificación previa es inválida y no ecológica. Riesgo: que la nueva medición tampoco muestre el problema.
- **D** es honesta, pero deja el proyecto sin criterio de éxito derivado de una línea de base (`reglas-catedra.md`, §2).

### Recomendación y fundamento

**C, con D preregistrada como rama de respaldo (ADR-093).**

1. **Se aplica «Refuta» tal como lo fijó la Tabla 10:** se revisa la meta del objetivo general y la selección del flujo. Se declara sin rodeos que la condición 1 de ADR-053 y la 4 de ADR-078 se cumplen en sustancia para el ejecutor principal, y que la restricción de ADR-079 §3 dejó la consecuencia sin activar por un caso de Charles.
2. **Problema reformulado** (cinco componentes, I.3.1):
   - sujeto: el desarrollador que configura OpenCode, y el agente al que delega esa tarea;
   - manifestación: no dispone de un medio para verificar que una declaración de configuración, en particular de permisos, produce el efecto pretendido; las declaraciones sin efecto no generan aviso;
   - magnitud: éxito declarado falso y detección de declaraciones sin efecto, medidos en ADR-091 y ADR-092;
   - contexto y frecuencia: ante cada cambio de configuración (la referente declara cinco accesos semanales, A.VI.5);
   - consecuencia: el permiso efectivo difiere del supuesto y el cambio se da por hecho.
3. **La atribución medida** se informa completa como el resultado que reorientó el proyecto (con las sensibilidades de criterio), sin criterio de cumplimiento. RF-01 queda como capacidad del producto (OE-1).
4. **Orden de construcción:** RF-02 (con CA-9) y RF-07 al frente de lo que resta (V.1); deja de regir «Reordena».
5. **Sujeto humano:** no se mide por ahora; se decide después de ADR-091 y ADR-092 (decisión del autor, 14/10/2026).
6. **Readjudicación de la atribución por el autor:** no se hace; la atribución queda descriptiva y se declara tal como se adjudicó (ADR-087).

**Condición que invalidaría la decisión:** la que fija ADR-093 para la rama de respaldo.

### Decisión del autor

**Aceptado por el autor el 14/10/2026**, tal como está redactado.

### Consecuencias

**Si se acepta:** ADR-078, ADR-079 §3 y ADR-053 (cond. 1) quedan reabiertos por este registro; ADR-084 reemplazado por ADR-093; propagación al informe después de las mediciones de ADR-091 y ADR-092.

### Evidencia

- `informe/cap-04/IV.3-analisis-rivalidad-amplificada.md` (Tabla 10)
- `01-relevamiento/linea-base/verificacion/20261014-adjudicacion-autor/`, `20261014-analisis-LB-mod/`, `20261014-analisis-sondas-p3/`
- ADR-078, ADR-079, ADR-084, ADR-086, ADR-089
