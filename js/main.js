/* ==========================================================================
   Próximo Nível — interactions
   Vanilla JS. No dependencies. Everything animated is transform/opacity only.
   ========================================================================== */

(function () {
  "use strict";

  // main.js is alive, so the head's "un-hide everything" failsafe isn't needed
  if (window.__pnRevealFailsafe) {
    window.clearTimeout(window.__pnRevealFailsafe);
    window.__pnRevealFailsafe = null;
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function on(el, type, fn, opts) {
    if (el) el.addEventListener(type, fn, opts);
  }

  /* ------------------------------------------------------------------------
     Header: solid + blurred once the page has moved
     ------------------------------------------------------------------------ */

  var header = document.querySelector(".header");
  var waSticky = document.querySelector(".wa-sticky");

  function onScrollChrome() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-stuck", y > 24);
    if (waSticky) waSticky.classList.toggle("is-shown", y > 260);
  }

  /* ------------------------------------------------------------------------
     Mobile drawer
     ------------------------------------------------------------------------ */

  var burger = document.querySelector(".burger");
  var drawer = document.querySelector(".drawer");

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute("aria-expanded", String(open));
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("is-locked", open);
    if (open) {
      var first = drawer.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    }
  }

  on(burger, "click", function () {
    setDrawer(burger.getAttribute("aria-expanded") !== "true");
  });

  on(drawer, "click", function (e) {
    if (e.target.closest("a")) setDrawer(false);
  });

  on(document, "keydown", function (e) {
    if (!drawer || !drawer.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      setDrawer(false);
      burger.focus();
      return;
    }

    // Keep Tab inside the drawer — the page behind it is hidden by an opaque
    // overlay, so tabbing into it would move focus somewhere invisible.
    if (e.key !== "Tab") return;

    var focusables = drawer.querySelectorAll("a[href], button:not(:disabled)");
    if (!focusables.length) return;

    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (e.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // A resize past the breakpoint must not leave the page scroll-locked
  var mqDesktop = window.matchMedia("(min-width: 901px)");
  function onBreakpoint(e) {
    if (e.matches) setDrawer(false);
  }
  if (mqDesktop.addEventListener) mqDesktop.addEventListener("change", onBreakpoint);
  else if (mqDesktop.addListener) mqDesktop.addListener(onBreakpoint);

  /* ------------------------------------------------------------------------
     Scroll reveal — fade + rise, staggered by --i
     ------------------------------------------------------------------------ */

  var reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    // No observer: show everything rather than hiding content behind a feature
    // test, and settle the counters on their final values instead of leaving
    // the "0"/"1990" placeholders on screen.
    for (var r = 0; r < reveals.length; r++) reveals[r].classList.add("is-visible");
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el.textContent = el.getAttribute("data-count");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      // threshold 0 so tall elements and the last block before the footer
      // always trigger; the bottom inset is what delays the reveal until the
      // element is properly on screen.
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });

    /* ----------------------------------------------------------------------
       Counters — eased count-up, fires once
       ---------------------------------------------------------------------- */

    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll("[data-count]").forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var from = parseFloat(el.getAttribute("data-from") || "0");
    if (isNaN(target)) return;

    if (reduceMotion.matches) {
      el.textContent = String(target);
      return;
    }

    var duration = 1600;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      // easeOutExpo — decisive arrival, no linear counting
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(from + (target - from) * eased));
      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------------
     Hero parallax — ambient depth layer, transform only
     ------------------------------------------------------------------------ */

  var heroImg = document.querySelector("[data-parallax]");
  var heroCopy = document.querySelector("[data-parallax-copy]");
  var hero = document.querySelector(".hero");
  var heroVisible = true;
  var ticking = false;

  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        heroVisible = entries[0].isIntersecting;
      },
      { threshold: 0 }
    ).observe(hero);
  }

  function parallax() {
    if (!heroVisible || reduceMotion.matches) return;
    var y = window.scrollY;
    var limit = window.innerHeight;
    var p = Math.min(y / limit, 1);
    if (heroImg) heroImg.style.transform = "scale(1.06) translate3d(0," + (p * -42).toFixed(2) + "px,0)";
    if (heroCopy) heroCopy.style.transform = "translate3d(0," + (p * -14).toFixed(2) + "px,0)";
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollChrome();
      parallax();
      ticking = false;
    });
  }

  on(window, "scroll", onScroll, { passive: true });
  onScrollChrome();
  parallax();

  /* ------------------------------------------------------------------------
     Pointer sheen on glass cards
     ------------------------------------------------------------------------ */

  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".card, .quote").forEach(function (card) {
      on(card, "pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - rect.top) / rect.height) * 100 + "%");
      });
    });
  }

  /* ------------------------------------------------------------------------
     Testimonials carousel
     ------------------------------------------------------------------------ */

  var quotes = document.querySelector("[data-carousel]");

  if (quotes) {
    var track = quotes.querySelector(".quotes__track");
    var slides = Array.prototype.slice.call(quotes.querySelectorAll(".quote"));
    var prevBtn = quotes.querySelector("[data-carousel-prev]");
    var nextBtn = quotes.querySelector("[data-carousel-next]");
    var dotsWrap = quotes.querySelector("[data-carousel-dots]");
    var controls = quotes.querySelector(".quotes__controls");
    var index = 0;
    var maxIndex = 0;
    var timer = null;
    var AUTOPLAY = 6500;

    function perView() {
      if (!slides.length) return 1;
      var trackWidth = track.getBoundingClientRect().width;
      var slideWidth = slides[0].getBoundingClientRect().width;
      return Math.max(1, Math.round(trackWidth / slideWidth));
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (var i = 0; i <= maxIndex; i++) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "quotes__dot";
        dot.setAttribute("aria-label", "Ir para o depoimento " + (i + 1));
        dot.dataset.index = String(i);
        dotsWrap.appendChild(dot);
      }
    }

    function render() {
      if (!slides.length) return;
      var gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
      var step = slides[0].getBoundingClientRect().width + gap;
      track.style.transform = "translate3d(" + -(index * step).toFixed(2) + "px,0,0)";

      slides.forEach(function (slide, i) {
        var visible = i >= index && i < index + perView();
        slide.setAttribute("aria-hidden", String(!visible));
        // Keep off-screen cards out of the tab order
        slide.querySelectorAll("a, button").forEach(function (el) {
          el.tabIndex = visible ? 0 : -1;
        });
      });

      // Disabling the button under the cursor/caret would drop focus to
      // <body> and send a keyboard user back to the top of the tab order.
      // Hand focus to the sibling control before it goes inert.
      var willDisablePrev = index === 0;
      var willDisableNext = index >= maxIndex;

      if (prevBtn && willDisablePrev && document.activeElement === prevBtn && nextBtn && !willDisableNext) {
        nextBtn.focus();
      }
      if (nextBtn && willDisableNext && document.activeElement === nextBtn && prevBtn && !willDisablePrev) {
        prevBtn.focus();
      }

      if (prevBtn) prevBtn.disabled = willDisablePrev;
      if (nextBtn) nextBtn.disabled = willDisableNext;

      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
          dot.setAttribute("aria-current", String(i === index));
        });
      }
    }

    function measure() {
      var pv = perView();
      maxIndex = Math.max(0, slides.length - pv);
      index = Math.min(index, maxIndex);
      // Nothing to page through at this width — drop the controls entirely
      if (controls) controls.hidden = maxIndex === 0;
      buildDots();
      render();
      if (maxIndex === 0) stop();
      else start();
    }

    function go(next) {
      index = Math.max(0, Math.min(next, maxIndex));
      render();
    }

    function start() {
      if (reduceMotion.matches || maxIndex === 0) return;
      stop();
      timer = window.setInterval(function () {
        go(index >= maxIndex ? 0 : index + 1);
      }, AUTOPLAY);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    on(prevBtn, "click", function () {
      go(index - 1);
      start();
    });

    on(nextBtn, "click", function () {
      go(index + 1);
      start();
    });

    on(dotsWrap, "click", function (e) {
      var dot = e.target.closest(".quotes__dot");
      if (!dot) return;
      go(parseInt(dot.dataset.index, 10));
      start();
    });

    on(quotes, "keydown", function (e) {
      if (e.key === "ArrowLeft") {
        go(index - 1);
        start();
      }
      if (e.key === "ArrowRight") {
        go(index + 1);
        start();
      }
    });

    on(quotes, "pointerenter", stop);
    on(quotes, "pointerleave", start);
    on(quotes, "focusin", stop);
    on(quotes, "focusout", function (e) {
      if (!quotes.contains(e.relatedTarget)) start();
    });

    on(document, "visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    // Swipe
    var startX = null;
    on(quotes, "pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      startX = e.clientX;
    });
    on(quotes, "pointerup", function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 45) go(dx < 0 ? index + 1 : index - 1);
      startX = null;
      start();
    });

    var resizeTimer = null;
    on(window, "resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 160);
    });

    measure();
  }

  /* ------------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------------ */

  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
