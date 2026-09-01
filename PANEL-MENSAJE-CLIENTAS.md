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

## Mensaje 1 · Renombrar la cuenta (1 minuto)

> Mandar ahora. Es lo único que bloquea todo lo demás.

¡Hola chicas! 💚 Antes de pasar la tienda a la cuenta nueva necesito que cambien una cosita, y es rapidísimo.

Cuando se registraron, GitHub les puso un nombre automático largo: *aymuniversebrand-creator*. Ese nombre queda dentro de la dirección de la tienda, así:

❌ aymuniversebrand-creator.github.io/a-y-m

Ya verifiqué que *aymuniverse* está libre, y quedaría así:

✅ aymuniverse.github.io/a-y-m

Mucho más fácil de dictar y de compartir. 🙌

━━━━━━━━━━━
✏️ *CÓMO CAMBIARLO (1 min)*
━━━━━━━━━━━
1️⃣ Entrar a github.com con la cuenta nueva
2️⃣ Arriba a la derecha, tocar la foto de perfil → *Settings*
3️⃣ En el menú de la izquierda: *Account*
4️⃣ Donde dice *Change username*, tocar el botón
5️⃣ Escribir: *aymuniverse*
6️⃣ Confirmar

Es gratis y no se pierde nada. ⚠️ Solo importa hacerlo *ahora*, antes de que yo pase la tienda: si lo cambian después, hay que rehacer un montón de cosas.

Cuando esté, me avisan y sigo con el resto. 🐾

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
