# Afiliados Tinbet — Landing

Landing del Programa de Afiliados de Tinbet maquetada en **HTML, CSS y JavaScript puro** (sin dependencias ni build) a partir del diseño de Figma *Tinbet Afiliados Landing Page* (página "UI Design Desktop": frame desktop de 1512 px, frame Android de 360 px y menú móvil).

## Cómo verla

Abre `index.html` en el navegador o levanta un servidor estático:

```bash
python3 -m http.server 5500
```

y entra a <http://localhost:5500>.

## Estructura

```
index.html          Marcado de todas las secciones
css/styles.css      Estilos (desktop 1512 px, ajustes 1024–1511 px y layout móvil < 1024 px)
js/main.js          Menú móvil, tabs del panel, productos, etapas de comisión + gauge,
                    acordeones (pasos, FAQ, footer), validación del formulario y escalado
assets/img          Imágenes exportadas de Figma (originales con transparencia)
assets/icons        Iconos SVG exportados de Figma
```

## Notas sobre la fidelidad al diseño

- Las imágenes recortadas/rotadas usan el archivo original de Figma y reproducen el recorte (`crop`) y la matriz de transformación de cada capa en CSS, para que se vean exactamente igual sin fondos aplanados.
- La gráfica de comisiones y el hero se construyeron sobre las coordenadas de Figma y se escalan proporcionalmente en pantallas menores a 1512 px.
- Las fuentes del diseño son Montserrat e Inter (Google Fonts). *Charlie Display* y *Circular Std*, usadas en algunos botones y enlaces, no son libres; se sustituyen por Inter.
- Donde el diseño mobile y el desktop tienen textos distintos para el mismo dato, se usó el texto del desktop como fuente única.
