# A&M Universe 🐘

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
├─ css/styles.css      Estilos y temas (claro/oscuro)
├─ js/main.js          Tema, idioma (ES/EN), WhatsApp, menú, animaciones
├─ assets/
│  ├─ logo.svg                        Emblema vectorial (fuente)
│  ├─ icon-192.png · icon-512.png     Íconos PWA
│  ├─ apple-touch-icon.png            Ícono para iOS
│  └─ og-image.png · og-image.svg     Imagen para compartir en redes (1200×630)
├─ manifest.json       Configuración PWA
├─ robots.txt · sitemap.xml
└─ 404.html
```

## 🛠️ Cómo personalizar (rápido)

| Quiero cambiar… | Dónde |
|---|---|
| El número de WhatsApp | `js/main.js` → variable `WA_NUMBER` (formato `57` + número, sin espacios) |
| Los textos ES / EN | `js/main.js` → objeto `I18N` |
| Los colores del tema | `css/styles.css` → bloques `:root` (claro) y `[data-theme="dark"]` (oscuro) |
| El logo | Reemplaza `assets/logo.svg` por tu logo oficial (y el `<svg>` del encabezado en `index.html`) |
| Fotos de productos/colecciones | Cambia los bloques `.collection-art` / `.product-ico` por tus imágenes |

> 💡 **Logo:** el emblema del elefante es una versión provisional dibujada en código. Cuando tengas tu logo oficial en PNG o SVG, reemplázalo en `assets/logo.svg` para máxima fidelidad.

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
