/* =========================================================
   A&M Universe · redes sociales editables
   Toma data/negocio.json y pinta los íconos de Instagram,
   Facebook y TikTok en el pie de página. Además los agrega
   a los datos estructurados (sameAs), que es lo que leen
   Google y las redes para saber que son cuentas oficiales.
   Se puede escribir la dirección completa o solo el usuario
   (@aymuniverse). Si no hay ninguna red, el pie queda igual
   que hoy: no aparece nada.
   ========================================================= */
(function () {
  "use strict";

  var CAJA = "footer-social";

  /* campo del panel · nombre visible · dominio · dibujo del ícono */
  var REDES = [
    ["instagram", "Instagram", "https://instagram.com/",
      "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.9-11.1a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z"],
    ["facebook", "Facebook", "https://facebook.com/",
      "M13.5 21v-8h2.7l.4-3h-3.1V8.2c0-.9.3-1.5 1.5-1.5h1.7V4.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2V10H7.5v3h2.8v8h3.2Z"],
    ["tiktok", "TikTok", "https://tiktok.com/@",
      "M16.5 3c.3 1.9 1.4 3.1 3.3 3.3v2.4c-1.1.1-2.1-.2-3.2-.8v5.6c0 3.4-2.6 5.5-5.4 5.5-2.7 0-4.9-2-4.9-4.8 0-2.9 2.4-5 5.6-4.7v2.5c-.4-.1-.8-.1-1.2-.1-1.3 0-2.2.9-2.2 2.2s.9 2.3 2.2 2.3c1.4 0 2.4-1 2.4-2.6V3h3.4Z"]
  ];

  function esc(v) { var d = document.createElement("div"); d.textContent = v == null ? "" : String(v); return d.innerHTML; }

  /* Acepta la dirección completa (con o sin https) o solo el usuario
     (@nombre o nombre). Lo que trae una barra se toma como dirección. */
  function direccion(valor, dominio) {
    var v = typeof valor === "string" ? valor.trim() : "";
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    if (/^www\./i.test(v) || v.indexOf("/") >= 0) return "https://" + v.replace(/^\/+/, "");
    return dominio + v.replace(/^@+/, "");
  }

  function pintar(enlaces) {
    var caja = document.getElementById(CAJA);
    if (!caja) return;
    if (!enlaces.length) return; // sin redes, el pie se queda como está
    caja.innerHTML = enlaces.map(function (r) {
      return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener" ' +
        'aria-label="' + esc(r.nombre) + '" title="' + esc(r.nombre) + '">' +
        '<svg class="ci" viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">' +
        '<path d="' + r.icono + '"/></svg></a>';
    }).join("");
    caja.hidden = false;
  }

  /* Datos estructurados: sameAs le dice a los buscadores cuáles son
     las cuentas oficiales de la marca. */
  function marcarSeo(urls) {
    if (!urls.length) return;
    ["ld-store", "ld-org"].forEach(function (id) {
      var tag = document.getElementById(id);
      if (!tag) return;
      try {
        var datos = JSON.parse(tag.textContent);
        datos.sameAs = urls;
        tag.textContent = JSON.stringify(datos, null, 2);
      } catch (e) {}
    });
  }

  function load() {
    try {
      fetch("data/negocio.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || typeof data !== "object") return;
          var enlaces = [];
          REDES.forEach(function (red) {
            var url = direccion(data[red[0]], red[2]);
            if (url) enlaces.push({ url: url, nombre: red[1], icono: red[3] });
          });
          pintar(enlaces);
          marcarSeo(enlaces.map(function (r) { return r.url; }));
        })
        .catch(function () {});
    } catch (e) {}
  }

  if (document.readyState !== "loading") load();
  else document.addEventListener("DOMContentLoaded", load);
})();
