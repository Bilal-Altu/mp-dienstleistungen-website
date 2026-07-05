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

  /* ---------- Scroll-Reveal (respektiert prefers-reduced-motion) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

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
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Jahr im Footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
