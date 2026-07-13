/* =========================================================
   A&M Universe · carrito de compras (con tallas)
   Estado en localStorage · checkout por WhatsApp · ES/EN
   ========================================================= */
(function () {
  "use strict";

  var WA_NUMBER = "573215799683";
  var PRODUCTS = {
    ocean:  { price: 65000, img: "assets/tee-ocean.svg" },
    animal: { price: 65000, img: "assets/tee-animal.svg" },
    stars:  { price: 69000, img: "assets/tee-stars.svg" },
    origen: { price: 59000, img: "assets/tee-origen.svg" }
  };
  var FALLBACK = { ocean: "Camiseta Océano", animal: "Camiseta Reino Animal", stars: "Camiseta Cielo Nocturno", origen: "Camiseta Esencia A&M" };
  var SIZES = ["S", "M", "L", "XL"];

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem("aym-cart")) || []; } catch (e) { cart = []; }
  cart = cart.filter(function (i) { return i && PRODUCTS[i.id] && i.qty > 0; })
             .map(function (i) { return { id: i.id, size: SIZES.indexOf(i.size) >= 0 ? i.size : "M", qty: i.qty }; });

  function save() { try { localStorage.setItem("aym-cart", JSON.stringify(cart)); } catch (e) {} }
  function lang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "es"; }
  function fmt(n) { return "$" + n.toLocaleString("es-CO"); }
  function getName(id) {
    var b = document.querySelector('.btn-add[data-product="' + id + '"]');
    if (b) { var art = b.closest(".product"); if (art) { var n = art.querySelector(".product-name"); if (n && n.textContent.trim()) return n.textContent.trim(); } }
    return FALLBACK[id] || id;
  }
  function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function total() { return cart.reduce(function (s, i) { return s + i.qty * PRODUCTS[i.id].price; }, 0); }
  function find(id, size) { for (var i = 0; i < cart.length; i++) if (cart[i].id === id && cart[i].size === size) return cart[i]; return null; }

  function add(id, size) {
    if (!PRODUCTS[id]) return;
    if (SIZES.indexOf(size) < 0) size = "M";
    var it = find(id, size); if (it) it.qty++; else cart.push({ id: id, size: size, qty: 1 });
    save(); render(); open();
  }
  function setQty(id, size, q) { var it = find(id, size); if (!it) return; it.qty = q; if (it.qty <= 0) cart = cart.filter(function (x) { return !(x.id === id && x.size === size); }); save(); render(); }
  function remove(id, size) { cart = cart.filter(function (x) { return !(x.id === id && x.size === size); }); save(); render(); }

  function checkoutHref() {
    if (!cart.length) return "https://wa.me/" + WA_NUMBER;
    var en = lang() === "en", tl = en ? "Size" : "Talla";
    var lines = cart.map(function (i) { return "• " + i.qty + "× " + getName(i.id) + " (" + tl + " " + i.size + ") — " + fmt(i.qty * PRODUCTS[i.id].price); });
    var msg = en
      ? "Hi A&M Universe! 🐘 I'd like to order:\n" + lines.join("\n") + "\n\nTotal: " + fmt(total()) + "\n\nName: \nCity (shipping): "
      : "¡Hola A&M Universe! 🐘 Quiero hacer este pedido:\n" + lines.join("\n") + "\n\nTotal: " + fmt(total()) + "\n\nNombre: \nCiudad de envío: ";
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
        var p = PRODUCTS[i.id];
        return '<div class="cart-item">' +
          '<img src="' + p.img + '" alt="" width="62" height="68">' +
          '<div class="ci-info"><span class="ci-name">' + getName(i.id) + '</span>' +
          '<span class="ci-price">' + tl + ' ' + i.size + ' · ' + fmt(p.price) + '</span>' +
          '<div class="ci-qty">' +
            '<button type="button" data-act="dec" data-id="' + i.id + '" data-size="' + i.size + '" aria-label="menos">−</button>' +
            '<span class="ci-num">' + i.qty + '</span>' +
            '<button type="button" data-act="inc" data-id="' + i.id + '" data-size="' + i.size + '" aria-label="mas">+</button>' +
            '<button type="button" class="ci-remove" data-act="rm" data-id="' + i.id + '" data-size="' + i.size + '">' + rm + '</button>' +
          '</div></div>' +
          '<span class="ci-line">' + fmt(i.qty * p.price) + '</span>' +
        '</div>';
      }).join("");
    }
    var t = document.getElementById("cart-total"); if (t) t.textContent = fmt(total());
    var co = document.getElementById("cart-checkout"); if (co) co.setAttribute("href", checkoutHref());
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
    // selector de talla
    document.querySelectorAll(".product-sizes").forEach(function (grp) {
      grp.addEventListener("click", function (e) {
        var pill = e.target.closest(".size-pill"); if (!pill) return;
        grp.querySelectorAll(".size-pill").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
        pill.classList.add("is-active"); pill.setAttribute("aria-pressed", "true");
      });
    });
    // agregar
    document.querySelectorAll(".btn-add").forEach(function (b) {
      b.addEventListener("click", function () {
        var art = b.closest(".product");
        var active = art ? art.querySelector(".size-pill.is-active") : null;
        add(b.getAttribute("data-product"), active ? active.getAttribute("data-size") : "M");
      });
    });
    var cb = document.getElementById("cart-btn"); if (cb) cb.addEventListener("click", open);
    var cc = document.getElementById("cart-close"); if (cc) cc.addEventListener("click", close);
    var cont = document.getElementById("cart-continue"); if (cont) cont.addEventListener("click", close);
    var sc = document.getElementById("cart-scrim"); if (sc) sc.addEventListener("click", close);
    var items = document.getElementById("cart-items");
    if (items) items.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]"); if (!btn) return;
      var id = btn.getAttribute("data-id"), size = btn.getAttribute("data-size"), act = btn.getAttribute("data-act"), it = find(id, size);
      if (act === "inc") setQty(id, size, (it ? it.qty : 0) + 1);
      else if (act === "dec") setQty(id, size, (it ? it.qty : 0) - 1);
      else if (act === "rm") remove(id, size);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    render();
  });

  document.addEventListener("aym:langchange", render);
})();
