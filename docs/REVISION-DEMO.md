# Revisión de la demo de triadTech

## Dictamen

La aplicación está preparada para una **presentación del MVP ante el jurado**, incluido el ciclo de completar una meta, usar su ahorro y conservar el logro. Permite demostrar metas, aportes, ahorro protegido, autorización familiar y aprendizaje adaptado por edad. Los tres ajustes prioritarios del informe original están resueltos; siguen vigentes los límites de un prototipo local sin operaciones bancarias.

La revisión incluye el código, los textos renderizados en Chromium de las seis pantallas, los escenarios principales y la compilación de producción. No incluye pruebas con usuarios menores, lectores de pantalla, otros navegadores ni dispositivos físicos.

La validación se amplió con pruebas de la conservación de logros tras retiros parciales y totales, recarga de la sesión, migración de datos anteriores y visibilidad inicial del progreso y el aporte en las tres edades. La compilación y las pruebas se ejecutan con `npm run build` y `npm test`.

Resultado final: compilación de producción correcta y **12 pruebas aprobadas**. También se comprobó que crear una nueva meta con el mismo nombre de una ya cumplida no le asigna el logro anterior.

## Identidad actualizada

- La firma del proyecto dice «Una idea de triadTech».
- El pie de página identifica a triadTech y a Women in Tech.
- Los metadatos incluyen a triadTech como autor y en la descripción pública.
- Las referencias a la colaboración entre adolescente y tutor dicen «familia», «en familia» o «juntos», para distinguirlas de triadTech.
- Se mantiene «Mi primer sueño · Demo independiente» dentro del teléfono.

## ¿Quedan textos de plantilla?

No se encontraron textos visibles «Lorem ipsum», «Your company», «Coming soon», «TODO», «FIXME» ni pantallas «próximamente» en los recorridos revisados. Tampoco queda «nuestro equipo» como firma genérica de la aplicación.

Alex, la tablet de S/ 600 y los aportes iniciales son datos de ejemplo coherentes con un escenario de demostración, no campos pendientes de completar. Los placeholders «Ej. Mi primera tablet» y «Cuéntale a tu familia...» son ayudas de formulario adecuadas. Los identificadores de Angular `template` y `ng-template` son código y no aparecen como contenido ante el jurado. La copia `docs/legacy/` no se incluye en la compilación publicada.

## Correcciones realizadas

| Prioridad original | Hallazgo | Corrección |
| --- | --- | --- |
| Alta | El logro desaparecía al usar el dinero. | El hito se guarda aparte del saldo. La meta conserva el 100% histórico y aparece en «Sueños cumplidos»; los fondos aún reservados se muestran por separado. Las insignias obtenidas permanecen, incluso al recargar. |
| Media | Había notas para el presentador dentro de Familia y Perfil. | Las instrucciones sobre nombres ficticios y la autenticación simulada se trasladaron al panel externo. |
| Media | Inicio ocultaba el aporte debajo de la ilustración. | Se compactaron la cabecera, el saldo y la ilustración de Inicio. Se conserva el teléfono ampliado, los textos legibles y los botones de 44 px. El progreso y el aporte se comprobaron sin desplazamiento en 1366×768, 1440×1000 y 390×844, para 10, 14 y 17 años. |

Las sesiones previas se actualizan sin borrar sus metas: se reconocen las completadas por sus fondos o por los mensajes de logro identificables del historial. Los escenarios siguen permitiendo empezar una demostración nueva. La fecha de un hito recuperado corresponde al momento de migración, no se presenta como una fecha histórica de compra.

## Observaciones que permanecen

Hay dos actividades por cada una de las tres etapas de edad: seis en total. Es suficiente para mostrar la adaptación del MVP; no debe presentarse como un catálogo educativo completo. También conviene probar la resolución real del proyector y recordar que las pantallas secundarias conservan el desplazamiento interno habitual de una app móvil.

## Alcance que sí se puede demostrar

- Crear y ajustar metas, con plazo y aporte semanal sugerido.
- Separar dinero del saldo disponible sin duplicarlo en los saldos.
- Mantener el ahorro reservado durante una solicitud de retiro anticipado.
- Autorizar el retiro o conservar los fondos al elegir conversar primero.
- Simular aportes y mensajes de apoyo familiar.
- Cambiar edad y comprobar cambios visuales, vocabulario y actividades.
- Cambiar escenarios, usar el modo presentación y recuperar la sesión local.

La conexión bancaria, la autenticación familiar, las transferencias, las notificaciones externas, los resúmenes mensuales automáticos y las métricas de impacto con usuarios reales no están implementados. Son límites del prototipo; no impiden demostrar la experiencia si se describe su alcance correctamente.

## Entrega al jurado

Para una presentación local, mantener el servidor abierto y preparar un escenario conocido desde el panel. Los cambios de la demo persisten, por lo que recargar la página no restablece automáticamente la tablet al 30%.

Para entregar un enlace público, todavía debe publicarse y comprobarse la compilación de `dist/sueno/browser` bajo la ruta de GitHub Pages. Una compilación local correcta no verifica por sí sola ese alojamiento. No se ha realizado esa publicación como parte de esta revisión.

Recomendación: ensayar la secuencia con la pantalla que se utilizará ante el jurado y comprobar el enlace público cuando se publique. No queda pendiente ninguno de los tres ajustes prioritarios ni una limpieza de plantilla que bloquee la presentación.
