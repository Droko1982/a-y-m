# 🚚 Mudanza a la cuenta de marca

Guía para pasar la tienda de la cuenta personal (`Droko1982`) a una cuenta de
GitHub propia de A&M Universe, y dejar el panel funcionando.

> **El orden importa.** Si se instala el login (Worker + App OAuth) **antes** de
> mudar el repositorio, hay que rehacerlo todo: el callback de OAuth, el dominio
> permitido, la dirección del panel y las 27 direcciones del sitio.
> **Primero la mudanza, después el login.**

---

## Antes de empezar

- [ ] Crear la cuenta de GitHub de la marca con **aymuniversebrand@gmail.com**
      (usuario sugerido: `aymuniverse`) y **enviar el nombre de usuario**.
- [ ] Tener a mano la cuenta de Cloudflare (la misma del contador sirve).

Nada más. Los pasos 1 a 6 se hacen de corrido en un rato.

---

## Paso 1 · Mover el repositorio

En GitHub, desde la cuenta actual:
**repositorio `a-y-m` → Settings → General → abajo del todo, Danger Zone →
Transfer ownership** → escribir el usuario nuevo → confirmar.

La cuenta nueva recibe una invitación por correo y la acepta. Se conserva todo:
el historial, los archivos y las versiones anteriores.

> Alternativa si prefieren no transferir: crear el repositorio nuevo vacío y
> subir el proyecto con `git remote set-url origin <repo nuevo>` + `git push`.
> Se pierde el historial de quién hizo qué, pero funciona igual.

## Paso 2 · Encender la web en la cuenta nueva

En el repositorio nuevo: **Settings → Pages → Source: Deploy from a branch →
Branch: `main` / carpeta `/ (root)` → Save**.

En 1–2 minutos la tienda queda publicada en la dirección nueva, algo como
`https://aymuniverse.github.io/a-y-m/`. **Anotar esa dirección.**

## Paso 3 · Cambiar la dirección dentro del sitio

Hay 27 direcciones escritas dentro de los archivos (el `canonical`, las
etiquetas para compartir, los datos estructurados, el mapa del sitio…). Si se
olvida una, el sitio se ve bien pero Google sigue viendo el sitio viejo.

Desde la carpeta del proyecto, en la terminal:

```bash
# Primero mirar qué cambiaría, sin tocar nada:
node herramientas/cambiar-direccion.js --sitio=https://aymuniverse.github.io/a-y-m/ --repo=aymuniverse/a-y-m --revisar

# Si se ve bien, hacerlo de verdad:
node herramientas/cambiar-direccion.js --sitio=https://aymuniverse.github.io/a-y-m/ --repo=aymuniverse/a-y-m
```

El script avisa si queda alguna dirección vieja suelta. Después:

```bash
git add -A && git commit -m "Mudanza a la cuenta de marca" && git push
```

> El día que compren un dominio propio (ej. `aymuniverse.co`) se usa el mismo
> script con `--sitio=https://aymuniverse.co/`.

## Paso 4 · Desplegar el Worker del login (Cloudflare)

1. Entrar a **https://github.com/sveltia/sveltia-cms-auth**.
2. Botón **"Deploy to Cloudflare"**, iniciar sesión y desplegar.
3. **Anotar la dirección del Worker**, algo como
   `https://sveltia-cms-auth.TU-SUBDOMINIO.workers.dev`.

## Paso 5 · Crear la App OAuth de GitHub

Desde la **cuenta de marca**, en https://github.com/settings/applications/new:

| Campo | Qué poner |
|---|---|
| Application name | `A&M Universe Panel` |
| Homepage URL | la dirección de la tienda (paso 2) |
| Authorization callback URL | la dirección del Worker (paso 4) **+ `/callback`** |

**Register application** → copiar el **Client ID** → **Generate a new client
secret** → copiar el **Client Secret** (no se vuelve a mostrar).

## Paso 6 · Conectar las llaves

**a) En Cloudflare**, Worker `sveltia-cms-auth` → **Settings → Variables and
Secrets**:

| Nombre | Valor |
|---|---|
| `GITHUB_CLIENT_ID` | el Client ID del paso 5 |
| `GITHUB_CLIENT_SECRET` | el Client Secret (marcar **Encrypt**) |
| `ALLOWED_DOMAINS` | el dominio de la tienda, sin `https://` ni barras (ej. `aymuniverse.github.io`) |

Guardar y **Deploy**.

**b) En el repositorio**, editar `admin/config.yml` y cambiar la línea
`base_url:` por la dirección del Worker **sin** `/callback`:

```yaml
base_url: https://sveltia-cms-auth.TU-SUBDOMINIO.workers.dev
```

Guardar (commit). En 1–2 minutos el panel ya deja iniciar sesión.

## Paso 7 · Dar acceso a las dueñas

Cada dueña necesita:
1. Una **cuenta de GitHub gratis** (https://github.com/signup): solo correo y
   contraseña, no hay que saber programar.
2. Que la agreguen como **colaboradora**: repositorio → **Settings →
   Collaborators → Add people** → su usuario → **Add**. Ella acepta la
   invitación que le llega al correo.

---

## Comprobar que quedó bien

- [ ] La tienda abre en la dirección nueva y se ven las camisetas.
- [ ] `https://<dirección nueva>/admin/` deja pulsar **Sign in with GitHub** y
      entra sin errores.
- [ ] Cambiar un precio desde el panel y verlo reflejado en la tienda a los
      1–2 minutos.
- [ ] Subir una foto de prueba en Productos y comprobar que se ve.
- [ ] Buscar `droko1982` en el proyecto: no debe aparecer en ninguna parte.

## Cosas que hay que rehacer aparte

- **El contador de impacto:** si ya está el Worker del contador, su dirección
  vive en el panel (**Impacto → Dirección del contador automático**) y no
  depende de la cuenta. No hay que tocar nada.
- **La cuenta vieja:** una vez todo funcione, se puede quitar el acceso de la
  cuenta personal al repositorio.
- **Enlaces ya compartidos:** los que apunten a la dirección vieja dejarán de
  funcionar. Si ya se repartieron, conviene avisar o comprar el dominio propio
  antes de repartir más.
