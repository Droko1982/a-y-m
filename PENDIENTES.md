# ✅ A&M Universe — Estado y lo que falta

**Tienda en vivo:** https://droko1982.github.io/a-y-m/
_Última revisión: julio 2026._

La página ya está **funcionando**: tienda con carrito, hormas (Regular/Oversized),
tallas, 5 métodos de pago, contador de impacto con perrito animado, versión en
inglés, modo claro/oscuro, SEO y páginas legales base.

---

## 🔴 Falta para lanzar 100% (requiere a las dueñas)

### 1) Activar el contador de impacto 🐕
- [ ] Instalar el contador en Cloudflare y **enviar la dirección del Worker**
      (ver [`CONTADOR-MENSAJE-CLIENTAS.md`](CONTADOR-MENSAJE-CLIENTAS.md)).
      Luego se pega en `js/impacto.js` → `IMPACT_API`.
- [ ] (Opcional) Número inicial de camisetas si ya vendieron antes del lanzamiento.
- Hoy el contador muestra **0** (tazón vacío) hasta que se conecte y haya ventas.

### 2) Confirmar datos de pago 💳
- [ ] **Daviplata:** ¿es el mismo número `321 579 9683` o uno distinto?
- [ ] **Bre-B:** ¿cuál es la **llave** exacta (celular, @usuario, correo o cédula)?
- [ ] **Transferencia bancaria:** banco, tipo de cuenta, número y titular
      (hoy dice "coordinamos por WhatsApp"). Se pueden mostrar en el carrito.
- Nequi ya está confirmado (`321 579 9683`). Tarjeta y PSE quedan fuera por ahora.

### 3) Contenido real 📸
- [ ] **Fotos reales de las camisetas** (hoy hay dibujos SVG de referencia).
- [ ] **Fotos reales de los animalitos** que ayudan (hoy `assets/dogs/dog1–4.jpg` de referencia).
- [ ] **Testimonios reales** (con nombre y ciudad, si autorizan).
- [ ] **Logo oficial** en alta calidad (archivo original).
- [ ] **Nombre de la fundación** o a quién ayudan (da confianza).
- [ ] Confirmar **materiales** de las camisetas (algodón, etc.).
> Al llegar este contenido se quitan las notas de "mockup / referencia / ejemplo".

### 4) Datos del negocio 🏪
- [ ] **Redes sociales** (Instagram / Facebook / TikTok) para el pie de página
      y los datos estructurados (`sameAs`, hoy vacío).
- [ ] **Datos legales** en [`politicas.html`](politicas.html): razón social/nombre,
      NIT o cédula, tiempo estimado de envío `[X a Y días]` y de cambios `[X días]`.

---

## 🟢 Ya está listo por nuestra parte ✔️
- Hormas **Regular ($69.000) / Oversized ($79.000)** con selector y precio en vivo.
- **5 métodos de pago** en el carrito (Nequi, Daviplata, Bre-B, transferencia, contra entrega) con iconos.
- Pedido por WhatsApp con **resumen detallado** (ítems, total, envío, pago, datos de envío).
- **Contador de impacto** con perrito animado que come según lo recaudado ($1.000/camiseta, ajustable).
- Correo de marca `aymuniversebrand@gmail.com` en contacto, datos estructurados y políticas.
- Página en **español e inglés**, modo claro/oscuro, SEO, favicon e imagen para compartir.
- Secciones: tienda, Océano, propósito, impacto, **FAQ**, contacto y envíos, políticas.
- **Panel de administración gratuito** en `/admin/`: precios, productos (fotos,
  nombres, Agotado), contador de impacto y los textos de portada, colecciones,
  FAQ y contacto — ver [`PANEL-ADMIN.md`](PANEL-ADMIN.md).

---

## 💡 Opcional / a futuro
- [ ] **Dominio propio** (ej. `aymuniverse.co`) en vez del link largo.
- [ ] **Pagos en línea** (tarjeta / PSE con Wompi o Mercado Pago) — por ahora se cierra por WhatsApp.
- [ ] Mencionar las dos hormas en las descripciones de cada camiseta.

---
📲 Cuando lleguen **fotos, datos de pago, datos legales y la conexión del contador**,
la tienda queda 100% lista. 💚
