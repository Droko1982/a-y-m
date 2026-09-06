# 📩 Panel de administración — mensajes para las clientas

Mensajes listos para copiar y pegar por WhatsApp, en el orden en que hay que
mandarlos. La guía técnica completa está en
[`MUDANZA-DE-CUENTA.md`](MUDANZA-DE-CUENTA.md) y [`PANEL-ADMIN.md`](PANEL-ADMIN.md).

## Enlaces
- **Tienda en vivo (hoy):** https://droko1982.github.io/a-y-m/
- **Guía del panel para las dueñas:** https://claude.ai/code/artifact/876da455-70a2-4f47-8720-13dbc4a1253a

> ⚠️ La guía es un enlace **privado** de Claude. Hay que abrirla y usar el menú
> de **Compartir** del propio artifact; si solo se copia la URL, a las clientas
> les sale un error de acceso en vez de la guía.

## El orden importa

1. **Renombrar la cuenta** a `aymuniverse` — _mensaje 1_
2. Transferir el repositorio — lo lanza quien administra, ellas aceptan
3. Activar GitHub Pages — _mensaje 2_
4. Worker de Cloudflare + App OAuth — _mensaje 3_
5. Agregarlas como colaboradoras — lo hace quien administra

> Si se instala el login (pasos 4 y 5) **antes** de mudar, hay que rehacerlo
> todo: el callback de OAuth, el dominio permitido y las 27 direcciones del
> sitio. Por eso el orden.

---

## Mensaje 1 · Renombrar la cuenta de GitHub (1 minuto)

> Estado verificado el 2026-09-06: la cuenta de GitHub que existe es
> **`aymuniversebrand-creator`**, creada el 31 de agosto. El correo
> `aym.universedesing@gmail.com` que mandó Dahianna es una cuenta de **Gmail**,
> no de GitHub — ya quedó como el correo de contacto de la tienda.

¡Hola chicas! 💚 Ya tengo todo listo de mi lado. Falta una cosita de ustedes y es rapidísima.

Son dos cuentas distintas y es fácil confundirlas:

📧 *El correo* (Gmail) — el que crearon: aym.universedesing@gmail.com
   Ese ya lo dejé puesto como correo de contacto de la tienda ✅

🐙 *La cuenta de GitHub* — donde vive la tienda
   Esa ya existe también, pero le quedó un nombre automático largo:
   *aymuniversebrand-creator*

Ese nombre se mete dentro de la dirección de la tienda:

❌ aymuniversebrand-creator.github.io/a-y-m
✅ aymuniverse.github.io/a-y-m

Ya verifiqué que *aymuniverse* está libre. Es el mismo link que van a compartir por Instagram y WhatsApp, así que vale la pena que sea corto. 🙌

━━━━━━━━━━━
✏️ *CÓMO CAMBIARLO (1 min)*
━━━━━━━━━━━
1️⃣ Entrar a *github.com* (no a Gmail)
2️⃣ Iniciar sesión — es la cuenta que crearon el domingo pasado
3️⃣ Arriba a la derecha, tocar la foto de perfil → *Settings*
4️⃣ En el menú de la izquierda: *Account*
5️⃣ Donde dice *Change username*, tocar el botón
6️⃣ Escribir: *aymuniverse*
7️⃣ Confirmar

Es gratis y no se pierde nada. ⚠️ Lo importante es hacerlo *ahora*, antes de que yo les pase la tienda: si se cambia después, hay que rehacer un montón de cosas.

Si no recuerdan con cuál correo entraron a GitHub, prueben con *aymuniversebrand@gmail.com* — si tampoco, mándenme captura de lo que les salga y lo resolvemos. 🐾

Cuando esté, me avisan con un ✅ y yo sigo con todo lo demás.

---

## 🔒 Aparte: cambiar la contraseña del correo

> Mandar por separado. La contraseña de `aym.universedesing@gmail.com` viajó por
> el chat, así que quedó en el historial de WhatsApp de varias personas y en las
> copias de seguridad de sus celulares. **No se guarda en ningún archivo de este
> proyecto y no hace falta para nada de lo que viene.**

Chicas, un consejo de seguridad 🔐 La contraseña que me pasaron por acá quedó guardada en el chat, y WhatsApp hace copias en la nube. Mejor cambiarla:

1️⃣ Entrar a Gmail con esa cuenta
2️⃣ Foto de perfil → *Gestionar tu cuenta de Google*
3️⃣ Pestaña *Seguridad* → *Contraseña*
4️⃣ Poner una nueva

Y si pueden, activen ahí mismo la *verificación en 2 pasos*: es lo que de verdad protege la cuenta aunque alguien sepa la clave. 💚

No hace falta que me la manden: para todo lo que sigue ustedes hacen los clics desde su sesión, yo nunca necesito su contraseña.

---

## Mensaje 2 · Aceptar la tienda y encenderla

> Mandar cuando ya se lanzó la transferencia.

¡Listo chicas! Ya les mandé la tienda a su cuenta nueva. Faltan dos toques de ustedes. 💚

━━━━━━━━━━━
📬 *PARTE 1 · ACEPTAR*
━━━━━━━━━━━
1️⃣ Les llegó un correo de GitHub que dice algo como *"invitation to transfer a-y-m"*
2️⃣ Ábranlo y toquen el botón para aceptar
3️⃣ (Si no llega el correo, entren a github.com con la cuenta nueva y arriba les aparece el aviso)

━━━━━━━━━━━
🌐 *PARTE 2 · ENCENDER LA PÁGINA*
━━━━━━━━━━━
1️⃣ Ya dentro, entrar al repositorio *a-y-m*
2️⃣ Arriba, tocar *Settings*
3️⃣ En el menú de la izquierda, buscar *Pages*
4️⃣ Donde dice *Source*, elegir *Deploy from a branch*
5️⃣ En *Branch* elegir *main*, y al lado la carpeta */ (root)*
6️⃣ Tocar *Save*

En 1 o 2 minutos la tienda queda publicada en la dirección nueva. Me avisan y yo dejo todo apuntando ahí. 🐾

---

## Mensaje 3 · Instalar el acceso al panel (~10 min)

> Mandar cuando la tienda ya esté publicada en la dirección nueva.
> Requiere una cuenta gratis de Cloudflare (sirve la misma del contador).

¡Vamos con el último paso, chicas! 🎉 Este es el que les abre *su panel*, donde van a poder cambiar precios, subir fotos y editar textos ustedes mismas, sin depender de nadie.

Son dos cositas que se hacen *una sola vez*. Tómense su tiempo y mándenme captura de lo que les pida. 💚

━━━━━━━━━━━
☁️ *PARTE 1 · CLOUDFLARE (~4 min)*
━━━━━━━━━━━
1️⃣ Entrar a: github.com/sveltia/sveltia-cms-auth
2️⃣ Bajar un poquito y tocar el botón que dice *Deploy to Cloudflare*
3️⃣ Iniciar sesión en Cloudflare (o crear la cuenta gratis)
4️⃣ Seguir el asistente hasta el final
5️⃣ Al terminar les queda una dirección parecida a:
    sveltia-cms-auth.algo.workers.dev
    📸 *Mándenme esa dirección* (o captura)

━━━━━━━━━━━
🔑 *PARTE 2 · LA LLAVE DE GITHUB (~5 min)*
━━━━━━━━━━━
1️⃣ Con la cuenta *aymuniverse*, entrar a:
    github.com/settings/applications/new
2️⃣ Llenar así:
    • *Application name:* A&M Universe Panel
    • *Homepage URL:* la dirección de la tienda
    • *Authorization callback URL:* la dirección de Cloudflare de la Parte 1, agregándole */callback* al final
3️⃣ Tocar *Register application*
4️⃣ Copiar el *Client ID*
5️⃣ Tocar *Generate a new client secret* y copiar el *Client Secret*
    ⚠️ Ese código *solo se muestra una vez*: cópienlo enseguida
6️⃣ 📸 Mándenme los dos códigos por acá

Con eso yo conecto el panel y les mando el enlace con su clave. De ahí en adelante, la tienda es suya. 🐾💚

---

## Mensaje 4 · Ya está listo

> Mandar cuando el panel ya deja iniciar sesión.

¡Listo chicas, ya tienen su panel! 🎉💚

👉 (dirección del panel)

━━━━━━━━━━━
▶️ *PARA ENTRAR*
━━━━━━━━━━━
1️⃣ Abrir el enlace
2️⃣ Tocar *Sign in with GitHub*
3️⃣ Entrar con su cuenta y autorizar

Les recomiendo *guardarlo en favoritos* o dejarlo como acceso directo en la pantalla del celular.

Les paso también la guía con todo explicado paso a paso — precios, fotos, textos, el contador del perrito y qué hacer si algo sale mal:

👉 (enlace de la guía)

Lo único que hay que recordar: *hay un solo botón, Save*. Al tocarlo el cambio ya quedó publicado, y la tienda tarda 1 o 2 minutos en mostrarlo. 🐾
