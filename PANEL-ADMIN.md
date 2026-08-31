# Panel de administración · A&M Universe

Un panel web **gratuito** donde las dueñas inician sesión y editan la tienda.
No se instala ningún programa: es una página web con login. Al guardar, los
cambios se publican solos en el sitio (GitHub Pages) en **1 a 2 minutos**.

- **Dirección del panel:** https://droko1982.github.io/a-y-m/admin/
- **Herramienta:** Sveltia CMS (gratis, código abierto)
- **Costo:** $0 al mes

---

## ✅ Qué se puede editar hoy

| En el panel | Qué cambia en el sitio |
|---|---|
| **Precios** | Precio de Regular fit y de Oversized en toda la tienda |
| **Productos** | Crear, editar, reordenar y marcar *Agotado* las camisetas; subir la foto y escribir nombre y descripción en español e inglés |
| **Impacto** | El número de camisetas vendidas (el contador del perrito) |
| **Textos** | Los textos de la **portada**, las **colecciones**, las **preguntas frecuentes** (se pueden agregar, quitar y reordenar) y **contacto/envíos**, en español e inglés |

**Lo que aún no está en el panel:** la narrativa de la página *Océano*, los
textos de *Propósito* e *Impacto*, y las páginas legales (`politicas.html`).
Se pueden agregar más adelante si hace falta.

**Pedidos:** siguen llegando por **WhatsApp** (así ya funciona). Un panel
gratuito no puede tener un tablero de pedidos "de verdad"; si más adelante lo
quieren, se registran los pedidos en una **Google Sheet** gratis. (Opcional.)

---

# PARTE A — Instalación del acceso (una sola vez)

> Esto lo hace **una persona con un poco de práctica** (tú, Mauricio) **una
> sola vez**. Después, las dueñas solo abren la URL e inician sesión. Toma
> ~15 minutos.

Se necesitan dos cosas gratuitas: una **App OAuth de GitHub** y un pequeño
**Worker de Cloudflare** que conecta el login (ya usamos Cloudflare para el
contador, así que la cuenta ya existe).

### Paso 1 · Desplegar el Worker de autenticación (Cloudflare)

1. Entra a **https://github.com/sveltia/sveltia-cms-auth**.
2. Usa el botón **"Deploy to Cloudflare"** (o `wrangler deploy` si sabes).
   Inicia sesión en Cloudflare y despliega.
3. Copia la URL que te queda, algo como:
   `https://sveltia-cms-auth.TU-SUBDOMINIO.workers.dev`
   *(la usaremos en el Paso 2 y en el Paso 4).*

### Paso 2 · Crear la App OAuth de GitHub

1. Entra a **https://github.com/settings/applications/new**
2. Llena:
   - **Application name:** `A&M Universe Panel`
   - **Homepage URL:** `https://droko1982.github.io/a-y-m/`
   - **Authorization callback URL:**
     `https://sveltia-cms-auth.TU-SUBDOMINIO.workers.dev/callback`
     *(la URL del Worker del Paso 1, terminada en `/callback`)*
3. Clic en **Register application**.
4. Copia el **Client ID**. Luego clic en **Generate a new client secret** y
   copia el **Client Secret** (guárdalo, no se vuelve a mostrar).

### Paso 3 · Poner las llaves en el Worker (Cloudflare)

En el panel de Cloudflare → tu Worker `sveltia-cms-auth` → **Settings →
Variables and Secrets**, agrega:

| Nombre | Valor |
|---|---|
| `GITHUB_CLIENT_ID` | el Client ID del Paso 2 |
| `GITHUB_CLIENT_SECRET` | el Client Secret del Paso 2 (marca **Encrypt**) |
| `ALLOWED_DOMAINS` | `droko1982.github.io` |

Guarda y despliega (Deploy).

### Paso 4 · Conectar el panel con el Worker

1. Abre el archivo **`admin/config.yml`** del repositorio (en GitHub puedes
   editarlo en el navegador: lápiz ✏️).
2. Busca la línea `base_url:` y reemplaza el texto de ejemplo por la URL de
   tu Worker (sin `/callback`):
   ```yaml
   base_url: https://sveltia-cms-auth.TU-SUBDOMINIO.workers.dev
   ```
3. Guarda (Commit).

### Paso 5 · Dar acceso a las dueñas

Cada dueña que vaya a editar necesita:
1. Una **cuenta de GitHub** gratis (https://github.com/signup) — solo correo
   y contraseña. No necesitan saber programar.
2. Que la agregues como **colaboradora** del repositorio:
   GitHub → repo `a-y-m` → **Settings → Collaborators → Add people** →
   escribe su usuario de GitHub → **Add**. Ella acepta la invitación que le
   llega al correo.

**Listo.** El acceso queda instalado. No hay que repetir esto.

---

# PARTE B — Cómo lo usan las dueñas (el día a día)

> Esto es **fácil**. Pásales estas instrucciones.

1. Abrir **https://droko1982.github.io/a-y-m/admin/**
2. Clic en **"Sign in with GitHub"** y autorizar (la primera vez).
3. Elegir la sección en el menú:
   - **Precios** → cambiar el valor de Regular u Oversized → **Save** →
     **Publish**.
   - **Productos** → agregar una camiseta nueva, cambiar su foto, su nombre o
     apagar *¿Disponible?* para que salga **Agotado** → **Save** → **Publish**.
   - **Impacto** → escribir el nuevo total de camisetas vendidas → **Save** →
     **Publish**.
   - **Textos** → abrir el grupo que quieran (*Portada*, *Colecciones*,
     *Preguntas frecuentes*, *Contacto y envíos*), cambiar el texto → **Save**
     → **Publish**.
     - Cada texto tiene su casilla en **español** y en **inglés**.
     - Si una casilla se deja **vacía**, el sitio conserva el texto que ya tenía
       (nunca queda un espacio en blanco).
     - En *Preguntas frecuentes* se pueden **agregar** y **quitar** preguntas
       con los botones **+** y **🗑**, y arrastrarlas para cambiar el orden.
4. Esperar **1–2 minutos** y refrescar el sitio: el cambio ya está publicado.

### "Instalar" el acceso en el PC (opcional, para tenerlo a mano)

No se instala nada de verdad, pero se puede dejar como un ícono:
- **Acceso directo:** arrastrar la barra de dirección al escritorio, o
  Menú del navegador → **Más herramientas → Crear acceso directo**.
- **Como app (PWA):** en Chrome/Edge, ícono de instalar ⊕ en la barra de
  direcciones → **Instalar** — queda como una app con su propio ícono.

### Si algo sale mal
- Todos los cambios quedan guardados en GitHub con **historial**: siempre se
  puede **volver atrás** a una versión anterior. Nada se pierde.
- Si un cambio no aparece, esperar 2 minutos y refrescar con **Ctrl+F5**.

---

## Notas técnicas (para el desarrollador)

El panel solo edita archivos JSON; el sitio los lee al cargar y, si alguno
falla, se queda con lo que ya está escrito en el HTML (respaldo).

| Archivo | Lo consume | Qué controla |
|---|---|---|
| `data/config.json` | `js/cart.js` | Precios de las dos hormas |
| `data/impacto.json` | `js/impacto.js` | Total de camisetas del contador |
| `data/productos.json` | `js/shop.js` | Catálogo de la tienda |
| `data/textos.json` | `js/textos.js` | Textos de portada, colecciones, FAQ y contacto |

- `js/textos.js` traduce cada campo del panel a una clave de `I18N` en
  `js/main.js` (tabla `MAP`) y vuelve a aplicar el idioma. Los campos vacíos
  se ignoran, así que nunca se borra un texto por accidente.
- Las preguntas frecuentes se pintan en `#faq-list` y además se regenera el
  JSON-LD `FAQPage` (`#faq-jsonld`) con las preguntas en español, para que los
  datos estructurados de SEO no se queden desactualizados.
- El HTML de `index.html` conserva los textos originales: es lo que ven los
  buscadores sin JavaScript. Si las dueñas cambian mucho un texto, conviene
  actualizarlo también en el HTML de vez en cuando.
- Para agregar más textos al panel: añadir el campo en `data/textos.json`, el
  par correspondiente en `MAP` (`js/textos.js`) y el campo en la colección
  *Textos* de `admin/config.yml`. Los tres nombres deben coincidir.
- El panel es un único JS fijado (`@sveltia/cms@0.203.1`); sin servidor ni
  base de datos que mantener. El propio repositorio es el respaldo.
