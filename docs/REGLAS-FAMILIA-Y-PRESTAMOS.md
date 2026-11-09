# Familia y préstamos educativos · triadTech

Implementación local de noviembre de 2026. Las cantidades, los perfiles y sus historiales son ficticios. «Préstamo» describe un anticipo familiar con compromisos de actividades: no es un crédito bancario ni produce un reporte crediticio oficial.

## Recorrido de presentación

1. Abrir http://localhost:4200. El selector externo alterna hijo/adulto y permite elegir el perfil. Alex y Lucía tienen saldos, metas e historiales diferentes.
2. Como hijo, entrar a **Préstamos**, solicitar un importe y, opcionalmente, relacionarlo con una meta. Todavía no se recibe dinero.
3. Como adulto, abrir **Préstamos**, elegir al mismo hijo y preparar las condiciones: importe, actividad repetible, unidades totales, unidades por entrega, intervalo y primera fecha límite.
4. Opcionalmente, activar unidades adicionales por demora, con días de gracia, límite total y plazo adicional. Revisar el resumen antes de proponerlo.
5. Volver al hijo y aceptar expresamente. El anticipo pasa del fondo familiar al saldo libre de ese hijo; no entra automáticamente al ahorro protegido.
6. Registrar entregas parciales como hijo y confirmarlas como adulto. Avanzar el reloj externo permite mostrar una demora sin esperar días reales.
7. Como adulto, consultar **Hijos**: metas completas, dinero libre/reservado, ritmo sugerido y cumplimiento observado. El detalle permanece en la vista adulta.

## Permisos y dependencias

| Acción | Hijo | Adulto | Dependencia |
| --- | --- | --- | --- |
| Consultar metas y saldo | Su perfil | Sus hijos | Identificador de hijo |
| Crear metas, reservar dinero y solicitar retiro | Su perfil | No desde el detalle adulto | Saldo y reglas de protección |
| Resolver retiro protegido o aportar a una meta | No | Sí | Solicitud/meta del hijo seleccionado |
| Solicitar anticipo | Su perfil | No | Sin otro acuerdo abierto |
| Proponer condiciones y cambios | No | Sí | Acuerdo de ese hijo |
| Aceptar condiciones | Su perfil | No | Propuesta vigente y fondos suficientes |
| Registrar actividad cumplida | Su perfil | No | Unidades todavía pendientes |
| Confirmar o devolver una entrega | No | Sí | Reporte pendiente de ese hijo |
| Ver métricas familiares | No | Sí | Historial del hijo seleccionado |
| Cambiar rol, fecha o saldos de preparación | Panel externo | Panel externo | Control de presentación, no operación financiera |

Los comandos comprueban rol e identificadores de familia, hijo y acuerdo; no confían únicamente en la pantalla abierta. Cambiar de hijo limpia formularios y selecciones. Una ruta de detalle no cambia el rol. Las operaciones financieras se ejecutan sobre una copia y se guardan completas si pasan las validaciones.

**Límite de esta demo:** todo corre en el navegador y persiste en localStorage. Estas comprobaciones evitan inconsistencias en la presentación; no sustituyen autenticación ni autorización en servidor. En producción deben aplicarse también en cada solicitud al backend, con sesiones e identidades verificadas.

## Estados y dinero

| Estado | Operaciones siguientes | Efecto monetario |
| --- | --- | --- |
| Solicitado | Proponer, no acordar o cancelar solicitud | Ninguno |
| Esperando aceptación | Aceptar o no acordar | Ninguno hasta aceptar |
| Activo | Entregar, validar, proponer cambios | Anticipo ya desembolsado una sola vez |
| Activo en mora | Las anteriores y gestionar unidades adicionales | No se cobra dinero |
| Completado | Consultar historial | No se devuelve dinero ficticio por las tareas |
| No acordado/cancelado | Consultar | Sin desembolso |

«Vigente», «En mora», «En revisión familiar» y «Unidades adicionales pendientes» son situaciones derivadas dentro del acuerdo activo. Un acuerdo sin cumplir permanece abierto; no hay botón para cerrarlo como pagado. Solo se completa con todas las unidades base y adicionales exigibles confirmadas.

- Máximo un acuerdo abierto por hijo: evita anticipos superpuestos en el MVP. Hermanos pueden tener acuerdos abiertos independientes.
- La aceptación verifica nuevamente el fondo familiar. Un doble clic o segunda aceptación no duplica el desembolso.
- El saldo protegido, el saldo libre y el fondo para anticipos son conceptos separados. Los aportes familiares voluntarios conservan su flujo propio.
- Una meta relacionada con un acuerdo abierto no se puede eliminar. Las metas cumplidas conservan su progreso histórico.
- Los importes admiten centavos. Las cantidades de actividades son enteros; no existe equivalencia automática entre soles y una actividad.

## Unidades, calendario y entregas

El adulto escribe una unidad repetible y comprensible, por ejemplo «regar las plantas durante 10 minutos». La interfaz invita a acordar actividades adecuadas y alcanzables. El adulto elige cantidad total, cantidad por entrega, primera entrega en N días y siguientes cada N días. La última entrega recibe el remanente. No se obliga a usar tareas de un catálogo.

Los límites técnicos del MVP son 1–500 unidades base, hasta 60 entregas, intervalos de 1–90 días y duración máxima de 365 días. Son límites del prototipo, no recomendaciones pedagógicas. La interfaz permite revisar el calendario antes de aceptar; no incluye días semanales o recurrencias mensuales variables.

El hijo puede reportar parte de una entrega. La validación pertenece al adulto; rechazar devuelve esas unidades a pendientes y conserva el reporte. No se pueden reportar más unidades que las pendientes ni validar dos veces el mismo reporte. Para puntualidad se utiliza la fecha del reporte aceptado, no la fecha en que el adulto lo revisó. Un reporte pendiente de revisión se considera provisionalmente entregado para evitar penalizar la demora del adulto; si se rechaza se recalcula lo pendiente.

## Demora y cambios acordados

- El vencimiento es por entrega y por fecha de calendario. La fecha límite está incluida: la demora comienza al día siguiente. La gracia afecta a las unidades adicionales, no borra el retraso.
- El recargo opcional usa la misma unidad que el acuerdo; el adulto no tiene que reescribir la actividad. Define unidades por día, máximo acumulado, gracia y plazo adicional.
- Se cuenta una sola vez cada día con alguna entrega base vencida, aunque haya varias. No existe capitalización ni recargo sobre recargo. El día de una entrega tardía también cuenta.
- La generación se detiene cuando todas las unidades base están reportadas. El acuerdo sigue abierto hasta validar también las adicionales. Su fecha límite adicional es el vencimiento final —o la entrada en vigor, si es posterior— más el plazo configurado.
- Proponer un recargo en un acuerdo ya activo requiere aceptación del hijo. Entra en vigor al día siguiente de aceptar: no aplica retroactivamente. El máximo es obligatorio. Una nueva configuración conserva las unidades ya generadas que correspondan; no se borran silenciosamente.
- El adulto puede desactivar las adicionales y dispensar las pendientes. Esta decisión no elimina el antecedente de demora ni devuelve el dinero del anticipo.
- Una ampliación también requiere aceptación. Desplaza las entregas pendientes, conserva las confirmadas y deja un evento con el cambio. Conserva la fecha final original, el registro de mora y las unidades adicionales ya generadas.

El propósito educativo es acordar y revisar compromisos. La interfaz no recomienda aumentar automáticamente la carga por un historial desfavorable, no etiqueta al menor como «bueno/malo» y no convierte necesidades básicas en premios.

## Métricas y consejos al adulto

- Cumplimiento observado = acuerdos completados con todas sus entregas puntuales / acuerdos completados. Se muestra el tamaño de la muestra; sin acuerdos completos aparece «—».
- Adelanto y retraso medios se calculan por separado sobre acuerdos completos con adelanto/retraso. Se toma la entrega con mayor desviación respecto de su plazo. Una entrega intermedia tardía cuenta aunque la última llegue antes del vencimiento final.
- Se muestran acuerdos abiertos, reportes pendientes, importe originalmente anticipado en acuerdos abiertos, renegociaciones y acuerdos con antecedente de mora.
- La puntualidad se evalúa contra el calendario vigente; una renegociación aceptada cambia ese calendario. Por eso se conserva por separado el antecedente de mora y el número de cambios.
- No hay probabilidad de impago, calificación crediticia ni predicción de «100 %». Una muestra pequeña de compromisos familiares y tareas no permite esa inferencia.
- Para las metas se compara el ahorro semanal requerido por los plazos con el presupuesto semanal acordado. Se recomienda priorizar o revisar plazos cuando la suma lo supera. Es una guía, no un ingreso garantizado ni un juicio sobre el menor.

Los datos de menores no pasan a ser historial crediticio oficial por registrarse aquí. Cualquier uso futuro para evaluación bancaria requeriría un proyecto distinto de validación, consentimiento y revisión aplicable.

## Persistencia y controles de ensayo

La versión familiar usa `primer-sueno-familia-v6`. Si no existe, importa el perfil anterior de `primer-sueno-angular-v5` (o la migración previa disponible) como primer hijo; no elimina esa clave. Los hermanos e historiales de muestra se identifican como simulados. Un nuevo hijo comienza sin historial.

La fecha simulada inicia con la fecha de Lima y se guarda en el escenario. El panel permite avanzar días; impide retroceder antes de eventos registrados. Los escenarios reemplazan saldos, metas e historiales de toda la familia tras confirmación, conservando perfiles. No deben confundirse con transacciones normales.

## Investigación aplicada

Las siguientes fuentes sustentan decisiones; las reglas concretas de anticipos, límites y recargos son decisiones de este prototipo, no un estándar bancario certificado.

- [OWASP · Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): comprobar permisos y relación con cada recurso; separar controles de interfaz y autorización real.
- [OWASP · Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html): revisión y aceptación de los datos relevantes antes de ejecutar una operación.
- [CFPB · Building blocks to help youth achieve financial capability](https://www.consumerfinance.gov/data-research/research-reports/building-blocks-help-youth-achieve-financial-capability/): aprendizaje práctico, hábitos y habilidades adaptados al desarrollo.
- [UNICEF · Positive discipline](https://www.unicef.org/southafrica/unicef-parenting/child-care/how-discipline-your-child-smart-and-healthy-way): expectativas claras y realistas, acompañamiento y consecuencias calmadas.
- [Apple · UI Design Tips](https://developer.apple.com/design/tips/): legibilidad, jerarquía, controles accesibles y organización del contenido móvil. La navegación adulta e infantil comparte componentes y conserva secciones específicas para préstamos.
- [SBS · Reporte de deudas](https://www.sbs.gob.pe/usuarios/nuestros-servicios/reporte-de-deudas): distingue la información crediticia del sistema financiero de los registros educativos de esta demo.
- [NIST · Proportions](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm): incertidumbre de estimaciones a partir de muestras; se optó por frecuencias observadas sin predicción individual.
- Referencias audiovisuales localizadas en YouTube: [SBS · La SBS y la educación financiera](https://www.youtube.com/watch?v=7YnQyctsRYw) y [UIX Design Academy · tutorial de interfaz bancaria](https://www.youtube.com/watch?v=ITChn0Ohc9E). Se consultó la información indexada y las descripciones; no se analizó íntegramente su reproducción. Las reglas anteriores se apoyan en las fuentes primarias enlazadas y en decisiones explícitas del producto.

## Verificación

Pruebas en `tests/loan-rules.spec.ts` cubren estados, propiedad del acuerdo, importes, calendario, entregas parciales, revisión tardía del adulto, recargos, ampliaciones y métricas. `tests/family-ui.spec.ts` recorre ambas vistas, dos hermanos, desembolso, mora y cierre, además del diseño a distintos anchos. `tests/demo.spec.ts` conserva los recorridos de ahorro, aprendizaje, accesibilidad y persistencia.
