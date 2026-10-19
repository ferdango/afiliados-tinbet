(function () {
  'use strict';

  /* ---------------------------------------------------------
     Configuración
     --------------------------------------------------------- */
  var CONFIG = {
    // Los enlaces de "Iniciar sesión" y "Regístrate" están en el HTML
    // (data-login-link / data-register-link) para que funcionen sin JS y los lean los buscadores.
    // Endpoint que recibe el formulario (POST JSON). Vacío = envío simulado.
    formEndpoint: '',
    // URL del video testimonial (YouTube embed o .mp4). Vacío = sin video.
    testimonialVideo: ''
  };

  var root = document.documentElement;
  var MOBILE_MAX = 1023;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js');

  function isMobile() {
    return window.innerWidth <= MOBILE_MAX;
  }
  function toArray(list) {
    return Array.prototype.slice.call(list);
  }
  // marca que hay un modal o el menú abiertos (oculta el widget de Bitrix24)
  function setOverlay(on) {
    root.classList.toggle('has-overlay', on);
  }
  function restartClass(el, cls) {
    if (reduceMotion || !el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ---------------------------------------------------------
     Escalado de las "escenas" con posiciones absolutas
     (hero y CTA se diseñaron sobre 1272px, comisiones sobre 1512px)
     --------------------------------------------------------- */
  function updateScale() {
    var w = root.clientWidth;
    var kh = Math.min(1, (w - 48) / 1272);
    var kc = Math.min(1, w / 1512);
    root.style.setProperty('--kh', kh.toFixed(4));
    root.style.setProperty('--kc', kc.toFixed(4));
    root.style.setProperty('--km', (Math.min(w, 624) / 360).toFixed(4));
  }
  updateScale();
  window.addEventListener('resize', updateScale);

  /* ---------------------------------------------------------
     Avance automático de los sliders, en bucle infinito
     Corre mientras el bloque está en pantalla y la pestaña del navegador
     está visible. Se pausa con el mouse o el foco de teclado sobre el
     control y, cuando el usuario elige algo, respeta su elección unos
     segundos y luego retoma el bucle.
     --------------------------------------------------------- */
  var HOLD_MS = 6000;
  var autoplays = [];
  var looping = false;
  var lastTs = null;

  function createAutoplay(opts) {
    var a = {
      root: opts.root,
      duration: opts.duration,
      t: 0,
      inView: false,
      hover: false,
      focus: false,
      heldUntil: 0,
      disabled: reduceMotion || !opts.root,
      running: function () {
        return !a.disabled && a.inView && !a.hover && !a.focus && !document.hidden &&
          performance.now() >= a.heldUntil && (!opts.when || opts.when());
      },
      progress: function (p) { if (opts.onProgress) opts.onProgress(p); },
      reset: function () {
        a.t = 0;
        if (!a.disabled) a.progress(0);
        wake();
      },
      hold: function () {
        if (a.disabled) return;
        a.heldUntil = performance.now() + HOLD_MS;
        a.reset();
        setTimeout(wake, HOLD_MS + 50);
      },
      next: opts.next
    };
    if (a.disabled) return a;
    // la pausa por hover es sobre el control en sí, no sobre toda la sección
    (opts.hoverEls || [a.root]).forEach(function (el) {
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') a.hover = true; });
      el.addEventListener('pointerleave', function () { a.hover = false; wake(); });
    });
    // solo el foco de teclado pausa (un clic deja el foco en el botón y no debe frenar el bucle)
    a.root.addEventListener('focusin', function (e) {
      if (e.target.matches && e.target.matches(':focus-visible')) a.focus = true;
    });
    a.root.addEventListener('focusout', function (e) {
      if (!a.root.contains(e.relatedTarget)) { a.focus = false; wake(); }
    });
    autoplays.push(a);
    if (opts.onStart) opts.onStart();
    return a;
  }

  function loop(ts) {
    // tiempo real aunque el navegador reduzca los cuadros (tras una pausa se reinicia lastTs)
    var dt = lastTs === null ? 0 : Math.min(ts - lastTs, 1000);
    lastTs = ts;
    var any = false;
    autoplays.forEach(function (a) {
      if (!a.running()) return;
      any = true;
      a.t += dt;
      if (a.t >= a.duration) {
        a.t = 0;
        a.next();
      }
      a.progress(Math.min(1, a.t / a.duration));
    });
    if (any) requestAnimationFrame(loop);
    else { looping = false; lastTs = null; }
  }
  function wake() {
    if (looping) return;
    if (!autoplays.some(function (a) { return a.running(); })) return;
    looping = true;
    lastTs = null;
    requestAnimationFrame(loop);
  }
  function updateAutoplayView() {
    var vh = window.innerHeight;
    autoplays.forEach(function (a) {
      var r = a.root.getBoundingClientRect();
      a.inView = r.bottom > vh * 0.15 && r.top < vh * 0.85 && r.height > 0;
    });
    wake();
  }
  document.addEventListener('visibilitychange', wake);

  /* ---------------------------------------------------------
     Carruseles con scroll horizontal: bucle infinito y puntos
     Al final se agregan copias de las dos primeras tarjetas. Cuando el
     carrusel se detiene sobre una copia salta, sin animación, a la
     original: así del último se pasa al primero sin "rebobinar".
     --------------------------------------------------------- */
  function markClone(el) {
    el.removeAttribute('id');
    el.setAttribute('aria-hidden', 'true');
    el.classList.remove('is-active');
    if (el.hasAttribute('tabindex') || el.matches('a, button')) el.tabIndex = -1;
    el.querySelectorAll('a, button, [tabindex]').forEach(function (c) { c.tabIndex = -1; });
    el.querySelectorAll('[id]').forEach(function (c) { c.removeAttribute('id'); });
    el.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
    return el;
  }

  function makeCarousel(opts) {
    var scroller = opts.scroller;
    var items = opts.items;
    var n = items.length;
    var all = items.slice();
    var lockUntil = 0;
    var settleTimer = null;
    var pending = false;
    var dots = null;

    items.slice(0, 2).forEach(function (item) {
      var c = markClone(item.cloneNode(true));
      c.setAttribute('data-loop-clone', '');
      opts.appendTo.appendChild(c);
      all.push(c);
    });

    function offsetOf(k) { return all[k].offsetLeft - all[0].offsetLeft; }
    function nearest() {
      var x = scroller.scrollLeft;
      var best = 0;
      var bestD = Infinity;
      all.forEach(function (item, k) {
        var d = Math.abs(offsetOf(k) - x);
        if (d < bestD) { bestD = d; best = k; }
      });
      return best;
    }
    function markDots(i) {
      if (!dots) return;
      toArray(dots.children).forEach(function (b, k) {
        b.classList.toggle('is-active', k === i);
        if (k === i) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    }
    function go(k, smooth) {
      k = Math.min(k, all.length - 1);
      lockUntil = performance.now() + (smooth ? 900 : 60);
      scroller.scrollTo({ left: offsetOf(k), behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
      markDots(k % n);
    }
    function settle() {
      var k = nearest();
      if (k >= n) {
        lockUntil = performance.now() + 60;
        scroller.scrollTo({ left: offsetOf(k - n), behavior: 'auto' });
      }
    }

    if (opts.dotsLabel) {
      dots = document.createElement('div');
      dots.className = 'dots';
      items.forEach(function (item, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', opts.dotsLabel + ' ' + (i + 1) + ' de ' + n);
        b.addEventListener('click', function () {
          go(i, true);
          if (opts.onUser) opts.onUser();
        });
        dots.appendChild(b);
      });
      opts.after.insertAdjacentElement('afterend', dots);
    }

    scroller.addEventListener('scroll', function () {
      if (!pending) {
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          var k = nearest() % n;
          markDots(k);
          if (opts.onSwipe && performance.now() >= lockUntil) opts.onSwipe(k);
        });
      }
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 140);
    }, { passive: true });
    if (opts.onUser) {
      ['touchstart', 'wheel'].forEach(function (type) {
        scroller.addEventListener(type, opts.onUser, { passive: true });
      });
    }
    window.addEventListener('resize', function () { markDots(nearest() % n); });
    markDots(0);

    return {
      all: all,
      go: go,
      next: function () { go(nearest() + 1, true); }
    };
  }

  /* ---------------------------------------------------------
     Header: sombra al hacer scroll + sección activa con píldora
     --------------------------------------------------------- */
  var header = document.querySelector('.header');
  var nav = document.querySelector('.header__nav');
  var spyLinks = toArray(document.querySelectorAll('[data-spy]'));
  var spySections = spyLinks.map(function (link) { return document.getElementById(link.getAttribute('data-spy')); });
  var activeSpy = null;

  function movePill() {
    if (!nav) return;
    if (!activeSpy || isMobile()) { nav.classList.remove('has-pill'); return; }
    nav.style.setProperty('--pill-x', activeSpy.offsetLeft + 'px');
    nav.style.setProperty('--pill-w', activeSpy.offsetWidth + 'px');
    // sin animación la primera vez: aparece directamente sobre el enlace
    nav.classList.add('has-pill');
  }

  function updateSpy() {
    // la sección activa es la que empieza más cerca por encima de la línea
    var line = window.innerHeight * 0.45;
    var current = null;
    var bestTop = -Infinity;
    spySections.forEach(function (section, i) {
      if (!section) return;
      var top = section.getBoundingClientRect().top;
      if (top <= line && top > bestTop) { bestTop = top; current = spyLinks[i]; }
    });
    if (current === activeSpy) return;
    activeSpy = current;
    spyLinks.forEach(function (link) {
      var on = link === current;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    movePill();
  }
  window.addEventListener('resize', movePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

  /* ---------------------------------------------------------
     Menú móvil (con foco atrapado y retorno al botón)
     --------------------------------------------------------- */
  var menu = document.getElementById('menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');
  var main = document.getElementById('main');
  var menuOpen = false;

  function menuFocusables() {
    return menu.querySelectorAll('a[href], button');
  }

  function setMenu(open) {
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    setOverlay(open);
    if (main) main.inert = open;
    if (open) {
      menuFocusables()[0].focus();
    } else {
      openBtn.focus({ preventScroll: true });
    }
    updateSticky();
  }
  openBtn.addEventListener('click', function () { setMenu(true); });
  closeBtn.addEventListener('click', function () { setMenu(false); });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      setMenu(false);
    } else if (e.key === 'Tab') {
      var items = menuFocusables();
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize', function () {
    if (!isMobile() && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------------------------------------------------------
     Panel: una captura con visor ampliado. En desktop se ve completa
     y legible; en mobile se recorre con el dedo.
     --------------------------------------------------------- */
  var dashScreen = document.querySelector('.dash-frame__screen');
  if (dashScreen) {
    dashScreen.addEventListener('click', function () { openZoom(dashScreen); });
  }

  function openZoom(opener) {
    var source = opener.querySelector('img');
    var modal = document.createElement('div');
    var scroller = document.createElement('div');
    var img = document.createElement('img');
    var hint = document.createElement('p');
    var closeBtn = document.createElement('button');
    modal.className = 'zoom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Captura ampliada del panel de afiliados');
    scroller.className = 'zoom-modal__scroller';
    scroller.tabIndex = 0;
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    img.width = 1600;
    img.height = 775;
    hint.className = 'zoom-modal__hint';
    hint.textContent = isMobile() ? 'Desliza para recorrer la captura' : 'Pulsa Esc o haz clic fuera de la imagen para cerrar';
    closeBtn.className = 'video-modal__close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.textContent = '✕';
    scroller.appendChild(img);
    modal.appendChild(scroller);
    modal.appendChild(hint);
    modal.appendChild(closeBtn);

    function close() {
      modal.remove();
      document.body.style.overflow = '';
      setOverlay(false);
      if (main) main.inert = false;
      document.removeEventListener('keydown', onKey);
      opener.focus({ preventScroll: true });
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'Tab') {
        // el foco queda dentro del visor
        e.preventDefault();
        (document.activeElement === closeBtn ? scroller : closeBtn).focus();
      }
    }
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target === hint) close(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setOverlay(true);
    if (main) main.inert = true;
    closeBtn.focus();
  }

  /* ---------------------------------------------------------
     Productos: en desktop la lista rota sola; en mobile el carrusel
     avanza solo en bucle, con puntos
     --------------------------------------------------------- */
  var productsRow = document.querySelector('.products__row');
  var productsList = document.querySelector('.products__list');
  var products = toArray(document.querySelectorAll('.product'));
  var devices = document.querySelector('.products__devices');
  var activeProduct = 0;

  function activateProduct(i, user) {
    products.forEach(function (o, k) {
      o.classList.toggle('is-active', k === i);
      if (k !== i) o.style.setProperty('--p', 0);
    });
    if (i !== activeProduct && devices) {
      devices.style.setProperty('--glow', products[i].style.getPropertyValue('--pc').trim());
      restartClass(devices, 'is-swapping');
    }
    activeProduct = i;
    if (user) productAuto.hold();
    else productAuto.reset();
  }

  var productAuto = createAutoplay({
    root: productsRow,
    hoverEls: [productsList],
    duration: 5000,
    when: function () { return !isMobile(); },
    next: function () { activateProduct((activeProduct + 1) % products.length); },
    onProgress: function (p) { products[activeProduct].style.setProperty('--p', p.toFixed(4)); },
    onStart: function () { productsList.classList.add('is-autoplay'); }
  });

  products.forEach(function (p, i) {
    p.addEventListener('click', function () { activateProduct(i, true); });
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateProduct(i, true); }
    });
  });
  productAuto.reset();

  var productCar = makeCarousel({
    scroller: productsList,
    items: products,
    appendTo: productsList,
    dotsLabel: 'Producto',
    after: productsList,
    onUser: function () { productCarAuto.hold(); }
  });
  var productCarAuto = createAutoplay({
    root: productsRow,
    duration: 4000,
    when: isMobile,
    next: function () { productCar.next(); }
  });

  /* ---------------------------------------------------------
     Proveedores: "Ver más" + carrusel infinito
     --------------------------------------------------------- */
  var moreBtn = document.querySelector('.ecosystem__more');
  var moreText = document.getElementById('providers-extra');
  if (moreBtn && moreText) {
    moreBtn.addEventListener('click', function () {
      var open = moreText.hidden;
      moreText.hidden = !open;
      moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      moreBtn.textContent = open ? 'Ver menos' : 'Ver más';
    });
  }

  var providers = document.querySelector('.providers');
  var providersTrack = document.querySelector('.providers__track');
  if (providers && providersTrack && !reduceMotion) {
    toArray(providersTrack.children).forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
      providersTrack.appendChild(clone);
    });
    providers.classList.add('is-marquee');
  }

  /* ---------------------------------------------------------
     Comisiones: etapas + gauge animado + avance automático
     --------------------------------------------------------- */
  var STAGES = [
    { name: 'Primera etapa', pct: 20 },
    { name: 'Segunda etapa', pct: 25 },
    { name: 'Tercera etapa', pct: 30 },
    { name: 'Cuarta etapa', pct: 35 },
    { name: 'Quinta etapa', pct: 40 },
    { name: 'Sexta etapa', pct: 50 }
  ];
  var chart = document.querySelector('.chart');
  var tiers = document.querySelectorAll('.tier');
  var dots = document.querySelectorAll('.stage-card__dots i');
  var stageCard = document.querySelector('.stage-card');
  var stageTitle = document.querySelector('[data-stage-title]');
  var stageValue = document.querySelector('[data-stage-value]');
  var gaugeValue = document.querySelector('[data-gauge-value]');
  var gaugeTrack = document.querySelector('.gauge__track');
  var gaugeFill = document.querySelector('.gauge__fill');
  var gaugeMarker = document.querySelector('.gauge__marker');
  var currentStage = 0;
  var gaugePct = 0;
  var gaugeAnim = null;
  var chartShown = reduceMotion;

  // Semicírculo: centro (111.5, 111.5), radio exterior 111.5, grosor 44.91
  var CX = 111.5, CY = 111.5, R = 111.5, r = 111.5 - 44.9086;

  function pt(radius, deg) {
    var a = deg * Math.PI / 180;
    return [CX + radius * Math.cos(a), CY - radius * Math.sin(a)];
  }
  function f(n) { return n.toFixed(2); }

  function arcPath(fromDeg, toDeg) {
    var o1 = pt(R, fromDeg), o2 = pt(R, toDeg), i2 = pt(r, toDeg), i1 = pt(r, fromDeg);
    return 'M' + f(o1[0]) + ' ' + f(o1[1]) +
      ' A' + R + ' ' + R + ' 0 0 1 ' + f(o2[0]) + ' ' + f(o2[1]) +
      ' L' + f(i2[0]) + ' ' + f(i2[1]) +
      ' A' + f(r) + ' ' + f(r) + ' 0 0 0 ' + f(i1[0]) + ' ' + f(i1[1]) + ' Z';
  }

  function renderGauge(pct) {
    var end = 180 - 180 * (pct / 100);
    gaugeFill.setAttribute('d', pct > 0.05 ? arcPath(180, end) : '');
    var m1 = pt(60, end), m2 = pt(118.4, end);
    gaugeMarker.setAttribute('x1', f(m1[0]));
    gaugeMarker.setAttribute('y1', f(m1[1]));
    gaugeMarker.setAttribute('x2', f(m2[0]));
    gaugeMarker.setAttribute('y2', f(m2[1]));
    gaugeValue.textContent = Math.round(pct) + '%';
  }

  function animateGauge(to, duration) {
    if (gaugeAnim) cancelAnimationFrame(gaugeAnim);
    if (reduceMotion) { gaugePct = to; renderGauge(to); return; }
    var from = gaugePct;
    var start = null;
    duration = duration || 600;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      gaugePct = from + (to - from) * eased;
      renderGauge(gaugePct);
      if (t < 1) gaugeAnim = requestAnimationFrame(step);
    }
    gaugeAnim = requestAnimationFrame(step);
  }

  function setStage(i, opts) {
    opts = opts || {};
    currentStage = (i + STAGES.length) % STAGES.length;
    var s = STAGES[currentStage];
    tiers.forEach(function (t, k) {
      var on = k === currentStage;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    dots.forEach(function (d, k) { d.classList.toggle('is-active', k === currentStage); });
    stageTitle.textContent = s.name;
    stageValue.textContent = s.pct + '%';
    if (opts.animate) {
      restartClass(stageCard, 'is-changing');
      animateGauge(s.pct);
    } else if (chartShown) {
      gaugePct = s.pct;
      renderGauge(s.pct);
    }
    if (opts.user) stageAuto.hold();
    else stageAuto.reset();
  }

  var stageAuto = createAutoplay({
    root: chart,
    hoverEls: [stageCard, document.querySelector('.gauge')],
    duration: 3500,
    when: function () { return chartShown && window.innerWidth > 1199; },
    next: function () { setStage(currentStage + 1, { animate: true }); },
    onProgress: function (p) { stageCard.style.setProperty('--p', p.toFixed(4)); },
    onStart: function () { stageCard.classList.add('is-autoplay'); }
  });

  gaugeTrack.setAttribute('d', arcPath(180, 0));
  tiers.forEach(function (t, i) {
    t.addEventListener('click', function () { setStage(i, { animate: true, user: true }); });
  });
  document.querySelector('[data-tier-prev]').addEventListener('click', function () { setStage(currentStage - 1, { animate: true, user: true }); });
  document.querySelector('[data-tier-next]').addEventListener('click', function () { setStage(currentStage + 1, { animate: true, user: true }); });

  // El gauge arranca vacío y se llena cuando el gráfico entra en pantalla
  function onChartShown() {
    if (chartShown) return;
    chartShown = true;
    setTimeout(function () {
      animateGauge(STAGES[currentStage].pct, 1100);
      stageAuto.reset();
    }, 1200);
  }
  if (chartShown) setStage(0);
  else {
    renderGauge(0);
    setStage(0);
    chart.addEventListener('inview', onChartShown);
    if (chart.classList.contains('is-inview')) onChartShown();
  }

  /* ---------------------------------------------------------
     Acordeones: pasos de influencer, FAQ y footer móvil
     --------------------------------------------------------- */
  function setOpen(item, head, open) {
    item.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  var steps = toArray(document.querySelectorAll('.step'));
  var stepsImage = document.querySelector('.steps__image');
  var stepsBadge = document.querySelector('.steps__badge');
  var badgeNum = document.querySelector('[data-step-num]');
  var badgeTitle = document.querySelector('[data-step-title]');
  var stepImgs = toArray(document.querySelectorAll('.steps__img'));
  var activeStep = 0;

  // cada paso indica en data-media qué foto le corresponde
  function showStepImage(i) {
    var media = steps[i].getAttribute('data-media');
    stepImgs.forEach(function (img) { img.classList.toggle('is-shown', img.getAttribute('data-media') === media); });
  }

  function openStep(i, user) {
    steps.forEach(function (o, k) {
      setOpen(o, o.querySelector('.step__head'), k === i);
      if (k !== i) o.style.removeProperty('--p');
    });
    badgeNum.textContent = ('0' + (i + 1)).slice(-2);
    badgeTitle.textContent = steps[i].querySelector('.step__title').textContent;
    showStepImage(i);
    if (i !== activeStep && !isMobile()) {
      restartClass(stepsBadge, 'is-changing');
      restartClass(stepsImage, 'is-changing');
    }
    activeStep = i;
    if (user) stepAuto.hold();
    else stepAuto.reset();
  }

  var stepAuto = createAutoplay({
    root: document.querySelector('.steps'),
    hoverEls: [document.querySelector('.steps__list')],
    duration: 5000,
    when: function () { return !isMobile(); },
    next: function () { openStep((activeStep + 1) % steps.length); },
    onProgress: function (p) { steps[activeStep].style.setProperty('--p', p.toFixed(4)); }
  });

  stepAuto.reset();

  steps.forEach(function (step, i) {
    var head = step.querySelector('.step__head');
    head.addEventListener('click', function () {
      var wasOpen = step.classList.contains('is-open');
      if (wasOpen && !isMobile()) { stepAuto.hold(); return; }
      if (wasOpen) {
        // en mobile se puede cerrar el paso abierto
        setOpen(step, head, false);
        return;
      }
      openStep(i, true);
    });
  });

  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var head = item.querySelector('.faq-item__head');
    head.addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');
      faqItems.forEach(function (o) { setOpen(o, o.querySelector('.faq-item__head'), false); });
      setOpen(item, head, willOpen);
    });
  });

  // Footer: en mobile son acordeones cerrados de inicio; en desktop las listas
  // siempre se ven, así que el título deja de anunciarse como desplegable.
  var footerCols = toArray(document.querySelectorAll('[data-accordion]'));
  function syncFooterAccordions() {
    footerCols.forEach(function (col) {
      var head = col.querySelector('.footer__col-title');
      if (isMobile()) {
        head.setAttribute('aria-expanded', col.classList.contains('is-open') ? 'true' : 'false');
        head.setAttribute('aria-controls', head.getAttribute('data-controls'));
      } else {
        head.removeAttribute('aria-expanded');
        head.removeAttribute('aria-controls');
      }
    });
  }
  footerCols.forEach(function (col) {
    var head = col.querySelector('.footer__col-title');
    head.setAttribute('data-controls', head.getAttribute('aria-controls'));
    head.addEventListener('click', function () {
      if (!isMobile()) return;
      setOpen(col, head, !col.classList.contains('is-open'));
    });
  });
  syncFooterAccordions();
  window.addEventListener('resize', syncFooterAccordions);

  /* ---------------------------------------------------------
     Testimonios: columnas infinitas (desktop) y puntos (mobile)
     --------------------------------------------------------- */
  var tGrid = document.querySelector('.testimonials__grid');
  var tItems = toArray(tGrid.querySelectorAll('.testimonial, .testimonial-video'));
  if (!reduceMotion) {
    tGrid.querySelectorAll('.testimonials__track').forEach(function (track) {
      toArray(track.children).forEach(function (item) {
        var clone = item.cloneNode(true);
        clone.setAttribute('data-clone', '');
        clone.setAttribute('aria-hidden', 'true');
        if (clone.matches('button')) clone.tabIndex = -1;
        clone.querySelectorAll('a, button').forEach(function (el) { el.tabIndex = -1; });
        track.appendChild(clone);
      });
    });
    tGrid.classList.add('is-marquee');
  }
  // mobile: carrusel en bucle (las copias del bucle se agregan al final de la segunda columna)
  var tCar = makeCarousel({
    scroller: tGrid,
    items: tItems,
    appendTo: tGrid.querySelectorAll('.testimonials__track')[1],
    dotsLabel: 'Testimonio',
    after: tGrid,
    onUser: function () { tCarAuto.hold(); }
  });
  var tCarAuto = createAutoplay({
    root: tGrid,
    duration: 5000,
    when: isMobile,
    next: function () { tCar.next(); }
  });

  /* ---------------------------------------------------------
     Video testimonial en modal
     Cada tarjeta lee su video de data-video: un archivo (.mp4, .webm, .mov)
     o un enlace de YouTube (watch, youtu.be, shorts o embed). Sin video,
     el modal avisa que estará disponible pronto.
     --------------------------------------------------------- */
  function parseVideo(url) {
    url = (url || '').trim();
    if (!url) return null;
    var yt = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) {
      return {
        type: 'youtube',
        vertical: /\/shorts\//.test(url),
        src: 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&rel=0&modestbranding=1&playsinline=1'
      };
    }
    if (/\.(mp4|webm|mov|m4v|ogv)(?:[?#]|$)/i.test(url)) return { type: 'file', src: url };
    return null;
  }

  var videoCards = toArray(tGrid.querySelectorAll('.testimonial-video'));
  videoCards.forEach(function (card) {
    if (!card.getAttribute('data-video') && CONFIG.testimonialVideo) card.setAttribute('data-video', CONFIG.testimonialVideo);
  });
  // delegado: también responden las copias del carrusel
  tGrid.addEventListener('click', function (e) {
    var card = e.target.closest('.testimonial-video');
    if (!card) return;
    // el foco vuelve a la tarjeta original, no a una copia oculta
    var opener = card.hasAttribute('data-clone') || card.hasAttribute('data-loop-clone')
      ? videoCards.filter(function (c) {
          return !c.hasAttribute('data-clone') && !c.hasAttribute('data-loop-clone') &&
            c.getAttribute('data-video') === card.getAttribute('data-video');
        })[0] || card
      : card;
    openVideo(card.getAttribute('data-video'), opener, card.querySelector('.testimonial-video__img'));
  });

  function openVideo(url, opener, poster) {
    var video = parseVideo(url);
    var modal = document.createElement('div');
    var frame = document.createElement('div');
    var closeBtn = document.createElement('button');
    modal.className = 'video-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Video testimonial');
    frame.className = 'video-modal__frame';
    closeBtn.className = 'video-modal__close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Cerrar video');
    closeBtn.textContent = '✕';

    var media;
    if (video && video.type === 'youtube') {
      media = document.createElement('iframe');
      media.src = video.src;
      media.title = 'Video testimonial';
      media.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      media.allowFullscreen = true;
      if (video.vertical) frame.classList.add('is-vertical');
    } else if (video && video.type === 'file') {
      media = document.createElement('video');
      media.src = video.src;
      media.controls = true;
      media.autoplay = true;
      media.playsInline = true;
      media.preload = 'auto';
      if (poster) media.poster = poster.currentSrc || poster.src;
      // videos grabados en vertical (celular) se muestran en formato 9:16
      media.addEventListener('loadedmetadata', function () {
        if (media.videoHeight > media.videoWidth) frame.classList.add('is-vertical');
      });
      media.addEventListener('error', function () {
        frame.replaceChildren(emptyState('No pudimos cargar el video. Inténtalo más tarde.'));
      });
    } else {
      media = emptyState('Muy pronto podrás ver este testimonio en video.');
    }

    function emptyState(text) {
      var box = document.createElement('div');
      var msg = document.createElement('p');
      box.className = 'video-modal__empty';
      if (poster) box.style.backgroundImage = 'url("' + (poster.currentSrc || poster.src) + '")';
      msg.textContent = text;
      box.appendChild(msg);
      return box;
    }

    frame.appendChild(media);
    modal.appendChild(frame);
    modal.appendChild(closeBtn);

    function close() {
      modal.remove(); // al quitar el reproductor el video se detiene
      document.body.style.overflow = '';
      setOverlay(false);
      if (main) main.inert = false;
      document.removeEventListener('keydown', onKey);
      opener.focus({ preventScroll: true });
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'Tab') {
        // el foco queda dentro del modal: botón cerrar y reproductor
        var focusables = [closeBtn];
        if (media.tagName === 'VIDEO' || media.tagName === 'IFRAME') focusables.push(media);
        var i = focusables.indexOf(document.activeElement);
        e.preventDefault();
        focusables[(i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length].focus();
      }
    }
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    setOverlay(true);
    if (main) main.inert = true;
    closeBtn.focus();
    // se llama dentro del clic del usuario: así el navegador permite reproducir con sonido
    if (media.tagName === 'VIDEO') {
      var playing = media.play();
      if (playing && playing.catch) playing.catch(function () {});
    }
  }

  /* ---------------------------------------------------------
     Botones "Escríbenos": abren el chat del widget de Bitrix24.
     Si el widget no cargó, siguen su enlace de WhatsApp como respaldo.
     --------------------------------------------------------- */
  document.querySelectorAll('[data-chat-open]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var channel = document.querySelector('.b24-widget-button-openline_livechat');
      var button = document.querySelector('.b24-widget-button-inner-container');
      var target = channel || button;
      if (!target) return;
      e.preventDefault();
      target.click();
    });
  });

  /* ---------------------------------------------------------
     Botón fijo de registro (mobile): visible entre el hero y el formulario
     --------------------------------------------------------- */
  var sticky = document.querySelector('.sticky-cta');
  var heroBtn = document.querySelector('.hero__btn');
  var contact = document.getElementById('contacto');

  function updateSticky() {
    if (!sticky) return;
    var vh = window.innerHeight;
    var show = isMobile() && !menuOpen &&
      heroBtn.getBoundingClientRect().bottom < 0 &&
      contact.getBoundingClientRect().top > vh * 0.9;
    sticky.classList.toggle('is-shown', show);
  }

  /* ---------------------------------------------------------
     Scroll: un solo cuadro por frame para header, scrollspy,
     sliders automáticos y botón fijo
     --------------------------------------------------------- */
  var scrollPending = false;
  function onScrollFrame() {
    scrollPending = false;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    updateSpy();
    updateAutoplayView();
    updateSticky();
  }
  function requestScrollFrame() {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(onScrollFrame); }
  }
  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame);
  onScrollFrame();

  /* ---------------------------------------------------------
     Formulario de contacto
     --------------------------------------------------------- */
  var form = document.getElementById('lead-form');
  var formCard = document.querySelector('.form-card');
  var success = document.querySelector('.form-success');
  var successName = document.querySelector('[data-success-name]');
  var submitBtn = form.querySelector('.lead-form__submit');
  var submitText = form.querySelector('.lead-form__submit-text');
  var statusEl = form.querySelector('.lead-form__status');

  // Solo dígitos en DNI/RUC; celular agrupado como 987 654 321
  form.documento.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 11);
  });
  form.celular.addEventListener('input', function () {
    var d = this.value.replace(/\D/g, '').replace(/^51(?=9\d{8})/, '').slice(0, 9);
    this.value = d.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  });

  function validateField(input) {
    var wrapper = input.closest('.field, .check');
    if (!wrapper) return true;
    var ok;
    if (input.type === 'checkbox') ok = input.checked;
    else if (input.name === 'nombre') ok = input.value.trim().length >= 3;
    else ok = input.checkValidity();
    var error = wrapper.querySelector('.field__error');
    wrapper.classList.toggle('is-invalid', !ok);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (error) error.textContent = ok ? '' : error.getAttribute('data-msg');
    return ok;
  }

  form.querySelectorAll('[required]').forEach(function (input) {
    input.addEventListener('blur', function () {
      if (input.value || input.closest('.is-invalid')) validateField(input);
    });
    input.addEventListener(input.tagName === 'SELECT' || input.type === 'checkbox' ? 'change' : 'input', function () {
      if (input.closest('.is-invalid')) validateField(input);
    });
  });

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.setAttribute('aria-busy', busy ? 'true' : 'false');
    submitText.textContent = busy ? 'Enviando…' : 'Quiero ser afiliado';
  }

  function sendLead(data) {
    if (!CONFIG.formEndpoint) {
      return new Promise(function (resolve) { setTimeout(resolve, 700); });
    }
    return fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
    });
  }

  function confetti(container) {
    if (reduceMotion) return;
    var wrap = document.createElement('div');
    var colors = ['#98df4b', '#41a353', '#2391ff', '#f6c52b', '#0c7ffa'];
    wrap.className = 'confetti';
    wrap.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 40; i++) {
      var piece = document.createElement('i');
      var angle = Math.random() * Math.PI * 2;
      var dist = 80 + Math.random() * 170;
      piece.style.setProperty('--cx', (Math.cos(angle) * dist).toFixed(0) + 'px');
      piece.style.setProperty('--cy', (Math.sin(angle) * dist * 0.8 + 70).toFixed(0) + 'px');
      piece.style.setProperty('--cr', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      piece.style.setProperty('--cc', colors[i % colors.length]);
      piece.style.animationDelay = (Math.random() * 0.15).toFixed(2) + 's';
      wrap.appendChild(piece);
    }
    container.appendChild(wrap);
    setTimeout(function () { wrap.remove(); }, 1900);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.textContent = '';
    var firstInvalid = null;
    form.querySelectorAll('[required]').forEach(function (input) {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var data = {
      nombre: form.nombre.value.trim(),
      documento: form.documento.value,
      celular: form.celular.value.replace(/\s/g, ''),
      email: form.email.value.trim(),
      perfil: form.perfil.value,
      experiencia: form.experiencia.value,
      acepta_terminos: form.terminos.checked,
      acepta_marketing: form.marketing.checked
    };

    setBusy(true);
    sendLead(data).then(function () {
      // "¡Genial, Ana!": primer nombre con mayúscula inicial
      var first = data.nombre.split(/\s+/)[0] || '';
      successName.textContent = first ? ', ' + first.charAt(0).toUpperCase() + first.slice(1) : '';
      form.hidden = true;
      success.hidden = false;
      success.querySelector('.form-success__title').focus({ preventScroll: true });
      // la tarjeta se acorta: se centra en pantalla para que se vea el mensaje completo
      formCard.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      confetti(formCard);
    }).catch(function () {
      statusEl.textContent = 'No pudimos enviar tus datos. Inténtalo nuevamente o escríbenos a afiliados@tinbet.pe.';
    }).then(function () {
      setBusy(false);
    });
  });
})();
