# Identidad visual · Mi primer sueño

Refinamiento de noviembre de 2026 para triadTech. Símbolo vectorial propio: alcancía de contorno y moneda.

## Investigación y criterio

- [Apple Human Interface Guidelines · App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons): concepto reconocible, pocas formas, identidad consistente y legibilidad en distintos tamaños.
- [IBM Design Language · UI icons](https://www.ibm.com/design/language/iconography/ui-icons/design/): retícula, separación entre elementos y peso de trazo coherente. Sus valores y estilos corporativos son específicos de IBM; se aplican aquí principios de construcción, sin reproducir su identidad.
- [Microsoft · App icon design](https://learn.microsoft.com/en-us/windows/apps/design/iconography/app-icon-design): metáfora clara, silueta equilibrada, pocos detalles y color al servicio del reconocimiento.

Ninguna guía establece que un contorno sea siempre más profesional que una forma rellena. La elección depende del contexto. Aquí se eligió contorno porque combina con los iconos lineales de la app y permite una identidad más sobria, conservando una metáfora comprensible para las tres edades.

## Decisiones aplicadas

- Base vectorial de 64 × 64. Alcancía y moneda comparten trazo de 4 unidades, extremos y uniones redondeados.
- Interior vacío. Se retiraron brillo, ojo, detalle monetario y relleno naranja del cuerpo; la ranura distingue una alcancía de un animal genérico.
- Moneda naranja `#f4a13a`; contorno azul `#173e72` sobre fondo claro. El reconocimiento no depende únicamente del color: existe versión monocroma.
- Para el icono de aplicación/pestaña: mismo dibujo, contorno blanco sobre campo azul y moneda naranja. No hay letras ni detalles interiores pequeños.
- En el logotipo y la interfaz se utiliza el símbolo libre, sin caja de color ni sombra. Se conserva el nombre tipográfico existente para mantener continuidad.
- Se conserva presencia en cabecera, presentación y ambas vistas del teléfono. No cambia el símbolo según la edad.

## Uso y archivos

| Archivo | Uso |
| --- | --- |
| `public/brand-symbol.svg` | Símbolo azul/naranja, fondo transparente |
| `public/brand-symbol-mono.svg` | Reproducción con una sola tinta |
| `public/app-icon.svg` | Icono sobre fondo azul; también favicon |
| `src/app/shared/brand-mark.component.ts` | Mismo dibujo como componente de la interfaz |

Mantener la proporción 1:1. Dejar al menos 8 unidades de la retícula como espacio libre exterior al colocar el símbolo junto a otros elementos. No estirar, girar, agregar sombras ni cambiar el grosor de partes individuales. Usar la versión sobre fondo azul en superficies oscuras o complejas; no colocar el símbolo azul directamente sobre azul.

El tamaño habitual mínimo del símbolo libre es 24 px. El favicon se revisó también a 16 px, donde funciona como identificador compacto y no como ilustración detallada. Se inspeccionaron 16, 24, 32, 48, 72 y 128 px, además de su integración en la app. Es una verificación visual de esta implementación, no una validación de reconocimiento con usuarios ni una comprobación de exclusividad de marca.
