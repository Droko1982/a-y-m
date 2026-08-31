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
| **Pagos** | El número de Nequi y Daviplata, la llave de Bre-B y los datos de la cuenta para transferencias — es lo que ve la clienta en el carrito |
| **Impacto** | El número de camisetas vendidas y la dirección del contador automático (el Worker de Cloudflare) |
| **Textos** | **Todos** los textos del sitio, en español e inglés: portada, colecciones, tienda, la historia de *Océano*, *Propósito*, *Impacto y nuestra causa*, las **preguntas frecuentes** (se pueden agregar, quitar y reordenar) y contacto/envíos |
| **Datos del negocio** | Los datos que en la página de políticas salen `[entre corchetes]` (razón social, NIT o cédula, tiempo de envío, plazo de cambios) y las **redes sociales**, que aparecen en el pie de página |

También hay dos **interruptores** para quitar los avisos de "fotos de
referencia" (uno en *Tienda* y otro en *Impacto*): se apagan el día que
lleguen las fotos reales, sin tocar código.

**Lo que sigue fuera del panel:** el texto completo de las políticas y
términos (`politicas.html`) — solo sus datos `[entre corchetes]` son
editables — y el número de WhatsApp, que está en varios sitios a la vez.
Se pueden agregar si hace falta.

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
     guardar.
   - **Productos** → agregar una camiseta nueva, cambiar su foto, su nombre o
     apagar *¿Disponible?* para que salga **Agotado** → **Save**.
   - **Pagos** → escribir el número de Nequi, el de Daviplata y la llave de
     Bre-B → **Save**. Los datos de la cuenta bancaria son
     opcionales: mientras estén vacíos, el carrito sigue diciendo que se
     coordinan por WhatsApp; al llenarlos, aparecen en el carrito y también en
     el mensaje del pedido.
   - **Impacto** → escribir el nuevo total de camisetas vendidas → **Save** →
     guardar. Aquí también va la **dirección del contador automático**, si
     ya instalaron el Worker de Cloudflare (ver
     [`CONTADOR-MENSAJE-CLIENTAS.md`](CONTADOR-MENSAJE-CLIENTAS.md)).
   - **Textos** → abrir el grupo que quieran (*Portada*, *Colecciones*,
     *Tienda*, *Océano*, *Propósito*, *Impacto y nuestra causa*, *Preguntas
     frecuentes*, *Contacto y envíos*), cambiar el texto → **Save** →
     guardar.
     - Cada texto tiene su casilla en **español** y en **inglés**.
     - Si una casilla se deja **vacía**, el sitio conserva el texto que ya tenía
       (nunca queda un espacio en blanco).
     - En *Preguntas frecuentes* se pueden **agregar** y **quitar** preguntas
       con los botones **+** y **🗑**, y arrastrarlas para cambiar el orden.
     - En *Tienda* y en *Impacto* hay un interruptor **"¿Mostrar el aviso de
       fotos de referencia?"**: apágalo cuando ya estén las fotos reales y el
       aviso desaparece del sitio.
   - **Datos del negocio** → arriba, la razón social, el NIT o cédula, el
     tiempo de envío y el plazo de cambios → cuando los cuatro están llenos, el
     aviso de *"Plantilla base"* de la página de políticas desaparece solo.
     Abajo, las **redes sociales**: se puede escribir solo el usuario
     (`@aymuniverse`) o la dirección completa; los íconos aparecen en el pie de
     la página. → **Save**.
4. Esperar **1–2 minutos** y refrescar el sitio: el cambio ya está publicado.

> **Un solo botón.** El panel guarda y publica en el mismo paso: al pulsar
> **Save** el cambio ya queda hecho, no hay que buscar un segundo botón.
> Si el sitio todavía no muestra el cambio, es cuestión de esperar 1–2
> minutos y refrescar con **Ctrl+F5**.

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
| `data/pagos.json` | `js/cart.js` | Números de billetera y cuenta bancaria |
| `data/impacto.json` | `js/impacto.js` | Total de camisetas y URL del Worker |
| `data/productos.json` | `js/shop.js` | Catálogo de la tienda |
| `data/textos.json` | `js/textos.js` | Todos los textos del sitio (8 grupos) |
| `data/negocio.json` | `js/politicas.js` · `js/redes.js` | Datos legales y redes sociales |

- `js/textos.js` traduce cada campo del panel a una clave de `I18N` en
  `js/main.js` (tabla `MAP`) y vuelve a aplicar el idioma. Los campos vacíos
  se ignoran, así que nunca se borra un texto por accidente.
- Las preguntas frecuentes se pintan en `#faq-list` y además se regenera el
  JSON-LD `FAQPage` (`#faq-jsonld`) con las preguntas en español, para que los
  datos estructurados de SEO no se queden desactualizados.
- El HTML de `index.html` conserva los textos originales: es lo que ven los
  buscadores sin JavaScript. Si las dueñas cambian mucho un texto, conviene
  actualizarlo también en el HTML de vez en cuando.
- Los interruptores de los avisos ("¿Mostrar el aviso de fotos de
  referencia?") son booleanos sueltos en `data/textos.json`; la tabla
  `AVISOS` de `js/textos.js` los asocia a un selector CSS y solo ocultan el
  elemento cuando el panel los apaga explícitamente.
- `js/cart.js` carga `data/config.json` y `data/pagos.json` en paralelo antes
  del primer render; cada campo vacío conserva el valor por defecto. La nota de
  transferencia solo muestra la cuenta si hay banco o número, y se arma con las
  partes que existan (no inventa "a nombre de" si no hay titular).
- `js/redes.js` normaliza lo que escriban (usuario, `@usuario`, dominio sin
  `https` o dirección completa), pinta los íconos en `#footer-social` y
  reescribe `sameAs` en los dos bloques JSON-LD (`#ld-store`, `#ld-org`). Sin
  redes no pinta nada y el pie queda como está hoy.
- `js/impacto.js` lee siempre `data/impacto.json`; si trae una `api` con forma
  de URL, pide ese Worker y usa su total, y si el Worker falla vuelve al total
  local. La constante `IMPACT_API` del archivo manda sobre el panel.
- `js/politicas.js` rellena los huecos `#dato-*` de `politicas.html` con
  `data/negocio.json`, les quita la clase `.ph` (el resaltado de "falta este
  dato") y esconde `#aviso-plantilla` solo cuando los cuatro están completos.
- Para agregar más textos al panel: añadir el campo en `data/textos.json`, el
  par correspondiente en `MAP` (`js/textos.js`) y el campo en la colección
  *Textos* de `admin/config.yml`. Los tres nombres deben coincidir, y el orden
  de los grupos debe ser el mismo en el JSON y en el YAML.
- El panel es un único JS fijado (`@sveltia/cms@0.203.1`); sin servidor ni
  base de datos que mantener. El propio repositorio es el respaldo.
