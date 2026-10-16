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
  /* Los tres espacios de la tienda. Cada espacio tiene sus propios diseños y
     su horma: una camiseta es Regular u Oversized según dónde la suban.
     (productos.json es el espacio Regular fit desde antes; se conserva el
     nombre para no romper nada de lo que ya tenían.) */
  var GRIDS = [
    { grid: "regular-grid",    archivo: "data/productos.json",  espacio: "regular",    fit: "regular" },
    { grid: "oversized-grid",  archivo: "data/oversized.json",  espacio: "oversized",  fit: "oversized" },
    { grid: "esenciales-grid", archivo: "data/essentials.json", espacio: "esenciales", fit: "regular" }
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

  /* Un precio del panel (puede venir como número o como "59.000"); 0 si no es
     válido. Igual criterio que el carrito: mínimo 1.000. */
  function numPrecio(v) {
    var n = typeof v === "number" ? Math.round(v)
          : parseInt(String(v == null ? "" : v).replace(/[^\d]/g, ""), 10);
    return isFinite(n) && n >= 1000 ? n : 0;
  }

  /* Lista de fotos (rutas, sin repetidas) a partir de una imagen principal y
     una galería opcional. */
  function listaFotos(imagen, galeria) {
    var lista = [ruta(imagen)];
    if (Array.isArray(galeria)) galeria.forEach(function (g) { lista.push(ruta(g)); });
    var vistas = {}, out = [];
    lista.forEach(function (f) { if (f && !vistas[f]) { vistas[f] = 1; out.push(f); } });
    return out;
  }
  /* Fotos por defecto del producto (sin color elegido). */
  function fotos(p) {
    var out = listaFotos(p.imagen, p.galeria);
    return out.length ? out : [IMG_DEFECTO];
  }

  /* Colores de un producto, cada uno con su propia foto. [] si no tiene.
     Un color sin foto se descarta: la idea es "cada color con su foto". */
  function coloresDe(p) {
    if (!Array.isArray(p.colores)) return [];
    return p.colores
      .map(function (c) {
        if (!c) return null;
        return {
          nombre_es: (c.nombre_es || c.nombre_en || "").trim(),
          nombre_en: (c.nombre_en || c.nombre_es || "").trim(),
          hex: typeof c.color === "string" ? c.color.trim() : "",
          imgs: listaFotos(c.imagen, c.galeria)
        };
      })
      .filter(function (c) { return c && c.imgs.length && (c.nombre_es || c.nombre_en); });
  }
  function nombreColor(c, en) { return en ? (c.nombre_en || c.nombre_es) : (c.nombre_es || c.nombre_en); }

  /* TODAS las fotos del producto en una sola galería: primero la portada y la
     galería general, después las fotos de cada color. `colorDe[i]` dice a qué
     color pertenece la foto i ("" = portada/galería general, sin color).
     La portada siempre va primero: los colores SUMAN fotos, no la reemplazan. */
  function todasLasFotos(p) {
    var cols = coloresDe(p);
    var imgs = [], colorDe = [], indice = {};
    function poner(src, key) {
      if (!src) return;
      if (indice.hasOwnProperty(src)) {
        /* La misma foto ya está (p. ej. la portada ES la foto del color negro):
           no se repite en la galería, pero queda asociada a ese color para que
           tocarlo la muestre. */
        var i = indice[src];
        if (key && !colorDe[i]) colorDe[i] = key;
        return;
      }
      indice[src] = imgs.length; imgs.push(src); colorDe.push(key || "");
    }
    listaFotos(p.imagen, p.galeria).forEach(function (s) { poner(s, ""); });
    cols.forEach(function (c) { c.imgs.forEach(function (s) { poner(s, c.nombre_es); }); });
    if (!imgs.length) { imgs.push(IMG_DEFECTO); colorDe.push(""); }
    return { imgs: imgs, colorDe: colorDe, cols: cols };
  }
  /* El cuadrito del color: el hex si lo pusieron, si no una miniatura de su foto. */
  function swatchHTML(c) {
    return c.hex
      ? '<span class="color-dot" style="background:' + esc(c.hex) + '"></span>'
      : '<span class="color-dot"><img src="' + esc(c.imgs[0]) + '" alt=""></span>';
  }

  /* Estado: lo que llegó de cada archivo, y el catálogo combinado */
  var datos = {};                 // archivo → lista de productos
  var CATALOGO = {};              // id → producto (para la ventana de fotos)

  function cardHTML(p) {
    var en = lang() === "en";
    var nombre = pick(p, "nombre"), desc = pick(p, "desc");
    var soldout = p.disponible === false;
    var todas = todasLasFotos(p);
    var cols = todas.cols;
    /* La tarjeta SIEMPRE muestra la portada. Los colores son opcionales: tocar
       uno muestra su foto; tocarlo otra vez vuelve a la portada. Nadie tiene
       que elegir un color para ver una foto. */
    var portada = todas.imgs[0];
    var hayGaleria = todas.imgs.length > 1;
    var swatches = cols.length
      ? '<div class="product-colors" role="group" aria-label="Color">' +
          cols.map(function (c) {
            var nm = nombreColor(c, en);
            return '<button type="button" class="color-swatch" data-color="' + esc(c.nombre_es) +
              '" data-img="' + esc(c.imgs[0]) + '" title="' + esc(nm) + '" aria-label="' + esc(nm) +
              '" aria-pressed="false">' + swatchHTML(c) + '</button>';
          }).join("") +
        '</div>'
      : "";
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
        '<img src="' + esc(portada) + '" data-portada="' + esc(portada) + '" alt="' + esc(nombre) + '" loading="lazy" width="260" height="288">' +
        lupa +
      '</button>' +
      tag +
      '<h3 class="product-name">' + esc(nombre) + '</h3>' +
      '<p class="product-desc">' + esc(desc) + '</p>' +
      swatches +
      '<div class="product-sizes" role="group" aria-label="Talla / Size">' +
        '<span class="size-label">' + (en ? "Size" : "Talla") + '</span>' + sizes +
      '</div>' +
      '<div class="product-buy">' +
        '<span class="product-price" data-price="' + esc(p.id) + '"></span>' +
        buy +
      '</div>' +
    '</article>';
  }

  /* Precio de una camiseta: el suyo propio si lo pusieron en el panel; si no,
     el precio general de su espacio (sección Precios). El carrito es quien
     cobra; esto solo alimenta los datos para Google y el respaldo de la ventana. */
  function precioDe(p) {
    var propio = numPrecio(p.precio);
    if (propio > 0) return propio;
    var cfg = window.AYM_PRECIOS || {};
    if (p._espacio === "esenciales" && numPrecio(cfg.precio_esenciales) > 0) return numPrecio(cfg.precio_esenciales);
    if (p._fit === "oversized") return numPrecio(cfg.precio_oversized) || 79000;
    return numPrecio(cfg.precio_regular) || 69000;
  }

  /* Pinta un espacio y devuelve la lista válida que mostró.
     `usados` lleva los id ya usados (entre los tres espacios) para que un id
     repetido no haga que el carrito confunda un producto con otro. */
  function renderGrid(g, lista, usados) {
    var grid = document.getElementById(g.grid);
    if (!grid || !Array.isArray(lista)) return [];
    var valid = lista.filter(function (p) {
      if (!p || !p.id || usados[p.id]) return false;
      usados[p.id] = true;
      return true;
    });
    /* El espacio define la horma de cada camiseta (ya no se elige aparte) */
    valid.forEach(function (p) { p._espacio = g.espacio; p._fit = g.fit; });
    grid.innerHTML = valid.map(cardHTML).join("");
    /* Espacio sin camisetas todavía (p. ej. Oversized antes de subir los
       primeros diseños): un aviso amable en vez de un hueco vacío. */
    var panel = grid.closest(".shop-panel");
    var vacio = panel ? panel.querySelector(".shop-empty") : null;
    if (vacio) vacio.hidden = valid.length > 0;
    return valid;
  }

  function renderAll() {
    var usados = {};
    var todos = [];
    GRIDS.forEach(function (g) {
      var lista = datos[g.archivo];
      if (Array.isArray(lista)) todos = todos.concat(renderGrid(g, lista, usados));
    });
    /* Si no llegó ningún catálogo, no se toca el carrito (podría vaciarlo) */
    if (!todos.length) return;

    /* Catálogo para la ventana de fotos (objetos completos) */
    CATALOGO = {};
    todos.forEach(function (p) { CATALOGO[p.id] = p; });

    /* Mapa para el carrito: nombre, foto, espacio y horma de cada camiseta,
       su precio propio (si tiene) y sus colores. */
    var map = {};
    todos.forEach(function (p) {
      var cols = coloresDe(p);
      map[p.id] = {
        img: fotos(p)[0],   // la portada, siempre
        nombre_es: p.nombre_es || "",
        nombre_en: p.nombre_en || "",
        disponible: p.disponible !== false,
        espacio: p._espacio,
        fit: p._fit,
        precio: p.precio,
        colores: cols.map(function (c) { return { nombre_es: c.nombre_es, nombre_en: c.nombre_en, img: c.imgs[0] }; })
      };
    });
    window.AYM_PRODUCTS = map;
    renderSeo(todos);
    document.dispatchEvent(new CustomEvent("aym:productsrendered"));
  }

  /* Datos estructurados de los productos (se regeneran con el catálogo y los
     precios reales). Cada camiseta tiene una horma y un precio. */
  function renderSeo(valid) {
    var tag = document.getElementById(SEO_ID);
    if (!tag || !valid.length) return;
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
                "@type": "Offer",
                "price": String(precioDe(p)),
                "priceCurrency": "COP",
                "availability": p.disponible === false
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
                "url": SITIO + "#" + (p._espacio || "regular")
              }
            }
          };
        })
      }, null, 2);
    } catch (e) {}
  }

  /* =======================================================
     Pestañas de la tienda: Regular fit · Oversized · Esenciales
     ======================================================= */
  var PESTANAS = ["regular", "oversized", "esenciales"];
  function mostrarTab(tab) {
    if (PESTANAS.indexOf(tab) < 0) tab = "regular";
    document.querySelectorAll(".shop-tab[data-tab]").forEach(function (b) {
      var on = b.getAttribute("data-tab") === tab;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll(".shop-panel[data-panel]").forEach(function (pn) {
      pn.hidden = pn.getAttribute("data-panel") !== tab;
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".shop-tab[data-tab]");
    if (!b) return;
    var tab = b.getAttribute("data-tab");
    mostrarTab(tab);
    /* El enlace queda compartible (#oversized…) sin saltar la página */
    try { history.replaceState(null, "", "#" + tab); } catch (err) {}
  });
  /* Teclado: ← → entre pestañas (patrón de pestañas accesible) */
  document.addEventListener("keydown", function (e) {
    var b = e.target.closest && e.target.closest(".shop-tab[data-tab]");
    if (!b || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    var i = PESTANAS.indexOf(b.getAttribute("data-tab"));
    var sig = PESTANAS[(i + (e.key === "ArrowRight" ? 1 : -1) + PESTANAS.length) % PESTANAS.length];
    mostrarTab(sig);
    var nb = document.querySelector('.shop-tab[data-tab="' + sig + '"]');
    if (nb) nb.focus();
    try { history.replaceState(null, "", "#" + sig); } catch (err) {}
  });
  /* El enrutador avisa cuando se entra por #regular / #oversized / #essentials */
  document.addEventListener("aym:tab", function (e) { mostrarTab(e.detail); });

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
      var col = t.closest(".pv-color");
      if (col) { elegirColor(parseInt(col.getAttribute("data-i"), 10) || 0); return; }
      var sz = t.closest(".pv-size");
      if (sz) {
        PV.querySelectorAll(".pv-size").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
        sz.classList.add("is-active"); sz.setAttribute("aria-pressed", "true");
        return;
      }
      var add = t.closest(".pv-add");
      if (add && !add.disabled) return agregarDesdeVentana();
    });

    /* Deslizar con el dedo (celular): izquierda = siguiente, derecha = anterior.
       Solo sobre la foto, para no estorbar el scroll del texto. */
    var x0 = null, y0 = null;
    PV.addEventListener("touchstart", function (e) {
      if (!e.target.closest(".pv-main") || !e.touches || !e.touches[0]) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    PV.addEventListener("touchend", function (e) {
      if (x0 === null || !e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      /* Gesto claramente horizontal y de al menos 40px */
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) mover(dx < 0 ? 1 : -1);
    }, { passive: true });
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

  /* Precio de la camiseta abierta en la ventana (lo calcula el carrito, que es
     quien cobra; si aún no cargó, el respaldo de precioDe). */
  function precioVentana() {
    var id = pvActual ? pvActual.id : null;
    if (window.AYM_CART && typeof window.AYM_CART.price === "function") return window.AYM_CART.price(id, pvActual.fit);
    var p = id ? CATALOGO[id] : null;
    return p ? precioDe(p) : 0;
  }
  function fmt(n) {
    if (window.AYM_CART && typeof window.AYM_CART.fmt === "function") return window.AYM_CART.fmt(n);
    return "$" + Number(n || 0).toLocaleString("es-CO");
  }

  /* HTML de la galería (foto grande + flechas + miniaturas) para una lista
     de fotos. Se usa al abrir y al cambiar de color. */
  function galeriaHTML(imgs, en) {
    var nav = imgs.length > 1
      ? '<button type="button" class="pv-nav pv-prev" aria-label="' + (en ? "Previous photo" : "Foto anterior") + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
        '<button type="button" class="pv-nav pv-next" aria-label="' + (en ? "Next photo" : "Siguiente foto") + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>' +
        '<span class="pv-count"></span>'
      : "";
    var thumbs = imgs.length > 1
      ? '<div class="pv-thumbs">' + imgs.map(function (src, k) {
          return '<button type="button" class="pv-thumb" data-i="' + k + '" aria-label="' +
            (en ? "Photo " : "Foto ") + (k + 1) + '"><img src="' + esc(src) + '" alt="" loading="lazy"></button>';
        }).join("") + '</div>'
      : "";
    return '<div class="pv-main">' + nav + '<img src="' + esc(imgs[0]) + '" alt=""></div>' + thumbs;
  }
  /* Elegir un color en la ventana = saltar a la primera foto de ese color.
     Tocar el color que ya está marcado vuelve a la portada. */
  function elegirColor(k) {
    if (!pvActual || !pvActual.cols || !pvActual.cols[k]) return;
    var key = pvActual.cols[k].nombre_es;
    if (pvActual.color === key) { pvActual.idx = 0; pintarFoto(); return; }
    var i = pvActual.colorDe.indexOf(key);
    if (i < 0) return;
    pvActual.idx = i;
    pintarFoto();
  }

  /* Pinta la foto actual y deja marcado el color al que pertenece: lo que se ve
     es lo que se pide. En la portada o la galería general no hay color. */
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
    pvActual.color = (pvActual.colorDe && pvActual.colorDe[i]) || "";
    PV.querySelectorAll(".pv-color").forEach(function (b, k) {
      var on = !!(pvActual.cols[k] && pvActual.cols[k].nombre_es === pvActual.color);
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    /* Que la miniatura activa quede a la vista si hay muchas */
    var activa = PV.querySelector(".pv-thumb.is-active");
    if (activa && activa.scrollIntoView) {
      try { activa.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) {}
    }
  }
  function mover(d) {
    if (!pvActual || pvActual.imgs.length < 2) return;
    var n = pvActual.imgs.length;
    pvActual.idx = (pvActual.idx + d + n) % n;
    pintarFoto();
  }
  function pintarPrecio() {
    var pr = PV.querySelector(".pv-price");
    if (pr) pr.textContent = fmt(precioVentana());
  }

  function abrirVentana(id, colorKey) {
    var p = CATALOGO[id];
    if (!p) return;
    construirVentana();
    var en = lang() === "en";
    var soldout = p.disponible === false;
    var nombre = pick(p, "nombre");
    var desc = (en
      ? (p.desc_larga_en || p.desc_larga_es || p.desc_en || p.desc_es)
      : (p.desc_larga_es || p.desc_larga_en || p.desc_es || p.desc_en)) || "";
    /* Una sola galería con todas las fotos; arranca en la portada, o en la
       primera foto del color que la persona tocó en la tarjeta. */
    var todas = todasLasFotos(p);
    var cols = todas.cols, imgs = todas.imgs;
    var idxInicial = 0;
    if (colorKey) { var j = todas.colorDe.indexOf(colorKey); if (j >= 0) idxInicial = j; }
    /* La horma la define el espacio donde está la camiseta */
    var fit = p._fit === "oversized" ? "oversized" : "regular";
    var etiquetaHorma = p._espacio === "esenciales" ? "Esenciales" : (fit === "oversized" ? "Oversized" : "Regular fit");
    pvActual = { id: id, cols: cols, colorDe: todas.colorDe, color: todas.colorDe[idxInicial] || "", imgs: imgs, idx: idxInicial, fit: fit };

    var colorBtns = cols.length ? cols.map(function (c, k) {
      var nm = nombreColor(c, en);
      return '<button type="button" class="pv-color" data-i="' + k +
        '" title="' + esc(nm) + '" aria-label="' + esc(nm) + '" aria-pressed="false">' + swatchHTML(c) + '</button>';
    }).join("") : "";
    var colorOpt = cols.length
      ? '<div class="pv-opt"><span class="pv-opt-label">' + (en ? "Color" : "Color") + '</span>' +
          '<div class="pv-colors" role="group" aria-label="' + (en ? "Color" : "Color") + '">' + colorBtns + '</div></div>'
      : "";

    var tag = soldout
      ? '<span class="tag">' + (en ? "Sold out" : "Agotado") + '</span>'
      : '<span class="tag tag-live">' + (en ? "Available" : "Disponible") + '</span>';

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
      '<div class="pv-gallery">' + galeriaHTML(imgs, en) + '</div>' +
      '<div class="pv-info">' +
        tag +
        '<h3 class="pv-title" id="pv-name">' + esc(nombre) + '</h3>' +
        '<p class="pv-desc">' + esc(desc) + '</p>' +
        '<div class="pv-opts">' +
          colorOpt +
          '<div class="pv-opt"><span class="pv-opt-label">Horma</span>' +
            '<span class="pv-fit-fija">' + esc(etiquetaHorma) + '</span></div>' +
          '<div class="pv-opt"><span class="pv-opt-label">' + (en ? "Size" : "Talla") + '</span>' +
            '<div class="pv-sizes" role="group" aria-label="' + (en ? "Size" : "Talla") + '">' + sizeBtns + '</div></div>' +
        '</div>' +
        '<div class="pv-buy"><span class="pv-price"></span>' + botonAdd + '</div>' +
      '</div>';

    pintarFoto();
    pintarPrecio();

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
    var color = pvActual.color || "";
    cerrarVentana();
    if (id && window.AYM_CART && typeof window.AYM_CART.add === "function") {
      window.AYM_CART.add(id, fit, size, color);
    }
  }

  /* Un clic en la foto de cualquier producto abre su ventana. Si en la tarjeta
     hay un color elegido, la ventana abre en ese color. */
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".pv-trigger[data-open]");
    if (!t) return;
    e.preventDefault();
    var art = t.closest(".product");
    var sw = art ? art.querySelector(".color-swatch.is-active") : null;
    abrirVentana(t.getAttribute("data-open"), sw ? sw.getAttribute("data-color") : null);
  });

  /* Elegir un color en la TARJETA: muestra su foto y lo deja marcado (el botón
     Agregar lo lee del color activo). Tocar el color ya marcado lo desmarca y
     vuelve a la portada: la portada es siempre el punto de partida. */
  document.addEventListener("click", function (e) {
    var sw = e.target.closest(".color-swatch[data-color]");
    if (!sw) return;
    var grp = sw.closest(".product-colors"); if (!grp) return;
    var art = sw.closest(".product");
    var img = art ? art.querySelector(".product-media img") : null;
    var yaEstaba = sw.classList.contains("is-active");
    grp.querySelectorAll(".color-swatch").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
    if (yaEstaba) {
      if (img && img.getAttribute("data-portada")) img.setAttribute("src", img.getAttribute("data-portada"));
      return;
    }
    sw.classList.add("is-active"); sw.setAttribute("aria-pressed", "true");
    var nueva = sw.getAttribute("data-img");
    if (img && nueva) img.setAttribute("src", nueva);
  });

  /* =======================================================
     Carga de datos
     ======================================================= */
  function cargarUno(archivo) {
    return fetch(archivo, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var list = data && Array.isArray(data.productos) ? data.productos : (Array.isArray(data) ? data : null);
        if (list) datos[archivo] = list;
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
    if (PV && PV.classList.contains("open") && pvActual) pintarPrecio();
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
