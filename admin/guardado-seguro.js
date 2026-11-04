/* =========================================================================
   A&M Universe · guardado seguro del panel
   -------------------------------------------------------------------------
   Por qué existe.

   Cada espacio de camisetas (Regular fit, Oversized, Esenciales) es UN solo
   archivo con todas sus camisetas. Al guardar, Sveltia manda el archivo
   completo tal como lo tiene en pantalla y no revisa si alguien más guardó
   ese archivo después de que se abrió el panel. Si el panel queda abierto
   (en el celular, en otra pestaña) mientras otra persona guarda, el
   siguiente guardado desde ahí borra sin aviso lo que guardó la otra.

   Pasó el 3 de noviembre de 2026: un guardado de las 17:46, hecho desde un
   panel abierto hacía días, devolvió a sus fotos viejas los colores de cinco
   camisetas que se habían cambiado a las 15:46 y a las 16:04.

   Qué hace este script:
   1. Antes de cada guardado pregunta a GitHub si alguien cambió ese archivo
      después de que se abrió el panel. Si sí, NO guarda y explica en
      español qué hacer: recargar y volver a hacer el cambio.
   2. Con el panel abierto, revisa cada minuto si llegaron cambios de otro
      lugar y muestra un aviso para recargar antes de seguir editando.
   3. Apaga los "borradores de respaldo" de Sveltia: al restaurarlos traían
      de vuelta una copia vieja de TODAS las camisetas del espacio.
   4. Confirma en español cada guardado y avisa que la tienda tarda 1 a 2
      minutos en mostrarlo (el aviso de Sveltia está en inglés).

   No cambia lo que Sveltia guarda: solo deja pasar o detiene el guardado.
   Usa la misma sesión de GitHub del panel y solo habla con GitHub. Si
   GitHub no contesta la revisión, deja guardar (es mejor que bloquear).

   Hecho y probado para Sveltia 0.203.1 (admin/index.html). Si se cambia de
   versión, hay que volver a probarlo.
   ========================================================================= */
(function () {
  "use strict";

  var CADA_MS = 60 * 1000;   // revisión de cambios nuevos con el panel abierto

  var NOMBRES = {
    "data/productos.json": "Camisetas Regular fit",
    "data/oversized.json": "Camisetas Oversized",
    "data/essentials.json": "Esenciales",
    "data/textos.json": "Textos de la página",
    "data/tallas.json": "Guía de tallas",
    "data/config.json": "Precios",
    "data/pagos.json": "Datos de pago",
    "data/impacto.json": "Contador de impacto",
    "data/negocio.json": "Datos del negocio"
  };

  /* ---------- 3. Borradores de respaldo apagados ----------
     Se hace en cada carga, antes de que Sveltia lea sus preferencias, para
     que nadie los vuelva a encender sin querer desde su menú. */
  try {
    var CLAVE = "sveltia-cms.prefs";
    var prefs = JSON.parse(localStorage.getItem(CLAVE) || "{}") || {};
    if (prefs.useDraftBackup !== false) {
      prefs.useDraftBackup = false;
      localStorage.setItem(CLAVE, JSON.stringify(prefs));
    }
  } catch (e) {}

  /* ---------- Estado (solo en memoria, se pierde al recargar) ---------- */
  var estado = {
    url: null,        // dirección de GitHub que usa el panel (…/graphql)
    vars: null,       // dueño, repositorio y rama, tal como los manda Sveltia
    auth: null,       // la sesión del panel, para preguntarle a GitHub
    base: null,       // versión que el panel cargó al abrirse
    propios: {}       // versiones guardadas desde esta misma pestaña
  };
  window.AYM_GUARDADO = estado;   // para revisarlo desde la consola si hace falta

  var fetchOriginal = window.fetch.bind(window);

  function urlDe(input) { return typeof input === "string" ? input : (input && input.url) || ""; }

  function leerCuerpo(init) {
    if (!init || typeof init.body !== "string") return null;
    try { return JSON.parse(init.body); } catch (e) { return null; }
  }

  /* La consulta con la que Sveltia pide la última versión de la rama */
  function esConsultaDeVersion(q) { return /history\(first: ?1\)\s*\{\s*nodes\s*\{\s*oid\s+message/.test(q); }

  window.fetch = function (input, init) {
    var url = urlDe(input);
    if (!/\/graphql$/.test(url) || !init || String(init.method || "GET").toUpperCase() !== "POST") {
      return fetchOriginal(input, init);
    }
    var cuerpo = leerCuerpo(init);
    var q = (cuerpo && cuerpo.query) || "";
    try {
      var h = new Headers(init.headers);
      if (h.get("Authorization")) estado.auth = h.get("Authorization");
    } catch (e) {}

    if (q.indexOf("createCommitOnBranch") >= 0) return guardar(input, init, cuerpo);

    var promesa = fetchOriginal(input, init);
    if (estado.base === null && esConsultaDeVersion(q)) {
      /* La primera vez que Sveltia pregunta la versión es al abrir el panel:
         esa es la versión que tiene cargada. Las siguientes (justo antes de
         guardar) no cuentan. */
      estado.url = url;
      estado.vars = cuerpo.variables || {};
      promesa.then(function (r) { return r.clone().json(); }).then(function (j) {
        var n = j && j.data && j.data.repository && j.data.repository.ref &&
                j.data.repository.ref.target.history.nodes[0];
        if (n && n.oid && estado.base === null) { estado.base = n.oid; arrancarRevision(); }
      }).catch(function () {});
    }
    return promesa;
  };

  /* ---------- Preguntarle a GitHub ---------- */
  function consultar(query, variables) {
    var headers = { "Content-Type": "application/json", "Accept": "application/json" };
    if (estado.auth) headers.Authorization = estado.auth;
    return fetchOriginal(estado.url, {
      method: "POST", cache: "no-store", headers: headers,
      body: JSON.stringify({ query: query, variables: variables })
    }).then(function (r) {
      if (!r.ok) throw new Error("GitHub respondió " + r.status);
      return r.json();
    }).then(function (j) {
      if (!j || j.errors || !j.data) throw new Error("GitHub respondió con errores");
      return j.data;
    });
  }

  /* Últimos cambios de cada ruta, y la fecha de la versión que se cargó */
  function historia(rutas, cuantos) {
    var partes = rutas.map(function (r, i) {
      return "r" + i + ": history(first: " + cuantos + ", path: " + JSON.stringify(r) + ") { nodes { oid committedDate } }";
    }).join(" ");
    var query = "query($owner: String!, $repo: String!, $branch: String!, $base: GitObjectID!) {" +
      " repository(owner: $owner, name: $repo) {" +
      " base: object(oid: $base) { ... on Commit { committedDate } }" +
      " ref(qualifiedName: $branch) { target { ... on Commit { " + partes + " } } } } }";
    var v = estado.vars || {};
    return consultar(query, { owner: v.owner, repo: v.repo, branch: v.branch || "main", base: estado.base });
  }

  /* El cambio más reciente que no hizo esta pestaña y es posterior a la
     versión cargada. Los cambios llegan del más nuevo al más viejo. */
  function cambioAjeno(nodos, baseFecha) {
    if (!baseFecha) return null;
    var limite = Date.parse(baseFecha);
    for (var i = 0; i < (nodos || []).length; i++) {
      var n = nodos[i];
      if (n.oid === estado.base || estado.propios[n.oid]) return null;
      return Date.parse(n.committedDate) > limite ? n : null;
    }
    return null;
  }

  function choques(rutas, cuantos) {
    return historia(rutas, cuantos).then(function (d) {
      var repo = d.repository || {};
      var fecha = repo.base && repo.base.committedDate;
      var t = (repo.ref && repo.ref.target) || {};
      var out = [];
      rutas.forEach(function (r, i) {
        var n = cambioAjeno((t["r" + i] || {}).nodes, fecha);
        if (n) out.push({ ruta: r, cuando: n.committedDate });
      });
      return out;
    });
  }

  /* ---------- 1. Revisar antes de guardar ---------- */
  function guardar(input, init, cuerpo) {
    var cambios = (cuerpo && cuerpo.variables && cuerpo.variables.input && cuerpo.variables.input.fileChanges) || {};
    var rutas = (cambios.additions || []).concat(cambios.deletions || [])
      .map(function (f) { return f && f.path; })
      .filter(function (r) { return r && /^data\/.+\.json$/.test(r); });

    var revision = (estado.base && estado.url && rutas.length)
      ? choques(rutas, 20).catch(function () { return []; })   // sin respuesta: deja guardar
      : Promise.resolve([]);

    return revision.then(function (lista) {
      if (lista.length) {
        avisoDeChoque(lista);
        return new Response(JSON.stringify({ message: mensajeCorto(lista) }), {
          status: 409, headers: { "Content-Type": "application/json" }
        });
      }
      return fetchOriginal(input, init).then(function (r) {
        r.clone().json().then(function (j) {
          var c = j && j.data && j.data.createCommitOnBranch && j.data.createCommitOnBranch.commit;
          if (c && c.oid) { estado.propios[c.oid] = true; avisoGuardado(); }
        }).catch(function () {});
        return r;
      });
    });
  }

  /* ---------- 2. Revisión periódica con el panel abierto ---------- */
  var reloj = null;
  function arrancarRevision() {
    if (reloj) return;
    reloj = setInterval(revisarAhora, CADA_MS);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") revisarAhora();
    });
  }
  function revisarAhora() {
    if (document.visibilityState !== "visible" || !estado.base || !estado.url) return;
    choques(["data"], 10).then(function (lista) {
      if (lista.length) avisoCambiosNuevos(lista[0].cuando);
    }).catch(function () {});
  }

  /* ---------- Textos y avisos (en español) ---------- */
  function hora(iso) {
    try {
      return new Date(iso).toLocaleString("es-CO", { weekday: "long", hour: "numeric", minute: "2-digit" });
    } catch (e) { return ""; }
  }
  function nombreDe(ruta) { return NOMBRES[ruta] || ruta; }
  function mensajeCorto(lista) {
    return "No se guardó: «" + lista.map(function (c) { return nombreDe(c.ruta); }).join("», «") +
      "» cambió desde otro lugar después de que abriste el panel. Recarga la página y vuelve a hacer tu cambio.";
  }

  var ESTILO =
    "#aym-guardado-fondo{position:fixed;inset:0;z-index:100000;background:rgba(20,18,12,.55);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}" +
    "#aym-guardado-caja{background:#FBF8F1;color:#2B2116;max-width:30rem;width:100%;border-radius:12px;padding:22px 22px 18px;box-shadow:0 20px 50px -20px rgba(0,0,0,.6);font:15px/1.55 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    "#aym-guardado-caja h2{font-size:18px;margin:0 0 10px;line-height:1.3}" +
    "#aym-guardado-caja p{margin:0 0 10px}#aym-guardado-caja ol{margin:0 0 14px;padding-left:20px}" +
    "#aym-guardado-caja .aym-botones{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}" +
    ".aym-boton{font:600 15px system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;border-radius:8px;padding:10px 16px;cursor:pointer;border:1px solid #5A6537}" +
    ".aym-boton-1{background:#5A6537;color:#F4EFE3}.aym-boton-2{background:transparent;color:#5A6537}" +
    "#aym-guardado-barra{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#8A5A1F;color:#FFF8EC;padding:10px 16px;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;font:14px/1.4 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;box-shadow:0 -6px 18px -10px rgba(0,0,0,.6)}" +
    "#aym-guardado-barra .aym-boton{padding:6px 12px;font-size:14px;background:#FFF8EC;color:#8A5A1F;border-color:#FFF8EC}" +
    "#aym-guardado-barra .aym-boton-2{background:transparent;color:#FFF8EC}" +
    "#aym-guardado-ok{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:100001;background:#2F3A1E;color:#F4EFE3;padding:12px 18px;border-radius:10px;font:600 15px/1.4 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;box-shadow:0 10px 30px -12px rgba(0,0,0,.6);max-width:calc(100vw - 32px);text-align:center}";
  function ponerEstilo() {
    if (document.getElementById("aym-guardado-estilo")) return;
    var s = document.createElement("style");
    s.id = "aym-guardado-estilo";
    s.textContent = ESTILO;
    document.head.appendChild(s);
  }
  function el(tag, attrs, texto) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (texto != null) e.textContent = texto;
    return e;
  }
  function recargar() { window.location.reload(); }

  function avisoDeChoque(lista) {
    ponerEstilo();
    var okViejo = document.getElementById("aym-guardado-ok");
    if (okViejo) okViejo.remove();
    var ya = document.getElementById("aym-guardado-fondo");
    if (ya) ya.remove();
    var fondo = el("div", { id: "aym-guardado-fondo" });
    var caja = el("div", { id: "aym-guardado-caja", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "aym-guardado-titulo" });
    caja.appendChild(el("h2", { id: "aym-guardado-titulo" }, "⚠️ No se guardó, para no borrar otro cambio"));
    lista.forEach(function (c) {
      caja.appendChild(el("p", {}, "«" + nombreDe(c.ruta) + "» se guardó desde otro lugar (otra persona, otra pestaña o el celular) el " +
        hora(c.cuando) + ", después de que abriste el panel. Si se guardaba esto, ese cambio se habría borrado."));
    });
    caja.appendChild(el("p", {}, "Qué hacer:"));
    var ol = el("ol");
    ["Anota lo que ibas a cambiar.", "Toca «Recargar el panel».", "Vuelve a hacer tu cambio y guarda."]
      .forEach(function (t) { ol.appendChild(el("li", {}, t)); });
    caja.appendChild(ol);
    var botones = el("div", { "class": "aym-botones" });
    var cerrar = el("button", { type: "button", "class": "aym-boton aym-boton-2" }, "Cerrar");
    var otra = el("button", { type: "button", "class": "aym-boton aym-boton-1" }, "Recargar el panel");
    cerrar.addEventListener("click", function () { fondo.remove(); });
    otra.addEventListener("click", recargar);
    botones.appendChild(cerrar); botones.appendChild(otra);
    caja.appendChild(botones);
    fondo.appendChild(caja);
    document.body.appendChild(fondo);
    otra.focus();
  }

  var cerradaHasta = 0;   // "Ahora no": no repetir el aviso por el mismo cambio
  function avisoCambiosNuevos(cuando) {
    ponerEstilo();
    if (document.getElementById("aym-guardado-barra") || Date.parse(cuando) <= cerradaHasta) return;
    var barra = el("div", { id: "aym-guardado-barra", role: "status" });
    barra.appendChild(el("span", {}, "🔄 Hay cambios nuevos guardados desde otro lugar (" + hora(cuando) +
      "). Recarga el panel antes de editar, para trabajar sobre lo último."));
    var b = el("button", { type: "button", "class": "aym-boton" }, "Recargar ahora");
    var no = el("button", { type: "button", "class": "aym-boton aym-boton-2" }, "Ahora no");
    b.addEventListener("click", recargar);
    no.addEventListener("click", function () { cerradaHasta = Date.parse(cuando); barra.remove(); });
    barra.appendChild(b); barra.appendChild(no);
    document.body.appendChild(barra);
  }

  var relojOk = null;
  function avisoGuardado() {
    ponerEstilo();
    var ya = document.getElementById("aym-guardado-ok");
    if (ya) ya.remove();
    var t = el("div", { id: "aym-guardado-ok", role: "status" },
      "✓ Guardado. La tienda se actualiza en 1 a 2 minutos.");
    document.body.appendChild(t);
    clearTimeout(relojOk);
    relojOk = setTimeout(function () { t.remove(); }, 7000);
  }
})();
