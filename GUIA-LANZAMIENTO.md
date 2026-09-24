# 🚀 Guía de lanzamiento — A&M Universe

Sitio: **https://droko1982.github.io/a-y-m/** · Repo: **Droko1982/a-y-m**

Esta guía resume cómo terminar de dejar la tienda lista para vender y cómo aparecer en Google.

---

## ✏️ Cómo cambiar cosas rápido

**Casi todo se cambia desde el panel, sin tocar código:**
👉 https://droko1982.github.io/a-y-m/admin/ · instrucciones en [`PANEL-ADMIN.md`](PANEL-ADMIN.md)
y enlaces que abren cada sección de una vez en [`ENLACES-DIRECTOS.md`](ENLACES-DIRECTOS.md).

| Quiero cambiar… | Dónde |
|---|---|
| **Precios** | Panel → *Precios* (los dos precios por horma) y *Productos* (si una camiseta tiene precio propio) |
| **Textos de la página** (inicio, Océano, Propósito, Impacto, preguntas) | Panel → *Textos* |
| **Nombres y descripciones de camisetas** | Panel → *Productos* |
| **Fotos de camisetas** | Panel → *Productos* → campo de la imagen (se suben desde el panel) |
| **Métodos de pago** (Nequi, Daviplata, Bre-B, cuenta bancaria) | Panel → *Pagos* |
| **Redes sociales** | Panel → *Datos del negocio* (abajo: Instagram, Facebook, TikTok) |
| **Datos legales, envíos y cambios** | Panel → *Datos del negocio* (arriba) |
| **Camisetas vendidas** (contador de impacto) | Panel → *Impacto* |

Lo que todavía pide entrar al código:

| Quiero cambiar… | Dónde |
|---|---|
| **El logo** | Reemplazar `assets/marca/logo-original.png` y correr `node herramientas/generar-logos.js` (ver [`README.md`](README.md)) |
| **El número de WhatsApp** | `js/main.js` y `js/cart.js` → variable `WA_NUMBER` (formato `57` + número, sin espacios) |
| **Los colores del tema** | `css/styles.css` → bloques `:root` (claro) y `[data-theme="dark"]` (oscuro) |
| **Fotos de animalitos** | Reemplazar `assets/dogs/dog1.jpg` … `dog4.jpg` |
| **Testimonios** | `js/main.js` → claves `tst.1.q`, `tst.1.n`, `tst.1.c`, etc. |
| **Aporte por camiseta** (cuánto se dona) | `js/impacto.js` → `APORTE_POR_CAMISETA`; guía en [`CONTADOR-IMPACTO.md`](CONTADOR-IMPACTO.md) |
| **La dirección del sitio** (dominio propio) | `node herramientas/cambiar-direccion.js` (ver [`MUDANZA-DE-CUENTA.md`](MUDANZA-DE-CUENTA.md)) |
| **La imagen que se ve al compartir el enlace** | `node herramientas/generar-og.js` |

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
