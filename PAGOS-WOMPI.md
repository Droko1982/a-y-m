# Pago en línea con Wompi: cómo activarlo

La tienda ya tiene todo listo para cobrar en línea con **Wompi** (Bancolombia): tarjeta débito o crédito, PSE, Nequi y Botón Bancolombia. Está **apagado** hasta terminar estos pasos. Mientras tanto el carrito funciona como siempre, solo con WhatsApp.

Cuando esté encendido, el carrito muestra:
- **«Pagar $X en línea»** como botón principal. La clienta paga las camisetas en Wompi y ahí mismo escribe su dirección de envío.
- **«Prefiero pedir por WhatsApp»** debajo, para quien no quiera pagar por internet.
- El aviso **«El envío se paga al recibir, según tu ciudad»**.

Al terminar de pagar, la clienta vuelve a `aymuniverse.com/pedido/` y ve si el pago quedó aprobado. Si quedó aprobado, el carrito se vacía solo.

---

## Parte 1 · Las dueñas: abrir la cuenta de Wompi (unos 20 minutos)

1. Entrar a <https://comercios.wompi.co> y registrarse. Sirve como persona natural (cédula) o con RUT. Hay que tener una cuenta bancaria a nombre de quien registra.
2. Apenas se registran, Wompi da **llaves de pruebas** (no mueven dinero real). Están en **Desarrolladores**:
   - Llave pública: `pub_test_…`
   - Llave privada: `prv_test_…`
   - Secreto de integridad: `test_integrity_…`
   - Secreto de eventos: `test_events_…`
3. Wompi revisa los documentos y aprueba la cuenta real en unos días. Ahí aparecen las mismas cuatro llaves con `prod` (`pub_prod_…`, `prv_prod_…`, `prod_integrity_…`, `prod_events_…`).
4. Las llaves se pasan **solo** a quien instala el servidor, por un medio privado. **No** van en el panel, ni en un mensaje de grupo, ni en el repositorio.

## Parte 2 · Quien instala: el servidor de pagos (unos 15 minutos)

El archivo `cloudflare/pagos.js` hace lo que la página no puede hacer sola:
- firma cada pago con el secreto, que no puede ir en la página;
- recalcula el total con los precios publicados, sin creerle al navegador;
- recibe el aviso de Wompi cuando un pago se aprueba;
- guarda los pedidos.

Corre gratis en Cloudflare Workers.

Desde la carpeta del repositorio, en una terminal:

```bash
# 1. Entrar a Cloudflare (abre el navegador; la cuenta gratuita sirve)
npx wrangler login

# 2. Crear el almacén de pedidos y pegar el "id" que devuelve en cloudflare/pagos.toml
npx wrangler kv namespace create PEDIDOS -c cloudflare/pagos.toml

# 3. Publicar el servidor. Al final muestra la dirección:
#    https://aym-pagos.<tu-cuenta>.workers.dev
npx wrangler deploy -c cloudflare/pagos.toml

# 4. Guardar las llaves de PRUEBAS como secretos (cada comando pide el valor)
npx wrangler secret put WOMPI_PUBLICA    -c cloudflare/pagos.toml   # pub_test_…
npx wrangler secret put WOMPI_INTEGRIDAD -c cloudflare/pagos.toml   # test_integrity_…
npx wrangler secret put WOMPI_EVENTOS    -c cloudflare/pagos.toml   # test_events_…
npx wrangler secret put WOMPI_PRIVADA    -c cloudflare/pagos.toml   # prv_test_… (recomendado)
npx wrangler secret put ADMIN_KEY        -c cloudflare/pagos.toml   # una clave larga inventada, para ver los pedidos
```

5. Abrir `https://aym-pagos.<tu-cuenta>.workers.dev/` en el navegador. Debe decir `"modo": "pruebas"` y todo en `true`.
6. En Wompi, en **Desarrolladores → URL de eventos** (la de pruebas), poner `https://aym-pagos.<tu-cuenta>.workers.dev/wompi/eventos`.
7. Hacer commit del `id` pegado en `cloudflare/pagos.toml` (con `git pull --rebase` antes del push).

## Parte 3 · Encenderlo en el panel

**Panel → Pagos → Formas de pago:**
- **Dirección del servidor de pagos:** `https://aym-pagos.<tu-cuenta>.workers.dev`
- **Pago en línea con Wompi:** encendido → **Guardar**.

En unos 2 minutos el botón «Pagar en línea» aparece en el carrito.

## Parte 4 · Probar con dinero de mentira

Con las llaves de pruebas, comprar en la tienda y pagar con:

| Medio | Dato de prueba | Resultado |
|---|---|---|
| Tarjeta | `4242 4242 4242 4242`, cualquier fecha futura y CVC de 3 dígitos | Aprobado |
| Tarjeta | `4111 1111 1111 1111` | Rechazado |
| Nequi | `3991111111` | Aprobado |
| Nequi | `3992222222` | Rechazado |

Revisar que:
- al volver, `/pedido/` diga **«¡Pago aprobado, gracias!»** y el carrito quede vacío (o «El pago no se completó» con el carrito intacto);
- el pedido aparezca en `https://aym-pagos.<tu-cuenta>.workers.dev/pedidos?key=<ADMIN_KEY>` marcado **PRUEBA**, con camisetas, tallas, colores y dirección.

## Parte 5 · Pasar a dinero real

Cuando Wompi apruebe la cuenta:

1. Volver a correr los 4 `secret put` de Wompi con las llaves `prod`: `pub_prod_…`, `prod_integrity_…`, `prod_events_…` y `prv_prod_…`.
2. En Wompi, poner la **URL de eventos de producción**, que es la misma dirección `…/wompi/eventos`.
3. Hacer una compra real pequeña para confirmar. Wompi permite anularla desde su panel.
4. Actualizar los textos que hablan del pago:
   - Panel → Textos → Preguntas frecuentes → «¿Cómo pago mi pedido?»: contar que se puede pagar en línea con tarjeta, PSE o Nequi, o pedir por WhatsApp.
   - `politicas.html` → «4. Formas de pago».

## Para las dueñas, en el día a día

- **Ver los pedidos pagados:** guardar en el celular el enlace `https://aym-pagos.<tu-cuenta>.workers.dev/pedidos?key=<ADMIN_KEY>`. Cada pedido muestra las camisetas (horma, talla, color), el total, el nombre, el correo, el teléfono con botón para escribir por WhatsApp y la dirección de envío. Wompi además manda un correo por cada pago.
- **El envío** se cobra aparte, al recibir: lo paga la clienta a la transportadora.
- **Si algo falla** con el servidor, el carrito muestra un mensaje y la clienta puede pedir por WhatsApp. Para apagar el pago en línea, basta apagar el interruptor en el panel.

## Para quien desarrolla

- Servidor: `cloudflare/pagos.js`, con su configuración en `cloudflare/pagos.toml`.
- Precios para el servidor: `data/tienda.json`, que lo genera `herramientas/seo/generar.js` en cada publicación con los mismos ids que `js/shop.js`. Las tallas agotadas y las camisetas agotadas se rechazan al pagar.
- Firma de integridad: `SHA256(referencia + centavos + "COP" + secreto)`. Coincide con el ejemplo de la documentación de Wompi.
- Aviso de Wompi: se verifica `X-Event-Checksum`, que es SHA256 de los valores de `signature.properties`, más `timestamp` y el secreto de eventos.
- Carrito: `js/cart.js` (busca `pagarEnLinea`). Página de vuelta: `pedido/index.html` y `js/pedido.js`, sin indexar.
- Costos: Cloudflare Workers y KV gratis para este volumen. Wompi cobra su comisión por cada pago aprobado.
