# 🔓 Abrir el panel ya, sin esperar la mudanza

> **Por qué este documento.** El acceso al panel se había encadenado a la mudanza
> de cuenta, y eso tuvo a las dueñas bloqueadas dos semanas sin necesidad.
> El panel funciona perfectamente en el repositorio actual. La mudanza es una
> decisión de **propiedad**, no un requisito para que entren.
>
> Si más adelante se muda la cuenta, rehacer esto cuesta ~5 minutos (cambiar el
> callback de la App OAuth, `ALLOWED_DOMAINS` y `base_url`). Ver
> [`MUDANZA-DE-CUENTA.md`](MUDANZA-DE-CUENTA.md).

## Estado

| | |
|---|---|
| Repositorio | `Droko1982/a-y-m` |
| Tienda | https://droko1982.github.io/a-y-m/ |
| Panel | https://droko1982.github.io/a-y-m/admin/ |
| Colaboradora | ✅ **aceptada** — `aymuniversebrand-creator` con permiso de escritura |
| `base_url` en `admin/config.yml` | ⏳ solo hace falta para la vía OAuth |

---

## ⚡ Atajo verificado: entrar HOY, sin Cloudflare

El panel tiene un segundo modo de entrada, **Sign In Using Access Token**, que
no usa el Worker ni la App OAuth. Comprobado en el panel real (v0.203.1): el
botón existe y pide un token con acceso de lectura/escritura al repositorio.
`base_url` puede seguir con el texto de ejemplo.

**Quién lo hace:** la dueña, desde el dispositivo donde va a usar el panel.
**Una sola vez por dispositivo.**

### Crear el token (con la cuenta `aymuniversebrand-creator`)

1. Entrar a **https://github.com/settings/tokens/new** (token *clásico*).
2. **Note:** `Panel A&M Universe`
3. **Expiration:** lo que prefieran (90 días, 1 año, o sin caducidad).
4. Marcar **solo** la casilla **`repo`**.
5. **Generate token** y copiar el código que aparece (empieza por `ghp_`).
   ⚠️ Solo se muestra una vez.

> **Por qué clásico y no "fine-grained":** los tokens de grano fino solo
> alcanzan repositorios de la propia cuenta, y `a-y-m` todavía pertenece a
> `Droko1982`. El token clásico con `repo` sí funciona para un repositorio
> donde se es colaboradora. Ese alcance cubre todos los repos de la cuenta,
> pero esa cuenta no tiene ningún otro, así que no expone nada más.

### Entrar

1. Abrir **https://droko1982.github.io/a-y-m/admin/**
2. Pulsar **Sign In Using Access Token**
3. Pegar el token y **Sign In**

El token queda guardado en ese navegador. En otro teléfono o computador hay que
volver a pegarlo (el mismo sirve).

⚠️ El token es una llave: no se manda por WhatsApp ni a nadie, tampoco a
quien administra. Si se filtra, se borra en la misma página y se crea otro.

---

## La otra vía (opcional, más cómoda a la larga)

Con el Worker y la App OAuth, la entrada es solo **Sign In with GitHub**: sin
tokens que copiar ni que caduquen. Son ~10 minutos de quien administra y se
puede hacer cuando haya tiempo, sin prisa, porque el atajo de arriba ya las
dejó trabajando.

## Los dos pasos que necesitan un navegador

No se pueden hacer por API: GitHub no permite crear Apps OAuth
programáticamente y Cloudflare necesita sesión iniciada. **Hazlos tú** — si los
hace la clienta, se traba, y ya lo vimos.

### Paso 1 · Desplegar el Worker (~4 min)

1. Abrir **https://github.com/sveltia/sveltia-cms-auth**
2. Botón **"Deploy to Cloudflare"** → iniciar sesión → desplegar.
   Si pide las variables ahora, se pueden dejar vacías: se llenan en el paso 3.
3. **Anotar la dirección del Worker.** Queda algo como:
   `https://sveltia-cms-auth.TU-SUBDOMINIO.workers.dev`

### Paso 2 · Crear la App OAuth (~5 min)

Con **cualquier** cuenta de GitHub que tenga acceso al repositorio (sirve
`Droko1982`): **https://github.com/settings/applications/new**

| Campo | Valor exacto |
|---|---|
| Application name | `A&M Universe Panel` |
| Homepage URL | `https://droko1982.github.io/a-y-m/` |
| Authorization callback URL | la dirección del Worker del paso 1 **+ `/callback`** |

→ **Register application**
→ copiar el **Client ID**
→ **Generate a new client secret** → copiar el **Client Secret**
⚠️ El secret solo se muestra una vez.

### Paso 3 · Poner las tres variables en Cloudflare

Panel de Cloudflare → Worker `sveltia-cms-auth` → **Settings → Variables and
Secrets**:

| Nombre | Valor |
|---|---|
| `GITHUB_CLIENT_ID` | el Client ID del paso 2 |
| `GITHUB_CLIENT_SECRET` | el Client Secret (marcar **Encrypt**) |
| `ALLOWED_DOMAINS` | `droko1982.github.io` |

Guardar y **Deploy**.

### Paso 4 · Lo hago yo

Mándame solo **la dirección del Worker** y pongo el `base_url` en
`admin/config.yml`. En 1–2 minutos el panel deja iniciar sesión.

> No me hace falta el Client Secret: ese vive únicamente en Cloudflare.
> Si me lo mandas por chat, cámbialo después (se regenera con un botón).

---

## Qué tiene que hacer la clienta

**Un solo paso.** Aceptar la invitación y entrar:

1. Le llegó un correo de GitHub a la cuenta `aymuniversebrand-creator`
   («invited you to collaborate»). Aceptarla.
2. Abrir el panel y pulsar **Sign In Using Access Token** (mientras el Worker no exista, es el único botón que se muestra).

Nada de Cloudflare, nada de OAuth, nada de renombrar cuentas.

---

## Comprobar que quedó bien

- [ ] El panel deja pulsar **Sign In Using Access Token**, acepta el código y entra sin error.
- [ ] Cambiar un precio y verlo en la tienda a los 1–2 minutos.
- [ ] Subir una foto en Productos y comprobar que se ve (no debe salir rota).
- [ ] Marcar una camiseta como Agotado y ver el sello en la tienda.

## Lo que queda aparte, sin prisa

- **La mudanza de cuenta** (`MUDANZA-DE-CUENTA.md`): decisión de propiedad.
  Cuando quieran, el renombrado a `aymuniverse` y la transferencia siguen ahí.
- **El contador de impacto**: su Worker es otro, independiente de esto, y su
  dirección se escribe desde el panel (**Impacto → Dirección del contador**).
- **Cuentas propias para cada dueña**: por ahora comparten
  `aymuniversebrand-creator`. Si más adelante quieren entrar cada una con su
  cuenta, se agregan como colaboradoras y listo.
