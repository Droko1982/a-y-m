/* =========================================================
   A&M Universe · enrutador de vistas (una sola página)
   Cada enlace muestra solo su sección como "página".
   Sin scroll entre secciones · enlaces compartibles (#tienda…)

   Las camisetas viven DENTRO de cada colección: al entrar a
   #oceano o #felina se ven sus camisetas (pestañas Regular fit /
   Oversized) y debajo la historia. Esenciales tiene su página
   (#esenciales). Enlaces viejos que siguen sirviendo:
     #essentials           → #esenciales
     #regular / #oversized → Océano, en esa pestaña
   ========================================================= */
(function () {
  "use strict";

  var VIEWS = ["tienda", "oceano", "felina", "esenciales", "proposito", "impacto", "faq", "contacto"];
  var DEFAULT = "tienda";
  /* enlace viejo o corto → [vista, pestaña] */
  var ALIAS = {
    essentials: ["esenciales", null],
    regular: ["oceano", "regular"],
    oversized: ["oceano", "oversized"]
  };
  var root = document.documentElement;

  function leerHash() { return (location.hash || "").replace(/^#\/?/, "").toLowerCase(); }
  /* Un ancla dentro de una página (#oc-camisetas, #oc-coral…): su vista es la
     de la sección que la contiene. Así un enlace compartido o una recarga
     abren la página correcta y bajan hasta ese punto. */
  function vistaDeAncla(h) {
    var el = h && document.getElementById(h);
    var sec = el && el.closest ? el.closest("section[data-view]") : null;
    return sec ? sec.getAttribute("data-view") : null;
  }
  function destino() {
    var h = leerHash();
    if (VIEWS.indexOf(h) >= 0) return [h, null, null];
    if (ALIAS[h]) return [ALIAS[h][0], ALIAS[h][1], null];
    var v = vistaDeAncla(h);
    if (v) return [v, null, h];
    return [DEFAULT, null, null];
  }

  function apply(firstLoad) {
    var d = destino(), view = d[0], tab = d[1], ancla = d[2];
    root.setAttribute("data-page", view); // el CSS oculta las demás vistas

    // Enlaces activos (nav + logo + pie). Siempre booleano: classList.toggle
    // con undefined ALTERNA la clase en vez de quitarla.
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

    document.dispatchEvent(new CustomEvent("aym:viewchange", { detail: view }));

    if (tab) {
      /* Enlace a una horma concreta: abrir esa pestaña y bajar a las camisetas */
      document.dispatchEvent(new CustomEvent("aym:tab", { detail: { vista: view, tab: tab } }));
      setTimeout(function () {
        var s = document.querySelector('section[data-view="' + view + '"] .shop-tabs');
        if (s && s.scrollIntoView) s.scrollIntoView({ block: "center" });
      }, firstLoad ? 150 : 0);
    } else if (ancla) {
      setTimeout(function () {
        var el = document.getElementById(ancla);
        if (el && el.scrollIntoView) el.scrollIntoView({ block: "start" });
      }, firstLoad ? 150 : 0);
    } else if (!firstLoad) {
      window.scrollTo(0, 0);
    }
  }

  window.addEventListener("hashchange", function () {
    var h = leerHash();
    if (VIEWS.indexOf(h) >= 0 || ALIAS[h]) return apply(false);
    /* Ancla de OTRA página: cambiar de página y bajar. Si es de la misma
       página, el navegador ya hace el desplazamiento solo. */
    var v = vistaDeAncla(h);
    if (v && v !== root.getAttribute("data-page")) apply(false);
  });

  function init() { apply(true); }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
