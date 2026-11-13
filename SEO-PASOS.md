# SEO de A&M Universe — lo que ya está hecho y lo que falta

La tienda ya está preparada para que la encuentren Google, Bing, ChatGPT, Gemini, Perplexity y Claude. Lo que falta son pasos que piden entrar con **sus cuentas**. Van en orden de importancia: los 4 primeros son los que más mueven la aguja.

---

## Lo que ya hace la tienda sola

Cada vez que alguien publica (también al guardar en el panel), GitHub arma y publica automáticamente:

| Qué | Dirección | Para qué |
|---|---|---|
| Una página por camiseta | `aymuniverse.com/camisetas/<nombre>/` | Que Google muestre cada camiseta con foto, precio y "Disponible" |
| Páginas de colección | `/coleccion/oceano/`, `/coleccion/felina/`, `/esenciales/`, `/camisetas/` | Búsquedas como "camisetas de gatos", "camisetas de animales marinos" |
| Nosotros, preguntas, tallas, cómo comprar | `/nosotros/`, `/preguntas-frecuentes/`, `/guia-de-tallas/`, `/como-comprar/` | Responder lo que la gente (y las IA) preguntan |
| Mapa del sitio con fotos | `aymuniverse.com/sitemap.xml` | Que Google y Bing encuentren todo |
| Feed de productos | `aymuniverse.com/feed/google-merchant.xml` | Google Shopping gratis y ChatGPT Shopping |
| Resumen para IA | `aymuniverse.com/llms.txt` y `/llms-full.txt` | Que ChatGPT, Claude, Perplexity entiendan la marca |
| Aviso automático a Bing (IndexNow) | — | Bing (de donde lee ChatGPT) se entera en minutos de cada cambio |

Si cambian un nombre, precio, foto o texto en el panel, todo lo anterior se actualiza solo. No hay que tocar nada.

> Ojo: si le cambian el **nombre** a una camiseta, cambia su dirección. No pasa nada grave, pero mejor no renombrar camisetas que ya se compartieron.

---

## Lo que falta (necesita sus cuentas)

### 1. Google Search Console — 10 minutos · IMPRESCINDIBLE
Es la forma de decirle a Google "esta tienda existe".

1. Entrar a <https://search.google.com/search-console> con la cuenta de Gmail de la marca.
2. **Agregar propiedad → Dominio** → escribir `aymuniverse.com`.
3. Google da un registro **TXT**. Copiarlo.
4. En **Namecheap** → Domain List → aymuniverse.com → Manage → **Advanced DNS** → Add New Record → **TXT Record**, Host `@`, Value = lo que dio Google → guardar.
5. Volver a Search Console → **Verificar** (si falla, esperar 15 minutos y repetir).
6. Menú **Sitemaps** → escribir `sitemap.xml` → Enviar.
7. Menú **Inspección de URLs** → pegar `https://aymuniverse.com/` → **Solicitar indexación**. Repetir con `/camisetas/`, `/coleccion/oceano/` y `/coleccion/felina/`.

### 2. Bing Webmaster Tools — 3 minutos · IMPRESCINDIBLE PARA CHATGPT
ChatGPT busca en la web usando sobre todo el índice de **Bing**, igual que Copilot y DuckDuckGo.

1. Entrar a <https://www.bing.com/webmasters>.
2. Elegir **Importar desde Google Search Console** (por eso va después del paso 1): trae el sitio y el sitemap ya verificados.
3. Listo. La tienda ya avisa sola a Bing de cada cambio (IndexNow).

### 3. Perfil de Empresa de Google (Google Maps) — 15 minutos · EL MÁS IMPORTANTE PARA EL QUINDÍO
Es lo que aparece a la derecha en Google y en Maps cuando alguien busca "camisetas Calarcá" o "tienda de camisetas Armenia".

1. Entrar a <https://business.google.com> → Agregar empresa → **A&M Universe**.
2. Categoría: **Tienda de ropa** (y como secundaria "Tienda de camisetas" si aparece).
3. Si no atienden en un local: elegir **"Entrego productos a mis clientes"** y **ocultar la dirección**; zona de servicio: Calarcá, Armenia, Quindío y Colombia.
4. Teléfono `321 579 9683`, sitio web `https://aymuniverse.com/`.
5. Verificar (Google suele pedir un video corto o un código).
6. Subir fotos reales de las camisetas y el logo. Publicar algo nuevo cada semana o dos.
7. **Pedir reseñas** a cada cliente: después de cada venta, mandar el enlace de reseñas por WhatsApp. Las reseñas son lo que más pesa en Maps.

### 4. Redes sociales en el panel — 2 minutos · MUY IMPORTANTE
Hoy la tienda **no tiene ninguna red enlazada**, y para Google y las IA eso hace que la marca casi no "exista".

- En el panel → **Datos del negocio** → llenar Instagram, Facebook y TikTok (basta con el usuario, por ejemplo `@aymuniverse`).
- Con eso aparecen en el pie de todas las páginas y en los datos que leen Google y ChatGPT.
- Y al revés: poner `https://aymuniverse.com/` en la **biografía** de Instagram, TikTok y Facebook. Al compartir una camiseta, usar su enlace propio (`aymuniverse.com/camisetas/...`): en WhatsApp e Instagram se ve con su foto y precio.

### 5. Google Merchant Center (Shopping gratis) — 20 minutos
Las camisetas salen gratis en la pestaña **Shopping** de Google, con foto y precio.

1. <https://merchants.google.com> → crear cuenta con la misma cuenta de Search Console (así el sitio sale ya verificado).
2. País: Colombia · moneda: COP.
3. **Productos → Fuentes de datos → Agregar fuente → Archivo programado** (o "desde una URL"):
   `https://aymuniverse.com/feed/google-merchant.xml` · actualización **diaria**.
4. Configurar **envíos** (costo y días por ciudad) y **devoluciones** (días para cambios). Sin eso Google no muestra los productos.
5. Activar **Fichas gratuitas** (Free listings).

### 6. ChatGPT Shopping y Perplexity — 5 minutos
- **ChatGPT**: en <https://chatgpt.com/merchants> pedir que incluyan la tienda; cuando pidan el feed, dar `https://aymuniverse.com/feed/google-merchant.xml`.
- **Perplexity**: buscar "Perplexity Merchant Program" y registrarse (mismo feed).

### 7. Completar los datos legales y de envío en el panel
Panel → **Datos del negocio**: razón social, NIT/cédula, **días de envío** y **días para cambios**. Con esto:
- la página de políticas queda completa (más confianza para Google);
- cada camiseta muestra su política de cambios en los resultados de Google (sale solo cuando "días para cambios" es un número, por ejemplo `15`).

### 8. Que otros sitios hablen de la marca (el SEO que más dura)
Cada enlace de otro sitio hacia `aymuniverse.com` le dice a Google y a las IA que la marca es real:
- **Fundaciones de animales** que reciben la ayuda: pedirles que pongan "con el apoyo de A&M Universe" y el enlace en su web o Instagram.
- **Prensa local**: Crónica del Quindío, La Crónica, emisoras de Calarcá y Armenia: la historia "marca del Quindío que ayuda a los animales de la calle" es noticia.
- **Directorios** gratuitos: Páginas Amarillas Colombia, Cylex, Foursquare, Apple Business Connect (Apple Maps), Bing Places (se importa desde el Perfil de Google).
- **Pinterest**: crear cuenta de empresa y fijar cada camiseta con su enlace (la ropa funciona muy bien ahí).
- Usar siempre el mismo nombre (**A&M Universe**), teléfono y ciudad en todos lados.

### 9. Pequeños ajustes de texto (desde el panel, opcional)
Google lee mucho el título grande de la portada. Hoy dice "Diseño con propósito.". Cambiarlo a algo como **"Camisetas estampadas con propósito"** ayuda a aparecer en esa búsqueda (Panel → Textos → Portada → Título).

---

## Cuánto tarda
- Google y Bing empiezan a mostrar las páginas en **1 a 4 semanas** después del paso 1 y 2.
- Las búsquedas por la marca ("A&M Universe", "aymuniverse") son las primeras en funcionar.
- Búsquedas generales ("camisetas de gatos Colombia") toman **meses** y dependen sobre todo de los pasos 3, 4 y 8.
- ChatGPT y otras IA empiezan a mencionar la tienda cuando Bing ya la tiene y otros sitios hablan de ella.

## Para quien desarrolla
- Generador: `herramientas/seo/generar.js` (se prueba con `node herramientas/seo/generar.js --salida=../_site-prueba`).
- Publicación: `.github/workflows/publicar.yml` (GitHub Pages en modo "GitHub Actions"). Si el generador falla, la tienda se publica igual sin las páginas extra y queda un aviso amarillo en la pestaña **Actions**.
- Clave de IndexNow: el archivo `206473af8cb74387171b409884db9d15.txt` en la raíz. No borrarlo.
- No se publican: los `.md`, `herramientas/`, `cloudflare/`, `wrangler.toml`.
