# Cumple tu primer sueño

Demo móvil de **triadTech** para la Hackathon Women in Tech · Inclusión financiera. Angular 21, TypeScript y componentes standalone, sin backend. El teléfono es interactivo; el panel externo sirve para presentar distintos perfiles al jurado.

## Abrir en local

Requiere una versión de Node compatible con Angular 21: Node 20.19+, 22.12+ o 24+. En este equipo se utilizó 22.22.2.

```sh
npm ci
npm start
```

Abrir **http://localhost:4200**. Desde un celular en la misma red, usar `http://IP-DEL-EQUIPO:4200`.

```sh
npm run build
npx playwright install chromium
npm test
```

La compilación estática queda en `dist/sueno/browser`. No abrir `src/index.html` con doble clic: Angular necesita el servidor o la compilación.

## Presentación sugerida (3 minutos)

1. **Inicio**: Alex tiene S/ 165 disponibles y S/ 180 reservados para una tablet de S/ 600. Agregar S/ 20; el disponible baja y la meta sube. El dinero no se cuenta dos veces.
2. **Protegido**: explicar el compromiso; abrir la meta y solicitar un retiro anticipado de S/ 30, indicando un motivo. El dinero sigue reservado.
3. **Vista del adulto**: alternar con el selector externo, abrir el detalle de Alex y autorizar el retiro o elegir conversar primero. Mostrar un aporte voluntario y enviar ánimo; el mensaje aparece en el Inicio del hijo. Seleccionar a Lucía para mostrar sus propias metas y estadísticas.
4. **Aprende**: mover la edad a 10 y luego a 17 desde el panel. Cambian el estilo visual, los ejemplos, el vocabulario y las actividades.
5. **Ejemplos**: abrir «Empezar con otro ejemplo» y cargar «Ver una meta cumplida» para mostrar la meta al 100%. Pide confirmar porque reemplaza los datos financieros de toda la familia; conserva perfiles y abre al hijo seleccionado.
6. **Ampliar teléfono**: oculta los paneles externos y amplía el teléfono. «Volver a la vista completa» permite salir.

En una pantalla estrecha la app ocupa el celular real. El botón flotante de controles abre la configuración de demostración.

## Familia y préstamos educativos

La vista adulta tiene Resumen, Hijos, Préstamos y Actividad. La vista del hijo conserva su experiencia de ahorro y añade una pestaña Préstamos. El detalle de un hijo siempre permanece en la vista adulta; las métricas familiares no aparecen en la vista infantil.

Para presentar el flujo nuevo: solicitar un anticipo como hijo; proponer importe, actividad repetible, unidades y calendario como adulto; aceptar como hijo; registrar entregas parciales y validarlas como adulto. El desembolso ocurre una sola vez, del fondo familiar al saldo libre del hijo correcto. Las tareas no generan devoluciones ficticias de dinero al padre.

Las unidades adicionales por demora son opcionales, con límite y plazo; no se capitalizan. Una condición nueva en un acuerdo activo necesita aceptación y entra en vigor al día siguiente. Se pueden desactivar sin borrar el antecedente de demora. El reloj externo permite avanzar días. Las estadísticas son observadas, con tamaño de muestra: no predicen solvencia ni constituyen historial crediticio oficial.

Consultar [reglas, permisos, estados, investigación y recorrido completo](docs/REGLAS-FAMILIA-Y-PRESTAMOS.md). Los perfiles de ejemplo incluyen historiales ficticios diferentes; un nuevo hijo comienza sin historial.

Cada acuerdo distingue cumplimiento y calidad de evidencia. Los reportes tienen fecha original, fecha declarada opcional y revisión separada; el silencio de 14 días se muestra como resultado no verificable, sin completar ni castigar automáticamente. Hay recordatorios internos y solicitudes de revisión de observaciones. No existe selección de éxitos para enviar a un banco. Las imágenes no se solicitan en este piloto.

**Documento clave: [ORIGEN](docs/CLAVE-ORIGEN.md)** reúne los flujos implementados, la investigación sobre fotos y alternativas, los límites legales/técnicos y los supuestos de seguridad de producción.

La [guía de voz y lenguaje](docs/VOZ-Y-LENGUAJE.md) explica la revisión de los textos y sus fuentes: los préstamos muestran una actividad y las veces que debe hacerse, las acciones nombran su resultado y los errores indican qué corregir. El modelo interno conserva sus identificadores y reglas.

El panel externo muestra primero la vista, el hijo y la edad. Los ajustes de montos, el avance de los días y los ejemplos quedan en secciones desplegables. Las [tres etapas visuales](docs/DISENO-POR-EDAD.md) usan composición, geometría y jerarquía distintas, manteniendo el mismo dinero y las mismas operaciones.

## Qué funciona

- Inicio, sueños, ahorro protegido, aprendizaje, familia y perfil.
- Crear, editar y cerrar metas; costo, plazo, ilustración y protección personalizables.
- Las metas alcanzadas pasan a «Sueños cumplidos». Usar sus fondos no reduce su progreso histórico ni elimina sus insignias. Las metas cumplidas se conservan y los nuevos objetivos se crean aparte.
- Aportes con validación de saldo, monto restante y centavos. Aporte familiar simulado independiente del saldo del adolescente.
- Retiro protegido con solicitud y autorización familiar; rechazar conserva los fondos. Las metas flexibles y las completadas permiten devolver dinero al saldo directamente.
- Para reducir el costo o desactivar la protección de una meta que ya tiene fondos reservados, primero debe recorrerse el retiro correspondiente. Editar una meta no permite eludir el compromiso.
- Cambios de saldo/ahorro desde el panel para preparar la presentación. Son ajustes del escenario, no transacciones: no generan movimientos. Ajustar manualmente el ahorro de una meta cancela sus solicitudes pendientes para evitar autorizar importes obsoletos.
- Tres etapas: Descubre (10–12), Construye (13–15), Proyecta (16–17). Actividades voluntarias, sin rachas obligatorias ni premios según el monto ahorrado.
- Persistencia local, notificaciones internas, mensajes familiares y resumen de movimientos registrados. No se inventa un resumen mensual sin fechas reales.
- Navegación fija, contenido desplazable dentro del teléfono, foco de teclado contenido en ventanas, cierre con Escape y reducción de movimiento.

## Estructura para iterar

| Ruta | Responsabilidad |
| --- | --- |
| `src/app/app.component.*` | Presentación y panel externo |
| `src/app/mobile/mobile.component.*` | Pantallas móviles, navegación y formularios |
| `src/app/parent/` | Navegación adulta, hijos, métricas y acompañamiento |
| `src/app/loans/` | Interfaz de préstamos compartida con acciones por rol |
| `src/app/core/loan-engine.ts` | Comandos y transiciones de acuerdos |
| `src/app/core/agreement-rules.ts` | Calendario, mora y métricas observadas |
| `src/app/core/demo.store.ts` | Estado, persistencia, migración y reglas de dinero |
| `src/app/core/models.ts` | Tipos y formato monetario |
| `src/app/core/lessons.ts` | Contenido y respuestas según edad |
| `src/app/shared/` | Iconos, ilustraciones SVG y tarjeta de meta |
| `src/styles.css` | Tokens de color, teléfono y estilos adaptativos |
| `src/age-themes.css` | Composición y geometría de las tres etapas visuales |
| `public/fonts/` | Fuentes locales y sus licencias SIL OFL |
| `tests/` | Pruebas de recorridos en Chromium |
| `docs/DISENO.md` | Referencias y decisiones visuales |
| `docs/legacy/` | Copia de la demo JavaScript anterior |

Los datos familiares actuales usan `primer-sueno-familia-v6` en `localStorage`. Si aún no existen, se importa `primer-sueno-angular-v5` como primer hijo, con la migración anterior de `primer-sueno-demo-v2` cuando corresponde. Las claves anteriores no se borran ni se sobrescriben. La persistencia depende del origen: los datos de GitHub Pages no se pueden leer desde localhost. Los escenarios reemplazan el estado financiero y los acuerdos de toda la familia tras confirmación; conservan los perfiles.

Las fuentes e ilustraciones se sirven desde el proyecto, sin peticiones externas durante el uso. No hay instalación PWA ni caché de servicio: se necesita mantener el servidor local abierto.

## Publicación en GitHub Pages

GitHub Pages conserva la configuración existente: publicar desde `main`, carpeta `/ (root)`. La URL es https://joana51.github.io/Cumple-tu-primer-sue-o/. No hace falta cambiar los ajustes de administración.

Para generar la misma compilación en local:

```sh
npm run build:pages
```

Este comando compila Angular y prepara el `index.html` de la raíz y `site-assets/`. **Son archivos generados: no editarlos a mano.** Los cambios de la aplicación se hacen en `src/` y `public/`. Después de ejecutar el comando, incluir los archivos generados en el commit y subirlo a `main`; GitHub publica la nueva versión. `.nojekyll` conserva los recursos de Angular sin procesamiento adicional.

El workflow `.github/workflows/pages.yml` verifica las pruebas y la compilación en cada push. La publicación la realiza el proceso de Pages ya configurado en el repositorio. Como se publica desde la raíz, otros archivos públicos del repositorio también pueden ser accesibles por su ruta; la entrada de la app utiliza únicamente los recursos compilados de `site-assets/`.

## Alcance

Prototipo educativo independiente con dinero ficticio. No realiza transferencias, no conecta cuentas, no bloquea fondos reales y no tiene autenticación. La protección real, el consentimiento de tutores y las integraciones requieren validación posterior. No usar datos bancarios ni información sensible de menores.

La identidad visible es propia de «Mi primer sueño», una propuesta de triadTech. No se incluyen logos ni recreaciones de logos de BCP, CIX o Yape en la aplicación. El aviso de independencia permanece dentro del teléfono, también en modo presentación y con formularios abiertos. La mención a Women in Tech identifica a triadTech como participante. `docs/legacy/` es una copia de referencia; la aplicación principal no la carga. Para actualizar GitHub Pages, ejecutar `npm run build:pages` antes de subir los cambios.
