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

  /* ---------- Kino: Parallax markierter Bildrahmen ---------- */
  if (!reduceMotion) {
    var paraEls = document.querySelectorAll("[data-parallax]");
    if (paraEls.length) {
      var paraTicking = false;
      var updatePara = function () {
        paraTicking = false;
        var mid = window.innerHeight / 2;
        paraEls.forEach(function (el) {
          var speed = parseFloat(el.getAttribute("data-speed") || "0.08");
          var r = el.getBoundingClientRect();
          var center = r.top + r.height / 2;
          el.style.transform = "translate3d(0," + ((mid - center) * speed).toFixed(1) + "px,0)";
        });
      };
      var onParaScroll = function () {
        if (!paraTicking) { paraTicking = true; requestAnimationFrame(updatePara); }
      };
      window.addEventListener("scroll", onParaScroll, { passive: true });
      window.addEventListener("resize", onParaScroll, { passive: true });
      updatePara();
    }
  }

  /* ---------- Kino: Wort-für-Wort-Reveal großer Überschriften ---------- */
  var headings = [];
  document.querySelectorAll(".display, .h2, .footer-tagline").forEach(function (h) {
    if (!h.closest(".scrollvid")) headings.push(h);
  });

  if (headings.length) {
    var wIndex;
    var splitEl = function (el) {
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          if (!node.textContent.trim()) return;
          var frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            var outer = document.createElement("span");
            outer.className = "w";
            var inner = document.createElement("span");
            inner.className = "w-in";
            inner.style.transitionDelay = Math.min(wIndex * 45, 700) + "ms";
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
            wIndex++;
          });
          el.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          splitEl(node);
        }
      });
    };

    headings.forEach(function (h) { wIndex = 0; splitEl(h); h.classList.add("reveal-words"); });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      headings.forEach(function (h) { h.classList.add("is-in"); });
    } else {
      var wordObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            wordObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
      headings.forEach(function (h) { wordObserver.observe(h); });
    }
  }

  /* ---------- Kino: Spotlight-Cursor im Bilanz-Abschnitt ---------- */
  var chapter = document.querySelector(".chapter");
  if (chapter && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    chapter.addEventListener("mousemove", function (e) {
      var r = chapter.getBoundingClientRect();
      chapter.style.setProperty("--mx", (e.clientX - r.left) + "px");
      chapter.style.setProperty("--my", (e.clientY - r.top) + "px");
      chapter.classList.add("is-hot");
    });
    chapter.addEventListener("mouseleave", function () {
      chapter.classList.remove("is-hot");
    });
  }

  /* ---------- Scroll-Fortschrittslinie ---------- */
  var progress = document.querySelector(".scroll-progress");
  if (progress) {
    var updateProgress = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- Scrollspy: aktiver Menüpunkt ---------- */
  var navLinkMap = {};
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.charAt(0) === "#") navLinkMap[href.slice(1)] = a;
  });
  var spySections = Object.keys(navLinkMap)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (spySections.length && "IntersectionObserver" in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          document.querySelectorAll(".nav-links a.is-active").forEach(function (a) {
            a.classList.remove("is-active");
          });
          var link = navLinkMap[entry.target.id];
          if (link) link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    spySections.forEach(function (s) { spyObserver.observe(s); });
  }

  /* ---------- Sticky Mobile-CTA (Anrufen / Angebot) ---------- */
  var mcta = document.querySelector(".mobile-cta");
  if (mcta) {
    var kontaktSec = document.getElementById("kontakt");
    var updateMcta = function () {
      var show = window.scrollY > 620;
      if (kontaktSec && kontaktSec.getBoundingClientRect().top < window.innerHeight * 0.9) {
        show = false;
      }
      if (menu && menu.classList.contains("is-open")) show = false;
      mcta.classList.toggle("is-show", show);
    };
    window.addEventListener("scroll", updateMcta, { passive: true });
    window.addEventListener("resize", updateMcta, { passive: true });
    if (toggle) toggle.addEventListener("click", function () { setTimeout(updateMcta, 0); });
    updateMcta();
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
