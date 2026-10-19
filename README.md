# Afiliados Tinbet — Landing

Landing del Programa de Afiliados de Tinbet maquetada en **HTML, CSS y JavaScript puro** (sin dependencias ni build) a partir del diseño de Figma *Tinbet Afiliados Landing Page* (página "UI Design Desktop": frame desktop de 1512 px, frame Android de 360 px y menú móvil).

## Cómo verla

Abre `index.html` en el navegador o levanta un servidor estático:

```bash
python3 -m http.server 5500
```

y entra a <http://localhost:5500>.

## Versiones

- Tag [`figma-fiel`](../../tree/figma-fiel): maquetación tal cual el diseño de Figma.
- `master`: versión mejorada (contenido, UX, accesibilidad, rendimiento, SEO) y modernizada con animaciones, sliders automáticos y microinteracciones. El detalle está en [MEJORAS.md](MEJORAS.md).

## Configuración

Al inicio de `js/main.js` está el objeto `CONFIG`:

| Clave | Uso |
|---|---|
| `formEndpoint` | Endpoint que recibe el formulario por `POST` en JSON. Si está vacío, el envío se simula |
| `testimonialVideo` | Video por defecto para las tarjetas de video que no tengan `data-video` |

Los botones **"Iniciar sesión"** (`data-login-link`) y **"Regístrate"** (`data-register-link`) tienen su URL directamente en `index.html`:

- `https://www.tinbet.pe/es/home#login`
- `https://www.tinbet.pe/es/register`

## Widget de contacto (Bitrix24)

- Al final de `index.html` está el cargador del widget de `tinbet.bitrix24.es`, que reemplaza al botón flotante de WhatsApp.
- Los canales que muestra (chat, WhatsApp, etc.) se configuran en Bitrix24 › CRM › Widget del sitio, sin tocar el código.
- Los enlaces con `data-chat-open` abren ese chat; si el widget no cargó, siguen su enlace de WhatsApp.
- En mobile, `css/styles.css` reubica el widget junto al botón fijo de registro. Mientras hay un modal o el menú abiertos, se oculta con la clase `has-overlay`.

## Video testimonial

Las tarjetas de video de **Testimonios** abren un modal con el video que indique su atributo `data-video` en `index.html`:

```html
<button class="testimonial-video" type="button" aria-label="Ver video testimonial" data-video="assets/video/testimonio.mp4">
```

- **Archivo propio:** subirlo a `assets/video/` en formato `.mp4` (H.264), `.webm` o `.mov`. GitHub no acepta archivos de más de 100 MB; conviene que pese menos de 30 MB.
- **YouTube:** pegar el enlace tal cual (`youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…`). Se reproduce con `youtube-nocookie.com`.
- Los videos verticales (de celular o Shorts) se muestran automáticamente en formato 9:16.
- Mientras no haya video, el modal muestra "Muy pronto podrás ver este testimonio en video".

## SEO

- **URL pública y canónica:** `https://ferdango.github.io/afiliados-tinbet/`. Si la landing pasa a un dominio propio, se reemplaza en `index.html`, `sitemap.xml`, `robots.txt` y `404.html` con:

  ```bash
  grep -rl "https://ferdango.github.io/afiliados-tinbet/" index.html sitemap.xml robots.txt 404.html | xargs sed -i '' "s#https://ferdango.github.io/afiliados-tinbet/#https://NUEVO-DOMINIO/#g"
  ```

- **Archivos de SEO:** `sitemap.xml`, `robots.txt`, `site.webmanifest`, `favicon.ico`, `404.html` y `.nojekyll`.
- **Imagen social:** `assets/img/og-image.jpg` (1200×630).
- **Después de publicar:**
  - Enviar el sitemap en Google Search Console.
  - En una URL de proyecto de GitHub Pages, `robots.txt` no está en la raíz del dominio y Google no lo lee.

## Estructura

```
index.html          Marcado de todas las secciones, metadatos SEO y datos estructurados
sitemap.xml         Mapa del sitio (con imágenes)
robots.txt          Reglas para buscadores y ubicación del sitemap
site.webmanifest    Nombre, colores e iconos de la web
404.html            Página de error propia (noindex)
css/styles.css      Estilos (desktop 1512 px, ajustes 1024–1511 px y layout móvil < 1024 px)
css/motion.css      Animaciones: apariciones, títulos por palabra, entrada del hero,
                    gráfico de comisiones, flotaciones y modo de movimiento reducido
js/main.js          Menú móvil, visor de la captura del panel, sliders con avance automático
                    (productos, etapas, pasos), carruseles, acordeones, botón fijo mobile y formulario
js/motion.js        Títulos por palabra, disparadores al hacer scroll, contadores,
                    parallax y efectos de cursor
assets/img          Imágenes exportadas de Figma (PNG/JPG + versiones AVIF optimizadas)
assets/icons        Iconos SVG exportados de Figma
```

## Animaciones

- Se activan con atributos en el HTML, sin librerías:
  - `data-reveal`: el bloque aparece desde abajo al entrar en pantalla. `style="--d:.3s"` le da un retraso.
  - `data-stagger`: igual, pero hijo por hijo.
  - `data-split`: el título entra palabra por palabra.
  - `data-count`: el número cuenta desde 0. Acepta prefijos y sufijos, como `S/ 15,000` o `300+`.
  - `data-parallax="0.05"`: desplazamiento suave con el scroll, solo en desktop.
  - `data-inview`: agrega la clase `.is-inview` para animaciones propias.
- **Sliders:** avanzan solos en bucle infinito mientras están en pantalla. Del último pasan al primero sin rebobinar, gracias a copias de las primeras tarjetas.
  - Se pausan con el mouse o el foco de teclado encima.
  - Cuando el usuario elige algo, respetan su elección 6 s (`HOLD_MS` en `js/main.js`) y retoman el bucle.
- Con *Reducir movimiento* activado en el sistema operativo se muestra todo sin animar. Si `motion.js` no carga, a los 3 s todo el contenido queda visible igual.

## Notas sobre la fidelidad al diseño

- Las imágenes recortadas/rotadas usan el archivo original de Figma y reproducen el recorte (`crop`) y la matriz de transformación de cada capa en CSS, para que se vean exactamente igual sin fondos aplanados.
- La gráfica de comisiones y el hero se construyeron sobre las coordenadas de Figma y se escalan proporcionalmente en pantallas menores a 1512 px.
- Las fuentes del diseño son Montserrat e Inter (Google Fonts). *Charlie Display* y *Circular Std*, usadas en algunos botones y enlaces, no son libres; se sustituyen por Inter.
- Donde el diseño mobile y el desktop tienen textos distintos para el mismo dato, se usó el texto del desktop como fuente única.
