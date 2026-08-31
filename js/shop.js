/* =========================================================
   A&M Universe · catálogo dinámico
   Pinta la grilla de productos (#shop-grid) desde
   data/productos.json para que se puedan crear / editar
   productos, subir fotos y marcar Agotado desde el panel.
   Si el archivo falla, se conservan los productos que ya
   estén en el HTML (respaldo).
   ========================================================= */
(function () {
  "use strict";

  var GRID_ID = "shop-grid";
  var SIZES = ["S", "M", "L", "XL"]; // tallas ofrecidas
  var DEFAULT_SIZE = "M";

  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "es"; }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function pick(p, base) { var en = lang() === "en"; return (en ? (p[base + "_en"] || p[base + "_es"]) : (p[base + "_es"] || p[base + "_en"])) || ""; }

  var products = null; // se llena desde el JSON
  var IMG_DEFECTO = "assets/tee-ocean.svg";
  var SEO_ID = "ld-products";
  var SITIO = "https://droko1982.github.io/a-y-m/";

  /* El panel guarda la foto como "/assets/foto.jpg" (Sveltia antepone siempre
     una barra). La tienda no vive en la raíz del dominio sino en /a-y-m/, así
     que esa ruta apuntaría fuera del sitio y la foto saldría rota. Se pasa a
     ruta relativa, que funciona igual con dominio propio el día que lo haya. */
  function ruta(v) { return String(v == null ? "" : v).trim().replace(/^\/+/, ""); }

  function cardHTML(p) {
    var en = lang() === "en";
    var nombre = pick(p, "nombre"), desc = pick(p, "desc");
    var soldout = p.disponible === false;
    var img = ruta(p.imagen) || IMG_DEFECTO;
    var tag = soldout
      ? '<span class="tag">' + (en ? "Sold out" : "Agotado") + '</span>'
      : '<span class="tag tag-live">' + (en ? "Available" : "Disponible") + '</span>';
    var sizes = SIZES.map(function (sz) {
      var on = sz === DEFAULT_SIZE;
      return '<button type="button" class="size-pill' + (on ? " is-active" : "") + '" data-size="' + esc(sz) +
             '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(sz) + '</button>';
    }).join("");
    var buy = soldout
      ? '<button class="btn btn-add" type="button" disabled>' + (en ? "Sold out" : "Agotado") + '</button>'
      : '<button class="btn btn-add" data-product="' + esc(p.id) + '" type="button"><span>' + (en ? "Add" : "Agregar") + '</span></button>';
    return '<article class="product' + (soldout ? " is-soldout" : "") + '">' +
      '<div class="product-media"><img src="' + esc(img) + '" alt="' + esc(nombre) + '" loading="lazy" width="260" height="288"></div>' +
      tag +
      '<h3 class="product-name">' + esc(nombre) + '</h3>' +
      '<p class="product-desc">' + esc(desc) + '</p>' +
      '<div class="product-sizes" role="group" aria-label="Talla / Size">' +
        '<span class="size-label">' + (en ? "Size" : "Talla") + '</span>' + sizes +
      '</div>' +
      '<div class="product-buy">' +
        '<span class="product-price" data-price="' + esc(p.id) + '"></span>' +
        buy +
      '</div>' +
    '</article>';
  }

  function render() {
    var grid = document.getElementById(GRID_ID);
    if (!grid || !Array.isArray(products)) return;
    /* Si por error se repite un id en el panel, se conserva el primero: dos
       productos con el mismo id harían que el carrito confundiera uno con otro. */
    var usados = {};
    var valid = products.filter(function (p) {
      if (!p || !p.id || usados[p.id]) return false;
      usados[p.id] = true;
      return true;
    });
    if (!valid.length) return; // no vaciar la grilla si el JSON viene vacío
    grid.innerHTML = valid.map(cardHTML).join("");
    /* Mapa para el carrito: el nombre viaja aquí para que el carrito pueda
       nombrar bien también las camisetas agotadas y las creadas en el panel. */
    var map = {};
    valid.forEach(function (p) {
      map[p.id] = {
        img: ruta(p.imagen) || IMG_DEFECTO,
        nombre_es: p.nombre_es || "",
        nombre_en: p.nombre_en || "",
        disponible: p.disponible !== false
      };
    });
    window.AYM_PRODUCTS = map;
    renderSeo(valid);
    document.dispatchEvent(new CustomEvent("aym:productsrendered"));
  }

  /* Datos estructurados de los productos.
     Estaban escritos a mano en index.html con los 4 productos originales y los
     precios fijos, y ningún script los tocaba: en cuanto las dueñas creaban una
     camiseta, cambiaban un precio o marcaban Agotado, lo que leían Google y las
     redes dejaba de ser verdad. Se regeneran con el catálogo y los precios
     reales, igual que ya se hace con las preguntas frecuentes.
     Siempre en español, que es el idioma del sitio. */
  function renderSeo(valid) {
    var tag = document.getElementById(SEO_ID);
    if (!tag || !valid.length) return;
    /* Los precios los edita el panel en data/config.json; si no llegan, se usan
       los que ya estaban publicados. */
    var cfg = window.AYM_PRECIOS || {};
    var bajo = Number(cfg.precio_regular) > 0 ? Number(cfg.precio_regular) : 69000;
    var alto = Number(cfg.precio_oversized) > 0 ? Number(cfg.precio_oversized) : 79000;
    try {
      tag.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": valid.map(function (p, i) {
          var nombre = (p.nombre_es || p.nombre_en || "").trim();
          var desc = (p.desc_es || p.desc_en || "").trim();
          return {
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "Product",
              "name": nombre,
              "image": SITIO + (ruta(p.imagen) || IMG_DEFECTO),
              "description": desc,
              "brand": { "@type": "Brand", "name": "A&M Universe" },
              "offers": {
                "@type": "AggregateOffer",
                "lowPrice": String(Math.min(bajo, alto)),
                "highPrice": String(Math.max(bajo, alto)),
                "offerCount": "2",
                "priceCurrency": "COP",
                "availability": p.disponible === false
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
                "url": SITIO + "#oceano"
              }
            }
          };
        })
      }, null, 2);
    } catch (e) {}
  }

  function load() {
    try {
      fetch("data/productos.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          var list = data && Array.isArray(data.productos) ? data.productos : (Array.isArray(data) ? data : null);
          if (list && list.length) { products = list; render(); }
        })
        .catch(function () {});
    } catch (e) {}
  }

  /* cart.js puede terminar de cargar los precios después de que se pintó el
     catálogo: en ese caso hay que rehacer los datos estructurados. */
  document.addEventListener("aym:preciosaplicados", function () {
    if (Array.isArray(products)) renderSeo(products.filter(function (p) { return p && p.id; }));
  });

  if (document.readyState !== "loading") load();
  else document.addEventListener("DOMContentLoaded", load);
  document.addEventListener("aym:langchange", render);
})();
