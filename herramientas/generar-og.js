/* =========================================================
   A&M Universe · rehacer la imagen de compartir
   ---------------------------------------------------------
   assets/og-image.png es lo que se ve cuando alguien pega el
   enlace de la tienda en WhatsApp, Instagram o Facebook.

   Se compone en HTML y se fotografía la pantalla, para usar
   la tipografía real de la marca (Fraunces) en vez de dibujar
   el texto a mano.

   Uso:
     npm install sharp puppeteer      (solo la primera vez)
     node herramientas/generar-logos.js       ← primero este
     node herramientas/generar-og.js

   Necesita internet: las tipografías se bajan de Google Fonts.
   ========================================================= */
"use strict";

var fs = require("fs");
var os = require("os");
var http = require("http");
var path = require("path");
var sharp = require("sharp");
var puppeteer = require("puppeteer");

var RAIZ = path.resolve(__dirname, "..");
var LOGO = path.join(RAIZ, "assets/marca/logo-og.png");
var DESTINO = path.join(RAIZ, "assets/og-image.png");

/* Lo que dice la imagen. Si cambia el eslogan, se cambia aquí. */
var TITULO = "Diseño con propósito.";
var BAJADA = "Camisetas estampadas que cuentan historias y ayudan a los animales de la calle.";
var PIE = "Calarcá, Quindío · Colombia — envíos a todo el país";

/* Paleta real del sitio (css/styles.css, tema claro) */
var PAGINA = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500&display=swap">
<style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;
       background:#F6F2EA;                       /* --bg */
       font-family:'Inter',system-ui,sans-serif;
       color:#2E251C;                            /* --text */
       display:grid;place-items:center}
  .marco{position:absolute;inset:26px;border:1px solid rgba(46,37,28,.16)}
  .banda{position:absolute;left:0;right:0;bottom:0;height:64px;
         background:#5A6537}                     /* --olive */
  .banda p{color:#F4EFE3;font-size:19px;letter-spacing:.02em;
           height:64px;display:flex;align-items:center;justify-content:center}
  .centro{text-align:center;padding:0 90px 64px;position:relative;z-index:2}
  img{width:660px;height:auto;display:block;margin:0 auto 38px}
  h1{font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:52px;
     line-height:1.08;letter-spacing:-.015em;margin-bottom:18px}
  .lead{font-size:23px;line-height:1.5;color:#75664F;max-width:36rem;margin:0 auto}
</style></head><body>
  <div class="marco"></div>
  <div class="centro">
    <img src="logo.png" alt="">
    <h1>__TITULO__</h1>
    <p class="lead">__BAJADA__</p>
  </div>
  <div class="banda"><p>__PIE__</p></div>
</body></html>`;

(async function () {
  if (!fs.existsSync(LOGO)) {
    console.error("Falta " + path.relative(RAIZ, LOGO) +
      "\nCorre primero: node herramientas/generar-logos.js");
    process.exit(1);
  }

  /* Un servidor de un rato, para que el navegador cargue el logo sin
     problemas de permisos con file:// */
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), "aym-og-"));
  fs.copyFileSync(LOGO, path.join(dir, "logo.png"));
  fs.writeFileSync(path.join(dir, "index.html"), PAGINA
    .replace("__TITULO__", TITULO)
    .replace("__BAJADA__", BAJADA)
    .replace("__PIE__", PIE));

  var MIME = { ".html": "text/html; charset=utf-8", ".png": "image/png" };
  var server = http.createServer(function (q, s) {
    var u = decodeURIComponent(q.url.split("?")[0]);
    if (u === "/") u = "/index.html";
    fs.readFile(path.join(dir, u), function (e, d) {
      if (e) { s.writeHead(404); return s.end("404"); }
      s.writeHead(200, { "Content-Type": MIME[path.extname(u)] || "text/plain" });
      s.end(d);
    });
  });
  await new Promise(function (r) { server.listen(0, "127.0.0.1", r); });
  var base = "http://127.0.0.1:" + server.address().port + "/";

  var navegador = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--renderer-process-limit=1"]
  });
  try {
    var pag = await navegador.newPage();
    await pag.setViewport({ width: 1200, height: 630 });
    await pag.goto(base, { waitUntil: "networkidle0" });
    await pag.evaluate(function () { return document.fonts.ready; });
    /* Un respiro para que la tipografía acabe de pintar */
    await new Promise(function (r) { setTimeout(r, 800); });
    await pag.screenshot({ path: DESTINO });
  } finally {
    await navegador.close();
    server.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }

  /* La captura pesa de más para lo que es: se recomprime */
  var comprimida = await sharp(DESTINO)
    .png({ compressionLevel: 9, palette: true }).toBuffer();
  fs.writeFileSync(DESTINO, comprimida);

  var m = await sharp(DESTINO).metadata();
  console.log("assets/og-image.png · " + m.width + "x" + m.height + " · " +
    (fs.statSync(DESTINO).size / 1024).toFixed(0) + " KB");

  var ok = m.width === 1200 && m.height === 630;
  console.log(ok
    ? "Medida correcta (1200x630, la que esperan WhatsApp y Facebook)."
    : "OJO: debería medir 1200x630.");
  process.exit(ok ? 0 : 1);
})();
