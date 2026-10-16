(function () {
  'use strict';

  var root = document.documentElement;
  var MOBILE_MAX = 1023;

  function isMobile() {
    return window.innerWidth <= MOBILE_MAX;
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
     Menú móvil
     --------------------------------------------------------- */
  var menu = document.getElementById('menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  openBtn.addEventListener('click', function () { setMenu(true); });
  closeBtn.addEventListener('click', function () { setMenu(false); });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------------------------------------------------------
     Tabs del dashboard
     --------------------------------------------------------- */
  var tabs = document.querySelectorAll('.tabs__btn');
  var screensViewport = document.querySelector('.screens__viewport');
  var screensTrack = document.querySelector('.screens__track');
  var slides = document.querySelectorAll('.screens__slide');
  var activeTab = 0;

  function showSlide(i) {
    var slide = slides[i];
    if (!slide) return;
    var offset = slide.offsetLeft - slides[0].offsetLeft;
    if (isMobile()) {
      screensTrack.style.transform = '';
      screensViewport.scrollTo({ left: offset, behavior: 'smooth' });
    } else {
      var maxShift = screensTrack.scrollWidth - screensViewport.clientWidth;
      var shift = Math.min(offset, Math.max(0, maxShift));
      screensTrack.style.transform = 'translateX(' + -shift + 'px)';
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      activeTab = i;
      showSlide(i);
    });
  });
  window.addEventListener('resize', function () { showSlide(activeTab); });

  /* ---------------------------------------------------------
     Productos
     --------------------------------------------------------- */
  var products = document.querySelectorAll('.product');
  products.forEach(function (p) {
    p.addEventListener('click', function () {
      products.forEach(function (o) { o.classList.remove('is-active'); });
      p.classList.add('is-active');
    });
  });

  /* ---------------------------------------------------------
     Comisiones: etapas + gauge
     --------------------------------------------------------- */
  var STAGES = [
    { name: 'Primera etapa', pct: 20 },
    { name: 'Segunda etapa', pct: 25 },
    { name: 'Tercera etapa', pct: 30 },
    { name: 'Cuarta etapa', pct: 35 },
    { name: 'Quinta etapa', pct: 40 },
    { name: 'Sexta etapa', pct: 50 }
  ];
  var tiers = document.querySelectorAll('.tier');
  var dots = document.querySelectorAll('.stage-card__dots i');
  var stageTitle = document.querySelector('[data-stage-title]');
  var stageValue = document.querySelector('[data-stage-value]');
  var gaugeValue = document.querySelector('[data-gauge-value]');
  var gaugeTrack = document.querySelector('.gauge__track');
  var gaugeFill = document.querySelector('.gauge__fill');
  var gaugeMarker = document.querySelector('.gauge__marker');
  var currentStage = 0;

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
    gaugeTrack.setAttribute('d', arcPath(180, 0));
    gaugeFill.setAttribute('d', arcPath(180, end));
    var m1 = pt(60, end), m2 = pt(118.4, end);
    gaugeMarker.setAttribute('x1', f(m1[0]));
    gaugeMarker.setAttribute('y1', f(m1[1]));
    gaugeMarker.setAttribute('x2', f(m2[0]));
    gaugeMarker.setAttribute('y2', f(m2[1]));
  }

  function setStage(i) {
    currentStage = (i + STAGES.length) % STAGES.length;
    var s = STAGES[currentStage];
    tiers.forEach(function (t, k) { t.classList.toggle('is-active', k === currentStage); });
    dots.forEach(function (d, k) { d.classList.toggle('is-active', k === currentStage); });
    stageTitle.textContent = s.name;
    stageValue.textContent = s.pct + '% of Comisión por NGR';
    gaugeValue.textContent = s.pct + '%';
    renderGauge(s.pct);
  }

  tiers.forEach(function (t, i) {
    t.addEventListener('click', function () { setStage(i); });
  });
  document.querySelector('[data-tier-prev]').addEventListener('click', function () { setStage(currentStage - 1); });
  document.querySelector('[data-tier-next]').addEventListener('click', function () { setStage(currentStage + 1); });
  setStage(0);

  /* ---------------------------------------------------------
     Acordeones (pasos influencer, FAQ, footer móvil)
     --------------------------------------------------------- */
  function accordion(items, headSel, openClass, single) {
    items.forEach(function (item) {
      var head = item.querySelector(headSel);
      head.addEventListener('click', function () {
        var willOpen = !item.classList.contains(openClass);
        if (single) {
          items.forEach(function (o) {
            o.classList.remove(openClass);
            o.querySelector(headSel).setAttribute('aria-expanded', 'false');
          });
        }
        item.classList.toggle(openClass, willOpen);
        head.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });
  }

  var steps = document.querySelectorAll('.step');
  // En desktop siempre debe quedar un paso abierto
  steps.forEach(function (step) {
    step.querySelector('.step__head').addEventListener('click', function () {
      var wasOpen = step.classList.contains('is-open');
      if (wasOpen && !isMobile()) return;
      steps.forEach(function (o) {
        o.classList.remove('is-open');
        o.querySelector('.step__head').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        step.classList.add('is-open');
        step.querySelector('.step__head').setAttribute('aria-expanded', 'true');
      }
    });
  });

  accordion(document.querySelectorAll('.faq-item'), '.faq-item__head', 'is-open', true);

  document.querySelectorAll('[data-accordion]').forEach(function (col) {
    var head = col.querySelector('.footer__col-title');
    head.addEventListener('click', function () {
      if (!isMobile()) return;
      var open = col.classList.toggle('is-open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------------------------------------------------------
     Formulario de contacto
     --------------------------------------------------------- */
  var form = document.getElementById('lead-form');
  var success = document.querySelector('.form-success');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (input) {
      var wrapper = input.closest('.field, .check');
      var ok = input.type === 'checkbox' ? input.checked : input.checkValidity();
      wrapper.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      var first = form.querySelector('.is-invalid input, .is-invalid select');
      if (first) first.focus();
      return;
    }
    form.hidden = true;
    success.hidden = false;
  });

  form.addEventListener('input', function (e) {
    var wrapper = e.target.closest('.field, .check');
    if (wrapper) wrapper.classList.remove('is-invalid');
  });
  form.addEventListener('change', function (e) {
    var wrapper = e.target.closest('.field, .check');
    if (wrapper) wrapper.classList.remove('is-invalid');
  });
})();
