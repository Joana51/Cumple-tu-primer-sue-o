# Decisiones del rediseño

Investigación realizada el 8 de noviembre de 2026. La referencia original y el código conservado en `legacy/` se usan para mantener el propósito y las funciones. El producto se reorganiza para una demostración móvil ante jurado.

## Identidad y contexto de BCP

La [página oficial de Banca Móvil BCP](https://www.viabcp.com/canales/banca-movil) se consultó como contexto de producto. La identidad final pertenece al proyecto «Mi primer sueño»: azul `#173E72`, acción `#245FC4`, naranja `#F4A13A`, texto `#182D4C` y fondos `#F5F7FA`. Conserva una combinación general de azul y naranja con tonos propios. No utiliza logos, recreaciones de logos, tipografías propietarias ni una firma visual que presente al banco como autor o patrocinador. Usamos DM Sans y Manrope, con licencias SIL OFL y archivos locales.

El teléfono muestra permanentemente «Mi primer sueño · Demo independiente», incluso en modo presentación y al abrir formularios. La cabecera externa conserva solo la marca propia y el botón de presentación. Las referencias a otras entidades en la documentación son informativas; el contexto de la hackathon aparece en el pie de página.

La [alcancía digital Wardaditos pertenece a BCP](https://www.viabcp.com/ayuda-bcp/wardaditos/wardaditos-es-del-bcp). [Yape Hijos ya contempla usuarios de 10 a 17 años](https://www.yape.com.pe/productos/yape-hijos), con funciones adaptadas y acompañamiento del titular. Estas referencias no demuestran viabilidad de bloquear fondos ni acceso a una API. La oportunidad representada es la combinación de metas, protección acordada, aprendizaje contextual y apoyo familiar; no se afirma que ahorrar por objetivos sea una invención nueva.

## Patrones móviles elegidos

| Referencia primaria | Aplicación en esta demo |
| --- | --- |
| [Apple: UI Design Dos and Don’ts](https://developer.apple.com/design/tips/) | Ancho ajustado a pantalla, jerarquía clara, sin desplazamiento horizontal y controles principales de al menos 44 px. |
| [Apple: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Etiquetas explícitas, información con texto además del color, foco visible y reducción de movimiento. Los píxeles CSS son una aproximación web, no una equivalencia universal a puntos nativos. |
| [Material 3: Navigation bar](https://m3.material.io/components/navigation-bar/overview) | Cinco destinos estables con icono y etiqueta; ahorro protegido tiene un destino propio por su importancia. La página requiere JavaScript; se usa como referencia del componente, sin atribuirle contenido que no pudo inspeccionarse en texto. |
| [W3C: tamaño mínimo de objetivos](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | Espaciado, regiones de interacción amplias y botones de icono etiquetados. No se declara certificación WCAG de toda la demo. |
| [Angular: compatibilidad de versiones](https://angular.dev/reference/versions) | Angular 21 compatible con el Node 22.22.2 existente, modelos en TypeScript y componentes standalone. |

La cabecera y barra inferior permanecen visibles dentro del teléfono; solo se desplaza el contenido central. Los formularios aparecen como hojas inferiores contenidas en el dispositivo. Las ventanas atrapan el foco, vuelven al control de origen y se cierran con Escape. El panel de configuración queda fuera del producto; en pantallas pequeñas se abre con un botón.

## Adaptación por edad

| Etapa | Visual | Aprendizaje |
| --- | --- | --- |
| 10–12 · Descubre | Superficies cálidas, esquinas suaves, ilustración y motivación extra | Guardar una parte, deseos y necesidades con ejemplos concretos |
| 13–15 · Construye | Equilibrio entre cercanía y autonomía, tarjetas azules claras | Presupuesto sencillo, separar dinero y consecuencias de un retiro |
| 16–17 · Proyecta | Azul sobrio, tarjetas menos redondeadas y decoración reducida | Presupuesto con imprevistos y costo de oportunidad |

Estas bandas son una decisión de diseño, no una evaluación del nivel real de comprensión. Deben validarse con adolescentes y tutores. No cambian las condiciones de acceso al dinero: cambian lenguaje, ejemplos y presentación.

## Reglas comprobables

Un aporte reduce el saldo disponible y aumenta el ahorro en igual cantidad; no crea dinero. Un retiro anticipado protegido deja los saldos intactos mientras la solicitud está pendiente. Autorizar aplica el retiro una sola vez; conversar primero lo rechaza sin cambiar fondos. Un aporte familiar crea una contribución externa simulada y queda registrado como tal. Al completar una meta se permite liberar el ahorro. Para cerrar una meta con fondos, primero se recorre el retiro correspondiente.

La pantalla familiar reconoce esfuerzo sin puntuar al adolescente por su dinero. Las actividades no condicionan el acceso al ahorro y no penalizan pausas. El historial educativo no se presenta como historial crediticio.

## Validación posterior

Para un producto real se necesita investigación con usuarios, revisión del banco, consentimiento aplicable, autenticación con roles, backend transaccional, manejo de emergencias y auditoría de accesibilidad en dispositivos y lectores de pantalla. El prototipo permite revisar la experiencia y las reglas simuladas; no demuestra seguridad bancaria ni integración regulatoria.
