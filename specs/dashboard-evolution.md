# 1. Metadata
- Title: Comparativa interanual de periodos
- Status: Approved
- Version: 1.0.0
- Owner role or team: Commercial Analytics / Sales BI
- Last updated: 2026-07-16

# 2. Problem
- Who is affected: responsables comerciales, analistas de negocio y usuarios que consultan el dashboard para tomar decisiones sobre ventas.
- Current pain or limitation: el dashboard actual muestra el periodo activo, pero no ofrece una comparación clara con un bloque equivalente anterior para contextualizar cambios relevantes.
- Business impact: cuesta detectar crecimiento, caída o estabilización de ventas con rapidez; esto retrasa la interpretación comercial y puede llevar a decisiones sin una referencia temporal consistente.

# 3. Context
- Current dashboard behavior: el dashboard actual es un HTML autocontenido con filtros, KPIs, ranking por canales y categorías, narrativa de negocio, panel de calidad y una tabla de ventas recientes. La versión actual calcula métricas sobre el corte activo y no ofrece una comparativa temporal explícita.
- Relevant validated data sources and dependencies: la evolución debe basarse en un snapshot validado desde Supabase en modo lectura. La especificación final depende de inspeccionar el esquema real para confirmar tablas, claves, relaciones y cardinalidades. No se debe asumir ningún nombre de tabla, columna o join no verificado.
- Privacy and data-quality considerations: no se deben mostrar ni derivar nombres, apellidos, email, fecha de nacimiento, código postal ni cualquier identificador personal. Cada tabla fuente debe validarse de forma independiente y cada unión debe comprobar cardinalidad antes de usar el resultado. Si una unión duplica ventas o rompe la integridad esperada, la generación debe bloquearse.
- Supabase schema notes from the initial read-only inspection: se han identificado las tablas `public.dim_articulos`, `public.dim_canal`, `public.dim_fecha`, `public.dim_promociones`, `public.dim_usuarios`, `public.fact_promociones_articulos` y `public.fact_ventas`. Aún falta confirmar qué campo actúa como clave primaria en cada tabla, qué columnas son claves foráneas reales y si todas representan el modelo de negocio esperado o si alguna está parcialmente poblada.

# 4. Goals and Non-goals
- Goals: comparar el periodo seleccionado con el mismo periodo del año anterior; mantener los filtros activos aplicados de forma simétrica; mostrar variaciones absolutas y relativas; priorizar lectura comercial rápida; evitar exposición de PII; impedir que datos no validados produzcan KPI engañosos.
- Non-goals: forecasting; alertas automáticas; exportaciones; publicación en Confluence en esta iteración; análisis a nivel individual; conexión runtime a Supabase en la experiencia final; reintroducir CSV como fuente operativa.

# 5. Scope
- In scope: selección de periodo basada en calendario; comparación con un bloque equivalente del año anterior; KPI comparativos; visualización principal alineada por fecha de calendario equivalente; rankings y narrativas orientados a variación; estados vacíos, de error y de comparación ausente; validación de calidad y privacidad.
- Out of scope: nuevos KPI no existentes en el dashboard actual; cambios de arquitectura fuera del HTML autocontenido; publicación; runtime database connection; personalización por usuario identificable; modelos predictivos; análisis histórico fuera de la comparación interanual acordada.

# 6. Requirements
- REQ-001: El dashboard debe permitir seleccionar un periodo de calendario como base de análisis.
- REQ-002: El dashboard debe comparar el periodo seleccionado con un bloque equivalente del mismo rango del año anterior.
- REQ-003: Los filtros no temporales activos deben aplicarse de forma simétrica al periodo seleccionado y al comparado.
- REQ-004: El dashboard debe mostrar, para ambos periodos, ventas netas, pedidos, ticket medio, margen bruto y unidades.
- REQ-005: El dashboard debe mostrar variaciones absolutas y relativas entre ambos periodos.
- REQ-006: La visualización principal debe permitir leer la evolución comparada por fecha de calendario equivalente.
- REQ-007: Los rankings y narrativas de negocio deben reflejar cambio y contribución a la variación, no solo volumen absoluto.
- REQ-008: El dashboard debe mostrar estados vacíos o informativos cuando no exista base de comparación, no haya datos tras filtros o falte el periodo anterior.
- REQ-009: El dashboard debe validar cada tabla fuente por separado y cada unión por cardinalidad antes de usar los datos.
- REQ-010: El dashboard no debe exponer ni inferir información personal identificable en ninguna parte de la interfaz o del contenido generado.
- REQ-011: La fuente final de datos debe provenir de Supabase validado; no se permite usar CSV ni conexión runtime a la base de datos en la entrega final.
- REQ-012: Si alguna validación de calidad o privacidad falla, el resultado debe bloquearse o degradarse con una advertencia clara, no con una métrica silenciosamente incorrecta.

# 7. Acceptance Criteria
- AC-001: Given que existe un periodo de calendario con datos válidos, When el usuario abre el dashboard, Then ve el periodo seleccionado como base y un periodo comparado equivalente del año anterior. Map: REQ-001, REQ-002.
- AC-002: Given filtros no temporales activos, When el usuario cambia un filtro, Then el periodo seleccionado y el comparado se recalculan con el mismo filtro aplicado. Map: REQ-003.
- AC-003: Given un periodo con datos válidos, When el dashboard renderiza, Then muestra ventas netas, pedidos, ticket medio, margen bruto y unidades para ambos periodos. Map: REQ-004.
- AC-004: Given dos periodos comparables, When el dashboard calcula la comparación, Then muestra variación absoluta y relativa de forma visible y consistente. Map: REQ-005.
- AC-005: Given que el usuario observa la visualización principal, When los dos periodos contienen datos, Then puede interpretar la evolución por fecha de calendario equivalente sin cálculos manuales. Map: REQ-006.
- AC-006: Given rankings y narrativas de negocio, When existe diferencia entre periodos, Then la salida prioriza la contribución al cambio y no solo el volumen actual. Map: REQ-007.
- AC-007: Given que no hay datos para el periodo comparado o los filtros dejan vacío el conjunto, When se renderiza el dashboard, Then se muestra un estado vacío o informativo y no una comparación falsa. Map: REQ-008.
- AC-008: Given que una tabla fuente falla una validación, When se prepara el snapshot, Then la tabla queda marcada como FAIL y el resultado no se presenta como confiable sin advertencia. Map: REQ-009, REQ-012.
- AC-009: Given una unión que duplica ventas o altera la cardinalidad, When se valida el conjunto, Then el proceso detecta el problema y bloquea el uso del resultado. Map: REQ-009, REQ-012.
- AC-010: Given que una vista intenta mostrar PII, When el dashboard se revisa, Then no aparecen nombres, apellidos, email, fecha de nacimiento, código postal ni otros identificadores personales. Map: REQ-010.
- AC-011: Given la entrega final, When se valida la fuente de datos, Then el dashboard usa solo un snapshot validado desde Supabase y no depende de CSV ni de conexión runtime. Map: REQ-011.

# 8. Constraints
- Architecture: la entrega debe seguir siendo un dashboard autocontenido en HTML.
- Data source: el dato final debe venir de Supabase validado en modo lectura; la experiencia final no debe depender de CSV ni de una conexión runtime a la base de datos.
- Privacy: se prohíbe mostrar o derivar PII en cualquier parte de la interfaz, narrativa, filtrado o contenido auxiliar.
- Data quality: cada tabla fuente debe validarse por separado; cada join debe comprobar cardinalidad antes de aceptarse.
- UX: la comparación debe ser comprensible para negocio, legible en español y con estados claros de carga, vacío, comparación ausente y fallo.
- Compatibility: el comportamiento debe mantenerse compatible con navegadores modernos y con el patrón de uso actual del dashboard.
- Publishing: esta especificación no habilita publicación en Confluence; cualquier publicación deberá seguir la regla del repositorio sobre página padre, espacio y título.

# 9. Evolution
- Expected extension points: comparación mes a mes, año a la fecha, ventanas personalizadas, desglose por canal o segmento, narrativas de causa raíz y resaltado de drivers de cambio.
- Backward-compatibility expectations: los KPI y filtros existentes deben seguir siendo reconocibles; si falta base comparativa, el dashboard debe degradar con claridad sin romper la lectura principal.
- Versioning and change-log policy: cambios visibles en comportamiento de comparación deben subir la versión menor; correcciones de texto, formato o estados de error deben subir parche; cambios en definiciones de KPI deben quedar documentados explícitamente.
- Explicitly deferred capabilities: forecasting, alertas, exportaciones, análisis a nivel persona, conexión runtime a Supabase y publicación en Confluence.

# 10. Open Questions and Decisions
- Confirmed decisions:
  - La comparación será contra el mismo periodo del año anterior.
  - La comparación usará fecha de calendario y un bloque equivalente.
  - Los filtros activos se aplicarán de forma simétrica al periodo seleccionado y al comparado.
  - La fuente final no será CSV.
  - La entrega final no debe usar una conexión runtime a Supabase.
- Open questions:
  - BLOCKING TBD: confirmar si `public.fact_ventas` es la tabla de hechos principal de ventas o si existe otra tabla agregada o intermedia que deba usarse para el snapshot.
  - BLOCKING TBD: identificar la clave primaria y las claves foráneas reales de `public.fact_ventas` para enlazar calendario, canal, artículo y cualquier otra dimensión sin duplicar filas.
  - BLOCKING TBD: confirmar cuál es el campo fecha canónico en `public.fact_ventas` y cómo se relaciona con `public.dim_fecha` si hay más de una fecha disponible.
  - BLOCKING TBD: verificar la granularidad exacta de `public.fact_ventas` y si representa pedidos, líneas de pedido o una agregación ya consolidada.
  - BLOCKING TBD: confirmar qué columnas de `public.dim_articulos` pueden usarse para análisis comercial y cuáles, si existen, deben excluirse por privacidad o por baja calidad.
  - BLOCKING TBD: revisar si `public.dim_usuarios` contiene atributos que deban excluirse completamente del dashboard y qué campos anonimizados están realmente disponibles para segmentación.
  - BLOCKING TBD: validar el propósito exacto de `public.fact_promociones_articulos` y si su cardinalidad con ventas permite un join seguro o requiere tratamiento especial.
  - BLOCKING TBD: confirmar si `public.dim_promociones` y `public.dim_canal` comparten claves coherentes con la tabla de hechos o si necesitan normalización previa.
  - BLOCKING TBD: determinar si el esquema está bajo `public` de forma definitiva o si existen otros schemas relevantes que deban inspeccionarse antes de cerrar la spec.
  - NON-BLOCKING TBD: definir el formato exacto del selector de periodo siempre que mantenga la comparación por calendario y bloque equivalente.
- How to resolve TBDs: inspección autoritativa del esquema en Supabase en modo lectura, validación de cardinalidades y confirmación del mecanismo de snapshot antes de pasar a Approved.

# 11. Traceability
| Problem | Goal | Requirement | Acceptance Criterion | Validation method |
|---|---|---|---|---|
| Falta una lectura temporal comparativa | Comparar el periodo actual con un bloque equivalente anterior | REQ-001, REQ-002 | AC-001 | Revisar la selección de periodo y el bloque comparado en el dashboard |
| Los filtros pueden alterar la lectura comparativa de forma inconsistente | Aplicar el mismo contexto de filtros a ambos periodos | REQ-003 | AC-002 | Cambiar filtros y verificar que ambas ventanas se recalculan |
| Los KPI actuales no muestran el contexto del periodo anterior | Mostrar métricas de ambos periodos | REQ-004 | AC-003 | Verificar KPI dobles y consistentes para ambos periodos |
| Sin variación explícita no se detectan cambios relevantes | Mostrar deltas y dirección | REQ-005 | AC-004 | Revisar variación absoluta y relativa en los KPI |
| La trayectoria no se interpreta sin alineación por calendario | Hacer legible la evolución comparada | REQ-006 | AC-005 | Inspeccionar la visualización principal alineada por fecha equivalente |
| Los rankings solo muestran volumen | Enfatizar contribución al cambio | REQ-007 | AC-006 | Comparar orden y textos narrativos ante cambios entre periodos |
| Un periodo vacío puede inducir conclusiones falsas | Mostrar estados vacíos o informativos | REQ-008 | AC-007 | Probar filtros sin datos o sin comparado |
| Las uniones erróneas pueden duplicar ventas | Bloquear resultados no confiables | REQ-009, REQ-012 | AC-008, AC-009 | Validar tablas y cardinalidad antes de generar el snapshot |
| Riesgo de exposición de información personal | Evitar PII | REQ-010 | AC-010 | Revisar UI, textos, filtros y tooltips |
| La entrega no debe depender de fuentes no autorizadas | Usar solo Supabase validado | REQ-011 | AC-011 | Confirmar fuente final y ausencia de CSV/runtime DB |

Readiness for approval: hay bloqueos. La spec no puede pasar a Approved hasta confirmar el esquema real de Supabase, el campo calendario canónico y el mecanismo exacto de snapshot validado.