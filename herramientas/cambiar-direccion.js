/* =========================================================
   A&M Universe · cambiar la dirección de la tienda
   ---------------------------------------------------------
   Cuando la tienda se mude a otra cuenta de GitHub o a un
   dominio propio, hay 27 direcciones escritas a mano en 5
   archivos. Olvidar una no rompe nada a la vista: deja un
   canonical, un og:url o unos datos estructurados apuntando
   al sitio viejo, y eso solo se nota semanas después en
   Google. Esto lo hace de una vez y avisa si queda alguna.

   USO (desde la raíz del repositorio):
     node herramientas/cambiar-direccion.js --sitio=https://aymuniverse.github.io/a-y-m/ --repo=aymuniverse/a-y-m
     node herramientas/cambiar-direccion.js --sitio=https://aymuniverse.co/ --repo=aymuniverse/a-y-m

   Añade --revisar para ver qué cambiaría sin tocar nada.
   ========================================================= */
"use strict";

var fs = require("fs");
var path = require("path");

var RAIZ = path.resolve(__dirname, "..");

/* Archivos que llevan la dirección escrita a mano */
var ARCHIVOS = ["index.html", "politicas.html", "sitemap.xml", "robots.txt", "admin/config.yml"];

function arg(nombre) {
  var m = process.argv.slice(2).find(function (a) { return a.indexOf("--" + nombre + "=") === 0; });
  return m ? m.split("=").slice(1).join("=") : null;
}
var revisar = process.argv.indexOf("--revisar") >= 0;

function salir(msg) {
  console.error("\n" + msg + "\n");
  console.error("Ejemplo:");
  console.error("  node herramientas/cambiar-direccion.js --sitio=https://aymuniverse.github.io/a-y-m/ --repo=aymuniverse/a-y-m\n");
  process.exit(1);
}

/* ---------- Lo que hay hoy ---------- */
function detectarActual() {
  var html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
  var m = html.match(/<link rel="canonical" href="([^"]+)"/i);
  if (!m) salir("No encontré el <link rel=\"canonical\"> en index.html: revisa el archivo a mano.");
  return m[1].replace(/[^/]*$/, ""); // hasta la última barra
}
function detectarRepo() {
  var y = fs.readFileSync(path.join(RAIZ, "admin/config.yml"), "utf8");
  var m = y.match(/^\s*repo:\s*([^\s#]+)/m);
  return m ? m[1] : null;
}

var SITIO_VIEJO = detectarActual();
var REPO_VIEJO = detectarRepo();

var sitio = arg("sitio");
var repo = arg("repo");

if (!sitio) salir("Falta --sitio con la dirección nueva de la tienda.");
if (!/^https:\/\/[^\s"']+$/.test(sitio)) salir("La dirección debe empezar por https:// y no llevar espacios.\n  Recibí: " + sitio);
if (sitio.slice(-1) !== "/") sitio += "/";
if (repo && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) salir("El repositorio debe tener la forma dueño/repositorio.\n  Recibí: " + repo);

console.log("\nDirección actual : " + SITIO_VIEJO);
console.log("Dirección nueva  : " + sitio);
if (repo) console.log("Repositorio      : " + REPO_VIEJO + "  →  " + repo);
if (revisar) console.log("\n(modo revisión: no se va a escribir nada)");
console.log("");

if (sitio === SITIO_VIEJO && (!repo || repo === REPO_VIEJO)) {
  console.log("No hay nada que cambiar: ya está todo en esa dirección.\n");
  process.exit(0);
}

/* ---------- El cambio ---------- */
var totalCambios = 0;
var fallos = 0;

ARCHIVOS.forEach(function (rel) {
  var abs = path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) { console.log("  · " + rel + " — no existe, se salta"); return; }
  var antes = fs.readFileSync(abs, "utf8");
  var despues = antes.split(SITIO_VIEJO).join(sitio);
  /* El dominio suelto (sin la ruta) aparece en ALLOWED_DOMAINS y algún comentario */
  var dominioViejo = SITIO_VIEJO.replace(/^https:\/\//, "").replace(/\/.*$/, "");
  var dominioNuevo = sitio.replace(/^https:\/\//, "").replace(/\/.*$/, "");
  if (dominioViejo !== dominioNuevo) despues = despues.split(dominioViejo).join(dominioNuevo);
  if (repo && REPO_VIEJO) despues = despues.split(REPO_VIEJO).join(repo);

  var n = 0, i = 0;
  while ((i = antes.indexOf(SITIO_VIEJO, i)) >= 0) { n++; i += SITIO_VIEJO.length; }
  if (despues === antes) { console.log("  · " + rel + " — sin cambios"); return; }
  if (!revisar) fs.writeFileSync(abs, despues, "utf8");
  totalCambios += n;
  console.log("  ✔ " + rel + " — " + n + " dirección(es)" + (revisar ? " (no escrito)" : ""));
});

/* ---------- Comprobación: que no quede nada del sitio viejo ---------- */
console.log("");
if (!revisar) {
  var dominioViejo = SITIO_VIEJO.replace(/^https:\/\//, "").replace(/\/.*$/, "");
  var dominioNuevo = sitio.replace(/^https:\/\//, "").replace(/\/.*$/, "");
  ARCHIVOS.concat(["js/shop.js", "js/main.js", "js/cart.js", "js/redes.js", "js/impacto.js", "js/textos.js", "js/politicas.js", "404.html", "manifest.json"])
    .forEach(function (rel) {
      var abs = path.join(RAIZ, rel);
      if (!fs.existsSync(abs)) return;
      var t = fs.readFileSync(abs, "utf8");
      if (dominioViejo !== dominioNuevo && t.indexOf(dominioViejo) >= 0) {
        console.log("  ⚠ QUEDA la dirección vieja en " + rel);
        fallos++;
      }
    });
}

console.log(fallos
  ? "\n" + fallos + " archivo(s) siguen apuntando al sitio viejo: revísalos a mano.\n"
  : "\n" + totalCambios + " direcciones actualizadas." + (revisar ? " (revisión, no se escribió nada)" : "") + "\n");

if (!revisar && !fallos) {
  console.log("Falta todavía, y esto NO lo hace este script:");
  console.log("  1. Activar GitHub Pages en el repositorio nuevo.");
  console.log("  2. Crear la App OAuth de GitHub con el callback del Worker.");
  console.log("  3. Poner ALLOWED_DOMAINS=" + sitio.replace(/^https:\/\//, "").replace(/\/.*$/, "") + " en el Worker de Cloudflare.");
  console.log("  4. Pegar la URL del Worker en admin/config.yml → base_url.");
  console.log("  5. Agregar a cada dueña como colaboradora del repositorio.");
  console.log("  Ver MUDANZA-DE-CUENTA.md\n");
}
process.exit(fallos ? 1 : 0);
