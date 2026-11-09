# Veracidad de acuerdos familiares y protección del menor

Investigación para triadTech, 8 de noviembre de 2026. Informe inicial de propuestas. **Actualización:** los flujos educativos de evidencia, silencio neutral y reclamaciones ya se implementaron; consultar [ORIGEN](CLAVE-ORIGEN.md) para el alcance actual y los supuestos de producción. Las verificaciones externas y el uso financiero siguen sin implementarse.

## Conclusión

Un acuerdo declarado únicamente por padre e hijo no permite demostrar que una actividad doméstica ocurrió si ambos deciden inventarla. Identidad, firmas y registros resistentes a cambios permiten atribuir declaraciones y detectar alteraciones, pero no convierten una declaración falsa en verdadera. El W3C distingue explícitamente verificación de credenciales y veracidad de sus afirmaciones: [Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model/#ecosystem-overview).

La propuesta es mantener dos dimensiones independientes: **cumplimiento familiar** y **calidad de evidencia**. No prometer un historial crediticio basado en tareas. La [SBS](https://www.sbs.gob.pe/usuarios/nuestros-servicios/reporte-de-deudas) describe su reporte como créditos del sistema financiero e información remitida por sus entidades.

## Qué soluciones existentes son transferibles

| Caso real y fuente | Solución observada | Aplicación propuesta |
| --- | --- | --- |
| [eBay: shill bidding y manipulación](https://www.ebay.com/help/policies/selling-policies/selling-practices-policy/shill-bidding-policy?id=4353) | Trata expresamente la manipulación entre personas relacionadas | Padre e hijo son partes relacionadas, no verificadores independientes |
| [FICO: usuarios autorizados](https://www.myfico.com/credit-education/faq/scores/authorized-user) | Versiones recientes dan menor impacto a cuentas de usuario autorizado que a cuentas propias | Separar conducta atribuida al adulto de conducta propia del joven; no trasladar puntuaciones de otro contexto |
| [Microsoft: Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) | Eventos anexados, trazabilidad y correcciones mediante nuevos eventos | Servidor con cronología y versiones de condiciones; una bitácora auditable puede bastar sin adoptar todo el patrón |
| [Stripe Radar: revisión](https://docs.stripe.com/radar/transaction-reviews) | Combina controles automáticos y revisión humana de casos seleccionados | Anomalía significa «revisar», no «menor fraudulento» |
| [CFPB: reclamación de errores](https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-an-error-on-my-credit-report-en-314/) | Permite cuestionar información e investigar su corrección | Vía de revisión accesible y trazable, sin castigo automático mientras se investiga |

Estos son precedentes técnicos y metodológicos. Los ejemplos estadounidenses no constituyen reglas legales aplicables automáticamente en Perú. Ninguna fuente demuestra que tareas domésticas predigan pago de créditos adultos.

## Reglas de producto recomendadas

1. **Uso familiar por defecto.** Actividades, anticipos y disciplina pueden funcionar sin participar en investigación o compartir información externa. No hay premio crediticio por activar la participación.
2. **Incorporación prospectiva.** Si se ensaya un programa de verificación, sus condiciones y finalidades se aceptan antes de iniciar los acuerdos. El padre no elige al terminar cuáles éxitos «subir»: eso seleccionaría solo resultados favorables. La participación tampoco vuelve verificables las tareas por sí sola.
3. **Estados separados.** Un acuerdo puede seguir abierto en la familia y estar «sin verificación suficiente» para cualquier análisis externo. Resolver la falta de evidencia no equivale a condonar ni completar una obligación familiar.
4. **Olvido del adulto.** Reportar entrega genera fecha de servidor. Mientras falta revisión, no hay mora atribuible al hijo por ese reporte. Recordatorios al adulto; tras una ventana de revisión, pasa a «revisión vencida / resultado no verificable». No se convierte automáticamente en éxito ni fracaso. Una confirmación tardía conserva por separado fecha declarada de actividad, fecha del reporte y fecha de revisión.
5. **Olvido de ambas partes.** Sin registro contemporáneo, no hay prueba de incumplimiento ni de cumplimiento puntual. La declaración posterior puede resolver el acuerdo familiar; debe conservar su menor nivel de evidencia.
6. **Desacuerdo.** El hijo puede cuestionar una revisión. El padre mantiene sus herramientas familiares, pero su rechazo unilateral no genera una marca crediticia. El estado externo permanece en revisión o no verificable.
7. **Evidencia por afirmación.** Un desembolso confirmado por una integración financiera prueba el movimiento de dinero; no demuestra que el hijo leyó un libro. Un cuestionario dentro de la aplicación prueba ese ejercicio registrado, con limitaciones sobre quién lo respondió; no garantiza capacidad de pagar deudas. Registrar exactamente qué se comprobó y por quién.
8. **Neutralidad por ausencia.** No participar, tener pocos datos, compartir dispositivo o no aportar pruebas no debe etiquetar al menor como riesgoso. También debe evaluarse si conceder ventajas exclusivamente por evidencia disponible genera desventajas indirectas para otras familias.

Ejemplo de ventana de revisión para probar en un piloto: recordatorios a las 48 horas y a los 7 días; resultado no verificable a los 14 días. Son parámetros propuestos para validar con familias, no plazos exigidos por una norma.

## Niveles de evidencia

| Nivel | Qué se puede afirmar | Qué no se puede afirmar |
| --- | --- | --- |
| Declaración familiar | Las partes registraron un acuerdo/confirmación | La tarea ocurrió y demuestra solvencia |
| Eventos de plataforma | Se registraron acciones, versiones y fechas en el servicio | La persona física hizo una tarea doméstica |
| Hecho corroborado externamente | Una fuente independiente confirma un hecho concreto | Todos los aspectos del acuerdo son verdaderos |
| Indicador validado en un estudio | Mostró utilidad bajo población, método y límites documentados | Garantiza pago individual o aprobación bancaria |

Una foto, un familiar adicional, dos cuentas distintas o una firma digital no constituyen automáticamente evidencia independiente. Evitar vigilancia del hogar, videos continuos y biometría como requisito de participación.

## Controles para un producto real

- Identidades y vínculos verificados según el flujo aplicable; autenticación y permisos en backend. El navegador no decide quién es el adulto ni la hora válida.
- Registro de creación, aceptación, desembolso, reportes, revisiones, cambios y reclamaciones. Correcciones como nuevos eventos, con actor, motivo, versión y fecha; sin reescritura silenciosa.
- IDs únicos, idempotencia y conciliación de transferencias para evitar contar un desembolso varias veces. Datos importados o simulados siempre excluidos de evidencia real.
- Detección de creación/cierre masivos, reutilización de pruebas, retroactividad y circulación repetida de fondos. Son señales para investigar; una familia con dispositivo/IP compartidos no es prueba de fraude.
- Limitar cuánto aportan eventos repetidos y correlacionados dentro de una misma familia a un análisis. Los límites se calibran en un piloto; no inventar una conversión «N tareas = crédito».
- Revisar casos sospechosos con evidencia disponible, motivo comprensible y posibilidad de corrección. Si no hay observación independiente suficiente, el resultado correcto es «no verificable».

## Validación que todavía falta

Incluso registros auténticos de tareas pueden carecer de valor predictivo sobre deudas. Antes de cualquier uso financiero se necesitarían finalidad y tratamiento de datos definidos, diseño ético, consentimiento aplicable, validación con una institución y evaluación longitudinal de resultados adultos reales, sesgos y errores. La [declaración conjunta de reguladores sobre datos alternativos](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20191203b.htm) es una referencia para estudiar controles de calidad e idoneidad; no una autorización para este producto.

Para la hackathon, la formulación defendible es: **«Acompañamos hábitos financieros y distinguimos declaraciones familiares de hechos verificables. El uso futuro como información complementaria debe validarse con la institución financiera; no penalizamos al menor por revisiones olvidadas.»**

## Diferencia con lo publicado

La demo conserva reportes y cambios, separa roles y no castiga la tardanza del adulto al validar un reporte puntual. Usa localStorage, un reloj de ensayo y datos ficticios: no tiene verificación independiente, autenticación real, integración financiera ni resistencia a manipulación. Sus estadísticas son educativas. La caducidad neutral de revisiones, reclamaciones y separación de evidencia se incorporaron posteriormente; el alcance vigente se detalla en [ORIGEN](CLAVE-ORIGEN.md).
