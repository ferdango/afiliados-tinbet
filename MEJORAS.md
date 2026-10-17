# Puntos de mejora detectados y aplicados

La versión fiel al Figma está marcada con el tag [`figma-fiel`](../../tree/figma-fiel). Sobre esa base se revisó la landing y se aplicaron las mejoras siguientes. La sección 6 describe la segunda ronda: animaciones, sliders y microinteracciones.

## 1. Contenido y textos

| Problema en el diseño | Mejora aplicada |
|---|---|
| Textos en inglés en una landing en español: Virtuales, Hípicas, paso "Regístrate", testimonios, "20% of Comisión", "All Rights Reserved" | Traducidos y redactados en español |
| Hípicas decía *"Refer players to BitStarz…"* y un testimonio usaba el logo de **BitStarz** y hablaba de **Affilka** (marcas de terceros/competencia) | Eliminadas las referencias a otras marcas; el testimonio usa el logo de Tinbet |
| Errores ortográficos: "Conviertete", "Telefono", "Genial!", "Quién eres?", "Ya tienes una cuenta?" | "Conviértete", "Teléfono", "¡Genial!", "¿Quién eres?", "¿Ya tienes una cuenta?" |
| Listas que terminan en coma ("PagoEfectivo,", "Euro Games Technology,") | Listas cerradas correctamente |
| FAQ duplicada ("¿Con qué frecuencia se realizan los pagos?" aparece dos veces) | Reemplazada por "¿Cuánto cuesta unirme al programa?" |
| "Ver más" de proveedores no hacía nada | Despliega la lista completa de proveedores |
| Valor de la etapa "20% of Comisión por NGR" no explicaba qué es NGR | "20% del NGR" con la definición en un tooltip (`abbr`) |

## 2. Experiencia de usuario

- **Iconos de los botones:** todos los CTA usaban un guion (`line-md:minus`), que se lee como "restar/contraer". Se reemplazó por una flecha → con micro-animación al pasar el mouse.
- **Header:** queda fijo con *blur* y sombra al hacer scroll; el enlace de la sección visible se resalta (antes "Productos" estaba siempre activo). Se agregó **"Inicia sesión"** en desktop (solo existía en mobile).
- **Imagen del hero en mobile:** la capa de Figma estaba reflejada y el texto del teléfono se leía al revés. Ahora se muestra sin reflejo manteniendo la composición.
- **Acordeones animados** (pasos, FAQ y footer mobile) en lugar de aparecer/desaparecer de golpe.
- **Gauge de comisiones animado** al cambiar de etapa.
- **Proveedores en carrusel infinito** que se pausa al pasar el mouse; se quitaron los logos repetidos de Aviatrix.
- **Aparición suave** de los bloques al hacer scroll.
- **WhatsApp** abre la conversación con un mensaje prellenado.
- **Formulario:**
  - Mensajes de error por campo, en lugar de solo un borde rojo.
  - Validación de DNI (8 dígitos) o RUC (11 dígitos) y de celular peruano (9 dígitos que empiezan con 9), con formato automático `987 654 321`.
  - Estado "Enviando…" y mensaje si falla el envío.
  - Foco en el mensaje de éxito.
  - Listo para conectarse a un endpoint real (`CONFIG.formEndpoint` en `js/main.js`).

## 3. Accesibilidad

- Enlace "Saltar al contenido" y foco visible en todos los elementos interactivos.
- Menú mobile como diálogo: foco atrapado, cierre con `Esc`, `aria-expanded` y bloqueo del contenido de fondo (`inert`).
- Tabs del panel con roles ARIA y navegación con flechas, `Home` y `End`.
- Acordeones con `aria-expanded`/`aria-controls`; preguntas del FAQ como encabezados.
- Etiquetas reales (`label`) en todos los campos y errores asociados con `aria-describedby`.
- Métricas como lista de definiciones; testimonios como `blockquote`.
- Se respeta `prefers-reduced-motion` (sin animaciones ni carrusel automático).

## 4. Rendimiento

- Imágenes pesadas convertidas a **AVIF** con *fallback* PNG/JPG mediante `<picture>`. Por ejemplo: la mano del hero pasa de 1.06 MB a 77 KB, la laptop de 1.4 MB a 130 KB, y las imágenes del CTA de 0.75 MB a ~75 KB cada una.
- *Preload* con `fetchpriority="high"` de la imagen principal (distinta para desktop y mobile).
- `loading="lazy"` en todo lo que está bajo el primer pantallazo y script con `defer`.
- Imágenes que eran JPEG con extensión `.png` renombradas a `.jpg`.

## 5. SEO y legal

- `title` y `description` orientados a búsqueda, `lang="es-PE"`, Open Graph/Twitter, favicon y `theme-color`.
- Datos estructurados **FAQPage** (JSON-LD) para resultados enriquecidos en Google.
- Encabezados jerárquicos (h1 → h2 → h3) en todas las secciones.
- Aviso de **juego responsable +18** en el footer (el diseño no tenía ninguno, siendo un sitio de apuestas).

## 6. Landing moderna: animaciones e interacciones

### Textos y números
- **Títulos palabra por palabra:** cada título entra palabra por palabra al aparecer en pantalla. El degradado del título del hero se conserva durante la animación.
- **Contadores:** las métricas del hero (200,000+, 300+, S/ 15,000) y los porcentajes de las barras de comisión cuentan desde 0. Los lectores de pantalla leen siempre el valor final.
- **Aparición escalonada** de párrafos, botones, listas (ecosistema, FAQ, pasos, beneficios) y footer.

### Hero
- **Entrada animada:** el teléfono entra con un leve giro y luego flota. Las etiquetas RevShare y CPA aparecen con rebote y se balancean, y la caja de métricas sube suavemente.
- **Foco de luz** verde que sigue al cursor y halo de fondo que "respira".
- **Corrección:** la etiqueta decía "Rev Share **Desde** 50%", pero las comisiones van de 20% a 50%. Ahora dice "**Hasta** 50%".

### Sliders
- **Panel de afiliados:**
  - Píldora que se desliza entre pestañas y se llena mientras avanza sola cada 5 s.
  - Las capturas no activas se atenúan. En desktop se puede arrastrar con el mouse o hacer clic en la siguiente.
  - En mobile, al deslizar con el dedo cambia la pestaña activa.
  - La captura se "endereza" en 3D al hacer scroll.
- **Productos (desktop):** rotan solos con una barra de progreso en la tarjeta activa. El halo detrás de los dispositivos toma el color de cada producto.
- **Comisiones (desktop):**
  - La ola se dibuja de izquierda a derecha y las etapas aparecen una tras otra.
  - El gauge se llena desde 0.
  - Las etapas avanzan solas de 20% a 50%. El punto activo se convierte en barra de progreso y late.
- **Pasos de influencer (desktop):** avanzan solos con una línea de progreso vertical y una numeración 01–04. Una etiqueta sobre la imagen indica el paso actual y la imagen hace un zoom suave en cada cambio.
- **Testimonios (desktop):** dos columnas infinitas en sentidos opuestos que se pausan al pasar el mouse, junto a un texto y un CTA "Quiero ser afiliado".
- **Carruseles mobile** (productos y testimonios): puntos indicadores sincronizados con el deslizamiento. Se corrigió que la primera tarjeta quedaba pegada al borde.
- **Reglas comunes:** todo avance automático corre solo con la sección en pantalla, se pausa con el mouse o el foco encima del control y se detiene del todo en cuanto el usuario elige algo.

### Elementos nuevos
- **Cinta de beneficios:** dos bandas cruzadas en movimiento entre el hero y el panel (RevShare hasta 50%, CPA hasta S/ 600, pagos mensuales…).
- **Barra de progreso de lectura** en el header y **píldora** que se desliza al enlace de la sección activa. El scrollspy ya no deja marcado "Productos" al volver arriba.
- **Botón fijo "Regístrate gratis" en mobile:** aparece después del hero y se oculta al llegar al formulario. Antes, en mobile no había un CTA de registro visible al hacer scroll.
- **Beneficios en Contacto:** registro gratuito, comisiones, pagos mensuales y manager dedicado. Rellenan el espacio vacío que había en desktop.

### Microinteracciones
- **Botones:** brillo que los cruza al pasar el mouse, sombra y efecto "magnético" en los botones grandes.
- **Tarjetas:** foco de luz que sigue al cursor en productos, testimonios y canales de contacto.
- **Otros:**
  - FAQ con borde al pasar el mouse y el icono gira.
  - Enlaces del footer con subrayado animado.
  - WhatsApp con pulso y etiqueta "¿Hablamos?".
  - Astronauta y monedas del CTA flotando.

### Formulario
- **Etiquetas flotantes:** el nombre del campo queda visible al escribir; antes desaparecía con el placeholder.
- **Halo de color** girando detrás de la tarjeta.
- **Mensaje de éxito** con animación y confeti.

### Cuidado del rendimiento y la accesibilidad
- Sin librerías: las animaciones usan CSS (`transform`, `opacity`) y un único cálculo por cuadro al hacer scroll.
- Parallax e inclinación solo en desktop.
- Con *Reducir movimiento* activado todo se muestra quieto y sin avance automático.
- Si el script de animaciones no carga, el contenido aparece igual a los 3 s.

## Pendiente: requiere datos del negocio

Estos puntos no se pueden resolver solo con código y conviene definirlos antes de publicar:

1. **Cifras inconsistentes entre desktop y mobile en el Figma:** 300+ vs 100,000+ afiliados y S/15,000 vs S/30,000 de ingresos potenciales. Se usaron las de desktop.
2. **Tramos de comisión:** el último salta de "S/ 20,000 a S/ 25,000" a "+ S/ 50,000". Falta definir el rango entre S/ 25,000 y S/ 50,000.
3. **Testimonios:** son contenido de ejemplo (el mismo texto 5 veces, "CEO de XYZ"). Hay que reemplazarlos por testimonios reales con autorización.
4. **Video testimonial:** no hay video. Basta con poner la URL en `CONFIG.testimonialVideo` y se abre en un modal.
5. **Capturas del panel:** las 5 pestañas (Dashboard, Campañas…) muestran la misma imagen. Se necesita una captura por pestaña.
6. **URLs reales:** login de afiliados (`CONFIG.loginUrl`), endpoint del formulario (`CONFIG.formEndpoint`), redes sociales, Términos y Condiciones y enlaces de "Acerca de".
7. **Open Graph:** falta la URL de producción y una imagen social (1200×630) para `og:url` y `og:image`.
8. **Etiqueta "150+ proveedores. 10,400+ juegos y tragamonedas"** repetida en los 4 productos, incluso en Apuestas deportivas e Hípicas. Conviene un dato propio para cada producto.
9. **Tipografías:** *Charlie Display* y *Circular Std* (usadas en algunos botones del Figma) no son libres. Si Tinbet tiene licencia web, se pueden agregar; mientras tanto se usa Inter.
