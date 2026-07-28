/* =========================================================
   A&M Universe · contador de impacto en vivo
   Lee el total de camisetas vendidas desde el Worker de
   Cloudflare y muestra el dinero apartado para los animalitos.
   ========================================================= */
(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────
     1) Pega aquí la URL de tu Worker de Cloudflare (paso 6 de
        la guía CONTADOR-IMPACTO.md). Ejemplo:
        var IMPACT_API = "https://aym-contador.tu-usuario.workers.dev";
        Mientras esté vacío, el contador queda oculto.
     2) Aporte por cada camiseta vendida (ajustable):
     ───────────────────────────────────────────────────────── */
  var IMPACT_API = "";
  var APORTE_POR_CAMISETA = 1000;

  if (!IMPACT_API) return; // sin URL configurada → no mostramos nada

  function fmt(n) { return "$" + Number(n).toLocaleString("es-CO"); }

  function animate(el, to, render) {
    var from = 0, start = null, dur = 900;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = render(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function load() {
    var box = document.getElementById("impact-counter");
    if (!box) return;
    fetch(IMPACT_API, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        var n = parseInt(data && data.camisetas, 10);
        if (isNaN(n) || n < 0) return;
        var shirts = document.getElementById("ic-shirts");
        var money = document.getElementById("ic-money");
        box.hidden = false;
        if (shirts) animate(shirts, n, function (v) { return v.toLocaleString("es-CO"); });
        if (money) animate(money, n * APORTE_POR_CAMISETA, function (v) { return fmt(v); });
      })
      .catch(function () { /* sin conexión / worker caído → contador oculto */ });
  }

  if (document.readyState !== "loading") load();
  else document.addEventListener("DOMContentLoaded", load);
})();
