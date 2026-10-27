/* =========================================================
   A&M Universe · aligerar las fotos de las camisetas
   ---------------------------------------------------------
   Los mockups llegan como PNG de 4320 x 5400 px (3 a 7 MB
   cada uno). En el celular no alcanzan a cargar y parece
   que la foto "no aparece".

   Esto recorre las fotos que usan los datos (data/*.json),
   convierte a WebP (máx. 1600 px de lado) las que pesan más
   de 400 KB o miden más de 1600 px, cambia la ruta en los
   datos y borra el original si ya nadie lo usa.

   El panel ya convierte solo las fotos nuevas al subirlas
   (admin/config.yml → media_libraries). Esto es para las
   que se subieron antes, o si alguna se cuela.

   Uso:
     npm install sharp        (solo la primera vez)
     node herramientas/optimizar-fotos.js            (hace los cambios)
     node herramientas/optimizar-fotos.js --revisar  (solo cuenta)
   ========================================================= */
"use strict";

var sharp = require("sharp");
var fs = require("fs");
var path = require("path");

var RAIZ = path.resolve(__dirname, "..");
var DATOS = path.join(RAIZ, "data");
var SOLO_REVISAR = process.argv.indexOf("--revisar") >= 0;

var LADO_MAX = 1600;          // igual que el panel
var CALIDAD = 82;             // igual que el panel
var PESO_MAX = 400 * 1024;    // por debajo de esto, y de 1600 px, se deja igual
var RASTER = /\.(png|jpe?g|webp)$/i;
var RUTA = /^\/?assets\/.+\.(png|jpe?g|webp)$/i;

/* Mismo criterio que el panel (slugify_filename): sin espacios, tildes ni
   símbolos. "Mi Foto Azul (2).png" → "mi-foto-azul-2" */
function slug(nombre) {
  return nombre.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "foto";
}

function kb(n) { return Math.round(n / 1024) + " KB"; }
function mb(n) { return (n / 1048576).toFixed(1) + " MB"; }

/* Todas las cadenas "assets/…" de un JSON, en cualquier nivel */
function rutasDe(valor, salida) {
  if (typeof valor === "string") { if (RUTA.test(valor.trim())) salida.push(valor); }
  else if (Array.isArray(valor)) valor.forEach(function (v) { rutasDe(v, salida); });
  else if (valor && typeof valor === "object") Object.keys(valor).forEach(function (k) { rutasDe(valor[k], salida); });
  return salida;
}

/* Archivos del repo donde puede aparecer el nombre de una foto (para no
   borrar un original que el sitio todavía usa en otra parte) */
function textosDelRepo() {
  var out = [];
  (function andar(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
      if (d.name === ".git" || d.name === "node_modules" || d.name === "assets") return;
      var p = path.join(dir, d.name);
      if (d.isDirectory()) andar(p);
      else if (/\.(html|css|js|json|ya?ml|md|webmanifest|xml|txt)$/i.test(d.name)) out.push(p);
    });
  })(RAIZ);
  return out;
}

async function main() {
  var archivos = fs.readdirSync(DATOS).filter(function (f) { return /\.json$/i.test(f); });
  var crudo = {};
  var porArchivo = {};   // ruta tal cual en el JSON → [archivos que la usan]
  archivos.forEach(function (f) {
    crudo[f] = fs.readFileSync(path.join(DATOS, f), "utf8");
    rutasDe(JSON.parse(crudo[f]), []).forEach(function (r) {
      (porArchivo[r] = porArchivo[r] || []).push(f);
    });
  });

  var cambios = {};      // ruta vieja (tal cual) → ruta nueva (tal cual)
  var faltan = [];
  var antes = 0, despues = 0, convertidas = 0;
  var hechas = {};       // archivo de origen → archivo WebP, si ya se convirtió

  var rutas = Object.keys(porArchivo);
  for (var i = 0; i < rutas.length; i++) {
    var r = rutas[i];
    var barra = r.trim().charAt(0) === "/";
    var rel = r.trim().replace(/^\//, "");
    var abs = path.join(RAIZ, rel);
    if (!fs.existsSync(abs)) { faltan.push(r + "  (en " + porArchivo[r].join(", ") + ")"); continue; }
    if (!RASTER.test(abs)) continue;

    var peso = fs.statSync(abs).size;
    var meta = await sharp(abs).metadata();
    var grande = Math.max(meta.width || 0, meta.height || 0) > LADO_MAX;
    if (peso <= PESO_MAX && !grande) continue;

    var dir = path.dirname(rel);
    var destRel = hechas[abs];
    if (!destRel) {
      var base = slug(path.basename(rel, path.extname(rel)));
      destRel = dir + "/" + base + ".webp";
      for (var n = 2; fs.existsSync(path.join(RAIZ, destRel)) && path.join(RAIZ, destRel) !== abs; n++) {
        destRel = dir + "/" + base + "-" + n + ".webp";
      }
      if (path.join(RAIZ, destRel) === abs) {
        /* Ya era un WebP con buen nombre, solo pesado: se rehace en su sitio */
        destRel = dir + "/" + base + "-liviana.webp";
      }
      var destAbs = path.join(RAIZ, destRel);
      if (!SOLO_REVISAR) {
        await sharp(abs).rotate()
          .resize({ width: LADO_MAX, height: LADO_MAX, fit: "inside", withoutEnlargement: true })
          .webp({ quality: CALIDAD, alphaQuality: 90, effort: 5 })
          .toFile(destAbs);
        despues += fs.statSync(destAbs).size;
      }
      hechas[abs] = destRel;
      antes += peso;
      convertidas++;
      console.log("  " + (SOLO_REVISAR ? "· " : "✓ ") + rel + "  " + kb(peso) +
        (SOLO_REVISAR ? "" : "  →  " + path.basename(destRel) + "  " + kb(fs.statSync(destAbs).size)));
    }
    cambios[r] = (barra ? "/" : "") + destRel;
  }

  if (!SOLO_REVISAR) {
    /* Cambiar las rutas en los datos, sobre el texto, para no tocar el
       formato con el que guarda el panel */
    archivos.forEach(function (f) {
      var s = crudo[f];
      Object.keys(cambios).forEach(function (viejo) {
        s = s.split(JSON.stringify(viejo)).join(JSON.stringify(cambios[viejo]));
      });
      if (s !== crudo[f]) {
        JSON.parse(s);   // si algo quedó mal, que falle aquí y no en la tienda
        fs.writeFileSync(path.join(DATOS, f), s);
      }
    });

    /* Borrar los originales que ya nadie usa */
    var repo = textosDelRepo().map(function (p) { return fs.readFileSync(p, "utf8"); }).join("\n");
    Object.keys(hechas).forEach(function (abs) {
      var rel = path.relative(RAIZ, abs).split(path.sep).join("/");
      var nombre = path.basename(rel);
      var usado = repo.indexOf(nombre) >= 0 || repo.indexOf(encodeURI(nombre)) >= 0;
      if (usado) console.log("  · se deja " + rel + " (todavía se usa en otra parte)");
      else fs.unlinkSync(abs);
    });
  }

  console.log("");
  console.log(SOLO_REVISAR
    ? convertidas + " fotos por aligerar (" + mb(antes) + ")."
    : convertidas + " fotos aligeradas: " + mb(antes) + " → " + mb(despues) + ".");
  if (faltan.length) {
    console.log("");
    console.log("OJO, estas fotos están en los datos pero el archivo no existe:");
    faltan.forEach(function (f) { console.log("  ✗ " + f); });
  }
}

main().catch(function (e) { console.error(e); process.exit(1); });
