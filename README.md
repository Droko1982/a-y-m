# A&M Universe 🐱

Sitio web oficial de **A&M Universe** — *Diseño con propósito*.
Camisetas estampadas que cuentan historias y ayudan a los animales de la calle. Base en **Calarcá, Quindío** · envíos a toda Colombia.

🔗 **Sitio en vivo:** https://droko1982.github.io/a-y-m/

---

## ✨ Características

- **Modo claro y oscuro** — paleta blanca/crema y paleta verde (se recuerda tu elección).
- **Bilingüe Español / Inglés** — botón `ES/EN` en el encabezado (detecta tu idioma y recuerda tu preferencia).
- **Botón de WhatsApp** flotante + en varias secciones, con mensaje prellenado, hacia **321 579 9683**.
- **Diseño responsive** — se ve bien en celular, tablet y computador.
- **Optimizado para SEO** — metadatos, Open Graph, datos estructurados (Schema.org) y `sitemap.xml`.
- **PWA lista** — `manifest.json` e íconos para instalar en el celular.
- Sin dependencias ni frameworks: **HTML + CSS + JavaScript puro**. Carga rápido.

## 📁 Estructura

```
a-y-m/
├─ index.html          Página principal
├─ politicas.html      Políticas, datos legales y de envíos
├─ 404.html
├─ css/styles.css      Estilos y temas (claro/oscuro)
├─ js/
│  ├─ main.js          Tema, idioma (ES/EN), WhatsApp, menú, animaciones
│  ├─ cart.js          Carrito y pedido por WhatsApp
│  ├─ shop.js          Catálogo de camisetas
│  ├─ textos.js        Aplica los textos escritos en el panel
│  ├─ redes.js         Iconos de redes sociales
│  ├─ politicas.js     Datos legales en politicas.html
│  └─ impacto.js       Contador de camisetas vendidas
├─ data/               Lo que las dueñas editan desde el panel (JSON)
├─ admin/              El panel (Sveltia CMS) · ver PANEL-ADMIN.md
├─ assets/
│  ├─ logo-light.png · logo-dark.png  Logo (fondo claro / fondo oscuro)
│  ├─ favicon-48.png · icon-192.png · icon-512.png
│  ├─ apple-touch-icon.png            Ícono para iOS
│  ├─ og-image.png                    Imagen para compartir (1200×630)
│  └─ marca/logo-original.png         El logo original, de donde sale todo
├─ herramientas/       Scripts de mantenimiento (ver abajo)
├─ manifest.json       Configuración PWA
├─ favicon.ico
└─ robots.txt · sitemap.xml
```

## 🛠️ Cómo personalizar (rápido)

| Quiero cambiar… | Dónde |
|---|---|
| El número de WhatsApp | `js/main.js` → variable `WA_NUMBER` (formato `57` + número, sin espacios) |
| Los textos ES / EN | `js/main.js` → objeto `I18N` |
| Los colores del tema | `css/styles.css` → bloques `:root` (claro) y `[data-theme="dark"]` (oscuro) |
| El logo | Reemplaza `assets/marca/logo-original.png` y corre `node herramientas/generar-logos.js` |
| Fotos de productos/colecciones | Cambia los bloques `.collection-art` / `.product-ico` por tus imágenes |

> 💡 **Logo:** todo sale de un solo archivo, `assets/marca/logo-original.png`. De ahí
> se generan las dos versiones del logo (marrón para fondo claro, crema para fondo
> oscuro), los iconos cuadrados —que son la cara del gato— y el `favicon.ico`.
>
> ```bash
> npm install sharp puppeteer      # solo la primera vez
> node herramientas/generar-logos.js    # logo + iconos + favicon
> node herramientas/generar-og.js       # imagen para compartir en redes
> ```
>
> Si cambia el logo, se reemplaza ese archivo original y se vuelven a correr los dos.
> Los nombres de archivo no cambian, así que no hay que tocar el sitio.

## 🚀 Ver en local

Abre `index.html` en el navegador, o levanta un servidor simple:

```bash
python -m http.server 8000
# luego abre http://localhost:8000
```

## 🌱 Sobre la marca

A&M Universe es una marca con propósito: un porcentaje de cada venta ayuda a fundaciones y animales de la calle, promueve la adopción y crea conciencia sobre el medio ambiente. Próximamente: velas para masaje y mantequilla corporal.

---

Hecho con 💚 en el Quindío, Colombia.
