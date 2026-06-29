# Resend — configuración para Waná

## Qué necesito de ti (para pegar en `.env.staging` en el servidor)

| Variable | Dónde obtenerla | Ejemplo |
|----------|-----------------|---------|
| `RESEND_API_KEY` | [Resend → API Keys](https://resend.com/api-keys) → Create API Key | `re_xxxxxxxxxxxx` |
| `RESEND_FROM` | Dominio verificado en Resend → Emails → Domains | `Waná <reservas@tudominio.com>` |

También confirma que en `.env.staging` del Droplet estén:

```bash
PUBLIC_SITE_URL=http://164.92.241.30
NEXT_PUBLIC_SITE_URL=http://164.92.241.30
NEXT_PUBLIC_API_URL=http://164.92.241.30
```

(El enlace de reset de contraseña usa `PUBLIC_SITE_URL`.)

---

## Pasos en Resend (primera vez)

1. **Cuenta** en [resend.com](https://resend.com)
2. **API Key** con permiso *Sending access* (Full access también sirve)
3. **Dominio verificado** (recomendado para producción):
   - Resend → Domains → Add domain (ej. `glampingwana.com`)
   - Agrega los registros DNS (SPF, DKIM) que te indique Resend
   - Espera estado **Verified**
4. **`RESEND_FROM`** debe usar un email de ese dominio, ej. `Waná <noreply@glampingwana.com>`

### Staging solo con IP (sin dominio aún)

Resend **no** permite enviar desde `@wana.co` sin verificar el dominio.

Opciones:

- **A)** Verificar un dominio real (ideal) — aunque el sitio sea `http://164.92.241.30`, el *from* puede ser `@tudominio.com`
- **B)** Modo prueba Resend: solo puedes enviar **al email de tu cuenta Resend** usando `onboarding@resend.dev` como remitente (limitado)

---

## Qué emails envía Waná hoy

| Evento | Cuándo |
|--------|--------|
| Reset contraseña | `POST /auth/forgot-password` → link 1h |
| Confirmación reserva | Tras pago confirmado (`onBookingConfirmed`) |

---

## Cómo lo configuramos juntos

1. Tú me pasas (en el chat, o lo pegas tú en `.env.staging` local):
   - `RESEND_API_KEY=re_...`
   - `RESEND_FROM="Waná <email@dominio-verificado.com>"`
2. Yo actualizo `.env.staging`, despliego con `npm run go-live:remote`
3. Probamos: `/auth/forgot-password` con un email registrado (ej. `guest@wana.local` solo si ese inbox existe; mejor usa tu email real registrado en la app)

**No compartas la API key en repos públicos** — solo en `.env.staging` (gitignored).

---

## Verificación rápida post-deploy

```bash
# En el servidor
curl -s http://164.92.241.30/health

# Forgot password (desde tu máquina)
curl -X POST http://164.92.241.30/api/v1/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"TU_EMAIL_REGISTRADO"}'
```

Respuesta esperada: `{"success":true,"message":"Si el correo está registrado..."}` y correo en bandeja (revisa spam).
