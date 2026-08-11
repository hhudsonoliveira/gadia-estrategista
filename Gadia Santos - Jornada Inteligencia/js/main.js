/* ==========================================================================
   Jornada de Inteligência nos Negócios — interações
   Vanilla JS, sem dependências. Tudo animado é transform/opacity.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function on(el, type, fn, opts) {
    if (el) el.addEventListener(type, fn, opts);
  }

  /* ------------------------------------------------------------------------
     Header + barra fixa de CTA — aparecem depois de um scroll mínimo
     ------------------------------------------------------------------------ */

  var header = document.querySelector(".header");
  var stickyCta = document.querySelector(".sticky-cta");
  var offer = document.querySelector(".offer");

  function onScrollChrome() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-stuck", y > 24);

    if (stickyCta) {
      var showAfter = y > 420;
      // Esconde a barra fixa quando o cartão de oferta real já está visível,
      // para não duplicar o mesmo CTA na tela ao mesmo tempo.
      var hideBecauseOfferVisible = false;
      if (offer) {
        var r = offer.getBoundingClientRect();
        hideBecauseOfferVisible = r.top < window.innerHeight * 0.7 && r.bottom > 0;
      }
      stickyCta.classList.toggle("is-shown", showAfter && !hideBecauseOfferVisible);
    }
  }

  var ticking = false;
  on(window, "scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollChrome();
      ticking = false;
    });
  }, { passive: true });
  onScrollChrome();

  /* ------------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------------ */

  var reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    for (var r = 0; r < reveals.length; r++) reveals[r].classList.add("is-visible");
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  // Só desarma o failsafe do <head> depois que o sistema de reveal está de pé.
  // Se algo travar entre o topo deste arquivo e aqui, a rede de segurança
  // continua armada e ainda vai revelar o conteúdo passados os 4s.
  if (window.__pnRevealFailsafe) {
    window.clearTimeout(window.__pnRevealFailsafe);
    window.__pnRevealFailsafe = null;
  }

  /* ------------------------------------------------------------------------
     Contador regressivo até o início do evento
     ------------------------------------------------------------------------ */

  var clock = document.querySelector("[data-countdown]");

  if (clock) {
    // [CONFIRMAR] data/hora com a Gádia — ver briefing. Horário de Brasília
    // (UTC-3) fixado no formato ISO para não depender do fuso do visitante.
    var target = new Date(clock.getAttribute("data-countdown"));
    var els = {
      d: clock.querySelector("[data-d]"),
      h: clock.querySelector("[data-h]"),
      m: clock.querySelector("[data-m]"),
      s: clock.querySelector("[data-s]"),
    };

    function pad(n) { return String(n).padStart(2, "0"); }

    function tick(el, value) {
      if (!el) return;
      var text = pad(value);
      if (el.textContent === text) return;
      el.textContent = text;
      if (reduceMotion.matches) return;
      el.classList.add("is-ticking");
      window.setTimeout(function () { el.classList.remove("is-ticking"); }, 160);
    }

    var intervalId = null;

    function update() {
      var diff = target.getTime() - Date.now();
      if (diff <= 0) {
        clock.hidden = true;
        if (intervalId) window.clearInterval(intervalId);
        return;
      }
      var s = Math.floor(diff / 1000);
      var days = Math.floor(s / 86400);
      var hours = Math.floor((s % 86400) / 3600);
      var mins = Math.floor((s % 3600) / 60);
      var secs = s % 60;
      tick(els.d, days);
      tick(els.h, hours);
      tick(els.m, mins);
      tick(els.s, secs);
    }

    update();
    intervalId = window.setInterval(update, 1000);
  }
})();
