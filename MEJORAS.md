# Puntos de mejora detectados y aplicados

La versión fiel al Figma está marcada con el tag [`figma-fiel`](../../tree/figma-fiel). Sobre esa base se revisó la landing y se aplicaron las mejoras siguientes.

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
