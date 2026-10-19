/* =========================================================
   Afiliados Tinbet — Animaciones
   Títulos palabra por palabra, apariciones al hacer scroll, contadores,
   parallax y efectos de cursor.
   Se carga antes que main.js; expone window.TinbetMotion.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var MOBILE_MAX = 1023;

  window.__motionReady = true;
  root.classList.add('js');

  function isMobile() { return window.innerWidth <= MOBILE_MAX; }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function toArray(list) { return Array.prototype.slice.call(list); }
  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* ---------------------------------------------------------
     Títulos: cada palabra en su propia "ventana" para animarla
     --------------------------------------------------------- */
  var splitHeads = toArray(document.querySelectorAll('[data-split]'));
  var WJ = '⁠'; // une una palabra con la puntuación que viene en otro elemento ("influencer" + "?")

  function splitWords(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var index = 0;
    (function walk(node) {
      toArray(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) {
          if (child.tagName !== 'BR') walk(child);
          return;
        }
        if (child.nodeType !== 3) return;
        var text = child.textContent;
        var frag = document.createDocumentFragment();
        if (/^\S/.test(text) && child.previousSibling) frag.appendChild(document.createTextNode(WJ));
        text.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span');
          var inner = document.createElement('span');
          w.className = 'w';
          w.setAttribute('aria-hidden', 'true');
          inner.className = 'w__i';
          inner.style.setProperty('--wi', index++);
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        if (/\S$/.test(text) && child.nextSibling && child.nextSibling.nodeType === 1 && child.nextSibling.tagName !== 'BR') {
          frag.appendChild(document.createTextNode(WJ));
        }
        node.replaceChild(frag, child);
      });
    })(el);
    el.classList.add('is-split');
  }

  /* Palabras dentro de un texto con degradado (background-clip: text):
     al moverse dejan de recibir el fondo del contenedor, así que cada una
     pinta su tramo del mismo degradado. */
  function clipHost(word, head) {
    var node = word.parentNode;
    while (node && node !== head.parentNode) {
      var cs = getComputedStyle(node);
      var clip = cs.backgroundClip || cs.webkitBackgroundClip;
      if ((clip === 'text' || cs.webkitBackgroundClip === 'text') && cs.backgroundImage !== 'none') return node;
      node = node.parentNode;
    }
    return null;
  }

  function paintGradientWords() {
    splitHeads.forEach(function (head) {
      toArray(head.querySelectorAll('.w__i')).forEach(function (inner) {
        var host = getComputedStyle(inner).color === 'rgba(0, 0, 0, 0)' ? clipHost(inner, head) : null;
        var st = inner.style;
        if (!host) {
          st.removeProperty('background-image');
          st.removeProperty('background-size');
          st.removeProperty('background-position');
          st.removeProperty('-webkit-background-clip');
          st.removeProperty('background-clip');
          return;
        }
        // offset* ignora transform y zoom: todo queda en px CSS del mismo contenedor
        st.backgroundImage = getComputedStyle(host).backgroundImage;
        st.backgroundSize = host.offsetWidth + 'px ' + host.offsetHeight + 'px';
        st.backgroundPosition = (host.offsetLeft - inner.offsetLeft) + 'px ' + (host.offsetTop - inner.offsetTop) + 'px';
        st.webkitBackgroundClip = 'text';
        st.backgroundClip = 'text';
      });
    });
  }

  if (reduceMotion) {
    splitHeads.forEach(function (el) { el.classList.add('is-split', 'is-visible'); });
  } else {
    splitHeads.forEach(splitWords);
    paintGradientWords();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintGradientWords);
    window.addEventListener('resize', debounce(paintGradientWords, 150));
  }

  /* ---------------------------------------------------------
     Contadores (200,000+ · S/ 15,000 · 35%)
     --------------------------------------------------------- */
  function prepareCount(el) {
    var text = el.textContent.trim();
    var m = text.match(/^(\D*?)(\d[\d,]*)(.*)$/);
    if (!m) return null;
    var visual = document.createElement('span');
    var sr = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    sr.className = 'sr-only';
    sr.textContent = text;
    el.textContent = '';
    el.appendChild(visual);
    el.appendChild(sr);
    var data = { el: el, visual: visual, prefix: m[1], target: parseInt(m[2].replace(/,/g, ''), 10), suffix: m[3] };
    renderCount(data, 0);
    return data;
  }
  function renderCount(d, n) {
    d.visual.textContent = d.prefix + n.toLocaleString('en-US') + d.suffix;
  }
  function runCount(d, delay) {
    var duration = 1700;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = clamp((ts - start) / duration, 0, 1);
      var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      renderCount(d, Math.round(d.target * eased));
      if (t < 1) requestAnimationFrame(step);
    }
    setTimeout(function () { requestAnimationFrame(step); }, delay || 0);
  }

  /* ---------------------------------------------------------
     Disparadores al entrar en pantalla (por posición, sin observers)
     --------------------------------------------------------- */
  var watchers = [];
  function watch(el, fn, ratio) {
    watchers.push({ el: el, fn: fn, ratio: ratio || 0.88 });
  }
  function checkWatchers() {
    if (!watchers.length) return;
    var vh = window.innerHeight;
    watchers = watchers.filter(function (w) {
      var r = w.el.getBoundingClientRect();
      // los elementos ocultos (display: none) miden 0 y esperan a mostrarse
      if (r.bottom > 0 && r.top < vh * w.ratio && (r.width || r.height)) {
        w.fn(w.el);
        return false;
      }
      return true;
    });
  }

  function show(el) { el.classList.add('is-visible'); }

  toArray(document.querySelectorAll('[data-stagger]')).forEach(function (el) {
    toArray(el.children).forEach(function (child, i) { child.style.setProperty('--si', i); });
  });

  var hero = document.querySelector('.hero');

  if (reduceMotion) {
    toArray(document.querySelectorAll('[data-reveal], [data-stagger]')).forEach(show);
    toArray(document.querySelectorAll('[data-inview]')).forEach(function (el) { el.classList.add('is-inview'); });
    if (hero) hero.classList.add('is-ready');
  } else {
    toArray(document.querySelectorAll('[data-reveal], [data-stagger], [data-split]')).forEach(function (el) { watch(el, show); });
    toArray(document.querySelectorAll('[data-inview]')).forEach(function (el) {
      watch(el, function () {
        el.classList.add('is-inview');
        el.dispatchEvent(new CustomEvent('inview'));
      }, 0.8);
    });
    toArray(document.querySelectorAll('[data-count]')).forEach(function (el) {
      var d = prepareCount(el);
      if (!d) return;
      // en el hero la cuenta arranca cuando aparece la caja de métricas
      var inHero = hero && hero.contains(el);
      watch(el, function () { runCount(d, inHero ? 650 : 250); }, 1);
    });
    requestAnimationFrame(function () { if (hero) hero.classList.add('is-ready'); });
  }

  /* ---------------------------------------------------------
     Barra de progreso, parallax e inclinación del panel
     --------------------------------------------------------- */
  var header = document.querySelector('.header');
  var parallaxEls = toArray(document.querySelectorAll('[data-parallax]'));
  var dashboard = document.querySelector('.dashboard');
  var screens = document.querySelector('.dash-frame');
  var effectsOn = false;

  function updateEffects() {
    var vh = window.innerHeight;
    var desktop = !isMobile() && !reduceMotion;

    parallaxEls.forEach(function (el) {
      if (!desktop) { if (effectsOn) el.style.translate = ''; return; }
      // se mide el contenedor (no el elemento, que ya está desplazado)
      var box = el.offsetParent || el.parentElement;
      var r = box.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var factor = parseFloat(el.getAttribute('data-parallax')) || 0;
      var shift = clamp((r.top + r.height / 2 - vh / 2) * factor, -56, 56);
      el.style.translate = '0 ' + shift.toFixed(1) + 'px';
    });

    if (screens && dashboard) {
      if (!desktop) {
        if (effectsOn) screens.style.transform = '';
      } else {
        var top = screens.parentElement.getBoundingClientRect().top;
        var p = clamp((vh - top) / (vh * 0.7), 0, 1);
        var eased = 1 - Math.pow(1 - p, 2);
        screens.style.transform = 'perspective(1600px) rotateX(' + ((1 - eased) * 16).toFixed(2) + 'deg) scale(' + (0.92 + 0.08 * eased).toFixed(4) + ')';
      }
    }
    effectsOn = desktop;
  }

  var ticking = false;
  function onFrame() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    if (header) header.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    checkWatchers();
    updateEffects();
  }
  function requestFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  // main.js termina de registrar sus listeners antes de DOMContentLoaded
  document.addEventListener('DOMContentLoaded', onFrame);
  window.addEventListener('load', requestFrame);

  /* ---------------------------------------------------------
     Efectos de cursor (solo mouse): foco del hero, tarjetas y
     botones "magnéticos"
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--sx', (e.clientX - r.left).toFixed(0) + 'px');
        hero.style.setProperty('--sy', (e.clientY - r.top).toFixed(0) + 'px');
        hero.classList.add('has-pointer');
      });
      hero.addEventListener('pointerleave', function () { hero.classList.remove('has-pointer'); });
    }

    toArray(document.querySelectorAll('.product, .testimonial, .channel, .bento__card')).forEach(function (el) {
      el.classList.add('has-spot');
    });
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.has-spot');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
    }, { passive: true });

    toArray(document.querySelectorAll('.btn--lg')).forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.translate = (dx * 6).toFixed(1) + 'px ' + (dy * 5).toFixed(1) + 'px';
      });
      btn.addEventListener('pointerleave', function () { btn.style.translate = ''; });
    });
  }

  window.TinbetMotion = { watch: watch, reduceMotion: reduceMotion, refresh: requestFrame };
})();
