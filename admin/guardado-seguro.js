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
   1. Antes de cada guardado compara el archivo que hay en GitHub con la
      versión de la que partió este panel. Si alguien más lo cambió, COMBINA
      los dos cambios (camiseta por camiseta y campo por campo) y guarda el
      resultado: no se pierde lo de nadie y nadie tiene que repetir nada. Si
      las dos tocaron el mismo dato, queda el de este guardado. Solo si la
      combinación falla se detiene el guardado y se explica qué hacer.
      (Hasta el 10-11-2026 se detenía siempre; las dueñas lo vivían como "no
      se guarda", porque suelen editar las dos a la vez.)
   2. Con el panel abierto, revisa cada minuto si llegaron cambios de otro
      lugar y avisa, para recargar y verlos.
   3. Apaga los "borradores de respaldo" de Sveltia: al restaurarlos traían
      de vuelta una copia vieja de TODAS las camisetas del espacio.
   4. Confirma en español cada guardado y avisa que la tienda tarda 1 a 2
      minutos en mostrarlo (el aviso de Sveltia está en inglés).

   Solo cambia lo que Sveltia guarda cuando hay que combinar. Usa la misma
   sesión de GitHub del panel y solo habla con GitHub. Si GitHub no contesta
   la revisión, deja guardar como antes (es mejor que bloquear el panel).

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
    propios: {},      // versiones guardadas desde esta misma pestaña
    baseTexto: {}     // por archivo: lo que el panel tiene en memoria tras su último guardado
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

  /* ---------- 1. Al guardar: combinar en vez de pisar ----------
     Para cada archivo de datos que se guarda se compara la versión que hay
     ahora en GitHub con la versión de la que partió este panel. Si son
     iguales, nadie más lo tocó y se guarda tal cual. Si no, se combinan las
     dos y se guarda la combinación. */
  function deBase64(b64) {
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }
  function aBase64(texto) {
    var bytes = new TextEncoder().encode(texto), bin = "";
    for (var i = 0; i < bytes.length; i += 32768) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
    return btoa(bin);
  }
  function igual(x, y) { return JSON.stringify(x) === JSON.stringify(y); }
  function esObjeto(v) { return !!v && typeof v === "object" && !Array.isArray(v); }

  /* Listas cuyos elementos tienen id (las camisetas): se combinan elemento
     por elemento. Un id repetido ("----") se distingue por su orden. */
  function conIds(lista) {
    return Array.isArray(lista) && lista.every(function (x) { return esObjeto(x) && x.id != null && String(x.id) !== ""; });
  }
  function indexar(lista) {
    var m = {}, orden = [], veces = {};
    lista.forEach(function (x) {
      var id = String(x.id), k = id + "#" + (veces[id] = (veces[id] || 0) + 1);
      m[k] = x; orden.push(k);
    });
    return { m: m, orden: orden };
  }
  function fusionarLista(b, r, l) {
    var B = indexar(b), R = indexar(r), L = indexar(l), out = [], claves = [];
    L.orden.forEach(function (k) {
      if (!(k in B.m)) { out.push(L.m[k]); claves.push(k); return; }   // agregada aquí
      if (!(k in R.m)) {                                                // la borraron allá:
        if (igual(L.m[k], B.m[k])) return;                              //   aquí no se tocó, se borra
        out.push(L.m[k]); claves.push(k); return;                       //   aquí se editó, se conserva
      }
      out.push(fusionar(B.m[k], R.m[k], L.m[k])); claves.push(k);
    });
    /* Lo que agregaron allá (o editaron allá y se borró aquí) entra en el
       mismo lugar donde lo pusieron */
    R.orden.forEach(function (k, i) {
      if (k in L.m) return;
      if (k in B.m && igual(R.m[k], B.m[k])) return;                    // borrada aquí, allá sin cambios
      var j = i - 1;
      while (j >= 0 && claves.indexOf(R.orden[j]) < 0) j--;
      var pos = j < 0 ? 0 : claves.indexOf(R.orden[j]) + 1;
      out.splice(pos, 0, R.m[k]); claves.splice(pos, 0, k);
    });
    return out;
  }
  /* Combinación de tres versiones: b = de la que partió este panel,
     r = la que hay ahora en GitHub, l = la que este panel quiere guardar */
  function fusionar(b, r, l) {
    if (igual(l, b)) return r;                    // aquí no cambió: queda lo de allá
    if (igual(r, b) || igual(r, l)) return l;     // allá no cambió: queda lo de aquí
    if (esObjeto(b) && esObjeto(r) && esObjeto(l)) {
      var out = {};
      Object.keys(l).concat(Object.keys(r).filter(function (k) { return !(k in l); })).forEach(function (k) {
        if (!(k in l) && (k in b) && igual(r[k], b[k])) return;   // se quitó aquí
        if (!(k in r) && (k in b) && igual(l[k], b[k])) return;   // se quitó allá
        var v = fusionar(b[k], r[k], l[k]);
        if (v !== undefined) out[k] = v;
      });
      return out;
    }
    if (conIds(b) && conIds(r) && conIds(l)) return fusionarLista(b, r, l);
    return l;                                     // las dos cambiaron el mismo dato: queda lo de aquí
  }

  /* El archivo en la versión que cargó el panel y como está ahora en GitHub */
  function versiones(rutas) {
    var v = estado.vars || {}, rama = v.branch || "main";
    var partes = rutas.map(function (r, i) {
      return "b" + i + ": object(expression: " + JSON.stringify(estado.base + ":" + r) + ") { ... on Blob { text isTruncated } } " +
             "r" + i + ": object(expression: " + JSON.stringify(rama + ":" + r) + ") { ... on Blob { text isTruncated } }";
    }).join(" ");
    var query = "query($owner: String!, $repo: String!, $branch: String!) {" +
      " repository(owner: $owner, name: $repo) {" +
      " ref(qualifiedName: $branch) { target { oid ... on Commit { committedDate } } } " + partes + " } }";
    return consultar(query, { owner: v.owner, repo: v.repo, branch: rama }).then(function (d) {
      var repo = d.repository || {};
      var texto = function (o) { if (!o) return null; if (o.isTruncated) throw new Error("archivo muy grande"); return o.text; };
      return {
        cabeza: repo.ref && repo.ref.target && repo.ref.target.oid,
        fecha: repo.ref && repo.ref.target && repo.ref.target.committedDate,
        base: rutas.map(function (r, i) { return texto(repo["b" + i]); }),
        remoto: rutas.map(function (r, i) { return texto(repo["r" + i]); })
      };
    });
  }

  function guardar(input, init, cuerpo) {
    var entrada = (cuerpo && cuerpo.variables && cuerpo.variables.input) || {};
    var adds = ((entrada.fileChanges || {}).additions || [])
      .filter(function (f) { return f && /^data\/.+\.json$/.test(f.path) && typeof f.contents === "string"; });
    if (!estado.base || !estado.url || !adds.length) return enviar(input, init, false, {});

    return versiones(adds.map(function (f) { return f.path; })).then(function (v) {
      var combinadas = [], partida = {};
      try {
        adds.forEach(function (f, i) {
          var local = deBase64(f.contents);
          var base = Object.prototype.hasOwnProperty.call(estado.baseTexto, f.path) ? estado.baseTexto[f.path] : v.base[i];
          var remoto = v.remoto[i];
          partida[f.path] = local;
          if (remoto === base || remoto === local) return;               // nadie más lo tocó
          if (remoto == null || base == null) throw new Error("sin versión para combinar");
          var mezcla = fusionar(JSON.parse(base), JSON.parse(remoto), JSON.parse(local));
          f.contents = aBase64(JSON.stringify(mezcla, null, 2) + "\n");
          combinadas.push({ ruta: f.path, cuando: v.fecha });
        });
      } catch (e) {
        /* No se pudo combinar: se detiene para no borrar lo de nadie */
        var lista = adds.map(function (f) { return { ruta: f.path, cuando: v.fecha }; });
        avisoDeChoque(lista);
        return new Response(JSON.stringify({ message: mensajeCorto(lista) }), {
          status: 409, headers: { "Content-Type": "application/json" }
        });
      }
      if (!combinadas.length) return enviar(input, init, false, partida);
      /* Se guarda sobre la versión que se acaba de leer: si alguien guarda
         justo en este instante, GitHub lo rechaza en vez de pisarlo. */
      if (v.cabeza) entrada.expectedHeadOid = v.cabeza;
      var init2 = {};
      Object.keys(init).forEach(function (k) { init2[k] = init[k]; });
      init2.body = JSON.stringify(cuerpo);
      return enviar(input, init2, true, partida);
    }, function () {
      return enviar(input, init, false, {});   // GitHub no respondió: se guarda como antes
    });
  }

  function enviar(input, init, combinado, partida) {
    return fetchOriginal(input, init).then(function (r) {
      r.clone().json().then(function (j) {
        var c = j && j.data && j.data.createCommitOnBranch && j.data.createCommitOnBranch.commit;
        if (c && c.oid) {
          estado.propios[c.oid] = true;
          /* Lo que este panel tiene ahora en memoria: el punto de partida
             para combinar en el próximo guardado */
          Object.keys(partida).forEach(function (p) { estado.baseTexto[p] = partida[p]; });
          avisoGuardado(combinado);
        }
      }).catch(function () {});
      return r;
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
      caja.appendChild(el("p", {}, "«" + nombreDe(c.ruta) + "» se guardó desde otro lugar (otra persona, otra pestaña o el celular)" +
        (c.cuando ? " el " + hora(c.cuando) : "") + ", después de que abriste el panel, y no se pudo combinar con tu cambio. Si se guardaba esto, ese cambio se habría borrado."));
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
      "). Puedes seguir: al guardar se suman a los tuyos. Recarga el panel para verlos aquí."));
    var b = el("button", { type: "button", "class": "aym-boton" }, "Recargar ahora");
    var no = el("button", { type: "button", "class": "aym-boton aym-boton-2" }, "Ahora no");
    b.addEventListener("click", recargar);
    no.addEventListener("click", function () { cerradaHasta = Date.parse(cuando); barra.remove(); });
    barra.appendChild(b); barra.appendChild(no);
    document.body.appendChild(barra);
  }

  var relojOk = null;
  function avisoGuardado(combinado) {
    ponerEstilo();
    var ya = document.getElementById("aym-guardado-ok");
    if (ya) ya.remove();
    var t = el("div", { id: "aym-guardado-ok", role: "status" }, combinado
      ? "✓ Guardado y sumado a lo que guardaron desde otro lugar. La tienda se actualiza en 1 a 2 minutos. Recarga el panel para ver todo."
      : "✓ Guardado. La tienda se actualiza en 1 a 2 minutos.");
    document.body.appendChild(t);
    clearTimeout(relojOk);
    relojOk = setTimeout(function () { t.remove(); }, combinado ? 12000 : 7000);
  }
})();
