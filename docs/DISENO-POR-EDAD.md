# Tres etapas visuales · triadTech

## Qué se investigó y qué se puede concluir

La investigación de [Nielsen Norman Group sobre adolescentes](https://www.nngroup.com/articles/usability-of-websites-for-teenagers/) y la experiencia de [diseño con jóvenes del Department for Education](https://design-histories.education.gov.uk/find-a/designing-for-young-people) apoyan un diseño claro, fácil de recorrer y que evite tratar a adolescentes como niños pequeños. La investigación sobre jóvenes no significa que cualquier recurso gráfico «juvenil» funcione: la saturación, las animaciones y las ocurrencias visuales pueden estorbar.

[NN/G sobre cognición infantil](https://www.nngroup.com/articles/kids-cognition/) destaca las diferencias entre grupos y la importancia de considerar conocimientos y capacidades, no solo reducir el tamaño de una interfaz adulta. [UNICEF RITEC](https://www.unicef.org/childrightsandbusiness/workstreams/responsible-technology/online-gaming/ritec-design-toolbox) aporta un marco para pensar en autonomía, competencia, identidad y creatividad. RITEC estudia juego digital, especialmente edades 8–12: se utiliza como inspiración de bienestar, no como validación directa de una app financiera o de las edades mayores.

No se encontró una regla científica universal que asigne un color, círculo, diagonal o retícula a cada edad. **Las formas y paletas siguientes son hipótesis de diseño propias**, inspiradas en esos principios. Los cortes 10–12, 13–15 y 16–17 son decisiones del producto; no fronteras psicológicas exactas ni una medición de madurez.

## Direcciones implementadas

| Etapa | Composición y formas | Color, ritmo y jerarquía |
| --- | --- | --- |
| 10–12 · Descubre | Círculos, cuartos de círculo, piezas amplias y un recorrido de puntos; ilustración de la meta más presente; progreso dividido en cuatro tramos | Fondo cálido, azul de marca, amarillo y coral como acentos; separación clara entre tarjetas y superficies que invitan a actuar |
| 13–15 · Construye | Módulos desplazados, diagonales, marcos abiertos y composición en capas; ilustración ligeramente inclinada; progreso con módulos pequeños | Azul con acentos índigo y naranja; más contraste entre piezas y espacio para una identidad distinta de la infantil |
| 16–17 · Proyecta | Retículas y encuadres finos, tarjeta del dinero clara con borde superior, ilustración reducida a una miniatura; fichas educativas más editoriales | Azul, neutros fríos y verde azulado de apoyo; cifras destacadas, espacios alineados y barra de progreso continua |

El cambio se aprecia en Inicio, las metas, aprendizaje, estados de los botones, secciones y tarjetas de actividades. No se limita a cambiar radio o color de fondo. Los motivos abstractos no son gráficos de rendimiento, predicciones ni una evaluación del joven.

La alcancía, el nombre, las ubicaciones de navegación, los permisos y el significado del dinero se conservan. Los colores de error y los mensajes de estado no se utilizan para clasificar la edad o el valor del usuario. La vista adulta mantiene su diseño estable y la coherencia de marca.

## Implementación y límites

- `src/age-themes.css` reúne los tres sistemas, excluyendo la vista adulta.
- `StageArtComponent` dibuja vectores abstractos propios. No hay fotografías, mascotas añadidas ni recursos externos; los motivos se ocultan a lectores de pantalla.
- Las divisiones de la barra no añaden puntos o premios. El porcentaje exacto, la cantidad ahorrada y los requisitos de retiro son los mismos en las tres etapas.
- Se revisa que los patrones no reduzcan el contraste del texto y que no haya movimiento decorativo obligatorio. Se respeta la preferencia de movimiento reducido.
- La edad puede cambiarse con el control simple externo. No se añadieron selectores de apariencia que compliquen la presentación.

## Validación pendiente

Se inspeccionaron las tres composiciones en Inicio y Aprende y se verificaron navegación, saldos, progreso y disponibilidad del botón principal. Estas revisiones no sustituyen pruebas con personas de los tres rangos. En una fase posterior conviene comprobar identificación, sensación de respeto, legibilidad y autonomía, y considerar preferencias individuales: una persona de 12 o 17 años puede preferir otro estilo.

Evitar prometer que una paleta activa procesos mentales específicos o mejora automáticamente ahorro o aprendizaje. La hipótesis a probar es que cada dirección resulte apropiada y clara sin distraer de las decisiones financieras.
