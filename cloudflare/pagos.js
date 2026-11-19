/* =========================================================
   A&M Universe · servidor de pagos con Wompi (Cloudflare Worker)
   ---------------------------------------------------------
   La tienda es una página estática: la firma del pago no puede ir en ella
   (cualquiera vería el secreto y podría pagar $1.000 por un pedido de
   $200.000). Este Worker hace solo lo que necesita un servidor:

   POST /pagar             → recibe el carrito (id, talla, color, cantidad),
                             recalcula el total con el catálogo PUBLICADO
                             (data/tienda.json), guarda el pedido y devuelve la
                             dirección del checkout de Wompi ya firmada.
   POST /wompi/eventos     → Wompi avisa el resultado del pago. Se verifica la
                             firma del aviso antes de creerle.
   GET  /estado?ref=…&id=… → estado de un pedido, para la página /pedido/.
   GET  /pedidos?key=…     → lista de pedidos con datos de envío (dueñas).
   GET  /                  → diagnóstico: qué está configurado (sin secretos).

   Configuración (PAGOS-WOMPI.md): todo como secreto con
   `npx wrangler secret put NOMBRE -c cloudflare/pagos.toml`
     WOMPI_PUBLICA     pub_test_… (pruebas) o pub_prod_… (real)
     WOMPI_INTEGRIDAD  test_integrity_… o prod_integrity_…
     WOMPI_EVENTOS     test_events_… o prod_events_…
     WOMPI_PRIVADA     prv_test_… o prv_prod_… (opcional: confirma el pago
                       al volver de Wompi aunque el aviso tarde)
     ADMIN_KEY         la clave de las dueñas para ver /pedidos
   y en pagos.toml: SITIO (la tienda) y el almacén KV "PEDIDOS".
   ========================================================= */

const TALLAS = ["S", "M", "L", "XL"];
const MAX_LINEAS = 30;
const MAX_CANTIDAD = 20;
const DIA = 24 * 60 * 60;
const FINALES = ["APPROVED", "DECLINED", "VOIDED", "ERROR"];

/* ---------- utilidades ---------- */

export async function sha256hex(texto) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* Firma de integridad de Wompi: SHA256(referencia + monto en centavos + moneda + secreto) */
export function firmaIntegridad(referencia, centavos, moneda, secreto) {
  return sha256hex(String(referencia) + String(centavos) + String(moneda) + String(secreto));
}

/* Firma de un evento: los valores de signature.properties (en su orden),
   luego el timestamp y el secreto de eventos. */
export function checksumEvento(cuerpo, secreto) {
  const props = (cuerpo && cuerpo.signature && Array.isArray(cuerpo.signature.properties)) ? cuerpo.signature.properties : [];
  const valores = props.map((ruta) => ruta.split(".").reduce((o, k) => (o == null ? undefined : o[k]), cuerpo.data));
  return sha256hex(valores.map((v) => (v == null ? "" : String(v))).join("") + String(cuerpo.timestamp) + String(secreto));
}

function iguales(a, b) {
  a = String(a || "").toLowerCase(); b = String(b || "").toLowerCase();
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function sitioDe(env) { return String(env.SITIO || "https://aymuniverse.com").replace(/\/+$/, ""); }
function origenesDe(env) {
  const s = sitioDe(env);
  const extra = String(env.ORIGENES || "").split(",").map((x) => x.trim().replace(/\/+$/, "")).filter(Boolean);
  return [s, s.replace("://", "://www.")].concat(extra);
}
function cors(req, env) {
  const o = req.headers.get("Origin");
  const h = { "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
  if (o && origenesDe(env).includes(o)) h["Access-Control-Allow-Origin"] = o;
  return h;
}
function json(obj, status, req, env) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors(req, env) }
  });
}
function esc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function pesos(n) { return "$" + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function esPrueba(env) { return /^pub_test_/.test(String(env.WOMPI_PUBLICA || "")); }
function apiWompi(env) {
  const prv = String(env.WOMPI_PRIVADA || "");
  return /^prv_test_/.test(prv) ? "https://sandbox.wompi.co/v1" : "https://production.wompi.co/v1";
}

/* Referencia única: AYM-AAMMDD-XXXXXXXX (fecha de Colombia + 8 caracteres al azar) */
function nuevaReferencia() {
  const f = new Date(Date.now() - 5 * 3600 * 1000).toISOString();
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint8Array(8));
  return "AYM-" + f.slice(2, 4) + f.slice(5, 7) + f.slice(8, 10) + "-" + [...r].map((b) => abc[b % abc.length]).join("");
}

async function leerPedido(env, ref) {
  const v = await env.PEDIDOS.get("pedido:" + ref);
  return v ? JSON.parse(v) : null;
}
/* Los pedidos pagados se guardan para siempre; los que no se pagaron, 60 días */
async function guardarPedido(env, p) {
  const opciones = { metadata: { creado: p.creado, estado: p.estado, total: p.total } };
  if (p.estado !== "APPROVED") opciones.expirationTtl = 60 * DIA;
  await env.PEDIDOS.put("pedido:" + p.ref, JSON.stringify(p), opciones);
}

/* ---------- POST /pagar ---------- */

async function catalogo(env) {
  const r = await fetch(sitioDe(env) + "/data/tienda.json", { cf: { cacheTtl: 60, cacheEverything: true } });
  if (!r.ok) throw new Error("catálogo " + r.status);
  const j = await r.json();
  if (!j || typeof j.productos !== "object") throw new Error("catálogo sin productos");
  return j.productos;
}

async function pagar(req, env) {
  const o = req.headers.get("Origin");
  if (o && !origenesDe(env).includes(o)) return json({ error: "origen" }, 403, req, env);
  if (!env.WOMPI_PUBLICA || !env.WOMPI_INTEGRIDAD) return json({ error: "sin-configurar" }, 503, req, env);
  let cuerpo;
  try { cuerpo = await req.json(); } catch (e) { return json({ error: "formato" }, 400, req, env); }
  const items = cuerpo && Array.isArray(cuerpo.items) ? cuerpo.items : [];
  if (!items.length || items.length > MAX_LINEAS) return json({ error: "carrito" }, 400, req, env);

  let prods;
  try { prods = await catalogo(env); } catch (e) { return json({ error: "catalogo" }, 503, req, env); }

  const lineas = [], problemas = [], juntas = {};
  for (const it of items) {
    const id = String((it && it.id) || "");
    const talla = String((it && it.size) || "").toUpperCase();
    const color = String((it && it.color) || "").trim();
    const qty = Number(it && it.qty);
    const p = prods[id];
    if (!p) { problemas.push({ id, motivo: "no-existe" }); continue; }
    if (!p.d) { problemas.push({ id, nombre: p.n, motivo: "agotada" }); continue; }
    if (!TALLAS.includes(talla) || (p.a || []).includes(talla)) { problemas.push({ id, nombre: p.n, talla, motivo: "talla" }); continue; }
    if ((p.c || []).length ? !p.c.includes(color) : color !== "") { problemas.push({ id, nombre: p.n, color, motivo: "color" }); continue; }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_CANTIDAD) { problemas.push({ id, nombre: p.n, motivo: "cantidad" }); continue; }
    if (!(p.p >= 1000)) { problemas.push({ id, nombre: p.n, motivo: "precio" }); continue; }
    const k = id + "|" + talla + "|" + color;
    if (juntas[k]) { juntas[k].qty = Math.min(MAX_CANTIDAD, juntas[k].qty + qty); continue; }
    const linea = {
      id, nombre: p.n, talla, color, qty, precio: p.p,
      horma: p.e === "esenciales" ? "Esenciales" : (p.f === "oversized" ? "Oversized" : "Regular fit")
    };
    juntas[k] = linea;
    lineas.push(linea);
  }
  if (problemas.length) return json({ error: "cambio", problemas }, 409, req, env);

  const total = lineas.reduce((s, l) => s + l.qty * l.precio, 0);
  const centavos = total * 100;
  const ref = nuevaReferencia();
  const firma = await firmaIntegridad(ref, centavos, "COP", env.WOMPI_INTEGRIDAD);
  const pedido = {
    ref, creado: new Date().toISOString(), estado: "CREADO", total,
    items: lineas, prueba: esPrueba(env)
  };
  await guardarPedido(env, pedido);

  const q = new URLSearchParams();
  q.set("public-key", env.WOMPI_PUBLICA);
  q.set("currency", "COP");
  q.set("amount-in-cents", String(centavos));
  q.set("reference", ref);
  q.set("signature:integrity", firma);
  q.set("redirect-url", sitioDe(env) + "/pedido/");
  q.set("collect-shipping", "true");
  return json({ ok: true, ref, total, checkout: "https://checkout.wompi.co/p/?" + q.toString() }, 200, req, env);
}

/* ---------- resultado de una transacción (evento o consulta) ---------- */

async function aplicarTransaccion(env, t) {
  if (!t || !t.reference) return null;
  const ref = String(t.reference);
  const p = (await leerPedido(env, ref)) || {
    ref, creado: t.created_at || new Date().toISOString(), estado: "CREADO", total: Math.round((t.amount_in_cents || 0) / 100),
    items: [], externo: true, prueba: false
  };
  /* Un pedido aprobado no vuelve atrás por un aviso viejo que llegue tarde */
  if (p.estado === "APPROVED" && t.status !== "APPROVED" && t.status !== "VOIDED") return p;
  p.estado = String(t.status || p.estado);
  p.transaccion = t.id || p.transaccion;
  p.metodo = t.payment_method_type || p.metodo || "";
  p.email = t.customer_email || p.email || "";
  if (t.customer_data) p.cliente = { nombre: t.customer_data.full_name || "", telefono: t.customer_data.phone_number || "" };
  if (t.shipping_address) p.envio = t.shipping_address;
  p.pagado = Math.round((t.amount_in_cents || 0) / 100);
  p.montoOk = !p.externo && Number(t.amount_in_cents) === p.total * 100;
  p.actualizado = new Date().toISOString();
  await guardarPedido(env, p);
  return p;
}

async function eventos(req, env) {
  if (!env.WOMPI_EVENTOS) return new Response("sin configurar", { status: 503 });
  let cuerpo;
  try { cuerpo = await req.json(); } catch (e) { return new Response("formato", { status: 400 }); }
  const recibido = req.headers.get("X-Event-Checksum") || (cuerpo.signature && cuerpo.signature.checksum);
  const calculado = await checksumEvento(cuerpo, env.WOMPI_EVENTOS);
  if (!iguales(recibido, calculado)) return new Response("firma inválida", { status: 401 });
  if (cuerpo.event === "transaction.updated" && cuerpo.data && cuerpo.data.transaction) {
    await aplicarTransaccion(env, cuerpo.data.transaction);
  }
  return new Response("ok", { status: 200 });
}

/* ---------- GET /estado ---------- */

async function estado(req, env, url) {
  const ref = String(url.searchParams.get("ref") || "");
  const id = String(url.searchParams.get("id") || "");
  if (!/^AYM-\d{6}-[A-Z0-9]{8}$/.test(ref)) return json({ error: "ref" }, 400, req, env);
  let p = await leerPedido(env, ref);
  if (!p) return json({ error: "no-existe" }, 404, req, env);
  /* Volviendo de Wompi con el id de la transacción: si el aviso aún no llegó
     y hay llave privada, se pregunta directamente a Wompi. */
  if (!FINALES.includes(p.estado) && id && env.WOMPI_PRIVADA && /^[\w-]{6,80}$/.test(id)) {
    try {
      const r = await fetch(apiWompi(env) + "/transactions/" + encodeURIComponent(id), {
        headers: { Authorization: "Bearer " + env.WOMPI_PRIVADA }
      });
      if (r.ok) {
        const j = await r.json();
        if (j && j.data && j.data.reference === ref) p = (await aplicarTransaccion(env, j.data)) || p;
      }
    } catch (e) { /* se queda con lo que hay */ }
  }
  return json({
    ref: p.ref, estado: p.estado, total: p.total, metodo: p.metodo || "",
    items: (p.items || []).map((l) => ({ nombre: l.nombre, horma: l.horma, talla: l.talla, color: l.color, qty: l.qty, precio: l.precio }))
  }, 200, req, env);
}

/* ---------- GET /pedidos (para las dueñas) ---------- */

const ETIQUETA = {
  APPROVED: ["Pagado", "ok"], PENDING: ["Pago en proceso", "esp"], CREADO: ["Sin pagar (no terminó)", "nada"],
  DECLINED: ["Rechazado", "mal"], VOIDED: ["Anulado", "mal"], ERROR: ["Error en el pago", "mal"]
};
function fechaCo(iso) {
  try { return new Date(iso).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" }); }
  catch (e) { return String(iso || "").replace("T", " ").slice(0, 16); }
}
function tarjeta(p) {
  const [txt, cls] = ETIQUETA[p.estado] || [p.estado, "nada"];
  const e = p.envio || {};
  const tel = String(e.phone_number || (p.cliente && p.cliente.telefono) || "").replace(/\D/g, "");
  const wa = tel ? "https://wa.me/" + (tel.length === 10 ? "57" + tel : tel) + "?text=" + encodeURIComponent("¡Hola! Te escribimos de A&M Universe por tu pedido " + p.ref + " 🐱") : "";
  const dir = [e.address_line_1, e.address_line_2, e.city, e.region].filter(Boolean).map(esc).join(", ");
  return `<article class="p ${cls}">
  <header><span class="est">${esc(txt)}</span>${p.prueba ? ' <span class="prueba">PRUEBA</span>' : ""}<span class="fecha">${esc(fechaCo(p.creado))}</span></header>
  <p class="ref">${esc(p.ref)} · <strong>${pesos(p.total)}</strong>${p.metodo ? " · " + esc(p.metodo) : ""}</p>
  ${p.estado === "APPROVED" && p.montoOk === false && !p.externo ? '<p class="alerta">⚠ El valor pagado (' + pesos(p.pagado) + ") no coincide con el pedido. Revísalo en Wompi.</p>" : ""}
  ${p.externo ? '<p class="alerta">Pago hecho fuera de la tienda (por ejemplo, un link de pago de Wompi): no hay detalle de camisetas.</p>' : ""}
  <ul>${(p.items || []).map((l) => `<li>${l.qty} × ${esc(l.nombre)} · ${esc(l.horma)} · Talla ${esc(l.talla)}${l.color ? " · " + esc(l.color) : ""} <span>${pesos(l.qty * l.precio)}</span></li>`).join("")}</ul>
  ${(e.name || p.cliente || p.email || dir) ? `<div class="cli">
    ${e.name || (p.cliente && p.cliente.nombre) ? "<p>👤 " + esc(e.name || p.cliente.nombre) + "</p>" : ""}
    ${tel ? "<p>📱 " + esc(tel) + (wa ? ' · <a href="' + esc(wa) + '" target="_blank" rel="noopener">Escribir por WhatsApp</a>' : "") + "</p>" : ""}
    ${p.email ? "<p>✉️ " + esc(p.email) + "</p>" : ""}
    ${dir ? "<p>📦 " + dir + "</p>" : ""}
  </div>` : ""}
</article>`;
}

async function pedidos(req, env, url) {
  if (!env.ADMIN_KEY) return new Response("Falta configurar ADMIN_KEY", { status: 503 });
  if (!iguales(url.searchParams.get("key"), env.ADMIN_KEY)) {
    return new Response("Clave incorrecta", { status: 401, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const todos = url.searchParams.get("todos") === "1";
  const claves = [];
  let cursor;
  do {
    const l = await env.PEDIDOS.list({ prefix: "pedido:", cursor });
    claves.push(...l.keys);
    cursor = l.list_complete ? null : l.cursor;
  } while (cursor && claves.length < 5000);
  const elegidas = claves
    .filter((k) => todos || !k.metadata || k.metadata.estado !== "CREADO")
    .sort((a, b) => String((b.metadata || {}).creado || "").localeCompare(String((a.metadata || {}).creado || "")))
    .slice(0, 80);
  const lista = (await Promise.all(elegidas.map((k) => env.PEDIDOS.get(k.name)))).filter(Boolean).map((v) => JSON.parse(v));
  const pagados = lista.filter((p) => p.estado === "APPROVED");
  const k = encodeURIComponent(url.searchParams.get("key"));
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Pedidos · A&M Universe</title>
<style>
:root{--bg:#f7f4ee;--card:#fff;--tx:#1d1d1b;--soft:#6b6b66;--line:#e5e0d6;--ok:#2f7d4f;--mal:#b23b2e;--esp:#a06a00}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--card:#1f1f1d;--tx:#f2efe8;--soft:#a9a59b;--line:#33322e;--ok:#6fcf97;--mal:#ff9b8f;--esp:#f2c14e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;padding:16px}
main{max-width:760px;margin:0 auto}h1{font-size:1.35rem;margin:.2em 0}.sub{color:var(--soft);margin:0 0 16px}
.sub a{color:inherit}.p{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--line);border-radius:10px;padding:12px 14px;margin:0 0 12px}
.p.ok{border-left-color:var(--ok)}.p.mal{border-left-color:var(--mal)}.p.esp{border-left-color:var(--esp)}
header{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.est{font-weight:700}.ok .est{color:var(--ok)}.mal .est{color:var(--mal)}.esp .est{color:var(--esp)}
.fecha{margin-left:auto;color:var(--soft);font-size:.85rem}.prueba{font-size:.7rem;font-weight:700;border:1px solid var(--soft);border-radius:4px;padding:0 5px;color:var(--soft)}
.ref{margin:.3em 0;font-family:ui-monospace,Consolas,monospace;font-size:.88rem;word-break:break-all}
ul{margin:.4em 0;padding-left:18px}li span{color:var(--soft);white-space:nowrap}.cli{border-top:1px dashed var(--line);margin-top:8px;padding-top:6px}
.cli p{margin:.15em 0;overflow-wrap:anywhere}.cli a{color:var(--ok)}.alerta{color:var(--mal);font-weight:600;margin:.3em 0}
.vacio{color:var(--soft);text-align:center;padding:40px 0}
</style></head><body><main>
<h1>Pedidos pagados en línea</h1>
<p class="sub">${pagados.length} pagado${pagados.length === 1 ? "" : "s"} en esta lista${esPrueba(env) ? " · <strong>modo de PRUEBA</strong> (no es dinero real)" : ""} ·
${todos ? `<a href="?key=${k}">Ocultar los que no terminaron de pagar</a>` : `<a href="?key=${k}&todos=1">Ver también los que no terminaron de pagar</a>`}</p>
${lista.length ? lista.map(tarjeta).join("\n") : '<p class="vacio">Todavía no hay pedidos.</p>'}
</main></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}

/* ---------- entrada ---------- */

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const ruta = url.pathname.replace(/\/+$/, "") || "/";
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req, env) });
    try {
      if (ruta === "/pagar" && req.method === "POST") return await pagar(req, env);
      if (ruta === "/wompi/eventos" && req.method === "POST") return await eventos(req, env);
      if (ruta === "/estado" && req.method === "GET") return await estado(req, env, url);
      if (ruta === "/pedidos" && req.method === "GET") return await pedidos(req, env, url);
      if (ruta === "/" && req.method === "GET") {
        return json({
          servicio: "Pagos A&M Universe (Wompi)", sitio: sitioDe(env),
          modo: env.WOMPI_PUBLICA ? (esPrueba(env) ? "pruebas" : "real") : "sin configurar",
          configurado: {
            WOMPI_PUBLICA: !!env.WOMPI_PUBLICA, WOMPI_INTEGRIDAD: !!env.WOMPI_INTEGRIDAD, WOMPI_EVENTOS: !!env.WOMPI_EVENTOS,
            WOMPI_PRIVADA: !!env.WOMPI_PRIVADA, ADMIN_KEY: !!env.ADMIN_KEY, PEDIDOS: !!env.PEDIDOS
          }
        }, 200, req, env);
      }
      return json({ error: "no-existe" }, 404, req, env);
    } catch (e) {
      return json({ error: "interno" }, 500, req, env);
    }
  }
};
