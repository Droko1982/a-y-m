/* =========================================================
   A&M Universe · carrito de compras (horma + tallas + color)
   Estado en localStorage · checkout por WhatsApp · ES/EN
   ========================================================= */
(function () {
  "use strict";

  var WA_NUMBER = "573215799683";
  /* Pago en línea con Wompi (panel → Pagos). Apagado hasta que las dueñas
     tengan su cuenta y el servidor de pagos (cloudflare/pagos.js) esté listo:
     mientras tanto el carrito queda igual, solo con WhatsApp. */
  var WOMPI = { activo: false, api: "" };

  /* Precio general de cada espacio (sección Precios del panel). Se usa para
     las camisetas que no tienen precio propio. Esenciales en 0 = usa el de
     Regular fit hasta que pongan uno. */
  var FIT_PRICES = { regular: 69000, oversized: 79000, esenciales: 0 };
  var FITS = ["regular", "oversized"];
  var FIT_LABEL = { regular: "Regular fit", oversized: "Oversized" };

  var PRODUCTS = {
    ocean:  { img: "assets/tee-ocean.svg" },
    animal: { img: "assets/tee-animal.svg" },
    stars:  { img: "assets/tee-stars.svg" },
    origen: { img: "assets/tee-origen.svg" }
  };
  var FALLBACK = { ocean: "Camiseta Océano", animal: "Camiseta Coral", stars: "Camiseta Ballena", origen: "Camiseta Tortuga" };
  var SIZES = ["S", "M", "L", "XL"];
  var IMG_DEFECTO = "assets/tee-ocean.svg";

  /* Precio de UNA camiseta. Si trae su propio precio (campo "Precio" en el
     panel) se usa ese; si no, el precio general de su espacio: Esenciales,
     Oversized o Regular fit. Así cada camiseta puede costar distinto. */
  function price(id, fit) {
    var p = PRODUCTS[id];
    if (p) {
      var n = precioDelPanel(p.precio);
      if (n > 0) return n;
      if (p.espacio === "esenciales" && FIT_PRICES.esenciales > 0) return FIT_PRICES.esenciales;
    }
    return FIT_PRICES[fit] || FIT_PRICES.regular;
  }
  /* La horma de una camiseta la define su espacio (Regular / Oversized). */
  function fitDe(id) {
    var p = PRODUCTS[id];
    return p && FITS.indexOf(p.fit) >= 0 ? p.fit : "regular";
  }
  /* Lo que se escribe en el carrito y en el pedido: la horma, o "Esenciales". */
  function etiquetaDe(i) {
    var p = PRODUCTS[i.id];
    return p && p.espacio === "esenciales" ? "Esenciales" : FIT_LABEL[i.fit];
  }

  /* API mínima para la ventana de fotos (js/shop.js): agregar al carrito con
     la horma y la talla elegidas ahí, y leer el precio de esa camiseta en la
     horma pedida. Es la única puerta de entrada al carrito desde fuera. */
  window.AYM_CART = {
    add: function (id, fit, size, color) { add(id, fit, size, color); },
    open: function () { open(); },
    price: function (id, fit) { return price(id, FITS.indexOf(fit) >= 0 ? fit : fitDe(id)); },
    fmt: function (n) { return fmt(n); }
  };
  /* Escapa también comillas: ids y colores los escriben las dueñas ("Don't") y
     van dentro de atributos data-*. */
  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function limpio(v) { return typeof v === "string" && v.trim() !== "" ? v.trim() : ""; }

  /* ---------- Configuración editable desde el panel (data/config.json) ----------
     Permite a las dueñas cambiar los precios desde el panel de administración.
     Si el archivo no está o falla, se usan los valores por defecto de arriba. */
  /* Un precio del panel, leído como lo escribiría una persona en Colombia.
     "69.000" con Number() daba 69, y ese $69 llegaba hasta el pedido de
     WhatsApp: alguien podía pedir una camiseta por 69 pesos. En pesos no hay
     centavos, así que puntos, comas, espacios y el signo son separadores.
     El piso descarta los errores de dedo (un cero de menos, un 0, un negativo):
     ninguna camiseta cuesta menos de mil pesos, así que ante un valor
     imposible se conserva el precio anterior en vez de publicarlo. */
  var PRECIO_MINIMO = 1000;
  function precioDelPanel(v) {
    var n = typeof v === "number" ? Math.round(v)
          : parseInt(String(v == null ? "" : v).replace(/[^\d]/g, ""), 10);
    return isFinite(n) && n >= PRECIO_MINIMO ? n : 0;
  }

  function applyConfig(cfg) {
    if (!cfg || typeof cfg !== "object") return;
    var r = precioDelPanel(cfg.precio_regular), o = precioDelPanel(cfg.precio_oversized),
        e = precioDelPanel(cfg.precio_esenciales);
    if (r > 0) FIT_PRICES.regular = r;
    if (o > 0) FIT_PRICES.oversized = o;
    if (e > 0) FIT_PRICES.esenciales = e;
    /* Los datos estructurados de producto (js/shop.js) también necesitan
       el precio que puso el panel, no el que quedó escrito en el HTML. */
    window.AYM_PRECIOS = {
      precio_regular: FIT_PRICES.regular,
      precio_oversized: FIT_PRICES.oversized,
      precio_esenciales: FIT_PRICES.esenciales || FIT_PRICES.regular
    };
    try { document.dispatchEvent(new CustomEvent("aym:preciosaplicados")); } catch (e2) {}
  }

  function pedirJson(url) {
    try {
      return fetch(url, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }

  function applyPagos(p) {
    var api = p && typeof p.wompi_api === "string" ? p.wompi_api.trim().replace(/\/+$/, "") : "";
    WOMPI.activo = !!(p && p.wompi_activo === true && /^https?:\/\/[^\s]+$/.test(api));
    WOMPI.api = WOMPI.activo ? api : "";
  }

  function loadConfig(done) {
    try {
      Promise.all([pedirJson("data/config.json"), pedirJson("data/pagos.json")])
        .then(function (r) { applyConfig(r[0]); applyPagos(r[1]); done(); })
        .catch(function () { done(); });
    } catch (e) { done(); }
  }

  /* ---------- Estado ---------- */

  /* El carrito ya no pide el método de pago: se acuerda con la clienta por
     WhatsApp. Se borra la preferencia que guardaba la versión anterior. */
  try { localStorage.removeItem("aym-pay"); } catch (e) {}

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem("aym-cart")) || []; } catch (e) { cart = []; }
  /* No se descarta nada por el id: en este momento PRODUCTS solo tiene las
     cuatro camisetas escritas en este archivo, y el catálogo de verdad (con lo
     que las dueñas hayan creado desde el panel) todavía no ha llegado. Filtrar
     aquí borraba en silencio esos productos al recargar. La depuración real se
     hace más abajo, al recibir aym:productsrendered. */
  cart = cart.filter(function (i) { return i && i.id && i.qty > 0; })
             .map(function (i) {
               return {
                 id: i.id,
                 fit: FITS.indexOf(i.fit) >= 0 ? i.fit : "regular",
                 size: SIZES.indexOf(i.size) >= 0 ? i.size : "M",
                 color: typeof i.color === "string" ? i.color : "",
                 qty: i.qty
               };
             });

  function save() { try { localStorage.setItem("aym-cart", JSON.stringify(cart)); } catch (e) {} }
  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "es"; }
  function fmt(n) { return "$" + n.toLocaleString("es-CO"); }
  function getName(id) {
    var b = null;
    try {
      var sel = window.CSS && CSS.escape ? CSS.escape(id) : String(id).replace(/["\\]/g, "\\$&");
      b = document.querySelector('.btn-add[data-product="' + sel + '"]');
    } catch (e) { b = null; }
    if (b) { var art = b.closest(".product"); if (art) { var n = art.querySelector(".product-name"); if (n && n.textContent.trim()) return n.textContent.trim(); } }
    /* Las camisetas agotadas no llevan data-product (su botón está deshabilitado),
       así que el nombre se toma del catálogo del panel antes que de la tabla fija. */
    var p = PRODUCTS[id];
    if (p) {
      var nom = lang() === "en" ? (p.nombre_en || p.nombre_es) : (p.nombre_es || p.nombre_en);
      if (nom && String(nom).trim()) return String(nom).trim();
    }
    return FALLBACK[id] || id;
  }
  function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function total() { return cart.reduce(function (s, i) { return s + i.qty * price(i.id, i.fit); }, 0); }
  function mismo(x, id, fit, size, color) {
    return x.id === id && x.fit === fit && x.size === size && (x.color || "") === (color || "");
  }
  function find(id, fit, size, color) { for (var i = 0; i < cart.length; i++) if (mismo(cart[i], id, fit, size, color)) return cart[i]; return null; }

  /* Nombre del color según el idioma, a partir de su clave (nombre_es). Si el
     color ya no existe en el catálogo, se muestra la clave guardada. */
  function getColorName(id, key) {
    if (!key) return "";
    var p = PRODUCTS[id];
    if (p && Array.isArray(p.colores)) {
      for (var i = 0; i < p.colores.length; i++) {
        if (p.colores[i].nombre_es === key) {
          var c = p.colores[i], nm = lang() === "en" ? (c.nombre_en || c.nombre_es) : (c.nombre_es || c.nombre_en);
          if (nm) return nm;
        }
      }
    }
    return key;
  }
  /* Foto del color elegido (para la miniatura del carrito). */
  function getColorImg(id, key) {
    var p = PRODUCTS[id];
    if (p && Array.isArray(p.colores) && key) {
      for (var i = 0; i < p.colores.length; i++) {
        if (p.colores[i].nombre_es === key && p.colores[i].img) return p.colores[i].img;
      }
    }
    return p && p.img ? p.img : IMG_DEFECTO;
  }

  /* ---------- Color en el carrito ----------
     Si una camiseta tiene colores, el carrito muestra cuál se eligió y deja
     cambiarlo. Nada cambia hasta pulsar "Confirmar color", y el pedido no se
     puede enviar mientras falte el color de alguna camiseta: así no llega a
     WhatsApp un pedido sin color (antes pasaba si no se tocaba ningún color). */
  function coloresDe(id) {
    var p = PRODUCTS[id];
    return p && Array.isArray(p.colores) ? p.colores.filter(function (c) { return c && c.nombre_es; }) : [];
  }
  function colorValido(i) {
    var cols = coloresDe(i.id);
    if (!cols.length) return true;
    for (var k = 0; k < cols.length; k++) if (cols[k].nombre_es === i.color) return true;
    return false;
  }
  function faltaColor(i) { return coloresDe(i.id).length > 0 && !colorValido(i); }
  /* ---------- Tallas agotadas ----------
     El panel marca por camiseta las tallas que no hay. Una línea del carrito
     con una talla que se agotó después de agregarla no se borra: se marca y
     se ofrece cambiarla (con confirmación) o quitarla, y el pedido no sale
     mientras tanto. */
  function agotadasDe(id) {
    var p = PRODUCTS[id];
    return p && Array.isArray(p.agotadas) ? p.agotadas : [];
  }
  function tallaAgotada(i) { return agotadasDe(i.id).indexOf(i.size) >= 0; }
  function tallasLibres(id) {
    var a = agotadasDe(id);
    return SIZES.filter(function (s) { return a.indexOf(s) < 0; });
  }
  function cambiarTalla(id, fit, vieja, color, nueva) {
    var it = find(id, fit, vieja, color); if (!it) return null;
    var otro = find(id, fit, nueva, color);
    if (otro && otro !== it) { otro.qty += it.qty; cart = cart.filter(function (x) { return x !== it; }); return otro; }
    it.size = nueva;
    return it;
  }
  function bloqueada(i) { return faltaColor(i) || tallaAgotada(i); }
  function lineaDe(i) { return [i.id, i.fit, i.size, i.color || ""].join("|"); }
  /* Lo que la persona está editando: { "id|fit|talla|color": { abierto, pendiente, ok } } */
  var edicion = {};
  function hayPendientes() {
    return Object.keys(edicion).some(function (k) { return edicion[k] && (edicion[k].pendiente || edicion[k].talla); });
  }
  function puntoColor(id, key) {
    var cols = coloresDe(id);
    for (var k = 0; k < cols.length; k++) {
      if (cols[k].nombre_es !== key) continue;
      if (cols[k].hex) return '<span class="ci-dot" style="background:' + esc(cols[k].hex) + '"></span>';
      if (cols[k].img) return '<span class="ci-dot"><img src="' + esc(cols[k].img) + '" alt=""></span>';
    }
    return '<span class="ci-dot"></span>';
  }
  function cambiarColor(id, fit, size, viejo, nuevo) {
    var it = find(id, fit, size, viejo); if (!it) return null;
    var otro = find(id, fit, size, nuevo);
    if (otro && otro !== it) { otro.qty += it.qty; cart = cart.filter(function (x) { return x !== it; }); return otro; }
    it.color = nuevo;
    return it;
  }

  function add(id, fit, size, color) {
    if (!PRODUCTS[id]) return;
    if (FITS.indexOf(fit) < 0) fit = "regular";
    if (SIZES.indexOf(size) < 0) size = "M";
    /* Una talla agotada no entra al carrito (la tienda ni la deja elegir) */
    if (tallaAgotada({ id: id, size: size })) return;
    color = color || "";
    var it = find(id, fit, size, color); if (it) it.qty++; else { it = { id: id, fit: fit, size: size, color: color, qty: 1 }; cart.push(it); }
    save(); render(); open();
    /* Si falta el color, el selector queda a la vista para elegirlo ya */
    if (faltaColor(it)) mostrarEditor(lineaDe(it));
  }
  function setQty(id, fit, size, color, q) {
    var it = find(id, fit, size, color); if (!it) return;
    it.qty = q;
    if (it.qty <= 0) cart = cart.filter(function (x) { return !mismo(x, id, fit, size, color); });
    save(); render();
  }
  function remove(id, fit, size, color) { cart = cart.filter(function (x) { return !mismo(x, id, fit, size, color); }); save(); render(); }

  /* ---------- Precios en las tarjetas ----------
     Cada tarjeta muestra el precio de SU camiseta, en la horma de su espacio.
     (Antes había un selector de horma; ahora la horma la define el espacio.) */
  function applyFit() {
    document.querySelectorAll(".product-price[data-price]").forEach(function (el) {
      var id = el.getAttribute("data-price");
      el.textContent = fmt(price(id, fitDe(id)));
    });
  }

  function checkoutHref() {
    if (!cart.length) return "https://wa.me/" + WA_NUMBER;
    var en = lang() === "en", tl = en ? "Size" : "Talla";
    var lines = cart.map(function (i) {
      var colName = getColorName(i.id, i.color);
      return "• " + i.qty + "× " + getName(i.id) + " (" + etiquetaDe(i) + " · " + tl + " " + i.size + (colName ? " · " + colName : "") + ") — " + fmt(i.qty * price(i.id, i.fit));
    });
    var n = count(), msg;
    if (en) {
      msg = "Hi A&M Universe! 🐱 I'd like to place this order:\n\n" +
        lines.join("\n") + "\n\n" +
        n + (n === 1 ? " item" : " items") + " · Products total: " + fmt(total()) + "\n" +
        "Shipping: to be arranged by city\n\n" +
        "📦 Shipping details\n" +
        "Full name: \nPhone: \nCity & state: \nAddress: ";
    } else {
      msg = "¡Hola A&M Universe! 🐱 Quiero hacer este pedido:\n\n" +
        lines.join("\n") + "\n\n" +
        n + (n === 1 ? " prenda" : " prendas") + " · Total productos: " + fmt(total()) + "\n" +
        "Envío: a coordinar según tu ciudad\n\n" +
        "📦 Datos de envío\n" +
        "Nombre y apellido: \nTeléfono: \nCiudad y departamento: \nDirección: ";
    }
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  /* Recordar qué botón tenía el foco: render() rehace la lista y, sin esto,
     quien usa teclado o lector de pantalla pierde su lugar en cada clic. */
  function capturaFoco() {
    var a = document.activeElement;
    if (!a || !a.closest || !a.closest("#cart-items")) return null;
    return { act: a.getAttribute("data-act"), line: a.getAttribute("data-line"), key: a.getAttribute("data-key") };
  }
  function restauraFoco(f) {
    if (!f || !f.act) return;
    var lista = document.querySelectorAll("#cart-items [data-act]");
    var deLinea = [];
    for (var k = 0; k < lista.length; k++) {
      var b = lista[k];
      if (b.getAttribute("data-line") !== f.line) continue;
      deLinea.push(b);
      if (b.getAttribute("data-act") === f.act && (f.key == null || b.getAttribute("data-key") === f.key)) { b.focus(); return; }
    }
    /* El botón ya no está (p. ej. se abrió o cerró el selector): el más cercano
       de la misma línea: el color marcado, "Cambiar" o el botón de cantidad. */
    var orden = ['color-elegir[aria-pressed="true"]', "color-elegir", "color-abrir", "inc"];
    for (var o = 0; o < orden.length; o++) {
      var partes = orden[o].split("["), act = partes[0], pressed = partes[1] ? "true" : null;
      for (var j = 0; j < deLinea.length; j++) {
        if (deLinea[j].getAttribute("data-act") === act && (!pressed || deLinea[j].getAttribute("aria-pressed") === "true")) { deLinea[j].focus(); return; }
      }
    }
  }
  function enfocar(act, line) {
    var lista = document.querySelectorAll('#cart-items [data-act="' + act + '"]');
    for (var k = 0; k < lista.length; k++) if (lista[k].getAttribute("data-line") === line) { lista[k].focus(); return; }
  }
  /* En el celular la lista del carrito es una franja con scroll: el selector
     de color (y su botón Confirmar) se lleva a la vista para que no quede
     escondido debajo del total. */
  function mostrarEditor(line) {
    var eds = document.querySelectorAll("#cart-items .ci-color-edit");
    for (var k = 0; k < eds.length; k++) {
      if (eds[k].getAttribute("data-line") !== line) continue;
      var fin = eds[k].querySelector(".ci-color-btns") || eds[k];
      if (!eds[k].querySelector(".ci-color-btns") && eds[k + 1] && eds[k + 1].getAttribute("data-line") === line) continue;
      try { fin.scrollIntoView({ block: "nearest" }); } catch (e) { fin.scrollIntoView(false); }
      return;
    }
  }

  /* El color de una línea del carrito: resumen, o el selector para cambiarlo */
  function colorHTML(i, dc) {
    var cols = coloresDe(i.id);
    if (!cols.length) return { fila: "", editor: "" };
    var en = lang() === "en", linea = lineaDe(i), ed = edicion[linea] || {};
    var falta = faltaColor(i), abierto = falta || ed.abierto;
    var pend = ed.pendiente || "";
    var dl = ' data-line="' + esc(linea) + '"';
    var fila = "";
    if (!falta) {
      fila = '<div class="ci-color">' + puntoColor(i.id, i.color) +
        '<span>' + (en ? "Color" : "Color") + ': <strong>' + esc(getColorName(i.id, i.color)) + '</strong></span>' +
        (ed.ok ? '<span class="ci-ok" role="status">✓ ' + (en ? "Confirmed" : "Confirmado") + '</span>' : '') +
        (abierto ? '' : '<button type="button" class="ci-link" data-act="color-abrir"' + dc + dl + '>' + (en ? "Change" : "Cambiar") + '</button>') +
      '</div>';
    }
    if (!abierto) return { fila: fila, editor: "" };
    var opciones = cols.map(function (c) {
      var nm = en ? (c.nombre_en || c.nombre_es) : (c.nombre_es || c.nombre_en);
      var marcado = pend ? c.nombre_es === pend : (!falta && c.nombre_es === i.color);
      return '<button type="button" class="ci-color-opt" data-act="color-elegir"' + dc + dl + ' data-key="' + esc(c.nombre_es) +
        '" aria-pressed="' + (marcado ? "true" : "false") + '">' + puntoColor(i.id, c.nombre_es) + '<span>' + esc(nm) + '</span></button>';
    }).join("");
    var cambio = pend && pend !== i.color;
    var nombre = getName(i.id);
    var editor = '<div class="ci-color-edit' + (falta && !cambio ? " is-falta" : "") + '"' + dl + ' role="group" aria-label="' +
        esc((en ? "Color of " : "Color de ") + nombre) + '">' +
      '<p class="ci-color-msg">' + (falta
        ? (en ? "Choose the color of this t-shirt:" : "Elige el color de esta camiseta:")
        : (en ? "Choose another color:" : "Elige otro color:")) + '</p>' +
      '<div class="ci-color-opts">' + opciones + '</div>' +
      (cambio
        ? '<p class="ci-color-pend">' + (falta ? (en ? "You chose " : "Elegiste ") : (en ? "Change to " : "Cambiar a ")) +
            '<strong>' + esc(getColorName(i.id, pend)) + '</strong>' + (en ? ". Confirm?" : ". ¿Lo confirmas?") + '</p>' +
          '<div class="ci-color-btns">' +
            '<button type="button" class="ci-confirm" data-act="color-confirmar"' + dc + dl + '>' + (en ? "Confirm color" : "Confirmar color") + '</button>' +
            '<button type="button" class="ci-cancel" data-act="color-cancelar"' + dc + dl + '>' + (en ? "Cancel" : "Cancelar") + '</button>' +
          '</div>'
        : (falta ? '' : '<div class="ci-color-btns"><button type="button" class="ci-cancel" data-act="color-cancelar"' + dc + dl + '>' + (en ? "Keep " : "Dejar ") + esc(getColorName(i.id, i.color)) + '</button></div>')) +
    '</div>';
    return { fila: fila, editor: editor };
  }

  /* La talla de una línea que se agotó: aviso y tallas que sí hay */
  function tallaHTML(i, dc) {
    if (!tallaAgotada(i)) return "";
    var en = lang() === "en", linea = lineaDe(i), ed = edicion[linea] || {}, pend = ed.talla || "";
    var dl = ' data-line="' + esc(linea) + '"';
    var libres = tallasLibres(i.id);
    var opciones = libres.map(function (s) {
      return '<button type="button" class="ci-color-opt ci-talla-opt" data-act="talla-elegir"' + dc + dl + ' data-key="' + esc(s) +
        '" aria-pressed="' + (s === pend ? "true" : "false") + '"><span>' + esc(s) + '</span></button>';
    }).join("");
    return '<div class="ci-color-edit ci-talla-edit' + (pend ? "" : " is-falta") + '"' + dl + ' role="group" aria-label="' +
        esc((en ? "Size of " : "Talla de ") + getName(i.id)) + '">' +
      '<p class="ci-color-msg">' + (en ? "Size " + esc(i.size) + " is sold out. " : "La talla " + esc(i.size) + " se agotó. ") +
        (libres.length ? (en ? "Choose another size:" : "Elige otra talla:") : (en ? "Remove it to continue." : "Quítala para poder enviar tu pedido.")) + '</p>' +
      (libres.length ? '<div class="ci-color-opts">' + opciones + '</div>' : '') +
      (pend
        ? '<p class="ci-color-pend">' + (en ? "Change to size " : "Cambiar a talla ") + '<strong>' + esc(pend) + '</strong>' + (en ? ". Confirm?" : ". ¿Lo confirmas?") + '</p>' +
          '<div class="ci-color-btns">' +
            '<button type="button" class="ci-confirm" data-act="talla-confirmar"' + dc + dl + '>' + (en ? "Confirm size" : "Confirmar talla") + '</button>' +
            '<button type="button" class="ci-cancel" data-act="talla-cancelar"' + dc + dl + '>' + (en ? "Cancel" : "Cancelar") + '</button>' +
          '</div>'
        : '') +
    '</div>';
  }

  /* Aviso sobre el botón de WhatsApp mientras falte confirmar algún color */
  function pintarAviso(enfatizar) {
    var av = document.getElementById("cart-aviso"), co = document.getElementById("cart-checkout");
    var en = lang() === "en";
    var faltan = cart.filter(faltaColor).length;
    var sinTalla = cart.filter(tallaAgotada).length;
    var pend = hayPendientes();
    var msg = "";
    if (faltan) msg = en
      ? (faltan === 1 ? "Choose the color of 1 t-shirt to place your order." : "Choose the color of " + faltan + " t-shirts to place your order.")
      : (faltan === 1 ? "Falta elegir el color de 1 camiseta para enviar tu pedido." : "Falta elegir el color de " + faltan + " camisetas para enviar tu pedido.");
    else if (sinTalla) msg = en
      ? (sinTalla === 1 ? "A size you chose is sold out: change it or remove that t-shirt to place your order." : sinTalla + " sizes you chose are sold out: change them or remove those t-shirts to place your order.")
      : (sinTalla === 1 ? "Una talla que elegiste se agotó: cámbiala o quita esa camiseta para enviar tu pedido." : sinTalla + " tallas que elegiste se agotaron: cámbialas o quita esas camisetas para enviar tu pedido.");
    else if (pend) msg = en ? "Confirm or cancel the color change before placing your order." : "Confirma o cancela el cambio de color antes de enviar tu pedido.";
    if (av) {
      av.textContent = msg;
      av.hidden = !msg;
      av.classList.remove("is-alerta");
      if (msg && enfatizar) { void av.offsetWidth; av.classList.add("is-alerta"); }
    }
    if (co) {
      co.classList.toggle("is-bloqueado", !!msg);
      if (msg) co.setAttribute("aria-disabled", "true"); else co.removeAttribute("aria-disabled");
    }
    var pg = document.getElementById("cart-pagar");
    if (pg) {
      pg.classList.toggle("is-bloqueado", !!msg);
      if (msg) pg.setAttribute("aria-disabled", "true"); else pg.removeAttribute("aria-disabled");
    }
    return !msg;
  }

  function render() {
    var badge = document.getElementById("cart-count");
    if (badge) { var c = count(); badge.textContent = c; badge.hidden = c === 0; }
    var itemsEl = document.getElementById("cart-items");
    if (!itemsEl) return;
    var foco = capturaFoco();
    var emptyEl = document.getElementById("cart-empty"), footEl = document.getElementById("cart-foot");
    var en = lang() === "en", rm = en ? "Remove" : "Quitar", tl = en ? "Size" : "Talla";
    /* Olvidar ediciones de líneas que ya no existen */
    var vivas = {};
    cart.forEach(function (i) { vivas[lineaDe(i)] = true; });
    Object.keys(edicion).forEach(function (k) { if (!vivas[k]) delete edicion[k]; });
    if (!cart.length) {
      itemsEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      if (footEl) footEl.hidden = true;
    } else {
      if (emptyEl) emptyEl.hidden = true;
      if (footEl) footEl.hidden = false;
      itemsEl.innerHTML = cart.map(function (i) {
        /* p puede no existir si el catálogo aún no llegó o si falló: se pinta
           igual con una imagen de respaldo en vez de romper todo el carrito. */
        var unit = price(i.id, i.fit);
        var dc = ' data-id="' + esc(i.id) + '" data-fit="' + esc(i.fit) + '" data-size="' + esc(i.size) + '" data-color="' + esc(i.color || "") + '"';
        var dl = ' data-line="' + esc(lineaDe(i)) + '"';
        var col = colorHTML(i, dc);
        var ed = edicion[lineaDe(i)] || {};
        /* La miniatura muestra el color que se está por confirmar */
        var foto = getColorImg(i.id, ed.pendiente || (colorValido(i) ? i.color : ""));
        var agot = tallaAgotada(i);
        return '<div class="cart-item' + (bloqueada(i) ? " is-falta" : "") + '">' +
          '<img src="' + esc(foto) + '" alt="" width="62" height="68">' +
          '<div class="ci-info"><span class="ci-name">' + esc(getName(i.id)) + '</span>' +
          '<span class="ci-price">' + etiquetaDe(i) + ' · ' + tl + ' ' + esc(i.size) + (agot ? ' <strong class="ci-agotada">(' + (en ? "sold out" : "agotada") + ')</strong>' : '') + ' · ' + fmt(unit) + '</span>' +
          col.fila +
          '<div class="ci-qty">' +
            '<button type="button" data-act="dec"' + dc + dl + ' aria-label="' + (en ? "one less" : "una menos") + '">−</button>' +
            '<span class="ci-num">' + i.qty + '</span>' +
            '<button type="button" data-act="inc"' + dc + dl + ' aria-label="' + (en ? "one more" : "una más") + '">+</button>' +
            '<button type="button" class="ci-remove" data-act="rm"' + dc + dl + '>' + rm + '</button>' +
          '</div></div>' +
          '<span class="ci-line">' + fmt(i.qty * unit) + '</span>' +
          col.editor +
          tallaHTML(i, dc) +
        '</div>';
      }).join("");
    }
    var t = document.getElementById("cart-total"); if (t) t.textContent = fmt(total());
    var co = document.getElementById("cart-checkout"); if (co) co.setAttribute("href", checkoutHref());
    pintarAviso(false);
    pintarPago();
    restauraFoco(foco);
  }

  /* ---------- Pago en línea (Wompi) ----------
     El navegador solo manda qué camisetas, tallas, colores y cuántas. El
     servidor recalcula el total con el catálogo publicado, guarda el pedido
     y devuelve el checkout de Wompi firmado. El envío se paga al recibir. */
  var pagando = false;
  function pintarPago() {
    var foot = document.getElementById("cart-foot");
    if (foot) foot.classList.toggle("con-wompi", WOMPI.activo);
    var pg = document.getElementById("cart-pagar");
    if (pg) {
      pg.disabled = pagando;
      var txt = pg.querySelector(".cart-pagar-txt");
      if (txt) txt.textContent = pagando ? "Preparando tu pago…" : "Pagar " + fmt(total()) + " en línea";
    }
  }
  function mensajePago(texto) {
    var m = document.getElementById("cart-pago-msg");
    if (!m) return;
    m.textContent = texto || "";
    m.hidden = !texto;
  }
  function llevarAlEditor() {
    var primero = document.querySelector("#cart-items .ci-color-edit");
    if (primero && primero.scrollIntoView) primero.scrollIntoView({ block: "center", behavior: "smooth" });
    var b = primero && primero.querySelector(".ci-confirm, .ci-color-opt");
    if (b) b.focus({ preventScroll: true });
  }
  function pagarEnLinea() {
    if (pagando || !WOMPI.activo || !cart.length) return;
    mensajePago("");
    if (!pintarAviso(true)) { llevarAlEditor(); return; }
    var esperado = total();
    var items = cart.map(function (i) { return { id: i.id, fit: i.fit, size: i.size, color: i.color || "", qty: i.qty }; });
    pagando = true; pintarPago();
    var listo = function (texto) { pagando = false; pintarPago(); mensajePago(texto); };
    fetch(WOMPI.api + "/pagar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j || {} }; }); })
      .then(function (res) {
        var j = res.j;
        if (res.status === 200 && j.checkout && j.ref) {
          /* El precio de alguna camiseta cambió desde que se cargó la página:
             mejor avisar que mandar a pagar un total distinto al que se ve. */
          if (j.total !== esperado) {
            listo("El precio de alguna camiseta cambió mientras comprabas. Recarga la página para ver el total actualizado (" + fmt(j.total) + ").");
            return;
          }
          try { localStorage.setItem("aym-pedido", JSON.stringify({ ref: j.ref, total: j.total, creado: Date.now() })); } catch (e) {}
          location.href = j.checkout;
          return;
        }
        if (res.status === 409) {
          listo("Algo cambió en la tienda (una talla, un color o una camiseta se agotó). Recarga la página para ver lo último y vuelve a intentarlo.");
          return;
        }
        listo("No pudimos abrir el pago en línea en este momento. Inténtalo de nuevo en un rato o pide por WhatsApp con el botón de abajo.");
      })
      .catch(function () {
        listo("No pudimos conectar con el pago en línea. Revisa tu conexión e inténtalo de nuevo, o pide por WhatsApp con el botón de abajo.");
      });
  }
  /* Al volver con el botón Atrás desde Wompi, la página puede venir de la
     memoria del navegador con el botón en "Preparando…": se reinicia. */
  window.addEventListener("pageshow", function () { if (pagando) { pagando = false; pintarPago(); } });

  /* Foco al que volver cuando se cierre el carrito */
  var focoPrevio = null;

  /* Controles del cajón que se pueden enfocar, en orden */
  function focusables(d) {
    return Array.prototype.filter.call(
      d.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; }
    );
  }

  /* Mientras el carrito está abierto, Tab no se escapa a la página de detrás */
  function atrapaFoco(e) {
    if (e.key !== "Tab") return;
    var d = document.getElementById("cart-drawer");
    if (!d || !d.classList.contains("open")) return;
    var f = focusables(d);
    if (!f.length) return;
    var primero = f[0], ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  }

  function open() {
    var d = document.getElementById("cart-drawer"), s = document.getElementById("cart-scrim");
    if (!d) return;
    focoPrevio = document.activeElement;
    d.classList.add("open"); d.setAttribute("aria-hidden", "false");
    /* inert: sin esto, el cajón cerrado deja 11 botones invisibles en el
       recorrido del tabulador, fuera de la pantalla. */
    d.inert = false;
    if (s) { s.hidden = false; requestAnimationFrame(function () { s.classList.add("show"); }); }
    document.body.classList.add("cart-open");
    var cerrar = document.getElementById("cart-close");
    if (cerrar) cerrar.focus();
    document.addEventListener("keydown", atrapaFoco, true);
  }
  function close() {
    var d = document.getElementById("cart-drawer"), s = document.getElementById("cart-scrim");
    if (!d) return;
    document.removeEventListener("keydown", atrapaFoco, true);
    /* Si el foco está dentro del cajón hay que sacarlo ANTES de marcarlo inert */
    if (focoPrevio && typeof focoPrevio.focus === "function") focoPrevio.focus();
    else if (d.contains(document.activeElement)) document.activeElement.blur();
    focoPrevio = null;
    d.classList.remove("open"); d.setAttribute("aria-hidden", "true");
    d.inert = true;
    if (s) { s.classList.remove("show"); setTimeout(function () { s.hidden = true; }, 300); }
    document.body.classList.remove("cart-open");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var drawerInicial = document.getElementById("cart-drawer");
    if (drawerInicial && !drawerInicial.classList.contains("open")) drawerInicial.inert = true;
    applyFit();

    // selector de talla (delegado: funciona también con productos dinámicos)
    document.addEventListener("click", function (e) {
      var pill = e.target.closest(".product-sizes .size-pill"); if (!pill) return;
      if (pill.disabled || pill.classList.contains("is-agotada")) return;
      var grp = pill.closest(".product-sizes"); if (!grp) return;
      grp.querySelectorAll(".size-pill").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
      pill.classList.add("is-active"); pill.setAttribute("aria-pressed", "true");
    });
    // agregar al carrito (delegado; la horma es la del espacio de la camiseta,
    // y la talla y el color, los marcados en la tarjeta)
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".btn-add[data-product]"); if (!b) return;
      var art = b.closest(".product");
      var active = art ? art.querySelector(".size-pill.is-active:not(.is-agotada)") : null;
      if (!active) return;
      var sw = art ? art.querySelector(".color-swatch.is-active") : null;
      var pid = b.getAttribute("data-product");
      add(pid, fitDe(pid), active ? active.getAttribute("data-size") : "M", sw ? sw.getAttribute("data-color") : "");
    });

    var cb = document.getElementById("cart-btn"); if (cb) cb.addEventListener("click", open);
    var cc = document.getElementById("cart-close"); if (cc) cc.addEventListener("click", close);
    var cont = document.getElementById("cart-continue"); if (cont) cont.addEventListener("click", close);
    var sc = document.getElementById("cart-scrim"); if (sc) sc.addEventListener("click", close);
    var items = document.getElementById("cart-items");
    if (items) items.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]"); if (!btn) return;
      var id = btn.getAttribute("data-id"), fit = btn.getAttribute("data-fit"), size = btn.getAttribute("data-size"), color = btn.getAttribute("data-color") || "", act = btn.getAttribute("data-act"), it = find(id, fit, size, color);
      var linea = btn.getAttribute("data-line") || [id, fit, size, color].join("|");
      if (act === "inc") setQty(id, fit, size, color, (it ? it.qty : 0) + 1);
      else if (act === "dec") setQty(id, fit, size, color, (it ? it.qty : 0) - 1);
      else if (act === "rm") remove(id, fit, size, color);
      else if (act === "color-abrir") { edicion[linea] = { abierto: true }; render(); mostrarEditor(linea); }
      else if (act === "color-elegir") {
        var k = btn.getAttribute("data-key") || "";
        var ed = edicion[linea] || (edicion[linea] = {});
        ed.abierto = true; ed.ok = false;
        /* Tocar el color que ya tiene = no hay nada que confirmar */
        ed.pendiente = it && colorValido(it) && it.color === k ? "" : k;
        render();
        mostrarEditor(linea);
      }
      else if (act === "color-cancelar") { delete edicion[linea]; render(); }
      else if (act === "talla-elegir") {
        var ed2 = edicion[linea] || (edicion[linea] = {});
        ed2.talla = btn.getAttribute("data-key") || "";
        render();
        mostrarEditor(linea);
      }
      else if (act === "talla-cancelar") { if (edicion[linea]) delete edicion[linea].talla; render(); }
      else if (act === "talla-confirmar") {
        var nueva = (edicion[linea] || {}).talla;
        delete edicion[linea];
        if (nueva && tallasLibres(id).indexOf(nueva) >= 0) { cambiarTalla(id, fit, size, color, nueva); save(); }
        render();
      }
      else if (act === "color-confirmar") {
        var nuevo = (edicion[linea] || {}).pendiente;
        delete edicion[linea];
        if (nuevo) {
          var queda = cambiarColor(id, fit, size, color, nuevo);
          save();
          if (queda) {
            var ln = lineaDe(queda);
            edicion[ln] = { ok: true };
            setTimeout(function () { if (edicion[ln] && edicion[ln].ok && !edicion[ln].abierto) { delete edicion[ln]; render(); } }, 2600);
            render();
            enfocar("color-abrir", ln);
            return;
          }
        }
        render();
      }
    });
    /* No se envía a WhatsApp un pedido con colores sin elegir o sin confirmar */
    var checkout = document.getElementById("cart-checkout");
    if (checkout) checkout.addEventListener("click", function (e) {
      if (pintarAviso(true)) return;
      e.preventDefault();
      llevarAlEditor();
    });
    var pagar = document.getElementById("cart-pagar");
    if (pagar) pagar.addEventListener("click", pagarEnLinea);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    render();
    // Cargar precios editables desde el panel y refrescar
    loadConfig(function () { applyFit(); render(); });
  });

  document.addEventListener("aym:langchange", render);

  // El catálogo dinámico (shop.js) avisa cuando pintó los productos:
  // adoptamos el catálogo (incluye productos nuevos) y refrescamos precios.
  document.addEventListener("aym:productsrendered", function () {
    if (window.AYM_PRODUCTS) {
      PRODUCTS = window.AYM_PRODUCTS;
      /* Recién ahora sabemos qué existe de verdad. Se quitan del carrito las
         camisetas que las dueñas hayan borrado, renombrado o marcado Agotado:
         son las únicas que ya no se pueden pedir. Todo lo demás se conserva. */
      var antes = JSON.stringify(cart);
      /* Si algún archivo del catálogo no llegó (conexión), lo que no se ve no
         se borra: solo se quitan las agotadas y, con el catálogo completo,
         las que de verdad ya no existen. */
      var completo = window.AYM_CATALOGO_COMPLETO !== false;
      cart = cart.filter(function (i) {
        var p = PRODUCTS[i.id];
        if (!p) return !completo;
        return p.disponible !== false;
      });
      /* Las hormas ya no se eligen: cada camiseta tiene la de su espacio. Un
         carrito guardado de antes (con Oversized elegido para una camiseta que
         ahora es Regular) se corrige, y si dos líneas quedan iguales se juntan. */
      var juntas = {}, limpio2 = [];
      cart.forEach(function (i) {
        if (PRODUCTS[i.id]) i.fit = fitDe(i.id);
        var k = [i.id, i.fit, i.size, i.color || ""].join("|");
        if (juntas[k]) juntas[k].qty += i.qty;
        else { juntas[k] = i; limpio2.push(i); }
      });
      cart = limpio2;
      if (JSON.stringify(cart) !== antes) save();
    }
    applyFit();
    render();
  });
})();
