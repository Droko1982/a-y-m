# 🐾 Contador de impacto — guía de instalación

Este contador muestra en la página cuántas camisetas se han vendido y cuánto
dinero se va apartando para los animalitos (**$1.000 por camiseta**, ajustable).

El número **lo actualizas tú** después de cada venta pagada, tocando un **enlace
secreto** desde tu celular. La página pública se actualiza sola.

> Todo esto es **gratis** con el plan gratuito de Cloudflare. La configuración es
> de una sola vez (~15 min). Si el panel de Cloudflare se ve distinto a estos
> pasos, escríbeme y te guío con lo que aparezca en tu pantalla.

## 🐕 ¿Cómo se ve?

A medida que sube el dinero, un **perrito come de su tazón**: cada "bolsa de comida"
(cada **$50.000**) llena el tazón, y arriba se ven las camisetas vendidas y el
dinero reunido. Puedes cambiar el tamaño de la bolsa en `js/impacto.js` → `BOLSA`.

## Dos formas de usarlo

- **Opción rápida (ya funciona, sin cuentas):** el número vive en el archivo
  [`data/impacto.json`](data/impacto.json). Para actualizar, abres ese archivo en
  GitHub (✏️ *Edit*), cambias `"camisetas": 0` por el número real y guardas. Simple,
  pero cada cambio es manual desde GitHub.
- **Opción recomendada (enlace secreto):** sigue la guía de abajo para el Worker de
  Cloudflare. Así actualizas con **un toque** desde el celular y la web se actualiza
  sola. En cuanto pegues la URL del Worker (Parte B), la web usará esa fuente en vez
  del archivo.

---

## Parte A — Crear el contador en Cloudflare (una sola vez)

### 1. Crea una cuenta
Entra a **https://dash.cloudflare.com/sign-up** y regístrate (gratis). Confirma tu correo.

### 2. Crea el "Worker"
1. En el menú lateral abre **Workers & Pages**.
2. Botón **Create application** → pestaña **Workers** → **Create Worker**.
3. Ponle un nombre, por ejemplo **`aym-contador`** → **Deploy**.
4. Ahora entra a **Edit code**. Borra todo el código de ejemplo y **pega el
   contenido completo** del archivo [`cloudflare/worker.js`](cloudflare/worker.js)
   de este proyecto. Arriba a la derecha, **Deploy / Save and Deploy**.

### 3. Crea el almacén (KV) para guardar el número
1. En el menú lateral: **Storage & Databases → KV** (o **Workers → KV**).
2. **Create a namespace**, nómbralo **`aym-impacto`** → crear.

### 4. Conecta el KV al Worker con el nombre `IMPACTO`
1. Vuelve a tu Worker `aym-contador` → **Settings** → **Bindings**
   (puede decir *Variables and Bindings*).
2. **Add binding → KV namespace**:
   - **Variable name:** escribe exactamente **`IMPACTO`** (en mayúsculas).
   - **KV namespace:** elige **`aym-impacto`**.
   - Guarda / **Deploy**.

### 5. Crea tu clave secreta `ADMIN_KEY`
1. En el mismo Worker → **Settings** → **Variables and Secrets** (o *Environment
   Variables*).
2. **Add variable**:
   - **Nombre:** **`ADMIN_KEY`**
   - **Valor:** inventa una frase privada tuya, p. ej. `amy-2026-gatitos-felices`
     (que nadie más conozca).
   - Marca **Encrypt** (para que quede secreta) → **Save / Deploy**.

### 6. Copia la dirección de tu Worker
Arriba en la página del Worker verás una URL parecida a:

```
https://aym-contador.TU-USUARIO.workers.dev
```

Cópiala. Es la dirección de tu contador.

---

## Parte B — Conectar la página con el contador

1. Abre el archivo [`js/impacto.js`](js/impacto.js) (puedes editarlo en
   GitHub: botón ✏️ *Edit*).
2. En la línea que dice:
   ```js
   var IMPACT_API = "";
   ```
   pega tu dirección **sin la barra final**, así:
   ```js
   var IMPACT_API = "https://aym-contador.TU-USUARIO.workers.dev";
   ```
3. Guarda (**Commit changes**). En 1–2 minutos el contador aparecerá en vivo en la web. ✅

---

## Parte C — Tus enlaces para actualizar (¡guárdalos!)

Reemplaza `TU-USUARIO` por tu subdominio y `TU-CLAVE` por tu `ADMIN_KEY`:

| Para… | Enlace |
|---|---|
| **Sumar 1 camiseta** (lo normal tras cada venta) | `https://aym-contador.TU-USUARIO.workers.dev/sumar?key=TU-CLAVE` |
| **Sumar varias** (ej. 3 de una) | `…/sumar?key=TU-CLAVE&n=3` |
| **Restar 1** (si te equivocaste) | `…/restar?key=TU-CLAVE` |
| **Fijar el total exacto** (ej. ya vendiste 40 antes) | `…/ajustar?key=TU-CLAVE&valor=40` |

**Consejo:** abre el enlace de *sumar* en tu celular y **guárdalo como marcador
o en la pantalla de inicio**. Así, cada venta pagada = un toque, y ves la
confirmación “✅ ¡Venta registrada! — van N camisetas”.

> 🔒 Trata tu clave como una contraseña: no la pongas en publicaciones ni la
> compartas. Si se te filtra, cambia el valor de `ADMIN_KEY` en Cloudflare y
> actualiza tus enlaces.

---

## Cambiar el aporte por camiseta (hoy $1.000)

Está en **dos** lugares; cambia el número en ambos:
- Web pública: [`js/impacto.js`](js/impacto.js) → `APORTE_POR_CAMISETA`
- Página de confirmación del enlace: [`cloudflare/worker.js`](cloudflare/worker.js) → `APORTE_POR_CAMISETA`
  (y vuelve a hacer **Deploy** del Worker).

## ¿Y si un día quieres que sea 100% automático?
Haría falta un sistema de pagos en línea (pasarela) que confirme cada pago solo.
Cuando lleguen la tarjeta de crédito / PSE u otra pasarela, se puede conectar
para que sume automáticamente. Por ahora, el toque al enlace es lo más confiable
porque refleja **ventas realmente pagadas**.
