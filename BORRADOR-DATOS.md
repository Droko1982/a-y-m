# 📝 Borrador de los datos que faltan

Todo lo que falta, **relleno con ejemplos realistas** para que las dueñas
corrijan en vez de inventar desde cero. Es más fácil decir "no, el banco es
Nequi" que responder una pregunta en blanco.

> ⚠️ **Nada de esto está publicado.** Los archivos reales del repositorio siguen
> vacíos a propósito: publicar una cuenta bancaria o una cédula inventadas en una
> tienda en vivo sería engañar a quien compre. Estos valores solo existen aquí y
> en las capturas de simulación.

**Verificado:** con estos datos puestos, la tienda se ve como en las capturas de
`sim-carrito.png`, `sim-politicas.png` y `sim-pie.png` (generadas el 2026-09-23).
Ninguno de los campos quedó sin efecto.

---

## 💳 Pagos → sección **Pagos** del panel

| Campo del panel | Borrador | Dónde se ve |
|---|---|---|
| Nequi · número | `321 579 9683` | Carrito, al elegir Nequi |
| Daviplata · número | `321 579 9683` | Carrito, al elegir Daviplata |
| Bre-B · llave | `321 579 9683` | Carrito, al elegir Bre-B |
| Transferencia · banco | `Bancolombia` | Carrito + mensaje de WhatsApp |
| Transferencia · tipo de cuenta | `Ahorros` | ” |
| Transferencia · número de cuenta | `912-345678-90` | ” |
| Transferencia · a nombre de | `Cristina Marín` | ” |

**Lo único que hace falta preguntar de verdad:**
1. ¿Daviplata es el mismo número que Nequi, o distinto?
2. ¿La llave de Bre-B es el celular, un @usuario, un correo o la cédula?
3. ¿Quieren recibir transferencias? Si no, los 4 campos del banco se dejan
   vacíos y el carrito sigue diciendo que se coordina por WhatsApp.

Con la cuenta llena, el pedido que les llega dice:
`Pago: Transferencia bancaria (Bancolombia Ahorros 912-345678-90)` — así no hay
que dictar los datos en cada venta.

---

## 📄 Datos legales → sección **Datos del negocio**

| Campo del panel | Borrador | Nota |
|---|---|---|
| Razón social o nombre del responsable | `Cristina Marín` | Quien responde legalmente por el negocio |
| NIT o cédula | `C.C. 1.094.123.456` | Si no hay empresa, la cédula sirve |
| Tiempo estimado de envío | `2 a 5 días hábiles` | El que de verdad cumplan |
| Plazo para cambios de talla | `8 días` | Lo que estén dispuestas a sostener |
| Fecha de última actualización | `septiembre de 2026` | Se escribe sola en los 3 documentos |

Al completar los cuatro primeros, el aviso amarillo de **"Plantilla base"**
desaparece solo de la página de políticas.

> Conviene que un contador o alguien con experiencia revise los plazos antes de
> publicarlos: son un compromiso frente al Estatuto del Consumidor.

---

## 📱 Redes → sección **Datos del negocio**

| Campo | Borrador | Resultado |
|---|---|---|
| Instagram | `@aymuniverse` | Ícono en el pie + Google lo reconoce como cuenta oficial |
| Facebook | `aymuniverse` | ” |
| TikTok | `@aymuniverse` | ” |

Sirve el usuario solo, con o sin `@`, o la dirección completa. Las que no tengan,
se dejan vacías y no aparece su ícono.

---

## 📸 Fotos reales → sección **Productos**

Lo que hay hoy son **dibujos de referencia**, no fotos.

- **Formato:** cuadradas (igual de alto que de ancho), mínimo **1000 × 1000 px**,
  fondo claro y parejo. JPG o PNG.
- Una por diseño: Océano, Coral, Ballena, Tortuga.
- Si la foto es rectangular, la tienda la recorta al centro y puede quedar mal
  encuadrada.

Cuando estén subidas, se apaga el aviso de "fotos de referencia" desde
**Textos → Tienda → ¿Mostrar el aviso de fotos de referencia?**

**Lo mismo con los animalitos:** `assets/dogs/dog1–4.jpg` son fotos de relleno.
Esas no se suben por el panel, hay que pasarlas por acá. Al cambiarlas se apaga
su aviso en **Textos → Impacto**.

---

## 🐕 El contador de impacto

- **Hoy:** el total se escribe a mano en **Impacto → Camisetas vendidas**.
  Funciona perfecto; solo hay que acordarse de actualizarlo.
- **Opcional:** instalando el Worker de Cloudflare
  ([`CONTADOR-MENSAJE-CLIENTAS.md`](CONTADOR-MENSAJE-CLIENTAS.md)) el número se
  suma con un toque desde el celular. Su dirección se pega en
  **Impacto → Dirección del contador automático**.

---

## ❓ Lo que todavía no tiene respuesta

Cosas que el sitio menciona o insinúa y que nadie ha definido:

1. **¿A qué fundación ayudan?** El sitio habla de "fundaciones y animales de la
   calle" sin nombrar ninguna. Nombrarla daría mucha más confianza.
2. **¿Cuánto de cada venta se destina?** El contador asume **$1.000 por
   camiseta**. Si es otra cifra, se cambia en `js/impacto.js`.
3. **¿De qué material son las camisetas?** La FAQ dice "algodón suave" sin más.
4. **Testimonios reales.** Hoy no hay sección para ellos — la de "Historias" se
   quitó. Si consiguen 2 o 3 con nombre y ciudad, vale la pena volver a crearla.
5. **Logo en alta calidad.** El actual se ve bien, pero si existe el original
   conviene tenerlo.

---

## 📲 Mensaje para mandarles

> ¡Hola chicas! 💚 Les dejé **todo rellenado con datos de ejemplo** para que sea
> más fácil: en vez de responder preguntas en blanco, solo me corrigen lo que
> esté mal. Les mando 3 capturas de cómo se vería 👇
>
> ━━━━━━━━━━━
> 💳 *PAGOS*
> ━━━━━━━━━━━
> Puse esto de ejemplo:
> • Nequi: 321 579 9683
> • Daviplata: 321 579 9683
> • Bre-B: 321 579 9683
> • Banco: Bancolombia · Ahorros · 912-345678-90
> • A nombre de: Cristina Marín
>
> ❓ *¿Daviplata es el mismo número o otro?*
> ❓ *La llave de Bre-B, ¿es el celular, un @usuario, correo o cédula?*
> ❓ *¿Quieren recibir transferencias? Si no, lo quitamos y ya.*
>
> ━━━━━━━━━━━
> 📄 *DATOS LEGALES*
> ━━━━━━━━━━━
> • A cargo de: Cristina Marín
> • C.C. 1.094.123.456
> • Envío: 2 a 5 días hábiles
> • Cambios de talla: 8 días
>
> ❓ *¿Quién responde legalmente por el negocio y con qué cédula o NIT?*
> ❓ *¿Cuántos días se demora de verdad un envío?*
> ❓ *¿Cuántos días dan para cambiar una talla?*
>
> (Estos dos últimos son un compromiso legal, así que mejor poner lo que sí
> puedan cumplir 🙏)
>
> ━━━━━━━━━━━
> 📱 *REDES*
> ━━━━━━━━━━━
> ❓ *Pásenme el usuario de Instagram, Facebook y TikTok* (las que tengan)
>
> ━━━━━━━━━━━
> 📸 *FOTOS*
> ━━━━━━━━━━━
> Las camisetas que se ven ahora son dibujos, no fotos.
> ❓ *¿Ya tienen fotos reales?* Las necesito **cuadradas**, mínimo 1000×1000 px,
> con fondo claro. Una por diseño.
>
> ━━━━━━━━━━━
> 💭 *Y tres preguntas de fondo*
> ━━━━━━━━━━━
> ❓ *¿A qué fundación ayudan?* (nombrarla da mucha confianza)
> ❓ *¿Cuánto de cada camiseta se destina?* (hoy está en $1.000)
> ❓ *¿De qué material son exactamente?*
>
> Lo que no sepan todavía, lo dejan en blanco y listo: la tienda funciona igual
> con los textos provisionales 🐾
