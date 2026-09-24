/* =========================================================
   A&M Universe · rehacer el logo y todos los iconos
   ---------------------------------------------------------
   Parte de un solo archivo, el original de la marca:
       assets/marca/logo-original.png
   y de ahí salen las dos versiones del logo (para fondo
   claro y oscuro), los iconos cuadrados, el apple-touch y
   el favicon.ico.

   Uso:
     npm install sharp        (solo la primera vez)
     node herramientas/generar-logos.js

   Si algún día cambia el logo, se reemplaza ese archivo
   original y se vuelve a correr esto. No hay que tocar el
   sitio: todos los nombres de archivo se mantienen.
   ========================================================= */
"use strict";

var sharp = require("sharp");
var fs = require("fs");
var path = require("path");

var RAIZ = path.resolve(__dirname, "..");
var SRC = path.join(RAIZ, "assets/marca/logo-original.png");
var A = function () {
  return path.join.apply(null, [RAIZ, "assets"].concat([].slice.call(arguments)));
};

/* Paleta real del sitio (css/styles.css) */
var MARRON = { r: 0x58, g: 0x38, b: 0x28 };   // el del propio logo
var CREMA  = { r: 0xF4, g: 0xEF, b: 0xE3 };   // --on-alt, para el tema oscuro
var MARFIL = { r: 0xF6, g: 0xF2, b: 0xEA };   // --bg, fondo de los iconos

/* El gato solo, medido sobre el original (2588x763).
   OJO: hay que cortar antes de x=815 o se cuela la "U" de UNIVERSE, que
   empieza ahí en la banda inferior. El dibujo del gato termina en x=741. */
var GATO = { left: 0, top: 1, width: 815, height: 695 };

var ANCHO_LOGO = 640;   // a 54px de alto en pantalla, cubre pantallas 3x
var ANCHO_OG = 900;     // el logo suelto para la imagen de compartir

/* Pinta la silueta (el canal alfa del original) de un color plano.
   Funciona porque el original es marrón sobre transparente, sin blancos
   opacos: el alfa sirve de máscara. */
async function recolorear(entrada, color) {
  var img = sharp(entrada).ensureAlpha();
  var meta = await img.metadata();
  var alfa = await img.clone().extractChannel("alpha").toBuffer();
  return sharp({
    create: {
      width: meta.width, height: meta.height, channels: 3,
      background: { r: color.r, g: color.g, b: color.b }
    }
  })
    .joinChannel(alfa)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

(async function () {
  if (!fs.existsSync(SRC)) {
    console.error("No encuentro el original: assets/marca/logo-original.png");
    process.exit(1);
  }

  var hecho = [];
  var reg = function (f) {
    hecho.push([path.relative(RAIZ, f).replace(/\\/g, "/"), fs.statSync(f).size]);
  };

  /* ---------- 1. Logo completo, claro y oscuro ---------- */
  var variantes = [["logo-light.png", MARRON], ["logo-dark.png", CREMA]];
  for (var i = 0; i < variantes.length; i++) {
    var buf = await recolorear(SRC, variantes[i][1]);
    await sharp(buf).resize({ width: ANCHO_LOGO })
      .png({ compressionLevel: 9 }).toFile(A(variantes[i][0]));
    reg(A(variantes[i][0]));
  }
  var m = await sharp(A("logo-light.png")).metadata();
  console.log("LOGO: " + m.width + "x" + m.height +
    "  (proporción " + (m.width / m.height).toFixed(2) + ")");
  console.log("  → en el HTML: width=\"" + m.width + "\" height=\"" + m.height + "\"");

  /* ---------- 2. El gato, para los iconos cuadrados ---------- */
  /* Se deja el gato al 74% del lienzo: los iconos "maskable" de Android
     recortan un círculo y todo lo que importa debe caber dentro. */
  var gatoMarron = await sharp(await recolorear(SRC, MARRON)).extract(GATO).toBuffer();

  async function icono(tamano, archivo) {
    var dentro = Math.round(tamano * 0.74);
    var gato = await sharp(gatoMarron)
      .resize({
        width: dentro, height: dentro, fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();
    var out = await sharp({
      create: {
        width: tamano, height: tamano, channels: 4,
        background: { r: MARFIL.r, g: MARFIL.g, b: MARFIL.b, alpha: 1 }
      }
    })
      .composite([{ input: gato, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    if (archivo) { fs.writeFileSync(archivo, out); reg(archivo); }
    return out;
  }

  await icono(48, A("favicon-48.png"));
  await icono(180, A("apple-touch-icon.png"));
  await icono(192, A("icon-192.png"));
  await icono(512, A("icon-512.png"));

  /* ---------- 3. favicon.ico (un PNG dentro de un ICO) ---------- */
  /* sharp no escribe .ico, así que se arma a mano: cabecera de 6 bytes,
     una entrada de 16 y el PNG de 48px detrás. */
  var png48 = await icono(48, null);
  var cab = Buffer.alloc(6);
  cab.writeUInt16LE(0, 0); cab.writeUInt16LE(1, 2); cab.writeUInt16LE(1, 4);
  var ent = Buffer.alloc(16);
  ent.writeUInt8(48, 0); ent.writeUInt8(48, 1); ent.writeUInt8(0, 2); ent.writeUInt8(0, 3);
  ent.writeUInt16LE(1, 4); ent.writeUInt16LE(32, 6);
  ent.writeUInt32LE(png48.length, 8); ent.writeUInt32LE(22, 12);
  var ico = path.join(RAIZ, "favicon.ico");
  fs.writeFileSync(ico, Buffer.concat([cab, ent, png48]));
  reg(ico);

  /* ---------- 4. El logo suelto para la imagen de compartir ---------- */
  /* assets/og-image.png se compone aparte (herramientas/generar-og.js),
     que usa este archivo temporal. */
  var tmp = path.join(RAIZ, "assets/marca/logo-og.png");
  await sharp(await recolorear(SRC, MARRON)).resize({ width: ANCHO_OG })
    .png({ compressionLevel: 9 }).toFile(tmp);
  reg(tmp);

  console.log("\nARCHIVOS GENERADOS:");
  hecho.forEach(function (h) {
    console.log("  " + h[0].padEnd(34) + (h[1] / 1024).toFixed(0).padStart(4) + " KB");
  });

  /* Comprobación: el ICO debe empezar por su cabecera y llevar un PNG dentro */
  var leido = fs.readFileSync(ico);
  var okIco = leido.readUInt16LE(0) === 0 && leido.readUInt16LE(2) === 1 &&
    leido.slice(22, 26).toString("hex") === "89504e47";
  console.log("\nfavicon.ico válido (cabecera ICO + PNG dentro): " + (okIco ? "sí" : "NO"));
  process.exit(okIco ? 0 : 1);
})();
