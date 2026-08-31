/* =========================================================
   A&M Universe · textos editables
   Toma data/textos.json y reemplaza los textos del sitio
   (portada, colecciones, tienda, Océano, propósito, impacto,
   preguntas frecuentes y contacto/envíos) para que se puedan
   cambiar desde el panel.
   Las preguntas frecuentes se pintan en vivo (se pueden agregar,
   quitar y reordenar) y se actualizan también los datos
   estructurados de SEO.
   Si el archivo falla o un campo queda vacío, se conservan los
   textos que ya están en el sitio (respaldo).
   ========================================================= */
(function () {
  "use strict";

  var FAQ_ID = "faq-list";
  var FAQ_SEO_ID = "faq-jsonld";

  /* Ícono de ubicación: se conserva siempre, solo se edita el texto */
  var PIN_SVG = "<svg class='ci' viewBox='0 0 24 24' fill='none' stroke='currentColor' " +
    "stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>" +
    "<path d='M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z'/><circle cx='12' cy='10' r='2.5'/></svg> ";

  /* Campo del panel  →  clave de traducción del sitio */
  var MAP = [
    // Portada
    ["portada.aviso", "topbar"],
    ["portada.eyebrow", "hero.eyebrow"],
    ["portada.titulo", "hero.title"],
    ["portada.texto", "hero.sub"],
    ["portada.boton1", "hero.cta1"],
    ["portada.boton2", "hero.cta2"],
    // Colecciones
    ["colecciones.eyebrow", "collections.eyebrow"],
    ["colecciones.titulo", "collections.title"],
    ["colecciones.texto", "collections.lead"],
    ["colecciones.portal_titulo", "portal.title"],
    ["colecciones.portal_texto", "portal.lead"],
    ["colecciones.portal_texto2", "portal.lead2"],
    ["colecciones.oceano_nombre", "portal.ocean.name"],
    ["colecciones.oceano_desc", "portal.ocean.desc"],
    ["colecciones.oceano_boton", "portal.ocean.cta"],
    ["colecciones.felina_etiqueta", "portal.felina.tag"],
    ["colecciones.felina_nombre", "portal.felina.name"],
    ["colecciones.felina_desc", "portal.felina.desc"],
    ["colecciones.felina_boton", "portal.felina.cta"],
    // Preguntas frecuentes (encabezado)
    ["faq.eyebrow", "faq.eyebrow"],
    ["faq.titulo", "faq.title"],
    // Contacto y envíos
    ["contacto.eyebrow", "shipping.eyebrow"],
    ["contacto.titulo", "shipping.title"],
    ["contacto.texto", "shipping.lead"],
    ["contacto.paso1_titulo", "step.1.t"],
    ["contacto.paso1_texto", "step.1.d"],
    ["contacto.paso2_titulo", "step.2.t"],
    ["contacto.paso2_texto", "step.2.d"],
    ["contacto.paso3_titulo", "step.3.t"],
    ["contacto.paso3_texto", "step.3.d"],
    ["contacto.contacto_titulo", "contact.title"],
    ["contacto.contacto_texto", "contact.lead"],
    ["contacto.contacto_boton", "contact.cta"],
    // Portada · Nuestros valores
    ["portada.valores_titulo", "values.title"],
    ["portada.valor1_titulo", "value.1.t"],
    ["portada.valor1_texto", "value.1.d"],
    ["portada.valor2_titulo", "value.2.t"],
    ["portada.valor2_texto", "value.2.d"],
    ["portada.valor3_titulo", "value.3.t"],
    ["portada.valor3_texto", "value.3.d"],
    ["portada.valor4_titulo", "value.4.t"],
    ["portada.valor4_texto", "value.4.d"],
    // Tienda
    ["tienda.eyebrow", "shop.eyebrow"],
    ["tienda.texto", "shop.lead"],
    ["tienda.nota", "shop.note"],
    // Océano
    ["oceano.historia_eyebrow", "ocn.s1.eyebrow"],
    ["oceano.historia_titulo", "ocn.s1.title"],
    ["oceano.historia_p1", "ocn.s1.p1"],
    ["oceano.historia_p2", "ocn.s1.p2"],
    ["oceano.historia_p3", "ocn.s1.p3"],
    ["oceano.esperanza_eyebrow", "ocn.s2.eyebrow"],
    ["oceano.esperanza_titulo", "ocn.s2.title"],
    ["oceano.esperanza_texto", "ocn.s2.p1"],
    ["oceano.dato1_numero", "ocn.stat1.num"],
    ["oceano.dato1_texto", "ocn.stat1"],
    ["oceano.dato2_numero", "ocn.stat2.num"],
    ["oceano.dato2_texto", "ocn.stat2"],
    ["oceano.dato3_numero", "ocn.stat3.num"],
    ["oceano.dato3_texto", "ocn.stat3"],
    ["oceano.curiosidad_eyebrow", "ocn.cur.eyebrow"],
    ["oceano.curiosidad_titulo", "ocn.cur.title"],
    ["oceano.curiosidad_p1", "ocn.cur.p1"],
    ["oceano.curiosidad_p2", "ocn.cur.p2"],
    ["oceano.curiosidad_frase", "ocn.cur.quote"],
    ["oceano.acciones_eyebrow", "ocn.s5.eyebrow"],
    ["oceano.acciones_titulo", "ocn.s5.title"],
    ["oceano.acciones_texto", "ocn.s5.lead"],
    ["oceano.accion1_titulo", "ocn.a1.t"],
    ["oceano.accion1_texto", "ocn.a1.d"],
    ["oceano.accion2_titulo", "ocn.a2.t"],
    ["oceano.accion2_texto", "ocn.a2.d"],
    ["oceano.accion3_titulo", "ocn.a3.t"],
    ["oceano.accion3_texto", "ocn.a3.d"],
    ["oceano.accion4_titulo", "ocn.a4.t"],
    ["oceano.accion4_texto", "ocn.a4.d"],
    // Propósito
    ["proposito.eyebrow", "purpose.eyebrow"],
    ["proposito.titulo", "purpose.title"],
    ["proposito.texto", "purpose.lead"],
    ["proposito.tarjeta1_titulo", "purpose.c1.t"],
    ["proposito.tarjeta1_texto", "purpose.c1.d"],
    ["proposito.tarjeta2_titulo", "purpose.c2.t"],
    ["proposito.tarjeta2_texto", "purpose.c2.d"],
    ["proposito.tarjeta3_titulo", "purpose.c3.t"],
    ["proposito.tarjeta3_texto", "purpose.c3.d"],
    ["proposito.tarjeta4_titulo", "purpose.c4.t"],
    ["proposito.tarjeta4_texto", "purpose.c4.d"],
    // Impacto y nuestra causa
    ["impacto.eyebrow", "impact.eyebrow"],
    ["impacto.titulo", "impact.title"],
    ["impacto.texto", "impact.lead"],
    ["impacto.boton", "impact.cta"],
    ["impacto.frase", "impact.quote"],
    ["impacto.contador_envivo", "impact.count.live"],
    ["impacto.contador_camisetas", "impact.count.shirts"],
    ["impacto.contador_dinero", "impact.count.money"],
    ["impacto.causa_eyebrow", "rescue.eyebrow"],
    ["impacto.causa_titulo", "rescue.title"],
    ["impacto.causa_texto", "rescue.lead"],
    ["impacto.causa_nota", "rescue.note"]
  ];

  /* Avisos de "fotos de referencia": se apagan con un interruptor del panel */
  var AVISOS = [
    ["tienda", "mostrar_nota", ".shop-note"],
    ["impacto", "mostrar_causa_nota", ".gallery-note"]
  ];

  var faqs = null; // lista de preguntas del panel

  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "es"; }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  /* Valor de un campo, solo si trae texto de verdad */
  function val(data, path, suffix) {
    var parts = path.split(".");
    var group = data[parts[0]];
    if (!group) return null;
    var v = group[parts[1] + "_" + suffix];
    return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  }

  /* Traduce con respaldo: si falta el inglés, se usa el español */
  function pick(p, base) {
    var en = lang() === "en";
    var v = en ? (p[base + "_en"] || p[base + "_es"]) : (p[base + "_es"] || p[base + "_en"]);
    return typeof v === "string" ? v.trim() : "";
  }

  /* ---------- Diccionarios ---------- */
  function applyTexts(data) {
    var api = window.AYM_I18N;
    if (!api || !api.dicts) return;
    ["es", "en"].forEach(function (lg) {
      var dict = api.dicts[lg];
      if (!dict) return;
      MAP.forEach(function (pair) {
        var v = val(data, pair[0], lg);
        if (v != null) dict[pair[1]] = v;
      });
      var loc = val(data, "contacto.ubicacion", lg);
      if (loc != null) dict["contact.loc"] = PIN_SVG + loc;
    });
    api.apply();
  }

  /* ---------- Avisos temporales ---------- */
  function applyAvisos(data) {
    AVISOS.forEach(function (a) {
      var group = data[a[0]];
      if (!group || group[a[1]] !== false) return; // solo se oculta si el panel lo apaga
      document.querySelectorAll(a[2]).forEach(function (el) { el.hidden = true; });
    });
  }

  /* ---------- Preguntas frecuentes ---------- */
  function renderFaq() {
    var list = document.getElementById(FAQ_ID);
    if (!list || !Array.isArray(faqs)) return;
    var valid = faqs.filter(function (p) { return p && (p.pregunta_es || p.pregunta_en); });
    if (!valid.length) return; // no vaciar la lista si el panel viene sin preguntas
    list.innerHTML = valid.map(function (p) {
      return '<details class="faq-item">' +
        '<summary><span>' + esc(pick(p, "pregunta")) + '</span>' +
        '<span class="faq-ico" aria-hidden="true"></span></summary>' +
        '<div class="faq-a"><p>' + esc(pick(p, "respuesta")) + '</p></div>' +
      '</details>';
    }).join("");
  }

  /* Datos estructurados de SEO: siempre en español, como el sitio */
  function renderFaqSeo() {
    var tag = document.getElementById(FAQ_SEO_ID);
    if (!tag || !Array.isArray(faqs)) return;
    var valid = faqs.filter(function (p) { return p && p.pregunta_es && p.respuesta_es; });
    if (!valid.length) return;
    try {
      tag.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": valid.map(function (p) {
          return {
            "@type": "Question",
            "name": p.pregunta_es.trim(),
            "acceptedAnswer": { "@type": "Answer", "text": p.respuesta_es.trim() }
          };
        })
      }, null, 2);
    } catch (e) {}
  }

  function load() {
    try {
      fetch("data/textos.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || typeof data !== "object") return;
          if (data.faq && Array.isArray(data.faq.preguntas)) {
            faqs = data.faq.preguntas;
            renderFaq();
            renderFaqSeo();
          }
          applyTexts(data);
          applyAvisos(data);
        })
        .catch(function () {});
    } catch (e) {}
  }

  if (document.readyState !== "loading") load();
  else document.addEventListener("DOMContentLoaded", load);
  document.addEventListener("aym:langchange", renderFaq);
})();
