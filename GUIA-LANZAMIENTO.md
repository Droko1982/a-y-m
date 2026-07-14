# 🚀 Guía de lanzamiento — A&M Universe

Sitio: **https://droko1982.github.io/a-y-m/** · Repo: **Droko1982/a-y-m**

Esta guía resume cómo terminar de dejar la tienda lista para vender y cómo aparecer en Google.

---

## ✏️ Cómo cambiar cosas rápido

| Quiero cambiar… | Dónde |
|---|---|
| **Precios por horma** | `js/cart.js` → objeto `FIT_PRICES` (`regular: 69000`, `oversized: 79000`). Actualiza también el `$69.000`/`$79.000` visible en el selector de horma y los precios de datos estructurados (JSON-LD) en `index.html` |
| **Métodos de pago** | `js/cart.js` → `NEQUI_DISPLAY` (número Nequi). Las opciones son Nequi y Contra entrega; se eligen en el carrito |
| **Nombres/descripciones de camisetas** | `js/main.js` → claves `shop.ocean.name`, `shop.ocean.desc`, etc. (ES y EN) |
| **Número de WhatsApp** | `js/main.js` y `js/cart.js` → variable `WA_NUMBER` (formato `57` + número) |
| **Logo** | Reemplazar `assets/logo-light.png` y `assets/logo-dark.png` (mismo nombre) |
| **Fotos de camisetas** | Reemplazar `assets/tee-ocean.svg` … por fotos (`.jpg`) y ajustar la ruta en `index.html` |
| **Fotos de animalitos** | Reemplazar `assets/dogs/dog1.jpg` … `dog4.jpg` |
| **Testimonios** | `js/main.js` → claves `tst.1.q`, `tst.1.n`, `tst.1.c`, etc. |
| **% donado / textos** | `js/main.js` (busca la frase) |
| **Datos legales** | `politicas.html` → reemplazar los campos `[entre corchetes]` |

Tras editar, sube los cambios (git o desde github.com → editar archivo → *Commit*). El sitio se actualiza solo en 1–2 minutos.

---

## 🔎 Para aparecer en Google (SEO)

1. **Google Search Console** — https://search.google.com/search-console
   - Agrega la propiedad `https://droko1982.github.io/a-y-m/`.
   - Verifica (opción "Etiqueta HTML": pega el `<meta>` en el `<head>` de `index.html`).
   - En *Sitemaps*, envía: `sitemap.xml`.

2. **Perfil de Google Business** (clave para "camisetas Calarcá / Quindío") — https://business.google.com
   - Crea el perfil del negocio con dirección/zona de Calarcá, teléfono (WhatsApp) y enlace al sitio.

3. **Analítica** (ver visitas) — opciones:
   - **Plausible** (privado, pago) o **Google Analytics 4** (gratis). Pega el script en el `<head>` de `index.html`.

---

## 🌐 Dominio propio (opcional, recomendado)

1. Compra un dominio (ej. `aymuniverse.co` en GoDaddy, Namecheap, etc.).
2. En el repo, crea un archivo `CNAME` con el dominio dentro (una sola línea).
3. En tu proveedor de dominio, apunta el DNS a GitHub Pages:
   - `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - o `CNAME` `www` → `droko1982.github.io`
4. En GitHub → *Settings → Pages*, escribe el dominio y activa **Enforce HTTPS**.
5. Actualiza las URLs de `https://droko1982.github.io/a-y-m/` por el nuevo dominio en `index.html` (canonical, Open Graph) y `sitemap.xml` / `robots.txt`.

---

## 📱 Redes sociales

Cuando existan las cuentas, pásalas para enlazarlas en el pie de página y en los datos estructurados (`sameAs`). Instagram suele ser la más importante para esta marca.

---

Hecho con 💚 en el Quindío. Autoría: Dr. Mauricio Rodríguez Herrera.
