# Voz y lenguaje de la app · triadTech

Objetivo: que un adolescente, un familiar o un jurado pueda comprender la demo sin una explicación del equipo. Revisión de títulos, navegación, formularios, ayudas, estados, confirmaciones, errores, contenidos educativos y controles de presentación.

## Investigación aplicada

| Fuente primaria | Hallazgo o pauta | Decisión para esta app |
| --- | --- | --- |
| [Nielsen Norman Group · Recognition and recall](https://www.nngroup.com/articles/recognition-and-recall/) | El contexto visible ayuda a reconocer información sin tener que recordarla | Mostrar la actividad concreta junto a las cantidades y un resumen del calendario, sin obligar a recordar qué significaba «unidad» |
| [Microsoft · Brand voice](https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human) | Voz humana, directa y fácil de recorrer visualmente; tono adaptado al contexto | Calidez en metas y logros, precisión en dinero, permisos, fechas y resultados |
| [GOV.UK · Error messages](https://design-system.service.gov.uk/components/error-message/) | Explicar el problema y cómo corregirlo | Mensajes específicos para monto, actividad, cantidad, intervalo y límites; conservar el formulario para corregirlo |
| [W3C WAI · Writing for accessibility](https://www.w3.org/WAI/tips/writing/) | Títulos informativos, instrucciones claras, enlaces significativos y contenido conciso | Botones que nombran su resultado, campos con etiquetas visibles y explicaciones breves cerca de la decisión |
| [CFPB · Effective financial education](https://www.consumerfinance.gov/data-research/research-reports/effective-financial-education-five-principles-and-how-use-them/) | Conectar el aprendizaje con decisiones relevantes y acciones posibles | Explicar qué ocurre con el dinero antes de confirmar, usar ejemplos cotidianos y conservar las actividades adaptadas por edad |

Son fundamentos de diseño y comunicación, no una prueba de que esta redacción concreta aumente comprensión o conversión. La validación con adolescentes, familiares y jurados sigue pendiente. No se aplicaron afirmaciones de «neuromarketing», presión para pedir dinero, urgencia artificial ni promesas crediticias.

## Voz de la marca

**Clara, cercana y respetuosa.** «Sueño» conserva la motivación y la identidad; «meta de ahorro» explica la función. Se usan frases cortas y verbos concretos. No se infantiliza a un usuario de 17 años ni se depende de vocabulario bancario para que uno de 10 pueda empezar.

La comunicación comercial cuenta el beneficio —ahorrar para una meta y acompañarse en familia—, mientras que cada acción explica su consecuencia. No se sustituye una consecuencia incómoda por una frase amable pero imprecisa. Se reconoce el avance sin vincular valor personal, recursos familiares o capacidad crediticia con una cantidad ahorrada.

## Vocabulario y ejemplos

| Antes | Ahora | Motivo |
| --- | --- | --- |
| Unidad de pago | Actividad a realizar | Identifica lo que se hará |
| 3 unidades | Hacer la actividad 3 veces | Explica la cantidad sin inventar una equivalencia entre dinero y tareas |
| Unidades por entrega | Veces por fecha | Conecta cantidad y calendario |
| Anticipo | Dinero adelantado, con «préstamo familiar» como nombre de la función | Define el concepto en el primer uso |
| En mora | Con retraso | Comunica que pasó la fecha acordada sin exigir conocimientos bancarios |
| Recargo / unidades adicionales | Actividades extra por retraso | Hace explícito que no se cobra dinero |
| Gracia | Días de espera antes de sumar extras | Explica qué se posterga y qué no |
| Sin conclusión verificable | Sin información suficiente | Describe la falta de información sin etiquetar al menor |
| Reporte | Aviso de actividad realizada | Aclara quién avisa y qué espera después |
| Conversar primero, al rechazar un retiro | No autorizar retiro | Nombra el resultado real del botón; se puede conversar después |
| Un paso más cerca | Agregar ahorro | Los botones indican la acción, no requieren interpretar una metáfora |
| Cumplimiento observado | Puntualidad de sus avisos | Evita presentar los datos como juicio personal o calificación crediticia |

Ejemplo de resumen: «Actividad: Leer durante 15 minutos. Hacerla 3 veces en total: 1 vez cada 3 días. La primera fecha será 3 días después de aceptar». Si la última fecha lleva menos repeticiones, el resumen lo explica expresamente.

«Préstamo familiar» se conserva por continuidad de navegación y aprendizaje, pero se define dentro de la sección: en esta demo se recibe dinero adelantado y se cumplen actividades acordadas; no se devuelve dinero. El consentimiento y la aceptación siguen separados de la propuesta y del desembolso.

## Reglas editoriales para mantener

1. Una acción importante debe responder qué pasa, sobre qué meta o persona y qué sigue. «Autorizar retiro» mueve el dinero; «No autorizar retiro» lo mantiene en la meta.
2. Mostrar la información antes de actuar: monto, actividad, veces, fechas y posibles actividades extra. No esconder consecuencias en el mensaje de éxito.
3. Usar «veces» junto a la actividad; nunca como una nueva moneda. La actividad la escribe la familia y no se intenta adivinar su plural.
4. Distinguir fecha indicada, fecha del aviso y fecha de respuesta. El lenguaje sencillo no cambia la regla de puntualidad.
5. La falta de respuesta se explica como información pendiente. No se presenta como aprobación ni incumplimiento automático.
6. Usar «yo/tú» en la vista del hijo y texto contextual en la adulta. La identidad del hijo permanece visible al cambiar de vista.
7. Dar mensajes de error concretos con una corrección posible. Evitar «dato inválido» o «revisa todo» cuando se conoce el campo que falla.
8. Mantener visibles las decisiones esenciales; poner el detalle adicional en ayudas desplegables, como el cálculo del porcentaje familiar.
9. Evitar duración inventada, garantías, culpa o presión. Se cambió «2 min» por «Actividad breve» sin prometer una duración no medida.
10. No afirmar que un acuerdo completado demuestra solvencia. El alcance educativo y el carácter ficticio del dinero siguen claros.

## Alcance técnico y compatibilidad

Se mantiene el modelo de datos y los identificadores persistidos. `units`, `unitLabel` y otros nombres internos siguen siendo conceptos de implementación. La interfaz muestra actividad y veces; el texto no modifica montos, calendarios, requisitos de aceptación ni permisos.

`core/ui-copy.ts` centraliza singular/plural de veces y días, el resumen del plan y una presentación más clara de ciertos eventos antiguos de la app. La adaptación del historial se limita a formatos reconocidos; no reescribe los registros guardados ni modifica libremente las notas de la familia.

Las pruebas existentes se actualizaron para buscar las etiquetas nuevas manteniendo sus comprobaciones de saldos, estados, permisos y fechas. Se revisa además que un aviso corresponda a la actividad exacta de su fecha, importante en acuerdos antiguos con actividades diferentes. Las guías de seguridad [ORIGEN](CLAVE-ORIGEN.md) y de [identidad visual](IDENTIDAD-VISUAL.md) siguen vigentes.

## Cómo validar comprensión en una prueba real

Sin explicar la app primero, pedir a cada participante que indique cuánto dinero recibirá, qué debe hacer, cuántas veces, hasta cuándo y qué ocurre si el adulto no responde. Pedirle después que identifique qué botón autoriza o rechaza un retiro. Observar errores, preguntas y decisiones; no limitarse a preguntar si el texto «gusta». Ajustar la redacción a partir de esos resultados, sin prometer comprensión universal por haber aplicado una guía.
