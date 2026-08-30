# Panel de administración · A&M Universe

Un panel web **gratuito** donde las dueñas inician sesión y editan la tienda.
No se instala ningún programa: es una página web con login. Al guardar, los
cambios se publican solos en el sitio (GitHub Pages) en **1 a 2 minutos**.

- **Dirección del panel:** https://droko1982.github.io/a-y-m/admin/
- **Herramienta:** Sveltia CMS (gratis, código abierto)
- **Costo:** $0 al mes

---

## ✅ Qué se puede editar hoy (Fase 1)

| En el panel | Qué cambia en el sitio |
|---|---|
| **Precios** | Precio de Regular fit y de Oversized en toda la tienda |
| **Impacto** | El número de camisetas vendidas (el contador del perrito) |

**Próximamente (Fase 2):** crear/editar productos, subir fotos, tallas por
producto, marcar *Agotado*, y editar los textos de la web.

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
   - **Impacto** → escribir el nuevo total de camisetas vendidas → **Save** →
     **Publish**.
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
- El sitio lee `data/config.json` (precios) y `data/impacto.json` (contador).
  El panel edita esos archivos; `js/cart.js` e `js/impacto.js` los consumen.
- Fase 2: mover el catálogo a `data/productos.json` y pintar la grilla `#shop`
  desde ahí; añadir colección *Productos* (con imagen, ES/EN, tallas,
  disponible/agotado) y colección *Contenido* al `admin/config.yml`.
- El panel es un único JS fijado (`@sveltia/cms@0.203.1`); sin servidor ni
  base de datos que mantener. El propio repositorio es el respaldo.
