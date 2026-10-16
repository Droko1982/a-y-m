/* =========================================================
   A&M Universe · carrito de compras (horma + tallas + pago)
   Estado en localStorage · checkout por WhatsApp · ES/EN
   ========================================================= */
(function () {
  "use strict";

  var WA_NUMBER = "573215799683";
  /* Número o llave de cada billetera. Editables desde el panel
     (data/pagos.json); por ahora las tres usan el número de WhatsApp. */
  var PAY_KEY = { nequi: "321 579 9683", daviplata: "321 579 9683", breb: "321 579 9683" };
  /* Cuenta bancaria para transferencia. Mientras esté vacía, el carrito
     sigue diciendo que los datos se coordinan por WhatsApp. */
  var BANCO = { banco: "", tipo: "", numero: "", titular: "" };

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
  // Métodos activos (tarjeta de crédito y PSE: por ahora no)
  var PAYMENTS = ["nequi", "daviplata", "breb", "transfer", "cod"];
  // Métodos basados en número/llave (usan el mismo número de WhatsApp por ahora)
  var PHONE_PAY = { nequi: "Nequi", daviplata: "Daviplata", breb: "Bre-B" };

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
  function esc(v) { var d = document.createElement("div"); d.textContent = v == null ? "" : String(v); return d.innerHTML; }
  function limpio(v) { return typeof v === "string" && v.trim() !== "" ? v.trim() : ""; }
  /* ¿Hay datos de cuenta suficientes para mostrarlos en el carrito? */
  function hayBanco() { return BANCO.banco !== "" || BANCO.numero !== ""; }

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
  /* Datos de pago editables desde el panel (data/pagos.json).
     Cada campo vacío conserva el valor que ya estaba. */
  function applyPagos(p) {
    if (!p || typeof p !== "object") return;
    ["nequi", "daviplata", "breb"].forEach(function (k) {
      var v = limpio(p[k]);
      if (v) PAY_KEY[k] = v;
    });
    BANCO.banco = limpio(p.banco);
    BANCO.tipo = limpio(p.tipo_cuenta);
    BANCO.numero = limpio(p.numero_cuenta);
    BANCO.titular = limpio(p.titular);
  }

  function pedirJson(url) {
    try {
      return fetch(url, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }

  function loadConfig(done) {
    try {
      Promise.all([pedirJson("data/config.json"), pedirJson("data/pagos.json")])
        .then(function (r) { applyConfig(r[0]); applyPagos(r[1]); done(); })
        .catch(function () { done(); });
    } catch (e) { done(); }
  }

  /* ---------- Estado ---------- */

  var currentPay = "nequi";
  try { var sp = localStorage.getItem("aym-pay"); if (PAYMENTS.indexOf(sp) >= 0) currentPay = sp; } catch (e) {}

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
    var b = document.querySelector('.btn-add[data-product="' + id + '"]');
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

  function add(id, fit, size, color) {
    if (!PRODUCTS[id]) return;
    if (FITS.indexOf(fit) < 0) fit = "regular";
    if (SIZES.indexOf(size) < 0) size = "M";
    color = color || "";
    var it = find(id, fit, size, color); if (it) it.qty++; else cart.push({ id: id, fit: fit, size: size, color: color, qty: 1 });
    save(); render(); open();
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

  /* ---------- Pago ---------- */
  function applyPay() {
    document.querySelectorAll("#cart-pay .pay-pill").forEach(function (b) {
      var on = b.getAttribute("data-pay") === currentPay;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var info = document.getElementById("cart-pay-info");
    if (info) {
      var en = lang() === "en";
      if (PHONE_PAY[currentPay]) {
        var brand = PHONE_PAY[currentPay];
        var to = currentPay === "breb" ? (en ? "to the key" : "a la llave") : (en ? "to" : "al");
        info.innerHTML = en
          ? "Pay with " + brand + " " + to + " <strong>" + esc(PAY_KEY[currentPay]) + "</strong> and send us the receipt on WhatsApp."
          : "Paga con " + brand + " " + to + " <strong>" + esc(PAY_KEY[currentPay]) + "</strong> y envíanos el comprobante por WhatsApp.";
      } else if (currentPay === "transfer") {
        if (hayBanco()) {
          var partes = [];
          if (BANCO.banco) partes.push("<strong>" + esc(BANCO.banco) + "</strong>");
          if (BANCO.tipo) partes.push(esc(BANCO.tipo));
          if (BANCO.numero) partes.push("<strong>" + esc(BANCO.numero) + "</strong>");
          var titular = BANCO.titular
            ? (en ? " in the name of <strong>" : " a nombre de <strong>") + esc(BANCO.titular) + "</strong>"
            : "";
          info.innerHTML = (en ? "Transfer to " : "Transfiere a ") + partes.join(" · ") + titular +
            (en ? ", and send us the receipt on WhatsApp." : ", y envíanos el comprobante por WhatsApp.");
        } else {
          info.textContent = en
            ? "We'll share the bank account details on WhatsApp when we confirm your order."
            : "Te compartimos los datos de la cuenta para la transferencia por WhatsApp al confirmar tu pedido.";
        }
      } else {
        info.textContent = en
          ? "Pay in cash when your order arrives (availability by city)."
          : "Paga en efectivo cuando recibas tu pedido (según tu ciudad).";
      }
    }
    try { localStorage.setItem("aym-pay", currentPay); } catch (e) {}
  }

  function checkoutHref() {
    if (!cart.length) return "https://wa.me/" + WA_NUMBER;
    var en = lang() === "en", tl = en ? "Size" : "Talla";
    var lines = cart.map(function (i) {
      var colName = getColorName(i.id, i.color);
      return "• " + i.qty + "× " + getName(i.id) + " (" + etiquetaDe(i) + " · " + tl + " " + i.size + (colName ? " · " + colName : "") + ") — " + fmt(i.qty * price(i.id, i.fit));
    });
    var payVal;
    if (PHONE_PAY[currentPay]) payVal = PHONE_PAY[currentPay] + " (" + PAY_KEY[currentPay] + ")";
    else if (currentPay === "transfer") {
      payVal = en ? "Bank transfer" : "Transferencia bancaria";
      if (hayBanco()) {
        payVal += " (" + [BANCO.banco, BANCO.tipo, BANCO.numero].filter(Boolean).join(" ") + ")";
      }
    }
    else payVal = en ? "Cash on delivery" : "Contra entrega";
    var n = count(), msg;
    if (en) {
      msg = "Hi A&M Universe! 🐱 I'd like to place this order:\n\n" +
        lines.join("\n") + "\n\n" +
        n + (n === 1 ? " item" : " items") + " · Products total: " + fmt(total()) + "\n" +
        "Shipping: to be arranged by city\n" +
        "Payment: " + payVal + "\n\n" +
        "📦 Shipping details\n" +
        "Full name: \nPhone: \nCity & state: \nAddress: ";
    } else {
      msg = "¡Hola A&M Universe! 🐱 Quiero hacer este pedido:\n\n" +
        lines.join("\n") + "\n\n" +
        n + (n === 1 ? " prenda" : " prendas") + " · Total productos: " + fmt(total()) + "\n" +
        "Envío: a coordinar según tu ciudad\n" +
        "Pago: " + payVal + "\n\n" +
        "📦 Datos de envío\n" +
        "Nombre y apellido: \nTeléfono: \nCiudad y departamento: \nDirección: ";
    }
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  function render() {
    var badge = document.getElementById("cart-count");
    if (badge) { var c = count(); badge.textContent = c; badge.hidden = c === 0; }
    var itemsEl = document.getElementById("cart-items");
    if (!itemsEl) return;
    var emptyEl = document.getElementById("cart-empty"), footEl = document.getElementById("cart-foot");
    var en = lang() === "en", rm = en ? "Remove" : "Quitar", tl = en ? "Size" : "Talla";
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
        var p = PRODUCTS[i.id] || {}, unit = price(i.id, i.fit);
        var colName = getColorName(i.id, i.color);
        var dc = ' data-id="' + esc(i.id) + '" data-fit="' + esc(i.fit) + '" data-size="' + esc(i.size) + '" data-color="' + esc(i.color || "") + '"';
        return '<div class="cart-item">' +
          '<img src="' + esc(getColorImg(i.id, i.color)) + '" alt="" width="62" height="68">' +
          '<div class="ci-info"><span class="ci-name">' + getName(i.id) + '</span>' +
          '<span class="ci-price">' + etiquetaDe(i) + ' · ' + tl + ' ' + i.size + (colName ? ' · ' + esc(colName) : '') + ' · ' + fmt(unit) + '</span>' +
          '<div class="ci-qty">' +
            '<button type="button" data-act="dec"' + dc + ' aria-label="menos">−</button>' +
            '<span class="ci-num">' + i.qty + '</span>' +
            '<button type="button" data-act="inc"' + dc + ' aria-label="mas">+</button>' +
            '<button type="button" class="ci-remove" data-act="rm"' + dc + '>' + rm + '</button>' +
          '</div></div>' +
          '<span class="ci-line">' + fmt(i.qty * unit) + '</span>' +
        '</div>';
      }).join("");
    }
    var t = document.getElementById("cart-total"); if (t) t.textContent = fmt(total());
    var co = document.getElementById("cart-checkout"); if (co) co.setAttribute("href", checkoutHref());
    applyPay();
  }

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
      var grp = pill.closest(".product-sizes"); if (!grp) return;
      grp.querySelectorAll(".size-pill").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
      pill.classList.add("is-active"); pill.setAttribute("aria-pressed", "true");
    });
    // agregar al carrito (delegado; la horma es la del espacio de la camiseta,
    // y la talla y el color, los marcados en la tarjeta)
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".btn-add[data-product]"); if (!b) return;
      var art = b.closest(".product");
      var active = art ? art.querySelector(".size-pill.is-active") : null;
      var sw = art ? art.querySelector(".color-swatch.is-active") : null;
      var pid = b.getAttribute("data-product");
      add(pid, fitDe(pid), active ? active.getAttribute("data-size") : "M", sw ? sw.getAttribute("data-color") : "");
    });

    // selector de pago
    var payGrp = document.getElementById("cart-pay");
    if (payGrp) payGrp.addEventListener("click", function (e) {
      var btn = e.target.closest(".pay-pill"); if (!btn) return;
      var pay = btn.getAttribute("data-pay"); if (PAYMENTS.indexOf(pay) < 0) return;
      currentPay = pay; applyPay();
      var co = document.getElementById("cart-checkout"); if (co) co.setAttribute("href", checkoutHref());
    });

    var cb = document.getElementById("cart-btn"); if (cb) cb.addEventListener("click", open);
    var cc = document.getElementById("cart-close"); if (cc) cc.addEventListener("click", close);
    var cont = document.getElementById("cart-continue"); if (cont) cont.addEventListener("click", close);
    var sc = document.getElementById("cart-scrim"); if (sc) sc.addEventListener("click", close);
    var items = document.getElementById("cart-items");
    if (items) items.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]"); if (!btn) return;
      var id = btn.getAttribute("data-id"), fit = btn.getAttribute("data-fit"), size = btn.getAttribute("data-size"), color = btn.getAttribute("data-color") || "", act = btn.getAttribute("data-act"), it = find(id, fit, size, color);
      if (act === "inc") setQty(id, fit, size, color, (it ? it.qty : 0) + 1);
      else if (act === "dec") setQty(id, fit, size, color, (it ? it.qty : 0) - 1);
      else if (act === "rm") remove(id, fit, size, color);
    });
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
      cart = cart.filter(function (i) {
        var p = PRODUCTS[i.id];
        return p && p.disponible !== false;
      });
      /* Las hormas ya no se eligen: cada camiseta tiene la de su espacio. Un
         carrito guardado de antes (con Oversized elegido para una camiseta que
         ahora es Regular) se corrige, y si dos líneas quedan iguales se juntan. */
      var juntas = {}, limpio2 = [];
      cart.forEach(function (i) {
        i.fit = fitDe(i.id);
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
