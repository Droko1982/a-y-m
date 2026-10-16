/* =========================================================
   A&M Universe · enrutador de vistas (una sola página)
   Cada enlace muestra solo su sección como "página".
   Sin scroll entre secciones · enlaces compartibles (#tienda…)

   Los tres espacios de camisetas viven dentro de la Tienda, en
   pestañas. Sus enlaces (#regular, #oversized, #essentials /
   #esenciales) abren la Tienda en esa pestaña y bajan hasta las
   camisetas, así se pueden compartir y guardar.
   ========================================================= */
(function () {
  "use strict";

  var VIEWS = ["tienda", "oceano", "felina", "proposito", "impacto", "faq", "contacto"];
  var DEFAULT = "tienda";
  /* enlace → pestaña de la sección Camisetas */
  var TABS = { regular: "regular", oversized: "oversized", essentials: "esenciales", esenciales: "esenciales" };
  var root = document.documentElement;

  function leerHash() { return (location.hash || "").replace(/^#\/?/, "").toLowerCase(); }
  function currentView() {
    var h = leerHash();
    if (VIEWS.indexOf(h) >= 0) return h;
    if (TABS[h]) return "tienda";
    return DEFAULT;
  }

  function apply(view, firstLoad) {
    root.setAttribute("data-page", view); // el CSS oculta las demás vistas

    // Enlaces activos (nav + logo + pie)
    var h = leerHash();
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      var dn = a.getAttribute("data-nav");
      /* Siempre booleano: classList.toggle(clase, undefined) ALTERNA la clase
         en vez de quitarla, y dejaba todo el menú marcado como actual. */
      var on = dn === view || !!(TABS[dn] && TABS[dn] === TABS[h]);
      a.classList.toggle("is-current", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });

    // Asegurar que el contenido de la vista quede visible (por si la
    // animación de aparición no se disparó estando oculta)
    document.querySelectorAll('section[data-view="' + view + '"] .reveal').forEach(function (el) {
      el.classList.add("in");
    });

    document.dispatchEvent(new CustomEvent("aym:viewchange", { detail: view }));

    if (TABS[h]) {
      /* Abrir la pestaña pedida y bajar hasta las camisetas (después de que
         la vista se pinte, para que el desplazamiento caiga en el sitio). */
      document.dispatchEvent(new CustomEvent("aym:tab", { detail: TABS[h] }));
      setTimeout(function () {
        var s = document.getElementById("camisetas");
        if (s && s.scrollIntoView) s.scrollIntoView({ block: "start" });
      }, firstLoad ? 120 : 0);
    } else if (!firstLoad) {
      window.scrollTo(0, 0);
    }
  }

  window.addEventListener("hashchange", function () {
    var h = leerHash();
    if (VIEWS.indexOf(h) < 0 && !TABS[h]) return; // ancla de sección normal → scroll nativo
    apply(currentView(), false);
  });

  function init() { apply(currentView(), true); }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
