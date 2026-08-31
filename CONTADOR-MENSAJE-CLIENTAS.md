# 📩 Contador de impacto — mensaje e instrucciones para las clientas

Guarda aquí todo lo necesario para que las dueñas de A&M activen y manejen el
contador ellas mismas. Ver también la guía técnica: [`CONTADOR-IMPACTO.md`](CONTADOR-IMPACTO.md).

## Enlaces
- **Tienda en vivo:** https://droko1982.github.io/a-y-m/
- **Guía visual para compartir (celular):** https://claude.ai/code/artifact/49793b25-ee4d-41ca-9544-e31111d570c8
- **Demo del perrito (cómo se verá):** https://claude.ai/code/artifact/bb8ebace-bf88-4169-ad34-3bee5f430fb5

> Las guías/demo son enlaces privados de Claude: ábrelos y usa **Compartir** para
> que las clientas los puedan ver.

## Conectar la dirección del Worker (una sola vez)
Ya no hace falta tocar código: la dirección se escribe en el panel.
**Panel → Impacto → "Dirección del contador automático"** → pegar la URL del
Worker (paso 7) → **Save**. En 1–2 min el contador queda en vivo.

Lo pueden hacer las clientas mismas, o quien administra la web si prefieren
mandársela. Si la dirección queda vacía o el Worker falla, el contador sigue
funcionando con el total escrito en el panel (**Impacto → Camisetas vendidas**).

---

## Mensaje para WhatsApp (copiar y pegar)

¡Hola chicas! 💚🐕 Les paso el paso a paso para activar **su contador de camisetas** (el del perrito que come y muestra cuánto reunimos para los animalitos). Se instala **una sola vez** y después ustedes lo manejan con **un solo toque**. Solo necesitan una cuenta gratis de Cloudflare (nada de GitHub). Cualquier duda, mándenme captura. 🐾

━━━━━━━━━━━
🛠️ *PARTE 1 · INSTALAR (una vez, ~10 min)*
━━━━━━━━━━━

*1.* Creen una cuenta gratis en Cloudflare:
👉 https://dash.cloudflare.com/sign-up
(confirmen el correo)

*2.* En el menú de la izquierda: *Workers & Pages* (o *Compute*) → *Create* → *Create Worker* → *Deploy*.
Nómbrenlo: *aym-contador*

*3.* Entren a *Edit code*, borren TODO lo que aparece y peguen nuestro código (tiene botón de copiar 📋 arriba a la derecha):
👉 https://github.com/Droko1982/a-y-m/blob/main/cloudflare/worker.js
Luego toquen *Deploy*.

*4.* Creen el "almacén" del número:
Menú izquierdo → *Storage & Databases* → *KV* → *Create namespace* → nómbrenlo *aym-impacto* → crear.

*5.* Conéctenlo al contador:
Vuelvan a *aym-contador* → *Settings* → *Bindings* → *Add* → *KV namespace*:
   • Variable name: escriban exactamente *IMPACTO* (mayúsculas)
   • KV namespace: elijan *aym-impacto*
   Guarden (*Deploy*).

*6.* Creen su clave secreta:
En el mismo worker → *Settings* → *Variables and Secrets* → *Add*:
   • Nombre: *ADMIN_KEY*
   • Valor: inventen una frase privada (como contraseña), ej. *amy-2026-gatitos*
   Marquen *Encrypt* → guarden (*Deploy*).
   ⚠️ *Anoten esa clave*, la van a usar siempre.

*7.* Arriba en su worker verán una dirección así:
*https://aym-contador.SU-USUARIO.workers.dev*
📩 *Cópienla y envíenmela a mí.* (La clave NO me la manden, esa es privada de ustedes). Con esa dirección yo conecto el contador a la página. ✅

━━━━━━━━━━━
📲 *PARTE 2 · USARLO (para siempre, un toque)*
━━━━━━━━━━━

Su enlace para sumar ventas será (reemplazando lo suyo):
*https://aym-contador.SU-USUARIO.workers.dev/sumar?key=SU-CLAVE*

➡️ Ábranlo una vez y *guárdenlo en la pantalla de inicio* del celular.
➡️ Cada vez que una venta *ya esté pagada*, tóquenlo. Verán "✅ ¡Venta registrada!" y el perrito come más. 🍖

Otros enlaces útiles:
• Sumar varias de una: …/sumar?key=SU-CLAVE*&n=3*
• Restar una (si se equivocaron): …/*restar*?key=SU-CLAVE
• Poner el total exacto: …/*ajustar*?key=SU-CLAVE*&valor=40*

━━━━━━━━━━━
🐾 *REGLAS DE ORO*
━━━━━━━━━━━
• Sumen *solo* cuando el pago esté confirmado.
• Cada camiseta aparta *$1.000* para los animalitos (se calcula solo).
• Su *clave* es privada como una contraseña: no la compartan.

¡Y listo! Con eso ustedes controlan el contador 💚🐕
