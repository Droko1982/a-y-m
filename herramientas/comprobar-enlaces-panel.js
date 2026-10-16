/* =========================================================
   A&M Universe · comprobar los enlaces directos del panel
   ---------------------------------------------------------
   ENLACES-DIRECTOS.md lleva enlaces que abren cada sección
   del panel de una sola vez. Se construyen con los nombres
   de admin/config.yml, así que si una sección se renombra
   los enlaces quedan apuntando a un sitio que no existe y
   nadie se entera hasta que una dueña los toca.

   Esto compara los dos y avisa. Uso:
     node herramientas/comprobar-enlaces-panel.js
   ========================================================= */
"use strict";

var fs = require("fs");
var path = require("path");
var yaml = require("js-yaml");

var RAIZ = path.resolve(__dirname, "..");
var cfg = yaml.load(fs.readFileSync(path.join(RAIZ, "admin/config.yml"), "utf8"));
var doc = fs.readFileSync(path.join(RAIZ, "ENLACES-DIRECTOS.md"), "utf8");

var fallos = 0;
var esperados = [];

/* Un enlace por cada archivo de cada sección (Productos tiene tres:
   Regular fit, Oversized y Esenciales). */
cfg.collections.forEach(function (col) {
  if (!col.files || !col.files.length) {
    console.log("  · " + col.name + ": no tiene archivos, no lleva enlace directo");
    return;
  }
  col.files.forEach(function (f) {
    esperados.push("#/collections/" + col.name + "/entries/" + f.name);
  });
});

console.log("Secciones con enlace directo: " + esperados.length);
esperados.forEach(function (ruta) {
  var veces = doc.split(ruta).length - 1;
  if (veces === 0) {
    console.log("  ✗ FALTA en ENLACES-DIRECTOS.md: " + ruta);
    fallos++;
  } else {
    console.log("  ✓ " + ruta + "  (" + veces + " veces)");
  }
});

/* Al revés: que el documento no tenga enlaces a secciones que ya no existen */
var enElDoc = (doc.match(/#\/collections\/[A-Za-z0-9_-]+\/entries\/[A-Za-z0-9_-]+/g) || []);
enElDoc.filter(function (r, i, a) { return a.indexOf(r) === i; }).forEach(function (r) {
  if (esperados.indexOf(r) < 0) {
    console.log("  ✗ SOBRA (apunta a algo que ya no existe): " + r);
    fallos++;
  }
});

console.log(fallos
  ? "\n" + fallos + " problema(s): los enlaces y el panel no coinciden.\n"
  : "\nTodos los enlaces directos coinciden con el panel.\n");
process.exit(fallos ? 1 : 0);
