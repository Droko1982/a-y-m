/* =========================================================
   A&M Universe · contador de impacto en vivo (perrito comiendo)
   Lee el total de camisetas vendidas y muestra el dinero
   apartado para los animalitos + un perrito que come según
   se va llenando cada "bolsa de comida".
   ========================================================= */
(function () {
  "use strict";

  /* ─────────────── Configuración ───────────────
     1) IMPACT_API: URL del Worker de Cloudflare (ver
        CONTADOR-IMPACTO.md). Normalmente se deja vacía y se
        escribe desde el panel: Impacto → "Dirección del
        contador". Este valor manda sobre el del panel.
     2) APORTE_POR_CAMISETA: pesos apartados por camiseta.
     3) BOLSA: pesos que representan una "bolsa de comida"
        (cada bolsa llena el tazón del perrito).
     Sin Worker (o si el Worker falla) se usa el total escrito
     en data/impacto.json, que también sale del panel.        */
  var IMPACT_API = "";
  var LOCAL_JSON = "data/impacto.json";
  var APORTE_POR_CAMISETA = 1000;
  var BOLSA = 50000;

  function fmt(n) { return "$" + Number(n).toLocaleString("es-CO"); }
  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "es"; }

  var state = null; // guardamos el último n para poder retraducir la meta

  function animate(el, to, render) {
    var from = 0, start = null, dur = 900;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = render(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function goalText(n) {
    var en = lang() === "en";
    var collected = n * APORTE_POR_CAMISETA;
    var bags = Math.floor(collected / BOLSA);
    var falta = BOLSA - (collected % BOLSA);
    if (n <= 0) {
      return en
        ? "🐾 Be the first sale and start filling the bowl!"
        : "🐾 ¡Sé la primera venta y empieza a llenar el tazón!";
    }
    var bagsTxt = en
      ? "<strong>" + bags + "</strong> " + (bags === 1 ? "bowl of food" : "bowls of food") + " gathered"
      : "<strong>" + bags + "</strong> " + (bags === 1 ? "bolsa de comida reunida" : "bolsas de comida reunidas");
    var faltaTxt = en
      ? " · <strong>" + fmt(falta) + "</strong> to the next bowl 🍖"
      : " · faltan <strong>" + fmt(falta) + "</strong> para la próxima 🍖";
    return "🍖 " + bagsTxt + faltaTxt;
  }

  function paint(n) {
    state = n;
    var box = document.getElementById("impact-tracker");
    if (!box) return;
    var collected = n * APORTE_POR_CAMISETA;
    var inBag = BOLSA > 0 ? (collected % BOLSA) / BOLSA : 0;
    if (n > 0 && inBag === 0) inBag = 1; // bolsa recién completada = tazón lleno

    box.hidden = false;
    box.classList.toggle("is-eating", n > 0);

    var shirts = document.getElementById("ic-shirts");
    var money = document.getElementById("ic-money");
    if (shirts) animate(shirts, n, function (v) { return v.toLocaleString("es-CO"); });
    if (money) animate(money, collected, function (v) { return fmt(v); });

    var food = document.getElementById("food-level");
    if (food) food.style.transform = "scaleY(" + inBag.toFixed(3) + ")";
    var fill = document.getElementById("it-fill");
    if (fill) fill.style.width = (inBag * 100).toFixed(1) + "%";
    var goal = document.getElementById("it-goal");
    if (goal) goal.innerHTML = goalText(n);
  }

  function pedir(url) {
    try {
      return fetch(url, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }

  /* Pinta el contador si los datos traen un total válido */
  function mostrar(data) {
    var n = parseInt(data && data.camisetas, 10);
    if (isNaN(n) || n < 0) return false;
    paint(n);
    return true;
  }

  function load() {
    if (!document.getElementById("impact-tracker")) return;
    pedir(LOCAL_JSON).then(function (local) {
      var api = IMPACT_API || (local && typeof local.api === "string" ? local.api.trim() : "");
      if (!/^https?:\/\//i.test(api)) { mostrar(local); return; }
      // Con Worker conectado manda el dato en vivo; si falla, el archivo local
      pedir(api).then(function (vivo) {
        if (!mostrar(vivo)) mostrar(local);
      });
    });
  }

  // Retraducir la meta al cambiar de idioma (sin re-animar los números)
  document.addEventListener("aym:langchange", function () {
    if (state === null) return;
    var goal = document.getElementById("it-goal");
    if (goal) goal.innerHTML = goalText(state);
  });

  if (document.readyState !== "loading") load();
  else document.addEventListener("DOMContentLoaded", load);
})();
