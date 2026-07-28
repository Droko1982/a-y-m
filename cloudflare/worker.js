/* =========================================================
   A&M Universe · Worker del contador de impacto (Cloudflare)
   ---------------------------------------------------------
   Guarda el total de camisetas vendidas en Cloudflare KV.
   - GET  /            → { "camisetas": N }   (público, lo lee la web)
   - GET  /sumar?key=CLAVE[&n=1]   → suma 1 (o n) y confirma
   - GET  /restar?key=CLAVE[&n=1]  → resta 1 (o n) por si hubo un error
   - GET  /ajustar?key=CLAVE&valor=N → fija el total exacto

   Necesita (ver CONTADOR-IMPACTO.md):
   - Un namespace de KV enlazado con el nombre  IMPACTO
   - Una variable secreta                        ADMIN_KEY  (tu clave privada)
   ========================================================= */

const APORTE_POR_CAMISETA = 1000; // pesos apartados por camiseta (solo para el mensaje de confirmación)
const KEY = "camisetas";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

function pesos(n) {
  return "$" + n.toLocaleString("es-CO");
}

function pagina(titulo, total) {
  const dinero = pesos(total * APORTE_POR_CAMISETA);
  return new Response(
    `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;text-align:center;
       font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#12241B;color:#ECE4D3;padding:24px}
  .n{font-size:4rem;font-weight:700;color:#CBA968;line-height:1;margin:8px 0}
  p{color:#A7B7AB;margin:6px 0}
  .big{font-size:1.3rem;color:#ECE4D3;margin-top:14px}
</style></head><body><div>
  <p>${titulo}</p>
  <div class="n">${total.toLocaleString("es-CO")}</div>
  <p>camisetas vendidas</p>
  <p class="big">${dinero} apartado para los animalitos 🐾</p>
</div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", ...CORS } }
  );
}

async function leer(env) {
  const v = await env.IMPACTO.get(KEY);
  const n = parseInt(v, 10);
  return isNaN(n) || n < 0 ? 0 : n;
}

async function guardar(env, n) {
  await env.IMPACTO.put(KEY, String(n));
  return n;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    // Lectura pública
    if (path === "/" && request.method === "GET") {
      return json({ camisetas: await leer(env) });
    }

    // A partir de aquí, todo requiere la clave secreta
    const esAdmin = url.searchParams.get("key") === env.ADMIN_KEY;
    if (["/sumar", "/restar", "/ajustar"].includes(path)) {
      if (!env.ADMIN_KEY) return json({ error: "Falta configurar ADMIN_KEY" }, 500);
      if (!esAdmin) return json({ error: "Clave incorrecta" }, 401);

      const actual = await leer(env);
      const n = Math.max(1, parseInt(url.searchParams.get("n"), 10) || 1);

      if (path === "/sumar")  return pagina("✅ ¡Venta registrada!", await guardar(env, actual + n));
      if (path === "/restar") return pagina("↩️ Ajuste aplicado", await guardar(env, Math.max(0, actual - n)));
      if (path === "/ajustar") {
        const valor = parseInt(url.searchParams.get("valor"), 10);
        if (isNaN(valor) || valor < 0) return json({ error: "Falta ?valor=N (número válido)" }, 400);
        return pagina("🔧 Total actualizado", await guardar(env, valor));
      }
    }

    return json({ error: "Ruta no encontrada" }, 404);
  },
};
