# ORIGEN · Evidencia, privacidad y supuestos de producción

Documento clave de triadTech. Investigación y decisiones del piloto, noviembre de 2026. ORIGEN identifica este informe; no es una certificación ni un protocolo bancario aprobado.

## Decisión del producto

Mantener dos dimensiones: **cumplimiento familiar** y **calidad de evidencia**. No convertir tareas domésticas, declaraciones o recargos en historial crediticio. Un resultado confirmado por la familia conserva esa procedencia aunque sea legítimo. Ninguna técnica estudiada garantiza que una tarea doméstica ocurrió cuando todos sus declarantes colaboran para inventarla.

La finalidad inmediata es educativa. El banco podría estudiar hechos adicionales verificables en un piloto formal; usar datos auténticos no demuestra automáticamente capacidad predictiva sobre créditos adultos. Se necesitaría evaluar resultados reales, sesgos, errores y utilidad incremental antes de cualquier decisión financiera.

## Flujos implementados en esta versión

| Situación | Interfaz y regla |
| --- | --- |
| Creación y consulta | Todos los acuerdos quedan en el registro familiar, con sus distintos resultados. No hay selección retrospectiva de éxitos ni envío a un banco |
| Reportar actividad | Unidades, fecha declarada y nota opcional. La fecha del reporte es la del reloj de la demo; declarar un día anterior no la retrocede |
| Revisión pendiente | Recordatorios visibles a los 2 y 7 días; son mensajes dentro de la app, no notificaciones realmente enviadas |
| 14 días sin revisar | Se muestra «revisión vencida / resultado no verificable». Sigue abierto, no es completado ni se atribuye fracaso verificable |
| Confirmación tardía | Conserva reporte y actividad declarada; registra fecha de revisión y etiqueta confirmación familiar tardía |
| Observación del adulto | El hijo puede solicitar revisión y explicar el desacuerdo. No implica una marca crediticia |
| Conversación | El adulto puede confirmar o dejar sin conclusión verificable; ambas decisiones quedan registradas. Una conversación posterior puede confirmar conservando la observación anterior |
| Resultado sin conclusión | No suma unidades confirmadas, no cierra el préstamo y no genera recargo por las unidades cuestionadas mientras permanecen neutrales |
| Plazos ampliados | Se muestran fechas originales y vigentes por entrega; el historial conserva los cambios |
| Evidencia | Panel propio por acuerdo: confirmaciones familiares, pendientes, resultados neutrales y confirmaciones tardías. No existe un distintivo de verificación independiente |

Los 2/7/14 días son parámetros de producto para probar con familias, no plazos legales. El estado neutral de evidencia no elimina una obligación familiar. El rechazo no cuestionado puede devolver unidades a pendientes dentro del acuerdo familiar; sus estadísticas siguen siendo descriptivas, nunca un score externo.

Las revisiones guardan fecha y decisión, y no modifican `submittedAt`. Si ya hay un reporte de reemplazo, no se permite restaurar las mismas unidades mediante una reclamación duplicada. Se comprueban rol, hijo, acuerdo y reporte en cada comando de la demo. No se implementa arbitraje independiente: el adulto registra una conversación familiar y se identifica como fuente interesada.

## Investigación sobre fotografías

Una imagen de un plato limpio demuestra, como máximo y según su autenticidad y contexto, que se fotografió ese objeto. No prueba quién lo lavó, que fuera una actividad acordada, ni que se completara puntualmente. Una escena puede prepararse, reutilizarse o generarse. Un reto de captura reciente reduce reutilización, pero no resuelve la colaboración entre familiares.

Difuminar caras no basta para declarar anonimato. Uniformes, reflejos, nombres, fondos o ubicación pueden identificar. Además, si el archivo está asociado al perfil, la plataforma sabe a quién corresponde aunque no aparezca su rostro. La AEPD analiza estos límites de contexto en [anonimización de imágenes](https://laboratorio.aepd.es/blog/anonimizacion-en-visores-tipo-street-view-lo-estamos-haciendo-bien); es una referencia técnica europea, no legislación peruana.

En Perú, el [DS 016-2024-JUS, artículos 22–25](https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/ds_016-2024-jus.pdf), contempla reglas específicas de consentimiento según edad, lenguaje comprensible, identidad de quien consiente e interés superior del menor. También restringe recopilar por medio del menor información de otros familiares sin su consentimiento. Una imagen no es ilícita por existir: hace falta evaluar finalidad, necesidad, consentimiento aplicable, comunicación y seguridad. El consentimiento no reemplaza el resto de condiciones. Antes de producción se requiere revisión del flujo concreto y del marco vigente por especialistas en Perú.

### Alternativas comparadas

| Medio | Qué aporta | Límite y recomendación |
| --- | --- | --- |
| Declaración y nota breve | Contexto familiar y cronología | Fácil de inventar; útil para educación, no prueba independiente |
| Actividad dentro de la plataforma | Evento directamente registrado, por ejemplo ejercicio educativo | No garantiza quién respondió ni predice pago bancario. Describir exactamente el evento observado |
| Integración financiera autorizada | Confirmación del desembolso/movimiento real | No prueba una tarea doméstica ni que el dinero proviniera del esfuerzo del menor |
| Constancia de una entidad independiente | Una organización verificadora afirma un hecho que realmente pudo observar | Evaluar independencia, alcance, identidad, conflictos y controles del emisor; no basta otra persona de la familia |
| Foto opcional del resultado | Evidencia complementaria del objeto/escena | Baja fuerza para atribuir autoría de la actividad. No exigirla para ahorrar o participar |
| C2PA / procedencia firmada | Vincula archivo e información de origen y modificaciones | No asegura verdad, identidad del ejecutor ni contexto. Ausencia de C2PA no demuestra falsedad |
| Credencial firmada con divulgación selectiva | Permite compartir únicamente afirmaciones necesarias de un emisor confiable | Su fuerza depende del proceso de verificación del emisor; no convierte una afirmación falsa en cierta |

[C2PA](https://spec.c2pa.org/specifications/specifications/2.2/explainer/Explainer.html) distingue procedencia y verdad. El [W3C](https://www.w3.org/TR/vc-data-model/) distingue afirmaciones verificables de afirmaciones verdaderas y contempla minimizar los datos compartidos. Son herramientas posibles, no integraciones implementadas ni garantía de aceptación bancaria.

**Recomendación:** priorizar eventos de plataforma, movimientos corroborados y constancias independientes sobre hechos acotados. El banco recibiría una afirmación mínima con fuente y límites, si existe finalidad y habilitación adecuadas. No recibiría un álbum del hogar como evidencia de solvencia. La familia puede seguir usando acuerdos domésticos sin aportar imágenes.

### Si se evalúan fotos en una fase posterior

1. Justificar qué hecho útil se busca comprobar y por qué no alcanza un medio menos invasivo. Una evaluación de impacto debe considerar menores, perfilado y entorno doméstico.
2. Informar antes de capturar: finalidad, destinatarios, conservación y alternativas. Separar consentimiento de uso familiar de cualquier investigación o comunicación externa; no usar casillas premarcadas.
3. Evitar personas en la toma. Recortar al objeto y eliminar texto, reflejos y metadatos innecesarios, incluida ubicación; procesar localmente cuando sea viable y previsualizar antes de enviar. El censurado automático puede fallar y necesita comprobación.
4. No confundir anonimización de una copia con anonimización del registro vinculado a la cuenta. Tratar también hashes, inferencias o características como datos vinculables cuando corresponda; un hash solo comprueba coincidencia, no autoría ni verdad.
5. Si se adopta procedencia, registrar qué transformaciones se hicieron sin exponer datos identificativos innecesarios del original. Eliminar EXIF o recortar puede afectar firmas existentes: validar el pipeline completo.
6. Preferir comprobación acotada y constancia mínima. Conservar originales únicamente cuando se justifique, con plazo definido, acceso restringido y proceso de eliminación; no prometer borrar automáticamente sin contemplar reclamaciones y obligaciones aplicables.
7. No utilizar reconocimiento facial ni detección de IA como árbitro único. No pedir vigilancia continua, ubicación o documentos del hogar para probar tareas.

Estas fotografías no se solicitan ni se almacenan en el piloto. No se implementó un cargador que aparentara dar verificación bancaria sin un proceso real detrás.

## Supuestos y controles pendientes para producción

| Código | Supuesto necesario | Control o validación requerida |
| --- | --- | --- |
| O-01 | Navegador, reloj y rol elegidos por el usuario no son confiables | Backend con sesiones, identidad, vínculos y permisos por recurso. Eliminar controles de escenario en producción |
| O-02 | Fecha declarada y observada son diferentes | Hora de servidor y versiones. En modo offline distinguir fecha declarada y recepción; no atribuir mora solo por falta de conectividad |
| O-03 | El dinero de demo no es evidencia real | Integración autorizada, confirmación del proveedor, conciliación, IDs únicos e idempotencia. Excluir importes simulados/importados |
| O-04 | Padre e hijo pueden compartir interés en un resultado | Identificar fuentes relacionadas; no sumar sus dos confirmaciones como dos verificaciones independientes |
| O-05 | El historial puede editarse o borrarse en localStorage | Almacenamiento protegido, bitácora con actor/fecha/versión y correcciones mediante nuevos eventos. Acceso administrativo auditado |
| O-06 | La bitácora no debe conservar todo para siempre | Retención por categorías y finalidad, borrado/desvinculación cuando proceda, acceso/corrección y trazabilidad compatible con derechos |
| O-07 | Puede haber reintentos y operaciones simultáneas | Transacciones, concurrencia y pruebas contra doble desembolso, doble validación y doble conteo |
| O-08 | Una cuenta verificada no prueba una tarea | Procesos de corroboración independientes con alcance explícito; auditorías y calidad de fuentes |
| O-09 | La evidencia puede ser insuficiente | Resultado neutral, canal de reclamación y revisión accesible. Los desacuerdos no producen sanción crediticia automática |
| O-10 | Dispositivos compartidos y pocos registros son normales | No tratarlos como fraude. Medir desventajas indirectas por acceso a tecnología, tiempo del adulto o recursos familiares |
| O-11 | El abandono del adulto no describe conducta del menor | Separar revisión, reporte y desempeño; evaluar datos faltantes y sesgo de selección; no fabricar etiquetas positivas o negativas |
| O-12 | La selección de éxitos distorsiona análisis | Un programa futuro se define prospectivamente; resultados completos por cohortes y reglas transparentes, sin impedir derechos de retirada/supresión aplicables |
| O-13 | Anomalía no equivale a culpabilidad | Reglas calibradas, revisión proporcional, motivos y posibilidad de corregir. No implementar un detector ficticio en la demo |
| O-14 | Recolección y uso bancario son finalidades distintas | Base aplicable, información y consentimiento correspondiente, contratos/responsabilidades, registro de decisiones y revisión jurídica |
| O-15 | Niños, adultos y terceros tienen datos diferentes | Minimización, verificación de consentimiento según flujo/edad, protección de terceros, ausencia de rastreadores innecesarios |
| O-16 | Proveedores pueden recibir información | Cifrado, gestión de claves, aislamiento familiar, acceso mínimo, contratos, ubicaciones y transferencias evaluadas |
| O-17 | Un evento verdadero puede no predecir solvencia | Estudio con resultados adultos reales, validación independiente, incertidumbre, control de sesgos y aprobación de la institución antes de usarlo |
| O-18 | La educación no debe depender de aportar evidencia | Uso familiar completo sin fotos, biometría ni participación en evaluación financiera. Evitar incentivos que presionen a compartir datos |

Estos son requisitos y supuestos pendientes, no funcionalidades certificadas del prototipo. No hay envío a centrales de riesgo ni garantía de crédito. Ver la [descripción de la SBS](https://www.sbs.gob.pe/usuarios/nuestros-servicios/reporte-de-deudas) sobre qué integra su reporte.

## Verificación del piloto

`tests/loan-rules.spec.ts` y `tests/evidence-ui.spec.ts` verifican silencio neutral, confirmación tardía, conservación de fechas, reclamaciones, resultado sin conclusión, restauración sin duplicar unidades y separación entre hermanos/roles. Las pruebas de ahorro y familia anteriores permanecen. La compatibilidad conserva la clave familiar v6 y usa campos opcionales para los reportes anteriores; no borra los datos existentes.
