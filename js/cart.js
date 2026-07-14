/* =========================================================
   A&M Universe · carrito de compras (horma + tallas + pago)
   Estado en localStorage · checkout por WhatsApp · ES/EN
   ========================================================= */
(function () {
  "use strict";

  var WA_NUMBER = "573215799683";
  var NEQUI_DISPLAY = "321 579 9683"; // mismo número de WhatsApp para Nequi

  // Precio por horma (aplica a todos los diseños)
  var FIT_PRICES = { regular: 69000, oversized: 79000 };
  var FITS = ["regular", "oversized"];
  var FIT_LABEL = { regular: "Regular fit", oversized: "Oversized" };

  var PRODUCTS = {
    ocean:  { img: "assets/tee-ocean.svg" },
    animal: { img: "assets/tee-animal.svg" },
    stars:  { img: "assets/tee-stars.svg" },
    origen: { img: "assets/tee-origen.svg" }
  };
  var FALLBACK = { ocean: "Camiseta Océano", animal: "Camiseta Reino Animal", stars: "Camiseta Cielo Nocturno", origen: "Camiseta Esencia A&M" };
  var SIZES = ["S", "M", "L", "XL"];
  var PAYMENTS = ["nequi", "cod"];

  function price(fit) { return FIT_PRICES[fit] || FIT_PRICES.regular; }

  /* ---------- Estado ---------- */
  var currentFit = "regular";
  try { var sf = localStorage.getItem("aym-fit"); if (FITS.indexOf(sf) >= 0) currentFit = sf; } catch (e) {}

  var currentPay = "nequi";
  try { var sp = localStorage.getItem("aym-pay"); if (PAYMENTS.indexOf(sp) >= 0) currentPay = sp; } catch (e) {}

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem("aym-cart")) || []; } catch (e) { cart = []; }
  cart = cart.filter(function (i) { return i && PRODUCTS[i.id] && i.qty > 0; })
             .map(function (i) {
               return {
                 id: i.id,
                 fit: FITS.indexOf(i.fit) >= 0 ? i.fit : "regular",
                 size: SIZES.indexOf(i.size) >= 0 ? i.size : "M",
                 qty: i.qty
               };
             });

  function save() { try { localStorage.setItem("aym-cart", JSON.stringify(cart)); } catch (e) {} }
  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "es"; }
  function fmt(n) { return "$" + n.toLocaleString("es-CO"); }
  function getName(id) {
    var b = document.querySelector('.btn-add[data-product="' + id + '"]');
    if (b) { var art = b.closest(".product"); if (art) { var n = art.querySelector(".product-name"); if (n && n.textContent.trim()) return n.textContent.trim(); } }
    return FALLBACK[id] || id;
  }
  function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function total() { return cart.reduce(function (s, i) { return s + i.qty * price(i.fit); }, 0); }
  function find(id, fit, size) { for (var i = 0; i < cart.length; i++) if (cart[i].id === id && cart[i].fit === fit && cart[i].size === size) return cart[i]; return null; }

  function add(id, fit, size) {
    if (!PRODUCTS[id]) return;
    if (FITS.indexOf(fit) < 0) fit = "regular";
    if (SIZES.indexOf(size) < 0) size = "M";
    var it = find(id, fit, size); if (it) it.qty++; else cart.push({ id: id, fit: fit, size: size, qty: 1 });
    save(); render(); open();
  }
  function setQty(id, fit, size, q) {
    var it = find(id, fit, size); if (!it) return;
    it.qty = q;
    if (it.qty <= 0) cart = cart.filter(function (x) { return !(x.id === id && x.fit === fit && x.size === size); });
    save(); render();
  }
  function remove(id, fit, size) { cart = cart.filter(function (x) { return !(x.id === id && x.fit === fit && x.size === size); }); save(); render(); }

  /* ---------- Horma ---------- */
  function applyFit() {
    document.querySelectorAll("#fit-toggle .fit-btn").forEach(function (b) {
      var on = b.getAttribute("data-fit") === currentFit;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var txt = fmt(price(currentFit));
    document.querySelectorAll(".product-price").forEach(function (el) { el.textContent = txt; });
    try { localStorage.setItem("aym-fit", currentFit); } catch (e) {}
  }

  /* ---------- Pago ---------- */
  function payLabel(pay) {
    var en = lang() === "en";
    if (pay === "cod") return en ? "Cash on delivery" : "Contra entrega";
    return "Nequi";
  }
  function applyPay() {
    document.querySelectorAll("#cart-pay .pay-pill").forEach(function (b) {
      var on = b.getAttribute("data-pay") === currentPay;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var info = document.getElementById("cart-pay-info");
    if (info) {
      var en = lang() === "en";
      if (currentPay === "nequi") {
        info.innerHTML = en
          ? "Pay by Nequi to <strong>" + NEQUI_DISPLAY + "</strong> and send us the receipt on WhatsApp."
          : "Paga con Nequi al <strong>" + NEQUI_DISPLAY + "</strong> y envíanos el comprobante por WhatsApp.";
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
      return "• " + i.qty + "× " + getName(i.id) + " (" + FIT_LABEL[i.fit] + " · " + tl + " " + i.size + ") — " + fmt(i.qty * price(i.fit));
    });
    var payLine = currentPay === "nequi"
      ? (en ? "Payment: Nequi (" + NEQUI_DISPLAY + ")" : "Pago: Nequi (" + NEQUI_DISPLAY + ")")
      : (en ? "Payment: Cash on delivery" : "Pago: Contra entrega");
    var msg = en
      ? "Hi A&M Universe! 🐘 I'd like to order:\n" + lines.join("\n") + "\n\nTotal: " + fmt(total()) + "\n" + payLine + "\n\nName: \nCity (shipping): "
      : "¡Hola A&M Universe! 🐘 Quiero hacer este pedido:\n" + lines.join("\n") + "\n\nTotal: " + fmt(total()) + "\n" + payLine + "\n\nNombre: \nCiudad de envío: ";
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
        var p = PRODUCTS[i.id], unit = price(i.fit);
        return '<div class="cart-item">' +
          '<img src="' + p.img + '" alt="" width="62" height="68">' +
          '<div class="ci-info"><span class="ci-name">' + getName(i.id) + '</span>' +
          '<span class="ci-price">' + FIT_LABEL[i.fit] + ' · ' + tl + ' ' + i.size + ' · ' + fmt(unit) + '</span>' +
          '<div class="ci-qty">' +
            '<button type="button" data-act="dec" data-id="' + i.id + '" data-fit="' + i.fit + '" data-size="' + i.size + '" aria-label="menos">−</button>' +
            '<span class="ci-num">' + i.qty + '</span>' +
            '<button type="button" data-act="inc" data-id="' + i.id + '" data-fit="' + i.fit + '" data-size="' + i.size + '" aria-label="mas">+</button>' +
            '<button type="button" class="ci-remove" data-act="rm" data-id="' + i.id + '" data-fit="' + i.fit + '" data-size="' + i.size + '">' + rm + '</button>' +
          '</div></div>' +
          '<span class="ci-line">' + fmt(i.qty * unit) + '</span>' +
        '</div>';
      }).join("");
    }
    var t = document.getElementById("cart-total"); if (t) t.textContent = fmt(total());
    var co = document.getElementById("cart-checkout"); if (co) co.setAttribute("href", checkoutHref());
    applyPay();
  }

  function open() {
    var d = document.getElementById("cart-drawer"), s = document.getElementById("cart-scrim");
    if (!d) return;
    d.classList.add("open"); d.setAttribute("aria-hidden", "false");
    if (s) { s.hidden = false; requestAnimationFrame(function () { s.classList.add("show"); }); }
    document.body.classList.add("cart-open");
  }
  function close() {
    var d = document.getElementById("cart-drawer"), s = document.getElementById("cart-scrim");
    if (!d) return;
    d.classList.remove("open"); d.setAttribute("aria-hidden", "true");
    if (s) { s.classList.remove("show"); setTimeout(function () { s.hidden = true; }, 300); }
    document.body.classList.remove("cart-open");
  }

  document.addEventListener("DOMContentLoaded", function () {
    // selector de horma (global)
    var fitToggle = document.getElementById("fit-toggle");
    if (fitToggle) fitToggle.addEventListener("click", function (e) {
      var btn = e.target.closest(".fit-btn"); if (!btn) return;
      var fit = btn.getAttribute("data-fit"); if (FITS.indexOf(fit) < 0) return;
      currentFit = fit; applyFit();
    });
    applyFit();

    // selector de talla
    document.querySelectorAll(".product-sizes").forEach(function (grp) {
      grp.addEventListener("click", function (e) {
        var pill = e.target.closest(".size-pill"); if (!pill) return;
        grp.querySelectorAll(".size-pill").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
        pill.classList.add("is-active"); pill.setAttribute("aria-pressed", "true");
      });
    });
    // agregar (usa la horma activa)
    document.querySelectorAll(".btn-add").forEach(function (b) {
      b.addEventListener("click", function () {
        var art = b.closest(".product");
        var active = art ? art.querySelector(".size-pill.is-active") : null;
        add(b.getAttribute("data-product"), currentFit, active ? active.getAttribute("data-size") : "M");
      });
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
      var id = btn.getAttribute("data-id"), fit = btn.getAttribute("data-fit"), size = btn.getAttribute("data-size"), act = btn.getAttribute("data-act"), it = find(id, fit, size);
      if (act === "inc") setQty(id, fit, size, (it ? it.qty : 0) + 1);
      else if (act === "dec") setQty(id, fit, size, (it ? it.qty : 0) - 1);
      else if (act === "rm") remove(id, fit, size);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    render();
  });

  document.addEventListener("aym:langchange", render);
})();
