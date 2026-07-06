/* MP-Dienstleistungen — Navigation, Reveal, Kontaktformular */

(function () {
  "use strict";

  /* ---------- Mobile-Menü ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });

    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll-Reveal, gestaffelt (respektiert prefers-reduced-motion) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

  /* Staffelung: Position unter den .reveal-Geschwistern desselben Elternelements */
  revealEls.forEach(function (el) {
    var siblings = el.parentElement.querySelectorAll(":scope > .reveal");
    var idx = Array.prototype.indexOf.call(siblings, el);
    if (idx > 0) el.style.setProperty("--reveal-delay", Math.min(idx * 70, 420) + "ms");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Header-Schatten nach dem ersten Scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Bilanz-Zähler ---------- */
  var counters = document.querySelectorAll(".count");

  function renderCount(el, value, decimals) {
    el.textContent = value.toLocaleString("de-DE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var duration = 1800;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4); /* ease-out quart */
      renderCount(el, target * eased, decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (counters.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        renderCount(el, parseFloat(el.getAttribute("data-target")),
          parseInt(el.getAttribute("data-decimals") || "0", 10));
      });
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ---------- Jahr im Footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll-Video (nativ portiert) ----------
     Fahrt durch den 300vh-Abschnitt: Video faltet aus einer Pille zu voller
     Breite auf (clip-path inset + Radius), skaliert 0.7→1, Text blendet ein. */
  var sv = document.querySelector(".scrollvid");
  if (sv && reduceMotion) {
    sv.classList.add("is-static");
  } else if (sv) {
    var svHead = sv.querySelector('[data-sv="head"]');
    var svMedia = sv.querySelector('[data-sv="media"]');
    var svVideo = sv.querySelector('[data-sv="video"]');
    var svCta = sv.querySelector('[data-sv="cta"]');
    var svTicking = false;

    var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };

    var updateSV = function () {
      svTicking = false;
      var vh = window.innerHeight;
      var rect = sv.getBoundingClientRect();
      var denom = rect.height - vh * 0.5;
      if (denom <= 0) return;
      var p = clamp((vh * 0.5 - rect.top) / denom, 0, 1);

      var pf = Math.min(p / 0.8, 1);
      var inset = (1 - pf) * 45;
      var radius = 1000 - p * (1000 - 16);
      var scale = 0.7 + pf * 0.3;

      if (svMedia) {
        svMedia.style.clipPath =
          "inset(" + inset + "% " + inset + "% " + inset + "% " + inset +
          "% round " + radius + "px)";
      }
      if (svVideo) svVideo.style.transform = "scale(" + scale + ")";

      var tp = clamp((p - 0.08) / 0.5, 0, 1);
      if (svHead) {
        svHead.style.opacity = tp;
        svHead.style.transform = "translateY(" + (1 - tp) * 40 + "px)";
        svHead.style.filter = "blur(" + (1 - tp) * 8 + "px)";
      }
      var cp = clamp((p - 0.5) / 0.4, 0, 1);
      if (svCta) {
        svCta.style.opacity = cp;
        svCta.style.transform = "translateY(" + (1 - cp) * 28 + "px)";
      }
    };

    var onSVScroll = function () {
      if (!svTicking) { svTicking = true; requestAnimationFrame(updateSV); }
    };
    window.addEventListener("scroll", onSVScroll, { passive: true });
    window.addEventListener("resize", onSVScroll, { passive: true });
    updateSV();

    /* Video nur abspielen, während der Abschnitt sichtbar ist */
    if ("IntersectionObserver" in window && svVideo) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var pr = svVideo.play();
            if (pr && pr.catch) pr.catch(function () {});
          } else {
            svVideo.pause();
          }
        });
      }, { threshold: 0.05 }).observe(sv);
    }
  }

  /* ---------- Kontaktformular mit Rechen-Captcha ---------- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var captchaQ = document.getElementById("captcha-question");
  var captchaInput = document.getElementById("cf-captcha");
  var status = document.getElementById("form-status");
  var a = 0, b = 0;

  function newCaptcha() {
    a = 2 + Math.floor(Math.random() * 8);
    b = 1 + Math.floor(Math.random() * 8);
    captchaQ.textContent = "Was ergibt " + a + " + " + b + "?";
    captchaInput.value = "";
  }
  newCaptcha();

  function setStatus(msg, isError) {
    status.textContent = msg;
    status.classList.toggle("is-error", !!isError);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("cf-name").value.trim();
    var email = document.getElementById("cf-email").value.trim();
    var message = document.getElementById("cf-message").value.trim();
    var consent = document.getElementById("cf-consent").checked;

    if (!name || !email || !message) {
      setStatus("Bitte füllen Sie alle Pflichtfelder aus.", true);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus("Bitte geben Sie eine gültige E-Mail-Adresse ein.", true);
      return;
    }
    if (parseInt(captchaInput.value, 10) !== a + b) {
      setStatus("Der Spam-Schutz-Code ist nicht korrekt. Bitte erneut versuchen.", true);
      newCaptcha();
      return;
    }
    if (!consent) {
      setStatus("Bitte bestätigen Sie die Einwilligung zur Datenverarbeitung.", true);
      return;
    }

    /* Statische Seite ohne Backend: Anfrage per E-Mail-Programm übergeben */
    var subject = encodeURIComponent("Anfrage über die Website von " + name);
    var body = encodeURIComponent(
      "Name: " + name + "\nE-Mail: " + email + "\n\nNachricht:\n" + message
    );
    window.location.href =
      "mailto:info@mp-dienstleistungen.com?subject=" + subject + "&body=" + body;

    setStatus("Vielen Dank! Ihr E-Mail-Programm öffnet sich mit Ihrer Nachricht an uns.");
    form.reset();
    newCaptcha();
  });
})();
