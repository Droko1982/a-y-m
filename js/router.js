/* =========================================================
   A&M Universe · enrutador de vistas (una sola página)
   Cada enlace muestra solo su sección como "página".
   Sin scroll entre secciones · enlaces compartibles (#tienda…)
   ========================================================= */
(function () {
  "use strict";

  var VIEWS = ["tienda", "proposito", "historias", "impacto", "faq", "envios", "contacto"];
  var DEFAULT = "tienda";
  var root = document.documentElement;

  function currentView() {
    var h = (location.hash || "").replace(/^#\/?/, "").toLowerCase();
    return VIEWS.indexOf(h) >= 0 ? h : DEFAULT;
  }

  function apply(view, firstLoad) {
    root.setAttribute("data-page", view); // el CSS oculta las demás vistas

    // Enlaces activos (nav + logo)
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      var on = a.getAttribute("data-nav") === view;
      a.classList.toggle("is-current", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });

    // Asegurar que el contenido de la vista quede visible (por si la
    // animación de aparición no se disparó estando oculta)
    document.querySelectorAll('section[data-view="' + view + '"] .reveal').forEach(function (el) {
      el.classList.add("in");
    });

    if (!firstLoad) window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent("aym:viewchange", { detail: view }));
  }

  window.addEventListener("hashchange", function () {
    var h = (location.hash || "").replace(/^#\/?/, "").toLowerCase();
    if (VIEWS.indexOf(h) < 0) return; // ancla de sección normal (#shop) → scroll nativo
    apply(h, false);
  });

  function init() { apply(currentView(), true); }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
