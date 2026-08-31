/* =========================================================
   A&M Universe · datos legales editables
   Toma data/negocio.json y rellena los campos [entre corchetes]
   de politicas.html (razón social, NIT o cédula, tiempo de envío
   y días para cambios).
   Cuando los cuatro datos están completos, el aviso de
   "Plantilla base" desaparece solo.
   Si un campo queda vacío, se conserva el corchete como recordatorio.
   ========================================================= */
(function () {
  "use strict";

  /* id del hueco en la página  →  campo del panel */
  var CAMPOS = [
    ["dato-razon", "razon_social"],
    ["dato-nit", "identificacion"],
    ["dato-envio", "dias_envio"],
    ["dato-cambio", "dias_cambio"]
  ];

  function texto(data, campo) {
    var v = data[campo];
    return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  }

  function apply(data) {
    var completos = 0;
    CAMPOS.forEach(function (par) {
      var el = document.getElementById(par[0]);
      var v = texto(data, par[1]);
      if (!el || v == null) return;
      el.textContent = v;
      el.classList.remove("ph"); // ya no es un hueco por llenar
      completos++;
    });

    var fecha = texto(data, "actualizado");
    if (fecha != null) {
      document.querySelectorAll(".js-fecha").forEach(function (el) { el.textContent = fecha; });
    }

    /* El aviso de plantilla solo se retira cuando no queda ningún corchete */
    if (completos === CAMPOS.length) {
      var aviso = document.getElementById("aviso-plantilla");
      if (aviso) aviso.hidden = true;
    }
  }

  function load() {
    try {
      fetch("data/negocio.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) { if (data && typeof data === "object") apply(data); })
        .catch(function () {});
    } catch (e) {}
  }

  if (document.readyState !== "loading") load();
  else document.addEventListener("DOMContentLoaded", load);
})();
