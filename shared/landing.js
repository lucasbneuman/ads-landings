/* Comportamiento compartido: formulario, sticky CTA y eventos. Sin dependencias. */
(function () {
  "use strict";

  // Cola de eventos. El vendor de analítica se enchufa después (GA4/Meta/Plausible)
  // leyendo window.dataLayer; acá no se carga ningún script externo.
  window.dataLayer = window.dataLayer || [];
  function track(event, detail) {
    var payload = Object.assign({ event: event, product: document.body.dataset.product || "" }, detail || {});
    window.dataLayer.push(payload);
    // Umami escucha los mismos eventos: si el tracker está cargado, se reenvían.
    if (window.umami && typeof window.umami.track === "function") {
      try { window.umami.track(event, payload); } catch (e) { /* nunca romper por analítica */ }
    }
  }

  // --- Sticky CTA (solo mobile, aparece pasada la primera pantalla) ----------
  var sticky = document.querySelector(".sticky-cta");
  if (sticky) {
    var onScroll = function () {
      sticky.classList.toggle("show", window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    sticky.querySelector("a, button")?.addEventListener("click", function () {
      track("cta_click", { placement: "sticky" });
    });
  }

  // --- CTA principal --------------------------------------------------------
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      track("cta_click", { placement: el.dataset.cta });
    });
  });

  // --- FAQ ------------------------------------------------------------------
  document.querySelectorAll(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) track("faq_open", { question: d.querySelector("summary")?.textContent.trim().slice(0, 80) });
    });
  });

  // --- Formulario -----------------------------------------------------------
  var form = document.querySelector("form[data-lead]");
  if (!form) return;

  var msg = form.querySelector(".form-msg");
  var button = form.querySelector("button[type=submit]");
  var endpoint = form.dataset.endpoint || "/api/lead";
  var fallback = form.dataset.fallback || "mailto:lucas@lucasbenites.com";

  function setMsg(text, state) {
    if (!msg) return;
    msg.textContent = text || "";
    if (state) msg.dataset.state = state;
    else delete msg.dataset.state;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var name = form.elements.name;
    var contact = form.elements.contact;
    var ok = true;

    [name, contact].forEach(function (input) {
      input.removeAttribute("aria-invalid");
      if (!input.value.trim()) { input.setAttribute("aria-invalid", "true"); ok = false; }
    });
    if (contact.value.trim() && !validEmail(contact.value.trim()) && !/^[+\d][\d\s()-]{6,}$/.test(contact.value.trim())) {
      contact.setAttribute("aria-invalid", "true");
      ok = false;
    }
    if (!ok) { setMsg("Revisá los campos marcados.", "error"); return; }

    button.disabled = true;
    setMsg("Enviando…");

    var payload = {
      product: document.body.dataset.product || "",
      name: name.value.trim(),
      contact: contact.value.trim(),
      session_id: (window.localStorage && localStorage.getItem("cw_sid")) || ""
    };

    try {
      var res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("http " + res.status);
      setMsg("Listo. Te escribimos a ese contacto.", "ok");
      track("lead_submit", { ok: true });
      form.reset();
    } catch (err) {
      setMsg("", null);
      if (msg) {
        msg.dataset.state = "error";
        msg.innerHTML = 'No pudimos registrar el contacto. Escribinos a <a href="' + fallback + '">lucas@lucasbenites.com</a>.';
      }
      track("lead_submit", { ok: false, reason: String(err).slice(0, 60) });
    } finally {
      button.disabled = false;
    }
  });
})();
