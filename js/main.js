/* Ayrton Brêda · JS mínimo (sem dependências) */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  /* Ano automático no rodapé */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* Header com sombra ao rolar */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Menu mobile acessível */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('menu-principal');
  if (toggle && nav) {
    var label = toggle.querySelector('.visually-hidden');
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      if (label) label.textContent = open ? 'Fechar menu' : 'Abrir menu';
    };
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) { if (mq.matches) setOpen(false); });
  }

  /* Fade-in ao rolar (desligado se o usuário preferir menos movimento) */
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ==========================================================
     ANALYTICS / PIXEL (FUTURO) — só carregar com consentimento.
     Para ativar: descomente este bloco e o banner em index.html.

  function loadTracking() {
    // Cole aqui o código do Google Analytics 4 e/ou Meta Pixel.
  }
  var consent = document.getElementById('consent');
  var saved = localStorage.getItem('ab-consent');
  if (saved === 'accept') loadTracking();
  else if (!saved && consent) consent.hidden = false;
  if (consent) consent.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-consent]');
    if (!btn) return;
    localStorage.setItem('ab-consent', btn.dataset.consent);
    consent.hidden = true;
    if (btn.dataset.consent === 'accept') loadTracking();
  });
     ========================================================== */
})();
