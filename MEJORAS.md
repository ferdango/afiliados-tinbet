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
- **Panel de afiliados:** tuvo pestañas con avance automático; en la ronda 8 se reemplazó por una sola captura (ver abajo).
- **Productos (desktop):** rotan solos con una barra de progreso en la tarjeta activa. El halo detrás de los dispositivos toma el color de cada producto.
- **Comisiones (desktop):**
  - La ola se dibuja de izquierda a derecha y las etapas aparecen una tras otra.
  - El gauge se llena desde 0.
  - Las etapas avanzan solas de 20% a 50%. El punto activo se convierte en barra de progreso y late.
- **Pasos de influencer (desktop):** avanzan solos con una línea de progreso vertical y una numeración 01–04. Una etiqueta sobre la imagen indica el paso actual y la imagen hace un zoom suave en cada cambio.
- **Testimonios (desktop):** dos columnas infinitas en sentidos opuestos que se pausan al pasar el mouse, junto a un texto y un CTA "Quiero ser afiliado".
- **Carruseles mobile** (productos y testimonios): puntos indicadores sincronizados con el deslizamiento. Se corrigió que la primera tarjeta quedaba pegada al borde.
- **Carruseles mobile en movimiento:** productos (cada 4 s) y testimonios (cada 5 s) también avanzan solos, además del panel.
- **Bucle infinito:**
  - Todos los sliders pasan del último elemento al primero sin rebobinar: el riel avanza hacia una copia de la primera tarjeta y salta, sin que se note, a la original.
  - Si el usuario elige algo (clic, toque o deslizar), se respeta su elección 6 segundos y el bucle continúa.
  - Se pausan solo mientras el mouse o el foco de teclado está sobre el control, y solo corren con la sección en pantalla.

### Elementos nuevos
- **Barra de progreso de lectura** en el header y **píldora** que se desliza al enlace de la sección activa. El scrollspy ya no deja marcado "Productos" al volver arriba.
- **Botón fijo "Regístrate gratis" en mobile:** aparece después del hero y se oculta al llegar al formulario. Antes, en mobile no había un CTA de registro visible al hacer scroll.
- **Beneficios en Contacto:** registro gratuito, comisiones, pagos mensuales y asesor dedicado. Rellenan el espacio vacío que había en desktop.

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
- **Mensaje de éxito rediseñado:**
  - Antes era una tarjeta de alto fijo casi vacía. Ahora tiene un check que se dibuja, el título personalizado ("¡Genial, Ana!"), una lista de "Qué sigue" en 3 pasos y un botón para escribir por WhatsApp.
  - Incluye un enlace a las preguntas frecuentes.
  - Al enviarse, la tarjeta se centra en pantalla y suelta confeti.

### Cuidado del rendimiento y la accesibilidad
- Sin librerías: las animaciones usan CSS (`transform`, `opacity`) y un único cálculo por cuadro al hacer scroll.
- Parallax e inclinación solo en desktop.
- Con *Reducir movimiento* activado todo se muestra quieto y sin avance automático.
- Si el script de animaciones no carga, el contenido aparece igual a los 3 s.

## 7. Revisión de todas las secciones

- **Hero:**
  - Se quitó la franja animada que cruzaba la página bajo el banner principal.
  - Sus beneficios clave pasan al hero, junto al botón: registro gratis, pagos mensuales y asesor dedicado.
  - El título ya no usa saltos de línea forzados y se reparte en líneas equilibradas.
  - En mobile, las métricas van en 2 columnas y la caja ocupa la mitad de alto.
- **Etiquetas de sección:** cada sección tiene una etiqueta ("Productos", "Plataforma", "Comisiones RevShare", "Programa de influencers", "Ayuda", "Testimonios") con el mismo estilo. Antes solo algunas tenían, y con estilos distintos.
- **Ecosistema:**
  - Antes era una lista de texto junto a la misma laptop que ya aparece en Productos. Ahora son tarjetas con iconos.
  - Productos y métodos de pago van como etiquetas, y los proveedores muestran las cifras 150+ y 10,400+ animadas.
  - País, idioma y moneda van en tarjetas cortas.
- **FAQ:** al final hay un bloque "¿Tienes otra pregunta?" con acceso directo a WhatsApp.
- **Contacto:**
  - Se eliminaron textos repetidos: "Contáctanos" aparecía como título del formulario y de los canales, y el título repetía el del CTA final.
  - Ahora el título es "Tu asesor, desde el primer día", el formulario "Regístrate gratis" (con un subtítulo) y el botón "Quiero ser afiliado". Los canales van bajo "¿Prefieres escribirnos?".
  - Se quitó el hueco vacío que quedaba entre los beneficios y los canales.
  - En mobile, el formulario aparece antes que los canales de contacto.
- **Pasos de influencer:**
  - La foto del apretón de manos iba de borde a borde con 860 px de alto y se veía ampliada y recortada. Ahora es una tarjeta 4:3 con bordes redondeados dentro del ancho del contenido; la sección pasa de unos 1240 a 870 px de alto.
  - La foto cambia con el paso: deportistas en los pasos 1 y 3, apretón de manos en el 2 y el 4.
  - En mobile, la foto del paso abierto es una tarjeta redondeada en lugar de una franja de 380 px de alto.
- **Ritmo vertical:** espaciado parejo entre secciones (≈140 px en desktop, ≈96 px en mobile). Antes variaba entre 59 y 219 px.

## 8. Panel con una sola imagen, enlaces a Tinbet y SEO completo

### Panel de afiliados
- Las pestañas y el slider se reemplazaron por **una sola captura** dentro de un marco de navegador, con brillo detrás, inclinación 3D al hacer scroll y dos etiquetas flotantes en desktop.
- Clic en la captura o en **Ampliar**: se abre completa y legible en un visor (en mobile se recorre con el dedo).
- Debajo, 4 tarjetas explican lo que muestra el panel: resumen del mes, tendencias de 12 meses, comisiones por canal y montos en soles.

### Enlaces
- **"Iniciar sesión"** (antes "Inicia sesión") en el header, el menú mobile y el hero lleva a `https://www.tinbet.pe/es/home#login`.
- **"Regístrate"** en el header, el menú mobile y el botón fijo mobile lleva a `https://www.tinbet.pe/es/register`.
- Los enlaces están en el HTML (`data-login-link` / `data-register-link`), así funcionan sin JavaScript y los leen los buscadores.
- El título del formulario pasó de "Regístrate gratis" a **"Únete al programa"**, para no confundirlo con el registro de tinbet.pe.

### SEO
- **URL canónica:** `https://ferdango.github.io/afiliados-tinbet/` (GitHub Pages, donde está publicada). Con `hreflang` es-PE y x-default.
- **Title** de 57 caracteres y **description** de 149, con las palabras clave del programa (afiliados, comisión, apuestas deportivas, casino, Perú).
- **Meta robots** con `index, follow` y vista previa grande de imágenes.
- **Open Graph y X (Twitter)** completos, con una **imagen social de 1200×630** (`assets/img/og-image.jpg`).
- **Datos estructurados** (JSON-LD) enlazados entre sí: Organization (logo, correo, teléfono), WebSite, ImageObject y WebPage + FAQPage con las 5 preguntas.
- **`sitemap.xml`** con la página, sus versiones de idioma y las imágenes principales.
- **`robots.txt`** que permite todo y apunta al sitemap.
- **Iconos:** `favicon.ico`, PNG de 32 y 48 px, `apple-touch-icon` de 180 px e iconos de 192 y 512 px, generados desde el logo vectorial del Figma.
- **`site.webmanifest`** con nombre, colores e iconos.
- **Página 404** propia con `noindex`.
- **`.nojekyll`** para que GitHub Pages publique los archivos tal cual.
- `decoding="async"` en las imágenes diferidas; un solo `h1` y encabezados sin saltos de nivel; todas las imágenes con `alt`, ancho y alto.

## 9. Footer, redes y video testimonial

- **Footer en mobile:** los acordeones "Afiliados" y "Acerca de" empiezan cerrados (antes "Afiliados" venía abierto) y la lista entra con una animación suave. En desktop las listas siempre se ven y el título ya no se anuncia como desplegable a los lectores de pantalla.
- **Redes sociales:** se enlazaron las 4 redes, que también figuran como perfiles oficiales (`sameAs`) en los datos estructurados:
  - Facebook → `https://www.facebook.com/tinbet.pe.oficial`
  - Instagram → `https://www.instagram.com/tinbet.oficial/` (sin el parámetro de seguimiento `srtk` del enlace compartido)
  - TikTok → `https://www.tiktok.com/@tiotinbet`
  - YouTube → `https://www.youtube.com/@tinbetplay`
- **Widget de Bitrix24:**
  - El botón flotante de WhatsApp se reemplazó por el widget de contacto de Bitrix24 (`tinbet.bitrix24.es`), que hoy abre el chat "Soporte en línea".
  - En mobile se ubica en la esquina, alineado con el botón fijo "Regístrate gratis" (Bitrix lo ponía encima). Se oculta mientras están abiertos el menú o un modal.
  - Los botones "Escríbenos" del FAQ y "Chatea con nosotros" del mensaje de éxito también abren ese chat, así las conversaciones quedan en el CRM. Si el widget no carga, abren WhatsApp como respaldo.
- **Video testimonial:**
  - La tarjeta de video abre un modal que reproduce un **archivo subido** (`.mp4`, `.webm`, `.mov`) o un **enlace de YouTube** (incluido Shorts).
  - Cada tarjeta indica su video en `data-video`. Los verticales se muestran en 9:16.
  - El video se detiene al cerrar (botón, `Esc` o clic fuera) y el foco vuelve a la tarjeta.
  - Mientras no haya video, el modal muestra un aviso de "muy pronto" sobre la imagen de la tarjeta.

## Pendiente: requiere datos del negocio

Estos puntos no se pueden resolver solo con código y conviene definirlos antes de publicar:

1. **Cifras inconsistentes entre desktop y mobile en el Figma:** 300+ vs 100,000+ afiliados y S/15,000 vs S/30,000 de ingresos potenciales. Se usaron las de desktop.
2. **Tramos de comisión:** el último salta de "S/ 20,000 a S/ 25,000" a "+ S/ 50,000". Falta definir el rango entre S/ 25,000 y S/ 50,000.
3. **Testimonios:** son contenido de ejemplo (el mismo texto 5 veces, "CEO de XYZ"). Hay que reemplazarlos por testimonios reales con autorización.
4. **Video testimonial:** falta el archivo o el enlace de YouTube; se pone en `data-video` de la tarjeta (ver README).
5. **Captura del panel:** se usa una captura con datos de ejemplo. Conviene una captura oficial y actual.
6. **URLs reales:** endpoint del formulario (`CONFIG.formEndpoint`), Términos y Condiciones y enlaces de "Acerca de". Quedan 6 enlaces con `href="#"`; los buscadores los marcan como enlaces vacíos.
7. **Dominio propio:** si la landing se mueve a un dominio propio, hay que cambiar la URL canónica (ver README). Además, en GitHub Pages el `robots.txt` solo se lee si está en la raíz del dominio: con la URL actual (`/afiliados-tinbet/`) Google no lo usa, así que el sitemap se debe enviar a mano en Google Search Console.
8. **Etiqueta "150+ proveedores. 10,400+ juegos y tragamonedas"** repetida en los 4 productos, incluso en Apuestas deportivas e Hípicas. Conviene un dato propio para cada producto.
9. **Tipografías:** *Charlie Display* y *Circular Std* (usadas en algunos botones del Figma) no son libres. Si Tinbet tiene licencia web, se pueden agregar; mientras tanto se usa Inter.
10. **Canal de WhatsApp en Bitrix24:** el widget está integrado, pero hoy solo tiene el chat en línea. Para que ofrezca WhatsApp hay que activar ese canal en Bitrix24 (CRM › Widget del sitio); no requiere cambios en la landing. El número de respaldo `+51 987 665 213` viene del diseño y conviene confirmarlo.
