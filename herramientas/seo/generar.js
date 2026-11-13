#!/usr/bin/env node
/* =========================================================
   A&M Universe · generador de páginas para buscadores
   ---------------------------------------------------------
   Lo ejecuta GitHub (.github/workflows/publicar.yml) cada vez
   que alguien publica, incluidos los guardados del panel. NO
   hace commits: arma una copia del sitio en _site/ y a esa
   copia le agrega:

     · una página real por camiseta    /camisetas/<nombre>/
     · páginas de colección            /coleccion/oceano/ …
     · catálogo, nosotros, preguntas, guía de tallas, cómo comprar
     · sitemap.xml con fotos, feed de Google Merchant,
       llms.txt / llms-full.txt (asistentes de IA)
     · en index.html: tarjetas estáticas (para robots que no
       ejecutan JavaScript) y datos estructurados al día

   Todo sale de data/*.json, así que lo que las dueñas cambian
   en el panel llega solo a Google, Bing y ChatGPT.

   Regla de oro: un dato raro del panel NUNCA puede impedir que
   la tienda se publique. Cada parte va protegida; si algo falla
   se avisa y se publica el sitio igual.

   USO
     node herramientas/seo/generar.js --salida=_site
          [--previo=estado-anterior.json] [--indexnow=indexnow.json]
   Para revisar en local:
     node herramientas/seo/generar.js --salida=../_site-prueba
   ========================================================= */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const RAIZ = path.resolve(__dirname, "..", "..");

function arg(nombre, defecto) {
  const m = process.argv.slice(2).find((a) => a.startsWith("--" + nombre + "="));
  return m ? m.slice(nombre.length + 3) : defecto;
}
const SALIDA = path.resolve(RAIZ, arg("salida", "_site"));
const PREVIO = arg("previo", "");
const INDEXNOW = arg("indexnow", "");

const avisos = [];
function avisar(msg, e) {
  const txt = msg + (e ? ": " + (e && e.message ? e.message : e) : "");
  avisos.push(txt);
  // En GitHub Actions sale como aviso amarillo en el resumen
  console.log((process.env.GITHUB_ACTIONS ? "::warning::" : "⚠ ") + txt);
}
function seguro(nombre, fn, defecto) {
  try { return fn(); } catch (e) { avisar(nombre, e); return defecto; }
}

/* =========================================================
   1. Copia del sitio (sin lo interno)
   ========================================================= */
const NO_PUBLICAR_DIR = new Set([".git", ".github", ".claude", ".vscode", "node_modules", "herramientas", "cloudflare", "_site"]);
const NO_PUBLICAR_ARCHIVO = new Set(["wrangler.toml", "captura-fallback.png", "package.json", "package-lock.json", ".gitignore", ".gitattributes"]);

function copiar(origen, destino, nivel) {
  fs.mkdirSync(destino, { recursive: true });
  for (const ent of fs.readdirSync(origen, { withFileTypes: true })) {
    const o = path.join(origen, ent.name), d = path.join(destino, ent.name);
    if (path.resolve(o) === SALIDA) continue;
    if (ent.isDirectory()) {
      if (nivel === 0 && NO_PUBLICAR_DIR.has(ent.name)) continue;
      copiar(o, d, nivel + 1);
    } else if (ent.isFile()) {
      if (nivel === 0 && (NO_PUBLICAR_ARCHIVO.has(ent.name) || /\.md$/i.test(ent.name))) continue;
      fs.copyFileSync(o, d);
    }
  }
}

/* =========================================================
   2. Utilidades
   ========================================================= */
function leerJSON(rel) {
  try { return JSON.parse(fs.readFileSync(path.join(RAIZ, rel), "utf8")); }
  catch (e) { avisar("No pude leer " + rel, e); return null; }
}
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
/* Texto del panel: vacío o solo guiones ("--") = no hay texto */
function limpio(v) {
  const s = typeof v === "string" ? v.trim() : (typeof v === "number" ? String(v) : "");
  return /^[\s\-–—_.·]*$/.test(s) ? "" : s;
}
/* Texto del panel con formato mínimo permitido (cursiva/negrita) */
function rico(v) {
  return esc(limpio(v)).replace(/&lt;(\/?)(em|strong|b|i)&gt;/gi, "<$1$2>").replace(/&lt;br\s*\/?&gt;/gi, "<br>");
}
/* Texto plano (para meta, JSON-LD, feed) */
function plano(v) {
  return limpio(v).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
function recortar(s, n) {
  s = plano(s);
  if (s.length <= n) return s;
  const corte = s.slice(0, n - 1);
  const i = corte.lastIndexOf(" ");
  return (i > n * 0.6 ? corte.slice(0, i) : corte).replace(/[\s,;:.]+$/, "") + "…";
}
function slug(t) {
  return String(t == null ? "" : t).normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function numPrecio(v) {
  const n = typeof v === "number" ? Math.round(v) : parseInt(String(v == null ? "" : v).replace(/[^\d]/g, ""), 10);
  return isFinite(n) && n >= 1000 ? n : 0;
}
function pesos(n) { return "$" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function ruta(v) { return String(v == null ? "" : v).trim().replace(/^\/+/, ""); }
function existe(rel) { try { return fs.statSync(path.join(RAIZ, rel)).isFile(); } catch (e) { return false; } }
function hoy() { return new Date().toISOString().slice(0, 10); }

/* =========================================================
   3. Datos base (dirección, WhatsApp, correo, textos)
   ========================================================= */
const INDEX_SRC = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
const SITIO = (INDEX_SRC.match(/<link rel="canonical" href="([^"]+)"/i) || [, "https://aymuniverse.com/"])[1].replace(/\/+$/, "");
const HOST = SITIO.replace(/^https?:\/\//, "");
const WA = (INDEX_SRC.match(/wa\.me\/(\d{8,15})/) || [, "573215799683"])[1];
const WA_VISIBLE = WA.replace(/^57/, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
const CORREO = (INDEX_SRC.match(/mailto:([^"?]+)/) || [, ""])[1];
const MARCA = "A&M Universe";
const LUGAR = "Calarcá, Quindío";

const CONFIG = leerJSON("data/config.json") || {};
const TEXTOS = leerJSON("data/textos.json") || {};
const NEGOCIO = leerJSON("data/negocio.json") || {};
const PAGOS = leerJSON("data/pagos.json") || {};
const TALLAS = leerJSON("data/tallas.json") || {};
function T(grupo, campo) { return limpio((TEXTOS[grupo] || {})[campo]); }

const abs = (rel) => SITIO + "/" + encodeURI(ruta(rel)).replace(/'/g, "%27");

/* Redes (misma lógica que js/redes.js) */
const REDES = seguro("Redes sociales", () => {
  const defs = [["instagram", "Instagram", "https://www.instagram.com/"], ["facebook", "Facebook", "https://www.facebook.com/"], ["tiktok", "TikTok", "https://www.tiktok.com/@"]];
  const out = [];
  for (const [k, nombre, dominio] of defs) {
    let v = limpio(NEGOCIO[k]);
    if (!v) continue;
    if (/^https?:\/\//i.test(v)) out.push({ nombre, url: v });
    else if (/^www\./i.test(v) || v.indexOf("/") >= 0) out.push({ nombre, url: "https://" + v.replace(/^\/+/, "") });
    else out.push({ nombre, url: dominio + v.replace(/^@+/, "") });
  }
  return out;
}, []);

/* =========================================================
   4. Catálogo (misma lógica de IDs que js/shop.js)
   ========================================================= */
const ARCHIVOS = [
  { archivo: "data/productos.json", espacio: "regular", fit: "regular" },
  { archivo: "data/oversized.json", espacio: "oversized", fit: "oversized" },
  { archivo: "data/essentials.json", espacio: "esenciales", fit: "regular" }
];
const COLECCIONES = {
  oceano: { nombre: "Océano", ruta: "/coleccion/oceano/", tema: "animales marinos y el océano", hash: "oceano" },
  felina: { nombre: "Felina", ruta: "/coleccion/felina/", tema: "gatos y grandes felinos", hash: "felina" }
};
function idUnico(p, espacio, usados) {
  const id = String(p.id == null ? "" : p.id).trim();
  if (id && !usados[id]) return id;
  let base = [id, espacio, slug(p.nombre_es) || "camiseta"].filter(Boolean).join("~"), c = base;
  for (let n = 2; usados[c]; n++) c = base + "~" + n;
  return c;
}
function precioDe(p, espacio, fit) {
  const propio = numPrecio(p.precio);
  if (propio > 0) return propio;
  if (espacio === "esenciales" && numPrecio(CONFIG.precio_esenciales) > 0) return numPrecio(CONFIG.precio_esenciales);
  if (fit === "oversized") return numPrecio(CONFIG.precio_oversized) || 79000;
  return numPrecio(CONFIG.precio_regular) || 69000;
}
function fotosLista(imagen, galeria) {
  const lista = [ruta(imagen)].concat(Array.isArray(galeria) ? galeria.map(ruta) : []);
  return [...new Set(lista.filter((f) => f && existe(f)))];
}

const CATALOGO = seguro("Catálogo", () => {
  const usados = {}, todos = [], slugs = {};
  for (const a of ARCHIVOS) {
    const data = leerJSON(a.archivo);
    const lista = data && Array.isArray(data.productos) ? data.productos : (Array.isArray(data) ? data : []);
    for (const p of lista) {
      if (!p || typeof p !== "object") continue;
      const id = idUnico(p, a.espacio, usados);
      usados[id] = true;
      try {
        const nombre = plano(p.nombre_es || p.nombre_en);
        const colores = (Array.isArray(p.colores) ? p.colores : []).map((c) => c && {
          nombre: plano(c.nombre_es || c.nombre_en),
          fotos: fotosLista(c.imagen, c.galeria)
        }).filter((c) => c && c.nombre && c.fotos.length);
        const fotos = [...new Set(fotosLista(p.imagen, p.galeria).concat(...colores.map((c) => c.fotos)))];
        if (!nombre || !fotos.length) { avisar("Camiseta sin nombre o sin foto, no tiene página propia (id " + id + ")"); continue; }
        const col = String(p.coleccion || "").toLowerCase().trim();
        const coleccion = a.espacio === "esenciales" ? "" : (COLECCIONES[col] ? col : "oceano");
        // Dirección: el nombre; si ya existe, con la horma; y si aún choca, con número
        let s = slug(nombre) || "camiseta";
        if (slugs[s]) s = s + "-" + (a.espacio === "esenciales" ? "esencial" : a.fit);
        for (let n = 2, base = s; slugs[s]; n++) s = base + "-" + n;
        slugs[s] = true;
        todos.push({
          id, slug: s, url: "/camisetas/" + s + "/",
          espacio: a.espacio, fit: a.fit, coleccion,
          nombre,
          desc: plano(p.desc_es || p.desc_en),
          descLarga: plano(p.desc_larga_es || p.desc_larga_en),
          disponible: p.disponible !== false,
          precio: precioDe(p, a.espacio, a.fit),
          fotos, colores
        });
      } catch (e) { avisar("Camiseta " + id + " omitida", e); }
    }
  }
  return todos;
}, []);

function horma(p) { return p.espacio === "esenciales" ? "Esencial" : (p.fit === "oversized" ? "Oversized" : "Regular fit"); }
function etiquetaProducto(p) {
  if (p.espacio === "esenciales") return "Camiseta básica " + p.nombre;
  return "Camiseta " + (p.fit === "oversized" ? "oversized " : "") + p.nombre;
}
function enlaceTienda(p) {
  const hash = p.espacio === "esenciales" ? "esenciales" : COLECCIONES[p.coleccion].hash;
  return "/?camiseta=" + encodeURIComponent(p.id) + "#" + hash;
}
function waEnlace(texto) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(texto); }
const WA_GENERAL = waEnlace("¡Hola A&M Universe! 🐱 Quiero más información sobre las camisetas.");

/* =========================================================
   5. Plantilla común
   ========================================================= */
const ICONO_WA = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-2.9.8.8-2.8-.2-.3a8.2 8.2 0 1 1 6.8 3.6zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5.3-.4v-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.5h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 5 9.3a5 5 0 0 0 1 2.7 11.5 11.5 0 0 0 4.5 4 15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.7.1c.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.4-.3z"/></svg>';

const ORG_ID = SITIO + "/#organizacion";
const STORE_ID = SITIO + "/#tienda";
const WEB_ID = SITIO + "/#sitio";

function jsonld(obj) {
  return '<script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, "\\u003c") + "</script>";
}
function migasLD(migas) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: migas.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.nombre, item: SITIO + m.url }))
  };
}
function migasHTML(migas) {
  return '<nav class="pg-migas" aria-label="Estás en"><ol>' + migas.map((m, i) =>
    i === migas.length - 1
      ? '<li aria-current="page">' + esc(m.nombre) + "</li>"
      : '<li><a href="' + esc(m.url) + '">' + esc(m.nombre) + "</a></li>"
  ).join("") + "</ol></nav>";
}

const NAV = [
  ["/camisetas/", "Camisetas"],
  ["/coleccion/oceano/", "Océano"],
  ["/coleccion/felina/", "Felina"],
  ["/esenciales/", "Esenciales"],
  ["/nosotros/", "Nosotros"],
  ["/preguntas-frecuentes/", "Preguntas"]
];

function pagina(o) {
  const url = SITIO + o.ruta;
  const imagen = o.imagen ? abs(o.imagen) : SITIO + "/assets/og-image.png";
  const ld = [].concat(o.jsonld || [], o.migas ? [migasLD(o.migas)] : []);
  const nav = NAV.map(([h, t]) => '<a href="' + h + '"' + (o.ruta === h || (o.seccion && o.seccion === h) ? ' aria-current="page"' : "") + ">" + t + "</a>").join("");
  const redes = REDES.length
    ? '<div class="pg-redes">' + REDES.map((r) => '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.nombre) + "</a>").join(" · ") + "</div>"
    : "";
  return `<!DOCTYPE html>
<html lang="es-CO" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(o.titulo)}</title>
<meta name="description" content="${esc(o.descripcion)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="${esc(url)}">
<link rel="alternate" hreflang="es-CO" href="${esc(url)}">
<link rel="alternate" hreflang="x-default" href="${esc(url)}">
<meta property="og:type" content="${o.tipoOg || "website"}">
<meta property="og:site_name" content="${MARCA}">
<meta property="og:locale" content="es_CO">
<meta property="og:title" content="${esc(o.tituloOg || o.titulo)}">
<meta property="og:description" content="${esc(o.descripcion)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(imagen)}">
<meta property="og:image:alt" content="${esc(o.imagenAlt || MARCA)}">
${o.precio ? `<meta property="product:price:amount" content="${o.precio}">\n<meta property="product:price:currency" content="COP">\n<meta property="product:availability" content="${o.disponible === false ? "out of stock" : "in stock"}">\n<meta property="product:brand" content="${MARCA}">\n<meta property="product:condition" content="new">\n` : ""}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.tituloOg || o.titulo)}">
<meta name="twitter:description" content="${esc(o.descripcion)}">
<meta name="twitter:image" content="${esc(imagen)}">
<meta name="theme-color" content="#F6F2EA" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0D0D0D" media="(prefers-color-scheme: dark)">
<meta name="geo.region" content="CO-QUI">
<meta name="geo.placename" content="${LUGAR}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
<link rel="stylesheet" href="/css/paginas.css">
${o.precargar ? `<link rel="preload" as="image" href="${esc("/" + encodeURI(ruta(o.precargar)))}">\n` : ""}<script>(function(){var t;try{t=localStorage.getItem("aym-theme")}catch(e){}if(!t)t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)})();</script>
${ld.map(jsonld).join("\n")}
</head>
<body class="pg">
<a class="pg-saltar" href="#contenido">Saltar al contenido</a>
<div class="topbar"><span>🐾 Un porcentaje de cada venta ayuda a los animales de la calle · Envíos a toda Colombia</span></div>
<header class="pg-header">
  <div class="container pg-header-inner">
    <a class="pg-logo" href="/" aria-label="${MARCA} — inicio">
      <img class="brand-logo brand-logo-light" src="/assets/logo-light.png" alt="${MARCA}" width="640" height="189">
      <img class="brand-logo brand-logo-dark" src="/assets/logo-dark.png" alt="${MARCA}" width="640" height="189">
    </a>
    <div class="pg-acciones">
      <button class="icon-btn" id="pg-tema" type="button" aria-label="Cambiar tema claro u oscuro">
        <svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>
        <svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
      </button>
      <a class="btn btn-primary pg-ir-tienda" href="/">Ir a la tienda</a>
    </div>
  </div>
  <nav class="pg-nav" aria-label="Secciones"><div class="container">${nav}</div></nav>
</header>
<main id="contenido">
${o.migas ? '<div class="container">' + migasHTML(o.migas) + "</div>" : ""}
${o.cuerpo}
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <img class="brand-logo brand-logo-light footer-logo" src="/assets/logo-light.png" alt="${MARCA}" width="640" height="189" loading="lazy">
      <img class="brand-logo brand-logo-dark footer-logo" src="/assets/logo-dark.png" alt="${MARCA}" width="640" height="189" loading="lazy">
      <p>Diseño con propósito. Camisetas estampadas que cuentan historias y ayudan a los animales. Hechas en ${LUGAR}, con envíos a toda Colombia.</p>
    </div>
    <nav class="footer-nav" aria-label="Colecciones">
      <span class="footer-nav-title">Camisetas</span>
      <a href="/camisetas/">Todas las camisetas</a>
      <a href="/coleccion/oceano/">Colección Océano</a>
      <a href="/coleccion/felina/">Colección Felina</a>
      <a href="/esenciales/">Esenciales</a>
      <a href="/guia-de-tallas/">Guía de tallas</a>
    </nav>
    <nav class="footer-nav" aria-label="La marca">
      <span class="footer-nav-title">La marca</span>
      <a href="/nosotros/">Nosotros</a>
      <a href="/como-comprar/">Cómo comprar</a>
      <a href="/preguntas-frecuentes/">Preguntas frecuentes</a>
      <a href="/politicas.html">Políticas y términos</a>
    </nav>
    <div class="footer-contact">
      <a href="${esc(WA_GENERAL)}" target="_blank" rel="noopener">${ICONO_WA.replace('width="18" height="18"', 'class="ci" width="15" height="15"')} WhatsApp: ${WA_VISIBLE}</a>
      ${CORREO ? `<a href="mailto:${esc(CORREO)}">${esc(CORREO)}</a>` : ""}
      <span>${LUGAR} · Colombia</span>
      ${redes}
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <span>© ${new Date().getFullYear()} ${MARCA} · <a href="/politicas.html">Políticas y términos</a></span>
      <span>Hecho en el Quindío, Colombia</span>
      <span class="footer-dev">Desarrollo web: <a href="/politicas.html#desarrollo">Dr. Mauricio Rodríguez Herrera</a></span>
    </div>
  </div>
</footer>
<a href="${esc(o.wa || WA_GENERAL)}" class="wa-float" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${ICONO_WA.replace('width="18" height="18"', 'width="28" height="28"')}</a>
<script>
(function(){
  var b=document.getElementById("pg-tema");
  if(b)b.addEventListener("click",function(){var r=document.documentElement,t=r.getAttribute("data-theme")==="dark"?"light":"dark";r.setAttribute("data-theme",t);try{localStorage.setItem("aym-theme",t)}catch(e){}});
  var f=document.getElementById("pg-foto");
  document.querySelectorAll(".pg-mini").forEach(function(m){m.addEventListener("click",function(){
    if(!f)return;f.src=m.getAttribute("data-src");f.alt=m.getAttribute("data-alt")||f.alt;
    document.querySelectorAll(".pg-mini").forEach(function(x){x.setAttribute("aria-pressed",x===m?"true":"false")});
  })});
})();
</script>
</body>
</html>
`;
}

/* Tarjeta de camiseta que enlaza a su página */
function tarjeta(p, conColeccion) {
  const etiqueta = conColeccion && p.coleccion ? "Colección " + COLECCIONES[p.coleccion].nombre + " · " + horma(p) : horma(p);
  return '<article class="product pg-card' + (p.disponible ? "" : " is-soldout") + '">' +
    '<a class="product-media" href="' + p.url + '" tabindex="-1" aria-hidden="true">' +
      '<img src="/' + esc(encodeURI(p.fotos[0])) + '" alt="' + esc(etiquetaProducto(p)) + '" loading="lazy" width="260" height="288">' +
    "</a>" +
    '<span class="tag' + (p.disponible ? " tag-live" : "") + '">' + (p.disponible ? "Disponible" : "Agotado") + "</span>" +
    '<h3 class="product-name"><a href="' + p.url + '">' + esc(p.nombre) + "</a></h3>" +
    '<p class="pg-card-horma">' + esc(etiqueta) + "</p>" +
    '<p class="product-desc">' + esc(recortar(p.desc, 120)) + "</p>" +
    '<div class="product-buy"><span class="product-price">' + pesos(p.precio) + '</span><a class="btn btn-add" href="' + p.url + '">Ver camiseta</a></div>' +
  "</article>";
}
function rejilla(lista, conColeccion) {
  return '<div class="shop-grid pg-grid">' + lista.map((p) => tarjeta(p, conColeccion)).join("") + "</div>";
}
function listaLD(nombre, lista) {
  return {
    "@context": "https://schema.org", "@type": "ItemList", name: nombre,
    numberOfItems: lista.length,
    itemListElement: lista.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: SITIO + p.url, name: etiquetaProducto(p) }))
  };
}
function tablaTallas(clave) {
  const filas = Array.isArray(TALLAS[clave]) ? TALLAS[clave].filter((f) => f && f.talla) : [];
  if (!filas.length) return "";
  return '<div class="size-table-wrap"><h3 class="size-table-title">' + (clave === "oversized" ? "Oversized" : "Regular fit") + "</h3>" +
    '<table class="size-table"><caption class="sr-only">Medidas de la camiseta ' + (clave === "oversized" ? "oversized" : "regular fit") + ' en centímetros</caption><thead><tr><th scope="col">Talla</th><th scope="col">Pecho (cm)</th><th scope="col">Largo (cm)</th><th scope="col">Hombro (cm)</th></tr></thead><tbody>' +
    filas.map((f) => "<tr><th scope=\"row\">" + esc(f.talla) + "</th><td>" + esc(f.pecho) + "</td><td>" + esc(f.largo) + "</td><td>" + esc(f.hombro) + "</td></tr>").join("") +
    "</tbody></table></div>";
}
const TALLAS_TXT = (() => {
  const t = [...new Set([].concat(TALLAS.regular || [], TALLAS.oversized || []).map((f) => f && f.talla).filter(Boolean))];
  return t.length ? t : ["S", "M", "L", "XL"];
})();
const METODOS_PAGO = (() => {
  const m = [];
  if (limpio(PAGOS.nequi)) m.push("Nequi");
  if (limpio(PAGOS.daviplata)) m.push("Daviplata");
  if (limpio(PAGOS.breb)) m.push("Bre-B");
  m.push("transferencia bancaria", "contra entrega (según la ciudad)");
  return m;
})();
function listaHumana(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " y " + a[a.length - 1]; }

/* Confianza: lo mismo en cada camiseta */
const CONFIANZA = '<ul class="pg-confianza">' +
  "<li>🐾 Parte de cada venta ayuda a animales de la calle</li>" +
  "<li>🚚 Envíos a toda Colombia desde " + LUGAR + "</li>" +
  "<li>💳 " + esc(listaHumana(METODOS_PAGO)) + "</li>" +
  "<li>💬 Te asesoramos con la talla por WhatsApp</li>" +
  "</ul>";

/* Precio mínimo y máximo (para textos y datos) */
const PRECIOS = CATALOGO.map((p) => p.precio).filter(Boolean);
const P_MIN = PRECIOS.length ? Math.min(...PRECIOS) : 0;
const P_MAX = PRECIOS.length ? Math.max(...PRECIOS) : 0;

/* =========================================================
   6. Páginas
   ========================================================= */
const PAGINAS = []; // { ruta, html, imagenes:[abs], prioridad }
function agregar(rutaPag, html, extra) { PAGINAS.push(Object.assign({ ruta: rutaPag, html }, extra || {})); }

/* ---- 6.1 Una página por camiseta ---- */
function detallesHTML(texto) {
  const t = plano(texto);
  if (!t) return "";
  const partes = t.split(/Detalles del producto\s*:?/i);
  let html = partes[0].trim() ? "<p>" + esc(partes[0].trim()) + "</p>" : "";
  if (partes[1] && partes[1].trim()) {
    const items = partes[1].trim().split(/\.\s+(?=[A-ZÁÉÍÓÚÑ0-9])/).map((s) => s.replace(/\.$/, "").trim()).filter(Boolean);
    html += "<h3>Detalles del producto</h3><ul class=\"pg-lista\">" + items.map((s) => {
      const m = s.match(/^([^:]{2,32}):\s*(.+)$/);
      return "<li>" + (m ? "<strong>" + esc(m[1]) + ":</strong> " + esc(m[2]) : esc(s)) + "</li>";
    }).join("") + "</ul>";
  }
  return html;
}

for (const p of CATALOGO) {
  seguro("Página de " + p.nombre, () => {
    const col = p.coleccion ? COLECCIONES[p.coleccion] : null;
    const urlPag = SITIO + p.url;
    const ubicacion = col ? "Colección " + col.nombre : "Esenciales";
    const titulo = etiquetaProducto(p) + " · " + ubicacion + " | " + MARCA;
    const descripcion = recortar(p.desc || p.descLarga, 118) + " " + pesos(p.precio) + " · Envíos a toda Colombia.";
    const coloresTxt = p.colores.map((c) => c.nombre);
    const migas = [{ nombre: "Inicio", url: "/" }, { nombre: "Camisetas", url: "/camisetas/" }]
      .concat(col ? [{ nombre: "Colección " + col.nombre, url: col.ruta }] : [{ nombre: "Esenciales", url: "/esenciales/" }])
      .concat([{ nombre: p.nombre, url: p.url }]);

    // Fotos con su color (para el texto alternativo)
    const fotosAlt = [];
    const vistas = new Set();
    const altBase = etiquetaProducto(p) + " de " + MARCA;
    for (const f of p.fotos) {
      const c = p.colores.find((c) => c.fotos.includes(f));
      if (!vistas.has(f)) { vistas.add(f); fotosAlt.push({ f, alt: altBase + (c ? " en color " + c.nombre : "") }); }
    }
    const mini = fotosAlt.length > 1
      ? '<div class="pg-miniaturas">' + fotosAlt.slice(0, 16).map((x, i) =>
          '<button type="button" class="pg-mini" aria-pressed="' + (i ? "false" : "true") + '" data-src="/' + esc(encodeURI(x.f)) + '" data-alt="' + esc(x.alt) + '" aria-label="Ver foto ' + (i + 1) + '">' +
          '<img src="/' + esc(encodeURI(x.f)) + '" alt="" loading="lazy" width="72" height="72"></button>').join("") + "</div>"
      : "";

    const relacionadas = CATALOGO.filter((x) => x !== p && x.coleccion === p.coleccion && x.espacio !== "esenciales" === (p.espacio !== "esenciales"))
      .sort((a, b) => (a.fit === p.fit ? 0 : 1) - (b.fit === p.fit ? 0 : 1)).slice(0, 4);
    const otras = relacionadas.length ? relacionadas : CATALOGO.filter((x) => x !== p).slice(0, 4);

    const waTxt = "¡Hola A&M Universe! 🐱 Quiero la " + etiquetaProducto(p).replace(/^Camiseta/, "camiseta") + " (" + pesos(p.precio) + "). ¿Me ayudas con la talla y el envío? " + urlPag;
    const claveTallas = p.fit === "oversized" ? "oversized" : "regular";

    const ldProducto = {
      "@context": "https://schema.org", "@type": "Product",
      "@id": urlPag + "#producto",
      name: etiquetaProducto(p),
      description: plano(p.descLarga || p.desc),
      url: urlPag,
      sku: p.id,
      image: p.fotos.slice(0, 10).map(abs),
      brand: { "@type": "Brand", name: MARCA },
      category: "Ropa > Camisetas" + (col ? " > Colección " + col.nombre : " > Esenciales"),
      audience: { "@type": "PeopleAudience", suggestedGender: "unisex" },
      size: TALLAS_TXT.join(", "),
      offers: {
        "@type": "Offer",
        url: urlPag,
        priceCurrency: "COP",
        price: p.precio,
        availability: p.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": ORG_ID },
        areaServed: { "@type": "Country", name: "Colombia" }
      }
    };
    if (coloresTxt.length) ldProducto.color = coloresTxt.join(", ");
    if (/algod[oó]n/i.test(p.descLarga + " " + p.desc)) ldProducto.material = "Algodón";
    const diasCambio = parseInt(limpio(NEGOCIO.dias_cambio), 10);
    if (diasCambio > 0) {
      ldProducto.offers.hasMerchantReturnPolicy = {
        "@type": "MerchantReturnPolicy", applicableCountry: "CO",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: diasCambio, url: SITIO + "/politicas.html"
      };
    }

    const cuerpo = `
<section class="pg-producto">
  <div class="container pg-prod-grid">
    <div class="pg-galeria">
      <figure class="pg-foto-principal"><img id="pg-foto" src="/${esc(encodeURI(p.fotos[0]))}" alt="${esc(fotosAlt[0] ? fotosAlt[0].alt : altBase)}" width="800" height="800" fetchpriority="high"></figure>
      ${mini}
    </div>
    <div class="pg-info">
      <p class="eyebrow">${esc(ubicacion)} · ${esc(horma(p))}</p>
      <h1 class="pg-titulo">${esc(p.nombre)}</h1>
      <p class="pg-subtitulo">${esc(etiquetaProducto(p))} · ${esc(MARCA)}</p>
      <p class="pg-precio"><span>${pesos(p.precio)}</span> <span class="tag${p.disponible ? " tag-live" : ""}">${p.disponible ? "Disponible" : "Agotado"}</span></p>
      ${p.desc ? `<p class="pg-lead">${esc(p.desc)}</p>` : ""}
      <dl class="pg-datos">
        <div><dt>Horma</dt><dd>${esc(horma(p))}</dd></div>
        <div><dt>Tallas</dt><dd>${esc(TALLAS_TXT.join(" · "))}</dd></div>
        ${coloresTxt.length ? `<div><dt>Colores</dt><dd>${esc(coloresTxt.join(" · "))}</dd></div>` : ""}
        <div><dt>Envío</dt><dd>A toda Colombia</dd></div>
      </dl>
      <div class="pg-cta">
        ${p.disponible
          ? `<a class="btn btn-primary btn-lg" href="${esc(enlaceTienda(p))}">Elegir talla y comprar</a>`
          : `<span class="btn btn-ghost btn-lg" aria-disabled="true">Agotada por ahora</span>`}
        <a class="btn btn-whatsapp btn-lg" href="${esc(waEnlace(waTxt))}" target="_blank" rel="noopener">${ICONO_WA} ${p.disponible ? "Pedir por WhatsApp" : "Avísenme cuando vuelva"}</a>
      </div>
      ${CONFIANZA}
    </div>
  </div>
</section>
<section class="section pg-seccion">
  <div class="container pg-prosa">
    <h2>Sobre la ${esc(etiquetaProducto(p).replace(/^Camiseta/, "camiseta"))}</h2>
    ${detallesHTML(p.descLarga) || `<p>${esc(p.desc)}</p>`}
    ${col ? `<p>Hace parte de la <a href="${col.ruta}">colección ${esc(col.nombre)}</a> de ${MARCA}: camisetas estampadas inspiradas en ${esc(col.tema)}. Cada compra ayuda a los animales de la calle.</p>`
          : `<p>Hace parte de los <a href="/esenciales/">Esenciales</a> de ${MARCA}: básicos que combinan con todo. Cada compra ayuda a los animales de la calle.</p>`}
    <h2 id="tallas">Guía de tallas · ${esc(horma(p) === "Esencial" ? "Regular fit" : horma(p))}</h2>
    ${tablaTallas(claveTallas)}
    ${limpio(TALLAS.nota) ? `<p class="pg-nota">${esc(TALLAS.nota)}</p>` : ""}
    <p><a href="/guia-de-tallas/">Ver la guía de tallas completa</a> · <a href="/como-comprar/">Cómo comprar y formas de pago</a></p>
  </div>
</section>
<section class="section pg-seccion pg-alt">
  <div class="container">
    <h2 class="section-title pg-h2">${col ? "Más camisetas de la colección " + esc(col.nombre) : "Más camisetas"}</h2>
    ${rejilla(otras, !col)}
    <p class="pg-mas"><a class="btn btn-ghost" href="/camisetas/">Ver todas las camisetas</a></p>
  </div>
</section>`;
    agregar(p.url, pagina({
      ruta: p.url, seccion: col ? col.ruta : "/esenciales/", titulo, descripcion,
      tituloOg: etiquetaProducto(p) + " · " + MARCA,
      imagen: p.fotos[0], imagenAlt: altBase, precargar: p.fotos[0],
      tipoOg: "product", precio: p.precio, disponible: p.disponible,
      migas, jsonld: [ldProducto], cuerpo, wa: waEnlace(waTxt)
    }), { imagenes: fotosAlt.map((x) => ({ loc: abs(x.f), titulo: x.alt })), prioridad: "0.8", tipo: "producto" });
  });
}

/* ---- 6.2 Colecciones ---- */
function bloqueCamisetas(lista, titulo, id) {
  if (!lista.length) return "";
  return `<h2 class="section-title pg-h2" id="${id}">${esc(titulo)}</h2>${rejilla(lista)}`;
}
function parrafos(grupo, campos) {
  return campos.map((c) => T(grupo, c)).filter(Boolean).map((t) => "<p>" + rico(t) + "</p>").join("");
}

seguro("Colección Océano", () => {
  const lista = CATALOGO.filter((p) => p.coleccion === "oceano");
  const reg = lista.filter((p) => p.fit === "regular"), ovs = lista.filter((p) => p.fit === "oversized");
  const r = COLECCIONES.oceano.ruta;
  const datos = [1, 2, 3].map((n) => T("oceano", "dato" + n + "_numero_es") && T("oceano", "dato" + n + "_texto_es")
    ? `<div class="pg-dato"><strong>${esc(T("oceano", "dato" + n + "_numero_es"))}</strong><span>${rico(T("oceano", "dato" + n + "_texto_es"))}</span></div>` : "").join("");
  const acciones = [1, 2, 3, 4].map((n) => T("oceano", "accion" + n + "_titulo_es")
    ? `<li><strong>${esc(T("oceano", "accion" + n + "_titulo_es"))}.</strong> ${rico(T("oceano", "accion" + n + "_texto_es"))}</li>` : "").join("");
  const cuerpo = `
<section class="pg-hero">
  <div class="container">
    <p class="eyebrow">${esc(T("oceano", "portada_eyebrow_es") || "Colección")}</p>
    <h1 class="pg-titulo">Colección Océano: camisetas estampadas de animales marinos</h1>
    <p class="pg-lead">${rico(T("oceano", "portada_texto_es") || T("colecciones", "oceano_desc_es"))}</p>
    <p class="pg-lead-sec">${lista.length} diseños en Regular fit y Oversized${P_MIN ? ", desde " + pesos(Math.min(...lista.map((p) => p.precio))) : ""}. Envíos a toda Colombia.</p>
  </div>
</section>
<section class="section pg-seccion"><div class="container">
  ${bloqueCamisetas(reg, "Camisetas Océano · Regular fit", "regular")}
  ${bloqueCamisetas(ovs, "Camisetas Océano · Oversized", "oversized")}
</div></section>
<section class="section pg-seccion pg-alt"><div class="container pg-prosa">
  ${T("oceano", "historia_titulo_es") ? `<p class="eyebrow">${esc(T("oceano", "historia_eyebrow_es"))}</p><h2>${rico(T("oceano", "historia_titulo_es"))}</h2>` : ""}
  ${parrafos("oceano", ["historia_p1_es", "historia_p2_es", "historia_p3_es"])}
  ${T("oceano", "esperanza_titulo_es") ? `<h2>${rico(T("oceano", "esperanza_titulo_es"))}</h2>` : ""}
  ${parrafos("oceano", ["esperanza_texto_es"])}
  ${datos ? `<div class="pg-datos-num">${datos}</div>` : ""}
  ${T("oceano", "curiosidad_titulo_es") ? `<h2>${rico(T("oceano", "curiosidad_titulo_es"))}</h2>` : ""}
  ${parrafos("oceano", ["curiosidad_p1_es", "curiosidad_p2_es"])}
  ${T("oceano", "curiosidad_frase_es") ? `<blockquote class="pg-cita">${rico(T("oceano", "curiosidad_frase_es"))}</blockquote>` : ""}
  ${T("oceano", "acciones_titulo_es") ? `<h2>${rico(T("oceano", "acciones_titulo_es"))}</h2>` : ""}
  ${parrafos("oceano", ["acciones_texto_es"])}
  ${acciones ? `<ul class="pg-lista">${acciones}</ul>` : ""}
  <p class="pg-mas"><a class="btn btn-primary" href="/#oceano">Comprar en la tienda</a></p>
</div></section>`;
  agregar(r, pagina({
    ruta: r, titulo: "Colección Océano · Camisetas estampadas de animales marinos | " + MARCA,
    descripcion: recortar("Camisetas estampadas de ballenas, orcas, tiburones, mantarrayas y la vida del océano. " + lista.length + " diseños en Regular fit y Oversized, 100% algodón. Envíos a toda Colombia.", 158),
    imagen: (lista[0] || {}).fotos ? lista[0].fotos[0] : "", imagenAlt: "Colección Océano de " + MARCA,
    migas: [{ nombre: "Inicio", url: "/" }, { nombre: "Camisetas", url: "/camisetas/" }, { nombre: "Colección Océano", url: r }],
    jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Colección Océano", url: SITIO + r, isPartOf: { "@id": WEB_ID }, about: "Camisetas estampadas inspiradas en el océano y los animales marinos", mainEntity: listaLD("Camisetas de la colección Océano", lista) }],
    cuerpo
  }), { prioridad: "0.9", imagenes: lista.slice(0, 20).map((p) => ({ loc: abs(p.fotos[0]), titulo: etiquetaProducto(p) })) });
});

seguro("Colección Felina", () => {
  const lista = CATALOGO.filter((p) => p.coleccion === "felina");
  const reg = lista.filter((p) => p.fit === "regular"), ovs = lista.filter((p) => p.fit === "oversized");
  const r = COLECCIONES.felina.ruta;
  const rasgos = [1, 2, 3].map((n) => T("felina", "rasgo" + n + "_titulo_es")
    ? `<li><strong>${esc(T("felina", "rasgo" + n + "_titulo_es"))}.</strong> ${rico(T("felina", "rasgo" + n + "_texto_es"))}</li>` : "").join("");
  const cuerpo = `
<section class="pg-hero">
  <div class="container">
    <p class="eyebrow">${esc(T("felina", "eyebrow_es") || "Colección")}</p>
    <h1 class="pg-titulo">Colección Felina: camisetas estampadas de gatos y felinos</h1>
    <p class="pg-lead">${rico(T("felina", "texto_es") || T("colecciones", "felina_desc_es"))}</p>
    <p class="pg-lead-sec">${lista.length} diseños en Regular fit y Oversized${lista.length ? ", desde " + pesos(Math.min(...lista.map((p) => p.precio))) : ""}. Envíos a toda Colombia.</p>
  </div>
</section>
<section class="section pg-seccion"><div class="container">
  ${bloqueCamisetas(reg, "Camisetas Felina · Regular fit", "regular")}
  ${bloqueCamisetas(ovs, "Camisetas Felina · Oversized", "oversized")}
</div></section>
<section class="section pg-seccion pg-alt"><div class="container pg-prosa">
  ${T("felina", "historia_titulo_es") ? `<p class="eyebrow">${esc(T("felina", "historia_eyebrow_es"))}</p><h2>${rico(T("felina", "historia_titulo_es"))}</h2>` : ""}
  ${parrafos("felina", ["historia_p1_es", "historia_p2_es"])}
  ${T("felina", "inspira_titulo_es") ? `<h2>${rico(T("felina", "inspira_titulo_es"))}</h2>` : ""}
  ${rasgos ? `<ul class="pg-lista">${rasgos}</ul>` : ""}
  <p class="pg-mas"><a class="btn btn-primary" href="/#felina">Comprar en la tienda</a></p>
</div></section>`;
  agregar(r, pagina({
    ruta: r, titulo: "Colección Felina · Camisetas estampadas de gatos y felinos | " + MARCA,
    descripcion: recortar("Camisetas estampadas de gatos, leones, jaguares y tigres. " + lista.length + " diseños en Regular fit y Oversized, hechos en Calarcá, Quindío. Envíos a toda Colombia.", 158),
    imagen: lista[0] ? lista[0].fotos[0] : "", imagenAlt: "Colección Felina de " + MARCA,
    migas: [{ nombre: "Inicio", url: "/" }, { nombre: "Camisetas", url: "/camisetas/" }, { nombre: "Colección Felina", url: r }],
    jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Colección Felina", url: SITIO + r, isPartOf: { "@id": WEB_ID }, about: "Camisetas estampadas inspiradas en gatos y grandes felinos", mainEntity: listaLD("Camisetas de la colección Felina", lista) }],
    cuerpo
  }), { prioridad: "0.9", imagenes: lista.slice(0, 20).map((p) => ({ loc: abs(p.fotos[0]), titulo: etiquetaProducto(p) })) });
});

seguro("Esenciales", () => {
  const lista = CATALOGO.filter((p) => p.espacio === "esenciales");
  const r = "/esenciales/";
  const cuerpo = `
<section class="pg-hero"><div class="container">
  <p class="eyebrow">Esenciales</p>
  <h1 class="pg-titulo">Camisetas básicas Esenciales</h1>
  <p class="pg-lead">${rico(T("tienda", "esenciales_titulo_es") || "Los básicos que no fallan.")} ${rico(T("tienda", "esenciales_texto_es"))}</p>
  ${lista.length ? `<p class="pg-lead-sec">Desde ${pesos(Math.min(...lista.map((p) => p.precio)))}. Envíos a toda Colombia.</p>` : ""}
</div></section>
<section class="section pg-seccion"><div class="container">
  ${lista.length ? rejilla(lista) : `<p>Muy pronto, nuevos básicos. <a href="${esc(WA_GENERAL)}">Escríbenos</a> y te avisamos.</p>`}
  <p class="pg-mas"><a class="btn btn-primary" href="/#esenciales">Comprar en la tienda</a></p>
</div></section>`;
  agregar(r, pagina({
    ruta: r, titulo: "Esenciales · Camisetas básicas en algodón | " + MARCA,
    descripcion: recortar("Camisetas básicas Esenciales de " + MARCA + ": algodón suave, colores que combinan con todo" + (lista.length ? ", desde " + pesos(Math.min(...lista.map((p) => p.precio))) : "") + ". Envíos a toda Colombia.", 158),
    imagen: lista[0] ? lista[0].fotos[0] : "", imagenAlt: "Esenciales de " + MARCA,
    migas: [{ nombre: "Inicio", url: "/" }, { nombre: "Camisetas", url: "/camisetas/" }, { nombre: "Esenciales", url: r }],
    jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Esenciales", url: SITIO + r, isPartOf: { "@id": WEB_ID }, mainEntity: listaLD("Camisetas básicas Esenciales", lista) }],
    cuerpo
  }), { prioridad: "0.8" });
});

/* ---- 6.3 Catálogo completo ---- */
seguro("Catálogo completo", () => {
  const r = "/camisetas/";
  const grupos = [
    ["Colección Océano · Regular fit", CATALOGO.filter((p) => p.coleccion === "oceano" && p.fit === "regular"), "oceano-regular"],
    ["Colección Océano · Oversized", CATALOGO.filter((p) => p.coleccion === "oceano" && p.fit === "oversized"), "oceano-oversized"],
    ["Colección Felina · Regular fit", CATALOGO.filter((p) => p.coleccion === "felina" && p.fit === "regular"), "felina-regular"],
    ["Colección Felina · Oversized", CATALOGO.filter((p) => p.coleccion === "felina" && p.fit === "oversized"), "felina-oversized"],
    ["Esenciales", CATALOGO.filter((p) => p.espacio === "esenciales"), "esenciales"]
  ].filter((g) => g[1].length);
  const indice = '<ul class="pg-indice">' + grupos.map((g) => `<li><a href="#${g[2]}">${esc(g[0])} (${g[1].length})</a></li>`).join("") + "</ul>";
  const cuerpo = `
<section class="pg-hero"><div class="container">
  <p class="eyebrow">Tienda ${esc(MARCA)}</p>
  <h1 class="pg-titulo">Camisetas estampadas con propósito</h1>
  <p class="pg-lead">${CATALOGO.length} camisetas estampadas de animales, diseñadas en ${LUGAR}: ballenas, orcas, tiburones, gatos, leones y jaguares, en Regular fit, Oversized y básicos Esenciales.${P_MIN ? " Precios desde " + pesos(P_MIN) + (P_MAX > P_MIN ? " hasta " + pesos(P_MAX) : "") + "." : ""} Envíos a toda Colombia y parte de cada venta ayuda a los animales de la calle.</p>
  ${indice}
</div></section>
<section class="section pg-seccion"><div class="container">
  ${grupos.map((g) => bloqueCamisetas(g[1], g[0], g[2])).join("")}
</div></section>`;
  agregar(r, pagina({
    ruta: r, titulo: "Camisetas estampadas de animales con propósito | " + MARCA + " Colombia",
    descripcion: recortar(CATALOGO.length + " camisetas estampadas de animales: colecciones Océano y Felina en Regular fit y Oversized, y básicos Esenciales" + (P_MIN ? ", desde " + pesos(P_MIN) : "") + ". Hechas en " + LUGAR + ". Envíos a toda Colombia.", 158),
    imagen: CATALOGO[0] ? CATALOGO[0].fotos[0] : "", imagenAlt: "Camisetas de " + MARCA,
    migas: [{ nombre: "Inicio", url: "/" }, { nombre: "Camisetas", url: r }],
    jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Camisetas " + MARCA, url: SITIO + r, isPartOf: { "@id": WEB_ID }, mainEntity: listaLD("Todas las camisetas de " + MARCA, CATALOGO) }],
    cuerpo
  }), { prioridad: "0.9" });
});

/* ---- 6.4 Preguntas frecuentes (las del panel + datos reales de la tienda) ---- */
const FAQ = seguro("Preguntas frecuentes", () => {
  const delPanel = (Array.isArray((TEXTOS.faq || {}).preguntas) ? TEXTOS.faq.preguntas : [])
    .map((q) => q && { q: plano(q.pregunta_es), a: plano(q.respuesta_es) }).filter((q) => q && q.q && q.a);
  const extra = [];
  const pr = numPrecio(CONFIG.precio_regular), po = numPrecio(CONFIG.precio_oversized), pe = numPrecio(CONFIG.precio_esenciales);
  if (pr || po || pe) {
    extra.push({ q: "¿Cuánto cuesta una camiseta de A&M Universe?", a: [pr && "Regular fit: " + pesos(pr), po && "Oversized: " + pesos(po), pe && "Esenciales: " + pesos(pe)].filter(Boolean).join(" · ") + ". Algunos diseños pueden tener precio especial; el precio de cada camiseta aparece en su página. Precios en pesos colombianos." });
  }
  extra.push({ q: "¿Dónde está ubicada A&M Universe?", a: "Estamos en " + LUGAR + ", Colombia, y enviamos a todas las ciudades del país. Compras en la tienda en línea (aymuniverse.com) y coordinamos el pedido por WhatsApp al " + WA_VISIBLE + "." });
  extra.push({ q: "¿Qué diferencia hay entre Regular fit y Oversized?", a: "Regular fit es el corte clásico, a tu medida. Oversized es un corte amplio y relajado, con diseños propios. Las medidas exactas de cada talla están en la guía de tallas: aymuniverse.com/guia-de-tallas/." });
  extra.push({ q: "¿Qué colecciones tienen?", a: "Colección Océano (camisetas estampadas de ballenas, orcas, tiburones, mantarrayas y vida marina), colección Felina (gatos, leones, jaguares y tigres) y Esenciales (camisetas básicas). En total " + CATALOGO.length + " diseños." });
  const vistas = new Set(delPanel.map((q) => q.q.toLowerCase()));
  return delPanel.concat(extra.filter((q) => !vistas.has(q.q.toLowerCase())));
}, []);

seguro("Página de preguntas", () => {
  const r = "/preguntas-frecuentes/";
  const cuerpo = `
<section class="pg-hero"><div class="container">
  <p class="eyebrow">${esc(T("faq", "eyebrow_es") || "Preguntas frecuentes")}</p>
  <h1 class="pg-titulo">Preguntas frecuentes sobre ${MARCA}</h1>
  <p class="pg-lead">Envíos, tallas, pagos, cambios y cómo cada compra ayuda a los animales. ¿No encuentras tu respuesta? <a href="${esc(WA_GENERAL)}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a>.</p>
</div></section>
<section class="section pg-seccion"><div class="container pg-prosa">
  ${FAQ.map((q) => `<div class="pg-faq"><h2>${esc(q.q)}</h2><p>${esc(q.a)}</p></div>`).join("")}
</div></section>`;
  agregar(r, pagina({
    ruta: r, titulo: "Preguntas frecuentes: envíos, tallas y pagos | " + MARCA,
    descripcion: "Respuestas sobre envíos a toda Colombia, tallas S a XL, pagos con Nequi, Daviplata, Bre-B o contra entrega, cambios y cómo tu compra ayuda a los animales.",
    migas: [{ nombre: "Inicio", url: "/" }, { nombre: "Preguntas frecuentes", url: r }],
    jsonld: [{ "@context": "https://schema.org", "@type": "FAQPage", url: SITIO + r, mainEntity: FAQ.map((q) => ({ "@type": "Question", name: q.q, acceptedAnswer: { "@type": "Answer", text: q.a } })) }],
    cuerpo
  }), { prioridad: "0.7" });
});

/* ---- 6.5 Guía de tallas ---- */
seguro("Guía de tallas", () => {
  const r = "/guia-de-tallas/";
  const cuerpo = `
<section class="pg-hero"><div class="container">
  <p class="eyebrow">Guía de tallas</p>
  <h1 class="pg-titulo">Guía de tallas de las camisetas</h1>
  <p class="pg-lead">Medidas de la prenda en centímetros para Regular fit y Oversized, tallas ${esc(TALLAS_TXT.join(", "))}.</p>
</div></section>
<section class="section pg-seccion"><div class="container pg-prosa">
  ${tablaTallas("regular")}
  ${tablaTallas("oversized")}
  ${limpio(TALLAS.nota) ? `<p class="pg-nota">${esc(TALLAS.nota)}</p>` : ""}
  <h2>Cómo elegir tu talla</h2>
  <ul class="pg-lista">
    <li><strong>Pecho:</strong> ancho de la camiseta de axila a axila, con la prenda extendida.</li>
    <li><strong>Largo:</strong> desde el punto más alto del hombro hasta el borde inferior.</li>
    <li><strong>Hombro:</strong> de costura a costura de hombro.</li>
    <li>El truco más fácil: mide una camiseta que te quede bien y compárala con la tabla.</li>
    <li>Si te gusta el look amplio y relajado, elige <strong>Oversized</strong> en tu talla habitual.</li>
  </ul>
  <p>¿Dudas? <a href="${esc(WA_GENERAL)}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a> y te asesoramos.</p>
  <p class="pg-mas"><a class="btn btn-primary" href="/camisetas/">Ver camisetas</a></p>
</div></section>`;
  agregar(r, pagina({
    ruta: r, titulo: "Guía de tallas: Regular fit y Oversized | " + MARCA,
    descripcion: "Medidas en centímetros (pecho, largo y hombro) de las camisetas " + MARCA + " en tallas " + TALLAS_TXT.join(", ") + ", Regular fit y Oversized. Cómo elegir tu talla.",
    migas: [{ nombre: "Inicio", url: "/" }, { nombre: "Guía de tallas", url: r }],
    jsonld: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Guía de tallas", url: SITIO + r, isPartOf: { "@id": WEB_ID } }],
    cuerpo
  }), { prioridad: "0.6" });
});

/* ---- 6.6 Cómo comprar ---- */
seguro("Cómo comprar", () => {
  const r = "/como-comprar/";
  const pasos = [1, 2, 3].map((n) => T("contacto", "paso" + n + "_titulo_es")
    ? `<li><strong>${esc(T("contacto", "paso" + n + "_titulo_es"))}.</strong> ${rico(T("contacto", "paso" + n + "_texto_es"))}</li>` : "").join("");
  const envio = limpio(NEGOCIO.dias_envio), cambio = limpio(NEGOCIO.dias_cambio);
  const cuerpo = `
<section class="pg-hero"><div class="container">
  <p class="eyebrow">${esc(T("contacto", "eyebrow_es") || "Cómo comprar")}</p>
  <h1 class="pg-titulo">Cómo comprar, pagar y recibir tu camiseta</h1>
  <p class="pg-lead">${rico(T("contacto", "texto_es") || "Estamos en " + LUGAR + " y enviamos a todo el país.")}</p>
</div></section>
<section class="section pg-seccion"><div class="container pg-prosa">
  <h2>Paso a paso</h2>
  <ol class="pg-lista">${pasos || "<li>Elige tu diseño.</li><li>Escríbenos por WhatsApp.</li><li>Recíbelo en casa.</li>"}</ol>
  <p>También puedes armar tu pedido en el carrito de la <a href="/">tienda</a>: eliges diseño, horma, talla y color, y el pedido llega listo a nuestro WhatsApp.</p>
  <h2>Formas de pago</h2>
  <p>Aceptamos ${esc(listaHumana(METODOS_PAGO))}. Coordinamos el pago contigo por WhatsApp.</p>
  <h2>Envíos</h2>
  <p>Enviamos desde ${LUGAR} a todas las ciudades de Colombia.${envio ? " Tiempo de entrega: " + esc(envio) + "." : " El tiempo y el costo del envío dependen de tu ciudad; te los confirmamos antes de pagar."}</p>
  <h2>Cambios</h2>
  <p>Si la talla no te queda, te ayudamos con el cambio.${cambio ? " Plazo para solicitarlo: " + esc(cambio) + "." : ""} Todos los detalles están en <a href="/politicas.html">políticas y términos</a>.</p>
  <h2>Contacto</h2>
  <p>WhatsApp: <a href="${esc(WA_GENERAL)}" target="_blank" rel="noopener">${WA_VISIBLE}</a>${CORREO ? ` · Correo: <a href="mailto:${esc(CORREO)}">${esc(CORREO)}</a>` : ""} · ${LUGAR}, Colombia.</p>
  <p class="pg-mas"><a class="btn btn-primary" href="/camisetas/">Ver camisetas</a></p>
</div></section>`;
  agregar(r, pagina({
    ruta: r, titulo: "Cómo comprar: pagos, envíos a toda Colombia y cambios | " + MARCA,
    descripcion: recortar("Compra tu camiseta " + MARCA + " en 3 pasos. Pagos con " + listaHumana(METODOS_PAGO) + ". Envíos desde " + LUGAR + " a toda Colombia.", 158),
    migas: [{ nombre: "Inicio", url: "/" }, { nombre: "Cómo comprar", url: r }],
    jsonld: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Cómo comprar", url: SITIO + r, isPartOf: { "@id": WEB_ID } }],
    cuerpo
  }), { prioridad: "0.6" });
});

/* ---- 6.7 Nosotros ---- */
seguro("Nosotros", () => {
  const r = "/nosotros/";
  const tarjetas = [1, 2, 3, 4].map((n) => T("proposito", "tarjeta" + n + "_titulo_es") && T("proposito", "tarjeta" + n + "_texto_es")
    ? `<h3>${rico(T("proposito", "tarjeta" + n + "_titulo_es"))}</h3><p>${rico(T("proposito", "tarjeta" + n + "_texto_es"))}</p>` : "").join("");
  const cuerpo = `
<section class="pg-hero"><div class="container">
  <p class="eyebrow">Nosotros</p>
  <h1 class="pg-titulo">${MARCA}: camisetas estampadas con propósito desde el Quindío</h1>
  <p class="pg-lead">${MARCA} (también escrita AYM Universe) es una marca colombiana de camisetas estampadas con sede en ${LUGAR}. Cada diseño cuenta una historia —el océano, los felinos, la naturaleza— y parte de cada venta ayuda a los animales de la calle.</p>
</div></section>
<section class="section pg-seccion"><div class="container pg-prosa">
  ${T("proposito", "titulo_es") ? `<h2>${rico(T("proposito", "titulo_es"))}</h2>` : ""}
  ${parrafos("proposito", ["texto_es"])}
  ${tarjetas}
  ${T("impacto", "titulo_es") ? `<h2>${rico(T("impacto", "titulo_es"))}</h2>` : ""}
  ${parrafos("impacto", ["texto_es"])}
  ${T("impacto", "frase_es") ? `<blockquote class="pg-cita">${rico(T("impacto", "frase_es"))}</blockquote>` : ""}
  <h2>En pocas palabras</h2>
  <ul class="pg-lista">
    <li><strong>Qué hacemos:</strong> camisetas estampadas de animales — colecciones <a href="/coleccion/oceano/">Océano</a> y <a href="/coleccion/felina/">Felina</a>, más básicos <a href="/esenciales/">Esenciales</a>.</li>
    <li><strong>Hormas y tallas:</strong> Regular fit y Oversized, tallas ${esc(TALLAS_TXT.join(", "))}.</li>
    ${P_MIN ? `<li><strong>Precios:</strong> desde ${pesos(P_MIN)}${P_MAX > P_MIN ? " hasta " + pesos(P_MAX) : ""} (pesos colombianos).</li>` : ""}
    <li><strong>Dónde:</strong> ${LUGAR}, Colombia. Envíos a todo el país.</li>
    <li><strong>Pagos:</strong> ${esc(listaHumana(METODOS_PAGO))}.</li>
    <li><strong>Causa:</strong> un porcentaje de cada venta va a fundaciones y a los animales de la calle.</li>
    <li><strong>Contacto:</strong> WhatsApp <a href="${esc(WA_GENERAL)}" target="_blank" rel="noopener">${WA_VISIBLE}</a>${CORREO ? ` · <a href="mailto:${esc(CORREO)}">${esc(CORREO)}</a>` : ""}.</li>
  </ul>
  <p class="pg-mas"><a class="btn btn-primary" href="/camisetas/">Ver camisetas</a></p>
</div></section>`;
  agregar(r, pagina({
    ruta: r, titulo: "Nosotros · Marca de camisetas con propósito en " + LUGAR + " | " + MARCA,
    descripcion: MARCA + " es una marca colombiana de camisetas estampadas de animales, con sede en " + LUGAR + ". Diseño con propósito: parte de cada venta ayuda a los animales de la calle.",
    migas: [{ nombre: "Inicio", url: "/" }, { nombre: "Nosotros", url: r }],
    jsonld: [{ "@context": "https://schema.org", "@type": "AboutPage", name: "Sobre " + MARCA, url: SITIO + r, isPartOf: { "@id": WEB_ID }, about: { "@id": ORG_ID } }],
    cuerpo
  }), { prioridad: "0.7" });
});

/* =========================================================
   7. Portada (index.html de la copia publicada)
   ========================================================= */
function datosEstructuradosBase() {
  const sameAs = REDES.map((r) => r.url);
  const org = {
    "@context": "https://schema.org", "@type": "Organization", "@id": ORG_ID,
    name: MARCA, alternateName: ["AYM Universe", "A y M Universe", "AM Universe", "aymuniverse"],
    url: SITIO + "/", logo: SITIO + "/assets/icon-512.png", image: SITIO + "/assets/og-image.png",
    slogan: "Diseño con propósito",
    description: "Marca colombiana de camisetas estampadas de animales con propósito, con sede en " + LUGAR + ". Parte de cada venta ayuda a los animales de la calle.",
    email: CORREO || undefined, telephone: "+" + WA,
    address: { "@type": "PostalAddress", addressLocality: "Calarcá", addressRegion: "Quindío", addressCountry: "CO" },
    areaServed: { "@type": "Country", name: "Colombia" },
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", telephone: "+" + WA, email: CORREO || undefined, availableLanguage: ["es"], areaServed: "CO" }],
    sameAs
  };
  const tienda = {
    "@context": "https://schema.org", "@type": ["ClothingStore", "OnlineStore"], "@id": STORE_ID,
    name: MARCA, alternateName: ["AYM Universe", "A y M Universe"],
    description: "Tienda en línea de camisetas estampadas con propósito: colecciones Océano y Felina en Regular fit y Oversized, y básicos Esenciales. Envíos a toda Colombia desde " + LUGAR + ".",
    url: SITIO + "/", image: SITIO + "/assets/og-image.png", logo: SITIO + "/assets/icon-512.png",
    slogan: "Diseño con propósito",
    priceRange: P_MIN ? pesos(P_MIN) + " - " + pesos(P_MAX) : "$",
    currenciesAccepted: "COP",
    paymentAccepted: listaHumana(METODOS_PAGO),
    email: CORREO || undefined, telephone: "+" + WA,
    address: { "@type": "PostalAddress", addressLocality: "Calarcá", addressRegion: "Quindío", addressCountry: "CO" },
    geo: { "@type": "GeoCoordinates", latitude: 4.5254, longitude: -75.6444 },
    areaServed: { "@type": "Country", name: "Colombia" },
    parentOrganization: { "@id": ORG_ID },
    sameAs
  };
  const web = {
    "@context": "https://schema.org", "@type": "WebSite", "@id": WEB_ID,
    name: MARCA, alternateName: ["AYM Universe", "aymuniverse.com"], url: SITIO + "/",
    inLanguage: "es-CO", publisher: { "@id": ORG_ID }
  };
  return { org, tienda, web };
}

function tarjetaPortada(p) {
  return '<article class="product' + (p.disponible ? "" : " is-soldout") + '">' +
    '<a class="product-media" href="' + p.url + '"><img src="' + esc(encodeURI(p.fotos[0])) + '" alt="' + esc(etiquetaProducto(p)) + '" loading="lazy" width="260" height="288"></a>' +
    '<span class="tag' + (p.disponible ? " tag-live" : "") + '">' + (p.disponible ? "Disponible" : "Agotado") + "</span>" +
    '<h3 class="product-name"><a href="' + p.url + '">' + esc(p.nombre) + "</a></h3>" +
    '<p class="product-desc">' + esc(recortar(p.desc, 140)) + "</p>" +
    '<div class="product-buy"><span class="product-price">' + pesos(p.precio) + "</span></div>" +
  "</article>";
}

function portada(html) {
  const base = datosEstructuradosBase();
  const reemplazarLD = (h, id, obj) => {
    const re = new RegExp('(<script type="application/ld\\+json" id="' + id + '"[^>]*>)[\\s\\S]*?(</script>)');
    if (!re.test(h)) { avisar("No encontré el bloque " + id + " en index.html"); return h; }
    return h.replace(re, (m, a, b) => a + "\n" + JSON.stringify(obj, null, 2).replace(/</g, "\\u003c") + "\n    " + b);
  };
  html = reemplazarLD(html, "ld-store", base.tienda);
  html = reemplazarLD(html, "ld-org", base.org);
  html = reemplazarLD(html, "ld-products", listaLD("Camisetas de " + MARCA, CATALOGO));
  // marca para que js/shop.js no lo reemplace por una versión con menos datos
  html = html.replace('id="ld-products"', 'id="ld-products" data-generado="1"');
  if (html.indexOf('id="ld-website"') < 0) {
    html = html.replace("</head>", '<script type="application/ld+json" id="ld-website">' + JSON.stringify(base.web) + "</script>\n</head>");
  }
  // FAQ de la portada: la misma lista completa
  html = reemplazarLD(html, "faq-jsonld", { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((q) => ({ "@type": "Question", name: q.q, acceptedAnswer: { "@type": "Answer", text: q.a } })) });

  // Tarjetas estáticas dentro de cada cuadrícula (js/shop.js las reemplaza al cargar)
  const porGrid = {};
  for (const p of CATALOGO) {
    const grids = p.espacio === "esenciales" ? ["esenciales-grid"] : [p.coleccion + "-" + p.fit + "-grid"];
    for (const g of grids) (porGrid[g] = porGrid[g] || []).push(p);
  }
  for (const [g, lista] of Object.entries(porGrid)) {
    const re = new RegExp('(<div class="shop-grid" id="' + g + '">)(</div>)');
    if (re.test(html)) html = html.replace(re, (m, a, b) => a + lista.map(tarjetaPortada).join("") + b);
  }
  // Redes en el pie (sin esperar a JavaScript)
  return html;
}

/* =========================================================
   8. Archivos para buscadores e IA
   ========================================================= */
function xmlEsc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }

function feedMerchant() {
  const items = [];
  for (const p of CATALOGO) {
    const variantes = p.colores.length ? p.colores : [{ nombre: "", fotos: p.fotos }];
    for (const c of variantes) {
      for (const talla of TALLAS_TXT) {
        let id = slug(p.slug + "-" + (c.nombre || "unico") + "-" + talla);
        if (id.length > 50) id = id.slice(0, 41) + "-" + crypto.createHash("sha1").update(id).digest("hex").slice(0, 8);
        const fotos = c.fotos.concat(p.fotos.filter((f) => !c.fotos.includes(f)));
        items.push(`<item>
<g:id>${xmlEsc(id)}</g:id>
<g:item_group_id>${xmlEsc(p.slug)}</g:item_group_id>
<g:title>${xmlEsc((etiquetaProducto(p) + " " + MARCA + (c.nombre ? " - " + c.nombre : "") + " - Talla " + talla).slice(0, 150))}</g:title>
<g:description>${xmlEsc((p.descLarga || p.desc).slice(0, 5000))}</g:description>
<g:link>${xmlEsc(SITIO + p.url)}</g:link>
<g:image_link>${xmlEsc(abs(fotos[0]))}</g:image_link>
${fotos.slice(1, 11).map((f) => "<g:additional_image_link>" + xmlEsc(abs(f)) + "</g:additional_image_link>").join("\n")}
<g:availability>${p.disponible ? "in_stock" : "out_of_stock"}</g:availability>
<g:price>${p.precio} COP</g:price>
<g:brand>${xmlEsc(MARCA)}</g:brand>
<g:condition>new</g:condition>
<g:identifier_exists>no</g:identifier_exists>
<g:google_product_category>212</g:google_product_category>
<g:product_type>${xmlEsc("Camisetas > " + (p.coleccion ? "Colección " + COLECCIONES[p.coleccion].nombre : "Esenciales") + " > " + horma(p))}</g:product_type>
<g:gender>unisex</g:gender>
<g:age_group>adult</g:age_group>
${c.nombre ? "<g:color>" + xmlEsc(c.nombre) + "</g:color>" : ""}
<g:size>${xmlEsc(talla)}</g:size>
${/algod[oó]n/i.test(p.descLarga + p.desc) ? "<g:material>Algodón</g:material>" : ""}
</item>`.replace(/\n\n+/g, "\n"));
      }
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${xmlEsc(MARCA)} · Camisetas</title>
<link>${xmlEsc(SITIO + "/")}</link>
<description>${xmlEsc("Camisetas estampadas con propósito. Envíos a toda Colombia.")}</description>
${items.join("\n")}
</channel>
</rss>
`;
}

function llms(completo) {
  const lineas = [];
  lineas.push("# " + MARCA);
  lineas.push("");
  lineas.push("> " + MARCA + " (también escrita AYM Universe) es una marca colombiana de camisetas estampadas de animales con propósito, con sede en " + LUGAR + ", Colombia. Vende en línea en " + SITIO + "/ con envíos a toda Colombia. Parte de cada venta ayuda a los animales de la calle.");
  lineas.push("");
  lineas.push("## Datos clave");
  lineas.push("- Productos: " + CATALOGO.length + " camisetas estampadas — colección Océano (vida marina), colección Felina (gatos y grandes felinos) y Esenciales (básicos).");
  lineas.push("- Hormas: Regular fit y Oversized. Tallas: " + TALLAS_TXT.join(", ") + ".");
  if (P_MIN) lineas.push("- Precios: desde " + pesos(P_MIN) + (P_MAX > P_MIN ? " hasta " + pesos(P_MAX) : "") + " COP.");
  lineas.push("- Pagos: " + listaHumana(METODOS_PAGO) + ".");
  lineas.push("- Envíos: a todas las ciudades de Colombia desde " + LUGAR + ".");
  lineas.push("- Cómo comprar: carrito en " + SITIO + "/ que envía el pedido por WhatsApp, o directamente por WhatsApp al +" + WA + ".");
  if (CORREO) lineas.push("- Correo: " + CORREO);
  for (const r of REDES) lineas.push("- " + r.nombre + ": " + r.url);
  lineas.push("");
  lineas.push("## Páginas principales");
  lineas.push("- [Tienda](" + SITIO + "/): tienda en línea con carrito");
  lineas.push("- [Todas las camisetas](" + SITIO + "/camisetas/): catálogo completo con precios");
  lineas.push("- [Colección Océano](" + SITIO + "/coleccion/oceano/): camisetas de ballenas, orcas, tiburones, mantarrayas y vida marina");
  lineas.push("- [Colección Felina](" + SITIO + "/coleccion/felina/): camisetas de gatos, leones, jaguares y tigres");
  lineas.push("- [Esenciales](" + SITIO + "/esenciales/): camisetas básicas");
  lineas.push("- [Guía de tallas](" + SITIO + "/guia-de-tallas/): medidas en cm");
  lineas.push("- [Cómo comprar](" + SITIO + "/como-comprar/): pagos, envíos y cambios");
  lineas.push("- [Preguntas frecuentes](" + SITIO + "/preguntas-frecuentes/)");
  lineas.push("- [Nosotros](" + SITIO + "/nosotros/): la marca y su propósito");
  lineas.push("- [Políticas y términos](" + SITIO + "/politicas.html)");
  lineas.push("");
  lineas.push("## Camisetas");
  for (const p of CATALOGO) {
    const donde = p.coleccion ? "Colección " + COLECCIONES[p.coleccion].nombre : "Esenciales";
    if (completo) {
      lineas.push("");
      lineas.push("### " + etiquetaProducto(p));
      lineas.push("- URL: " + SITIO + p.url);
      lineas.push("- " + donde + " · " + horma(p) + " · " + pesos(p.precio) + " COP · " + (p.disponible ? "disponible" : "agotada"));
      if (p.colores.length) lineas.push("- Colores: " + p.colores.map((c) => c.nombre).join(", "));
      lineas.push("- Tallas: " + TALLAS_TXT.join(", "));
      lineas.push("");
      lineas.push(p.descLarga || p.desc);
    } else {
      lineas.push("- [" + etiquetaProducto(p) + "](" + SITIO + p.url + "): " + donde + ", " + horma(p) + ", " + pesos(p.precio) + " COP" + (p.disponible ? "" : " (agotada)"));
    }
  }
  if (completo) {
    lineas.push("");
    lineas.push("## Guía de tallas (cm)");
    for (const k of ["regular", "oversized"]) {
      const filas = Array.isArray(TALLAS[k]) ? TALLAS[k].filter((f) => f && f.talla) : [];
      if (!filas.length) continue;
      lineas.push("");
      lineas.push("### " + (k === "oversized" ? "Oversized" : "Regular fit"));
      lineas.push("| Talla | Pecho | Largo | Hombro |");
      lineas.push("|---|---|---|---|");
      for (const f of filas) lineas.push("| " + [f.talla, f.pecho, f.largo, f.hombro].map((x) => plano(String(x))).join(" | ") + " |");
    }
    lineas.push("");
    lineas.push("## Preguntas frecuentes");
    for (const q of FAQ) { lineas.push(""); lineas.push("### " + q.q); lineas.push(q.a); }
    const prop = [T("proposito", "texto_es"), T("impacto", "texto_es")].map(plano).filter(Boolean);
    if (prop.length) { lineas.push(""); lineas.push("## Propósito"); for (const t of prop) { lineas.push(""); lineas.push(t); } }
  } else {
    lineas.push("");
    lineas.push("## Más detalle");
    lineas.push("- [llms-full.txt](" + SITIO + "/llms-full.txt): catálogo completo con descripciones, tallas y preguntas frecuentes");
    lineas.push("- [Feed de productos](" + SITIO + "/feed/google-merchant.xml): todas las variantes con precio y disponibilidad");
  }
  return lineas.join("\n") + "\n";
}

/* =========================================================
   9. Publicar todo
   ========================================================= */
function escribir(rel, contenido) {
  const destino = path.join(SALIDA, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, contenido);
}
function fechaGit(...archivos) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...archivos], { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return out || "";
  } catch (e) { return ""; }
}

function principal() {
  const inicio = Date.now();
  // La copia es lo único imprescindible: sin ella no hay sitio.
  fs.rmSync(SALIDA, { recursive: true, force: true });
  copiar(RAIZ, SALIDA, 0);
  console.log("Copia del sitio lista en " + path.relative(RAIZ, SALIDA));

  seguro("Portada", () => escribir("index.html", portada(fs.readFileSync(path.join(SALIDA, "index.html"), "utf8"))));
  for (const pg of PAGINAS) seguro("Escribir " + pg.ruta, () => escribir(pg.ruta.replace(/^\//, "") + "index.html", pg.html));

  seguro("Direcciones de camisetas", () => {
    const mapa = {};
    for (const p of CATALOGO) mapa[p.id] = p.url;
    escribir("data/urls.json", JSON.stringify(mapa, null, 1));
  });
  seguro("Feed de Google Merchant", () => escribir("feed/google-merchant.xml", feedMerchant()));
  seguro("llms.txt", () => { escribir("llms.txt", llms(false)); escribir("llms-full.txt", llms(true)); });

  /* Fechas de cambio por página: solo cambia la fecha si cambió la página.
     El estado anterior viene de la publicación previa (/seo/estado.json). */
  seguro("Sitemap", () => {
    let previo = {};
    if (PREVIO) { try { previo = JSON.parse(fs.readFileSync(PREVIO, "utf8")).paginas || {}; } catch (e) { previo = {}; } }
    const ahora = new Date().toISOString().replace(/\.\d+Z$/, "+00:00");
    const portadaHtml = fs.readFileSync(path.join(SALIDA, "index.html"), "utf8");
    const polHtml = fs.existsSync(path.join(SALIDA, "politicas.html")) ? fs.readFileSync(path.join(SALIDA, "politicas.html"), "utf8") : "";
    const todas = [
      { ruta: "/", html: portadaHtml, prioridad: "1.0", imagenes: CATALOGO.slice(0, 30).map((p) => ({ loc: abs(p.fotos[0]), titulo: etiquetaProducto(p) })), git: fechaGit("index.html", "data") },
      ...PAGINAS,
      ...(polHtml ? [{ ruta: "/politicas.html", html: polHtml, prioridad: "0.3", git: fechaGit("politicas.html", "data/negocio.json") }] : [])
    ];
    const estado = {}, cambiadas = [];
    for (const pg of todas) {
      const url = SITIO + pg.ruta;
      // La huella ignora el año del pie para que no cambie todo el 1 de enero
      const h = crypto.createHash("sha1").update(pg.html.replace(/©\s*\d{4}/g, "")).digest("hex").slice(0, 16);
      const ant = previo[url];
      let lastmod;
      if (ant && ant.h === h && ant.lastmod) lastmod = ant.lastmod;
      else { lastmod = (!ant && pg.git) ? pg.git : ahora; cambiadas.push(url); }
      estado[url] = { h, lastmod };
      pg._lastmod = lastmod;
    }
    const xml = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'];
    for (const pg of todas) {
      xml.push("  <url>");
      xml.push("    <loc>" + xmlEsc(SITIO + pg.ruta) + "</loc>");
      xml.push("    <lastmod>" + pg._lastmod + "</lastmod>");
      xml.push("    <priority>" + (pg.prioridad || "0.5") + "</priority>");
      for (const im of (pg.imagenes || []).slice(0, 30)) {
        xml.push("    <image:image><image:loc>" + xmlEsc(im.loc) + "</image:loc></image:image>");
      }
      xml.push("  </url>");
    }
    xml.push("</urlset>");
    escribir("sitemap.xml", xml.join("\n") + "\n");
    escribir("seo/estado.json", JSON.stringify({ generado: ahora, paginas: estado }, null, 1));

    // IndexNow (Bing, Yandex, Seznam… y de ahí ChatGPT): solo lo que cambió
    if (INDEXNOW) {
      const clave = fs.readdirSync(RAIZ).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
      if (clave && cambiadas.length) {
        const key = clave.replace(/\.txt$/, "");
        const extras = [SITIO + "/sitemap.xml", SITIO + "/llms.txt", SITIO + "/llms-full.txt"];
        fs.writeFileSync(INDEXNOW, JSON.stringify({ host: HOST, key, keyLocation: SITIO + "/" + clave, urlList: cambiadas.concat(extras).slice(0, 10000) }));
        console.log("IndexNow: " + cambiadas.length + " página(s) nuevas o cambiadas");
      } else {
        try { fs.unlinkSync(INDEXNOW); } catch (e) {}
        console.log("IndexNow: nada nuevo que avisar");
      }
    }
  });

  console.log("\n" + CATALOGO.length + " camisetas · " + PAGINAS.length + " páginas generadas · " + ((Date.now() - inicio) / 1000).toFixed(1) + " s");
  if (avisos.length) console.log(avisos.length + " aviso(s); el sitio se publica igual.");
}

try { principal(); }
catch (e) {
  // Solo llega aquí si falló la copia del sitio: eso sí debe detener la publicación.
  console.error("::error::No se pudo preparar el sitio: " + (e && e.stack ? e.stack : e));
  process.exit(1);
}
