/* =========================================================
   A&M Universe · catálogo dinámico + ventana de fotos
   ---------------------------------------------------------
   Pinta dos cuadrículas desde el panel:
     · #shop-grid        ← data/productos.json  (colección Océano)
     · #essentials-grid  ← data/essentials.json (línea de básicos)
   Al hacer clic en una camiseta se abre una ventana con su
   galería de fotos y una descripción más amplia.
   Si un archivo falla, se conservan los productos que ya
   estén en el HTML (respaldo).
   ========================================================= */
(function () {
  "use strict";

  var SIZES = ["S", "M", "L", "XL"]; // tallas ofrecidas
  var DEFAULT_SIZE = "M";
  var IMG_DEFECTO = "assets/tee-ocean.svg";
  var SEO_ID = "ld-products";

  /* Las dos cuadrículas y su archivo de datos */
  var GRIDS = [
    { grid: "shop-grid", archivo: "data/productos.json" },
    { grid: "essentials-grid", archivo: "data/essentials.json" }
  ];

  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "es"; }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function pick(p, base) { var en = lang() === "en"; return (en ? (p[base + "_en"] || p[base + "_es"]) : (p[base + "_es"] || p[base + "_en"])) || ""; }

  /* El panel guarda las fotos como "/assets/foto.jpg" (Sveltia antepone siempre
     una barra). La tienda no vive en la raíz del dominio sino en /a-y-m/, así
     que esa ruta apuntaría fuera del sitio y la foto saldría rota. Se pasa a
     ruta relativa, que funciona igual con dominio propio el día que lo haya. */
  function ruta(v) { return String(v == null ? "" : v).trim().replace(/^\/+/, ""); }

  /* Base absoluta del sitio, deducida de la propia página (para los datos
     estructurados, que siguen siendo correctos si la tienda cambia de dirección). */
  var SITIO = location.origin + location.pathname.replace(/[^/]*$/, "");

  /* Lista de fotos de un producto: la principal + la galería, sin repetidas. */
  function fotos(p) {
    var lista = [ruta(p.imagen)];
    if (Array.isArray(p.galeria)) p.galeria.forEach(function (g) { lista.push(ruta(g)); });
    var vistas = {}, out = [];
    lista.forEach(function (f) { if (f && !vistas[f]) { vistas[f] = 1; out.push(f); } });
    return out.length ? out : [IMG_DEFECTO];
  }

  /* Estado: lo que llegó de cada archivo, y el catálogo combinado */
  var datos = {};                 // archivo → lista de productos
  var CATALOGO = {};              // id → producto (para la ventana de fotos)

  function cardHTML(p) {
    var en = lang() === "en";
    var nombre = pick(p, "nombre"), desc = pick(p, "desc");
    var soldout = p.disponible === false;
    var imgs = fotos(p);
    var hayGaleria = imgs.length > 1;
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
    /* La foto es un botón: al pulsarla se abre la ventana con la galería. */
    var lupa = '<span class="pv-badge" aria-hidden="true">' +
      (hayGaleria
        ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"/></svg>'
        : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>') +
      '</span>';
    return '<article class="product' + (soldout ? " is-soldout" : "") + '">' +
      '<button type="button" class="product-media pv-trigger" data-open="' + esc(p.id) + '" aria-label="' +
        (en ? "View photos of " : "Ver fotos de ") + esc(nombre) + '">' +
        '<img src="' + esc(imgs[0]) + '" alt="' + esc(nombre) + '" loading="lazy" width="260" height="288">' +
        lupa +
      '</button>' +
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

  /* Pinta una cuadrícula y devuelve la lista válida que mostró.
     `usados` lleva los id ya usados (entre las dos cuadrículas) para que un id
     repetido no haga que el carrito confunda un producto con otro. */
  function renderGrid(gridId, lista, usados) {
    var grid = document.getElementById(gridId);
    if (!grid || !Array.isArray(lista)) return [];
    var valid = lista.filter(function (p) {
      if (!p || !p.id || usados[p.id]) return false;
      usados[p.id] = true;
      return true;
    });
    if (!valid.length) return []; // no vaciar la grilla si el JSON viene vacío
    grid.innerHTML = valid.map(cardHTML).join("");
    return valid;
  }

  function renderAll() {
    var usados = {};
    var todos = [];
    GRIDS.forEach(function (g) {
      var lista = datos[g.archivo];
      if (Array.isArray(lista)) todos = todos.concat(renderGrid(g.grid, lista, usados));
    });
    if (!todos.length) return;

    /* Catálogo para la ventana de fotos (objetos completos) */
    CATALOGO = {};
    todos.forEach(function (p) { CATALOGO[p.id] = p; });

    /* Mapa para el carrito: el nombre viaja aquí para que el carrito pueda
       nombrar bien también las agotadas y las creadas en el panel. */
    var map = {};
    todos.forEach(function (p) {
      map[p.id] = {
        img: fotos(p)[0],
        nombre_es: p.nombre_es || "",
        nombre_en: p.nombre_en || "",
        disponible: p.disponible !== false
      };
    });
    window.AYM_PRODUCTS = map;
    renderSeo(todos);
    document.dispatchEvent(new CustomEvent("aym:productsrendered"));
  }

  /* Datos estructurados de los productos (se regeneran con el catálogo y los
     precios reales; antes estaban escritos a mano en index.html y quedaban
     desactualizados en cuanto el panel cambiaba algo). Siempre en español. */
  function renderSeo(valid) {
    var tag = document.getElementById(SEO_ID);
    if (!tag || !valid.length) return;
    var cfg = window.AYM_PRECIOS || {};
    var bajo = Number(cfg.precio_regular) > 0 ? Number(cfg.precio_regular) : 69000;
    var alto = Number(cfg.precio_oversized) > 0 ? Number(cfg.precio_oversized) : 79000;
    try {
      tag.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": valid.map(function (p, i) {
          var nombre = (p.nombre_es || p.nombre_en || "").trim();
          var desc = (p.desc_larga_es || p.desc_es || p.desc_larga_en || p.desc_en || "").trim();
          return {
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "Product",
              "name": nombre,
              "image": SITIO + fotos(p)[0],
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

  /* =======================================================
     Ventana de fotos (galería + descripción + agregar)
     ======================================================= */
  var PV = null;          // el elemento de la ventana
  var pvScrim = null;
  var pvActual = null;    // { id, imgs, idx, fit }
  var pvFocoPrevio = null;

  function construirVentana() {
    if (PV) return;
    pvScrim = document.createElement("div");
    pvScrim.className = "pv-scrim";
    pvScrim.hidden = true;
    pvScrim.addEventListener("click", cerrarVentana);

    PV = document.createElement("div");
    PV.className = "pv-modal";
    PV.id = "pv-modal";
    PV.setAttribute("role", "dialog");
    PV.setAttribute("aria-modal", "true");
    PV.setAttribute("aria-labelledby", "pv-name");
    PV.setAttribute("aria-hidden", "true");
    PV.inert = true;
    document.body.appendChild(pvScrim);
    document.body.appendChild(PV);

    PV.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest(".pv-close")) return cerrarVentana();
      var prev = t.closest(".pv-prev"), next = t.closest(".pv-next");
      if (prev) return mover(-1);
      if (next) return mover(1);
      var th = t.closest(".pv-thumb");
      if (th) { pvActual.idx = parseInt(th.getAttribute("data-i"), 10) || 0; pintarFoto(); return; }
      var fit = t.closest(".pv-fit-btn");
      if (fit) { elegirFit(fit.getAttribute("data-fit")); return; }
      var sz = t.closest(".pv-size");
      if (sz) {
        PV.querySelectorAll(".pv-size").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
        sz.classList.add("is-active"); sz.setAttribute("aria-pressed", "true");
        return;
      }
      var add = t.closest(".pv-add");
      if (add && !add.disabled) return agregarDesdeVentana();
    });
  }

  function focusables(cont) {
    return Array.prototype.slice.call(cont.querySelectorAll(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
    )).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }
  function atrapaFoco(e) {
    if (e.key === "Escape") { e.preventDefault(); return cerrarVentana(); }
    if (e.key === "ArrowLeft") { mover(-1); return; }
    if (e.key === "ArrowRight") { mover(1); return; }
    if (e.key !== "Tab" || !PV || !PV.classList.contains("open")) return;
    var f = focusables(PV);
    if (!f.length) return;
    var primero = f[0], ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  }

  function precioFit(fit) {
    if (window.AYM_CART && typeof window.AYM_CART.price === "function") return window.AYM_CART.price(fit);
    var cfg = window.AYM_PRECIOS || {};
    return fit === "oversized" ? (Number(cfg.precio_oversized) || 79000) : (Number(cfg.precio_regular) || 69000);
  }
  function fmt(n) {
    if (window.AYM_CART && typeof window.AYM_CART.fmt === "function") return window.AYM_CART.fmt(n);
    return "$" + Number(n || 0).toLocaleString("es-CO");
  }

  function pintarFoto() {
    var imgs = pvActual.imgs, i = pvActual.idx;
    var main = PV.querySelector(".pv-main img");
    if (main) main.setAttribute("src", imgs[i]);
    PV.querySelectorAll(".pv-thumb").forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-current", on ? "true" : "false");
    });
    var cuenta = PV.querySelector(".pv-count");
    if (cuenta) cuenta.textContent = (i + 1) + " / " + imgs.length;
  }
  function mover(d) {
    if (!pvActual || pvActual.imgs.length < 2) return;
    var n = pvActual.imgs.length;
    pvActual.idx = (pvActual.idx + d + n) % n;
    pintarFoto();
  }
  function elegirFit(fit) {
    if (fit !== "regular" && fit !== "oversized") return;
    pvActual.fit = fit;
    PV.querySelectorAll(".pv-fit-btn").forEach(function (b) {
      var on = b.getAttribute("data-fit") === fit;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var pr = PV.querySelector(".pv-price");
    if (pr) pr.textContent = fmt(precioFit(fit));
  }

  function abrirVentana(id) {
    var p = CATALOGO[id];
    if (!p) return;
    construirVentana();
    var en = lang() === "en";
    var soldout = p.disponible === false;
    var nombre = pick(p, "nombre");
    var desc = (en
      ? (p.desc_larga_en || p.desc_larga_es || p.desc_en || p.desc_es)
      : (p.desc_larga_es || p.desc_larga_en || p.desc_es || p.desc_en)) || "";
    var imgs = fotos(p);
    var fitInicial = (window.AYM_CART && typeof window.AYM_CART.fit === "function") ? window.AYM_CART.fit() : "regular";
    pvActual = { id: id, imgs: imgs, idx: 0, fit: fitInicial };

    var thumbs = imgs.length > 1 ? imgs.map(function (src, k) {
      return '<button type="button" class="pv-thumb" data-i="' + k + '" aria-label="' +
        (en ? "Photo " : "Foto ") + (k + 1) + '"><img src="' + esc(src) + '" alt="" loading="lazy"></button>';
    }).join("") : "";

    var nav = imgs.length > 1
      ? '<button type="button" class="pv-nav pv-prev" aria-label="' + (en ? "Previous photo" : "Foto anterior") + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
        '<button type="button" class="pv-nav pv-next" aria-label="' + (en ? "Next photo" : "Siguiente foto") + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>' +
        '<span class="pv-count"></span>'
      : "";

    var tag = soldout
      ? '<span class="tag">' + (en ? "Sold out" : "Agotado") + '</span>'
      : '<span class="tag tag-live">' + (en ? "Available" : "Disponible") + '</span>';

    var fitBtns = [["regular", en ? "Regular fit" : "Regular fit"], ["oversized", "Oversized"]].map(function (f) {
      var on = f[0] === fitInicial;
      return '<button type="button" class="pv-fit-btn' + (on ? " is-active" : "") + '" data-fit="' + f[0] +
        '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(f[1]) + '</button>';
    }).join("");

    var sizeBtns = SIZES.map(function (sz) {
      var on = sz === DEFAULT_SIZE;
      return '<button type="button" class="pv-size size-pill' + (on ? " is-active" : "") + '" data-size="' + esc(sz) +
        '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(sz) + '</button>';
    }).join("");

    var botonAdd = soldout
      ? '<button type="button" class="btn btn-add pv-add" disabled>' + (en ? "Sold out" : "Agotado") + '</button>'
      : '<button type="button" class="btn btn-add pv-add"><span>' + (en ? "Add to cart" : "Agregar al carrito") + '</span></button>';

    PV.innerHTML =
      '<button type="button" class="pv-close" aria-label="' + (en ? "Close" : "Cerrar") + '">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<div class="pv-gallery">' +
        '<div class="pv-main">' + nav + '<img src="' + esc(imgs[0]) + '" alt="' + esc(nombre) + '"></div>' +
        (thumbs ? '<div class="pv-thumbs">' + thumbs + '</div>' : '') +
      '</div>' +
      '<div class="pv-info">' +
        tag +
        '<h3 class="pv-title" id="pv-name">' + esc(nombre) + '</h3>' +
        '<p class="pv-desc">' + esc(desc) + '</p>' +
        '<div class="pv-opts">' +
          '<div class="pv-opt"><span class="pv-opt-label">' + (en ? "Fit" : "Horma") + '</span>' +
            '<div class="pv-fit" role="group" aria-label="' + (en ? "Fit" : "Horma") + '">' + fitBtns + '</div></div>' +
          '<div class="pv-opt"><span class="pv-opt-label">' + (en ? "Size" : "Talla") + '</span>' +
            '<div class="pv-sizes" role="group" aria-label="' + (en ? "Size" : "Talla") + '">' + sizeBtns + '</div></div>' +
        '</div>' +
        '<div class="pv-buy"><span class="pv-price"></span>' + botonAdd + '</div>' +
      '</div>';

    pintarFoto();
    elegirFit(fitInicial);

    pvFocoPrevio = document.activeElement;
    pvScrim.hidden = false;
    requestAnimationFrame(function () { pvScrim.classList.add("show"); });
    PV.classList.add("open");
    PV.setAttribute("aria-hidden", "false");
    PV.inert = false;
    document.body.classList.add("pv-open");
    var cerrar = PV.querySelector(".pv-close");
    if (cerrar) cerrar.focus();
    document.addEventListener("keydown", atrapaFoco, true);
  }

  function cerrarVentana() {
    if (!PV || !PV.classList.contains("open")) return;
    document.removeEventListener("keydown", atrapaFoco, true);
    if (pvFocoPrevio && typeof pvFocoPrevio.focus === "function") pvFocoPrevio.focus();
    else if (PV.contains(document.activeElement)) document.activeElement.blur();
    pvFocoPrevio = null;
    PV.classList.remove("open");
    PV.setAttribute("aria-hidden", "true");
    PV.inert = true;
    pvScrim.classList.remove("show");
    setTimeout(function () { if (pvScrim) pvScrim.hidden = true; }, 300);
    document.body.classList.remove("pv-open");
  }

  function agregarDesdeVentana() {
    if (!pvActual) return;
    var szEl = PV.querySelector(".pv-size.is-active");
    var id = pvActual.id;
    var size = szEl ? szEl.getAttribute("data-size") : DEFAULT_SIZE;
    var fit = pvActual.fit || "regular";
    cerrarVentana();
    if (id && window.AYM_CART && typeof window.AYM_CART.add === "function") {
      window.AYM_CART.add(id, fit, size);
    }
  }

  /* Un clic en la foto de cualquier producto abre su ventana. */
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".pv-trigger[data-open]");
    if (!t) return;
    e.preventDefault();
    abrirVentana(t.getAttribute("data-open"));
  });

  /* =======================================================
     Carga de datos
     ======================================================= */
  function cargarUno(archivo) {
    return fetch(archivo, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var list = data && Array.isArray(data.productos) ? data.productos : (Array.isArray(data) ? data : null);
        if (list && list.length) datos[archivo] = list;
      })
      .catch(function () {});
  }

  function load() {
    try {
      Promise.all(GRIDS.map(function (g) { return cargarUno(g.archivo); }))
        .then(renderAll)
        .catch(function () {});
    } catch (e) {}
  }

  /* cart.js puede terminar de cargar los precios después de pintar el catálogo:
     en ese caso hay que rehacer los datos estructurados, y si la ventana está
     abierta, refrescar su precio. */
  document.addEventListener("aym:preciosaplicados", function () {
    var todos = [];
    GRIDS.forEach(function (g) { if (Array.isArray(datos[g.archivo])) todos = todos.concat(datos[g.archivo].filter(function (p) { return p && p.id; })); });
    if (todos.length) renderSeo(todos);
    if (PV && PV.classList.contains("open") && pvActual) elegirFit(pvActual.fit);
  });

  if (document.readyState !== "loading") load();
  else document.addEventListener("DOMContentLoaded", load);
  /* Al cambiar de idioma se repintan las dos cuadrículas; si la ventana está
     abierta, se cierra (su contenido quedaría en el idioma anterior). */
  document.addEventListener("aym:langchange", function () {
    if (PV && PV.classList.contains("open")) cerrarVentana();
    renderAll();
  });
})();
