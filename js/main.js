(function () {
  'use strict';

  /* ---------------------------------------------------------
     Configuración: completar con las URLs reales antes de publicar
     --------------------------------------------------------- */
  var CONFIG = {
    // URL del login de afiliados (botones "Inicia sesión")
    loginUrl: '',
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
     Enlaces configurables
     --------------------------------------------------------- */
  if (CONFIG.loginUrl) {
    document.querySelectorAll('[data-login-link]').forEach(function (a) {
      a.href = CONFIG.loginUrl;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------------------------------------------------------
     Header: sombra al hacer scroll + sección activa (scrollspy)
     --------------------------------------------------------- */
  var header = document.querySelector('.header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var spyLinks = document.querySelectorAll('[data-spy]');
  if ('IntersectionObserver' in window && spyLinks.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function (link) {
          var active = link.getAttribute('data-spy') === entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyLinks.forEach(function (link) {
      var section = document.getElementById(link.getAttribute('data-spy'));
      if (section) spyObserver.observe(section);
    });
  }

  /* ---------------------------------------------------------
     Aparición suave de bloques
     --------------------------------------------------------- */
  var pendingReveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var revealTicking = false;
  function revealInView() {
    revealTicking = false;
    var vh = window.innerHeight;
    pendingReveals = pendingReveals.filter(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        el.classList.add('is-visible');
        return false;
      }
      return true;
    });
    if (!pendingReveals.length) window.removeEventListener('scroll', onRevealScroll);
  }
  function onRevealScroll() {
    if (!revealTicking) { revealTicking = true; requestAnimationFrame(revealInView); }
  }
  if (reduceMotion) {
    pendingReveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    revealInView();
    window.addEventListener('scroll', onRevealScroll, { passive: true });
    window.addEventListener('resize', onRevealScroll);
  }

  /* ---------------------------------------------------------
     Menú móvil (con foco atrapado y retorno al botón)
     --------------------------------------------------------- */
  var menu = document.getElementById('menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');
  var main = document.getElementById('main');

  function menuFocusables() {
    return menu.querySelectorAll('a[href], button');
  }

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (main) main.inert = open;
    if (open) {
      menuFocusables()[0].focus();
    } else {
      openBtn.focus({ preventScroll: true });
    }
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
     Tabs del panel (con navegación por teclado)
     --------------------------------------------------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs__btn'));
  var tabPanel = document.getElementById('dash-panel');
  var screensViewport = document.querySelector('.screens__viewport');
  var screensTrack = document.querySelector('.screens__track');
  var slides = document.querySelectorAll('.screens__slide');
  var activeTab = 0;

  function showSlide(i, smooth) {
    var slide = slides[i];
    if (!slide) return;
    var offset = slide.offsetLeft - slides[0].offsetLeft;
    if (isMobile()) {
      screensTrack.style.transform = '';
      screensViewport.scrollTo({ left: offset, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    } else {
      var maxShift = screensTrack.scrollWidth - screensViewport.clientWidth;
      var shift = Math.min(offset, Math.max(0, maxShift));
      screensTrack.style.transform = 'translateX(' + -shift + 'px)';
    }
  }

  function selectTab(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    tabPanel.setAttribute('aria-labelledby', tabs[i].id);
    activeTab = i;
    showSlide(i, true);
    if (focus) {
      tabs[i].focus();
      tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(i, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) { e.preventDefault(); selectTab(next, true); }
    });
  });
  window.addEventListener('resize', function () { showSlide(activeTab, false); });

  /* ---------------------------------------------------------
     Productos
     --------------------------------------------------------- */
  var products = document.querySelectorAll('.product');
  function activateProduct(p) {
    products.forEach(function (o) { o.classList.remove('is-active'); });
    p.classList.add('is-active');
  }
  products.forEach(function (p) {
    p.addEventListener('click', function () { activateProduct(p); });
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateProduct(p); }
    });
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
    Array.prototype.slice.call(providersTrack.children).forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
      providersTrack.appendChild(clone);
    });
    providers.classList.add('is-marquee');
  }

  /* ---------------------------------------------------------
     Comisiones: etapas + gauge animado
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
  var gaugePct = 0;
  var gaugeAnim = null;

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
    gaugeFill.setAttribute('d', arcPath(180, end));
    var m1 = pt(60, end), m2 = pt(118.4, end);
    gaugeMarker.setAttribute('x1', f(m1[0]));
    gaugeMarker.setAttribute('y1', f(m1[1]));
    gaugeMarker.setAttribute('x2', f(m2[0]));
    gaugeMarker.setAttribute('y2', f(m2[1]));
    gaugeValue.textContent = Math.round(pct) + '%';
  }

  function animateGauge(to) {
    if (gaugeAnim) cancelAnimationFrame(gaugeAnim);
    if (reduceMotion) { gaugePct = to; renderGauge(to); return; }
    var from = gaugePct;
    var start = null;
    var duration = 500;
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

  function setStage(i, animate) {
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
    if (animate) animateGauge(s.pct);
    else { gaugePct = s.pct; renderGauge(s.pct); }
  }

  gaugeTrack.setAttribute('d', arcPath(180, 0));
  tiers.forEach(function (t, i) {
    t.addEventListener('click', function () { setStage(i, true); });
  });
  document.querySelector('[data-tier-prev]').addEventListener('click', function () { setStage(currentStage - 1, true); });
  document.querySelector('[data-tier-next]').addEventListener('click', function () { setStage(currentStage + 1, true); });
  setStage(0, false);

  /* ---------------------------------------------------------
     Acordeones: pasos de influencer, FAQ y footer móvil
     --------------------------------------------------------- */
  function setOpen(item, head, open) {
    item.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  var steps = document.querySelectorAll('.step');
  steps.forEach(function (step) {
    var head = step.querySelector('.step__head');
    head.addEventListener('click', function () {
      var wasOpen = step.classList.contains('is-open');
      // En desktop siempre queda un paso abierto
      if (wasOpen && !isMobile()) return;
      steps.forEach(function (o) { setOpen(o, o.querySelector('.step__head'), false); });
      if (!wasOpen) setOpen(step, head, true);
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

  document.querySelectorAll('[data-accordion]').forEach(function (col) {
    var head = col.querySelector('.footer__col-title');
    head.addEventListener('click', function () {
      if (!isMobile()) return;
      setOpen(col, head, !col.classList.contains('is-open'));
    });
  });

  /* ---------------------------------------------------------
     Video testimonial (solo si hay URL configurada)
     --------------------------------------------------------- */
  var videoBtn = document.querySelector('.testimonial-video');
  if (videoBtn) {
    var videoUrl = videoBtn.getAttribute('data-video') || CONFIG.testimonialVideo;
    if (videoUrl) {
      videoBtn.setAttribute('data-video', videoUrl);
      videoBtn.addEventListener('click', function () { openVideo(videoUrl, videoBtn); });
    } else {
      videoBtn.setAttribute('aria-disabled', 'true');
      videoBtn.setAttribute('aria-label', 'Video testimonial (próximamente)');
    }
  }

  function openVideo(url, opener) {
    var modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Video testimonial');
    var media = /\.mp4($|\?)/.test(url)
      ? '<video src="' + url + '" controls autoplay playsinline></video>'
      : '<iframe src="' + url + '" title="Video testimonial" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    modal.innerHTML = '<div class="video-modal__frame">' + media + '</div>' +
      '<button class="video-modal__close" type="button" aria-label="Cerrar video">✕</button>';
    function close() {
      modal.remove();
      document.removeEventListener('keydown', onKey);
      opener.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('.video-modal__close').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(modal);
    modal.querySelector('.video-modal__close').focus();
  }

  /* ---------------------------------------------------------
     Formulario de contacto
     --------------------------------------------------------- */
  var form = document.getElementById('lead-form');
  var success = document.querySelector('.form-success');
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
    submitText.textContent = busy ? 'Enviando…' : 'Quiero saber más';
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
      form.hidden = true;
      success.hidden = false;
      success.querySelector('.form-success__title').focus();
    }).catch(function () {
      statusEl.textContent = 'No pudimos enviar tus datos. Inténtalo nuevamente o escríbenos a afiliados@tinbet.pe.';
    }).then(function () {
      setBusy(false);
    });
  });
})();
