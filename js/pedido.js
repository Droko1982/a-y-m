/* =========================================================
   A&M Universe · página /pedido/ (vuelta desde Wompi)
   Wompi devuelve a la clienta a /pedido/?id=<transacción>. La referencia
   del pedido quedó guardada en el navegador al ir a pagar. Se le pregunta
   al servidor de pagos (cloudflare/pagos.js) el estado y se muestra:
   pagado (y se vacía el carrito), rechazado (el carrito sigue intacto) o
   en proceso (se vuelve a preguntar unos segundos más).
   ========================================================= */
(function () {
  "use strict";
  var WA = "573215799683";
  var cuerpo = document.getElementById("pedido-cuerpo");
  var q = new URLSearchParams(location.search);
  var idTx = q.get("id") || "";
  var guardado = null;
  try { guardado = JSON.parse(localStorage.getItem("aym-pedido") || "null"); } catch (e) { guardado = null; }
  var ref = q.get("ref") || (guardado && guardado.ref) || "";
  var api = "", intentos = 0, MAX = 20;

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function pesos(n) { return "$" + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function wa(texto) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(texto); }
  var ICONO_WA = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-2.9.8.8-2.8-.2-.3a8.2 8.2 0 1 1 6.8 3.6z"/></svg>';

  function resumen(p) {
    if (!p.items || !p.items.length) return "";
    return '<ul class="resumen">' + p.items.map(function (l) {
      return "<li><span>" + l.qty + " × " + esc(l.nombre) + " · " + esc(l.horma) + " · Talla " + esc(l.talla) + (l.color ? " · " + esc(l.color) : "") +
        "</span><span>" + pesos(l.qty * l.precio) + "</span></li>";
    }).join("") + '<li class="total"><span>Total pagado</span><span>' + pesos(p.total) + "</span></li></ul>";
  }
  function pintar(clase, html) {
    var main = document.getElementById("pedido");
    main.className = "wrap " + (clase || "");
    cuerpo.innerHTML = html;
    var h = cuerpo.querySelector("h1");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  function aprobado(p) {
    /* Pago confirmado: el carrito ya se compró */
    try { localStorage.removeItem("aym-cart"); localStorage.removeItem("aym-pedido"); } catch (e) {}
    pintar("ok",
      '<p class="icono" aria-hidden="true">🎉</p>' +
      '<h1 class="serif">¡Pago aprobado, gracias!</h1>' +
      '<p class="lead">Recibimos tu pedido. Te escribimos por WhatsApp para coordinar el envío: el envío lo pagas al recibir, según tu ciudad.</p>' +
      '<p class="ref">Pedido ' + esc(p.ref) + "</p>" +
      resumen(p) +
      '<div class="acciones">' +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(wa("¡Hola A&M Universe! 🐱 Acabo de pagar en línea el pedido " + p.ref + " por " + pesos(p.total) + ". Quedo pendiente para coordinar el envío.")) + '">' + ICONO_WA + " Escribirnos por WhatsApp</a>" +
        '<a class="btn btn-borde" href="/">Seguir viendo la tienda</a>' +
      "</div>" +
      '<p class="nota">Wompi también te envió el comprobante a tu correo.</p>');
  }
  function rechazado(p) {
    var porque = { DECLINED: "El banco o la billetera rechazó el pago.", VOIDED: "El pago fue anulado.", ERROR: "Hubo un error con el pago." }[p.estado] || "";
    pintar("mal",
      '<p class="icono" aria-hidden="true">😿</p>' +
      '<h1 class="serif">El pago no se completó</h1>' +
      '<p class="lead">' + esc(porque) + " No se te cobró nada. Tus camisetas siguen en el carrito: puedes intentarlo otra vez con otro medio de pago, o pedir por WhatsApp.</p>" +
      '<div class="acciones">' +
        '<a class="btn btn-acento" href="/#tienda">Volver a la tienda</a>' +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(wa("¡Hola A&M Universe! 🐱 Intenté pagar en línea el pedido " + p.ref + " y no se completó. ¿Me ayudan?")) + '">' + ICONO_WA + " Pedir ayuda por WhatsApp</a>" +
      "</div>");
  }
  function esperando(p) {
    pintar("",
      '<p class="icono" aria-hidden="true">⏳</p>' +
      '<h1 class="serif">Tu pago está en proceso</h1>' +
      '<p class="lead">Algunos pagos (como PSE o Nequi) tardan unos minutos en confirmarse. Apenas Wompi lo confirme te llega el comprobante a tu correo.</p>' +
      (p && p.ref ? '<p class="ref">Pedido ' + esc(p.ref) + "</p>" : "") +
      '<div class="acciones">' +
        '<button type="button" class="btn btn-acento" id="otra-vez">Revisar otra vez</button>' +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(wa("¡Hola A&M Universe! 🐱 Pagué en línea el pedido " + (p && p.ref ? p.ref : "") + " y aún aparece en proceso.")) + '">' + ICONO_WA + " Escribirnos</a>" +
      "</div>");
    var b = document.getElementById("otra-vez");
    if (b) b.addEventListener("click", function () { intentos = 0; consultar(); });
  }
  function sinPedido(texto) {
    pintar("",
      '<p class="icono" aria-hidden="true">🐾</p>' +
      '<h1 class="serif">No encontramos un pago en curso</h1>' +
      '<p class="lead">' + esc(texto || "Si acabas de pagar y ves este mensaje, escríbenos por WhatsApp y lo revisamos contigo.") + "</p>" +
      '<div class="acciones">' +
        '<a class="btn btn-acento" href="/">Ir a la tienda</a>' +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(wa("¡Hola A&M Universe! 🐱 Tengo una pregunta sobre un pago en línea" + (idTx ? " (transacción " + idTx + ")" : "") + ".")) + '">' + ICONO_WA + " WhatsApp</a>" +
      "</div>");
  }

  function consultar() {
    intentos++;
    fetch(api + "/estado?ref=" + encodeURIComponent(ref) + (idTx ? "&id=" + encodeURIComponent(idTx) : ""), { cache: "no-store" })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); })
      .then(function (res) {
        var p = res.j || {};
        if (res.status === 404) return sinPedido();
        if (res.status !== 200) throw new Error("estado " + res.status);
        if (p.estado === "APPROVED") return aprobado(p);
        if (p.estado === "DECLINED" || p.estado === "VOIDED" || p.estado === "ERROR") return rechazado(p);
        /* CREADO o PENDING: el aviso de Wompi puede tardar unos segundos */
        if (intentos < MAX) { setTimeout(consultar, 3000); return; }
        esperando(p);
      })
      .catch(function () {
        if (intentos < 4) { setTimeout(consultar, 3000); return; }
        esperando({ ref: ref });
      });
  }

  if (!/^AYM-\d{6}-[A-Z0-9]{8}$/.test(ref)) { sinPedido(); return; }
  fetch("/data/pagos.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (p) {
      api = p && typeof p.wompi_api === "string" ? p.wompi_api.trim().replace(/\/+$/, "") : "";
      if (!api) { sinPedido("El pago en línea no está activo en este momento."); return; }
      consultar();
    })
    .catch(function () { esperando({ ref: ref }); });
})();
