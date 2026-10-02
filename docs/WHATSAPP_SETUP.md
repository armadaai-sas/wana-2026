# WhatsApp Business — Eleveri / Waná

Guía para **Meta Cloud API** + integración en la API Fastify.

**Webhook producción:** `https://eleveri.app/api/v1/webhooks/whatsapp`

---

## Parte A — Checklist humano (Meta)

### A1. Tres activos

| Activo | Dónde | Guardar |
|--------|--------|---------|
| Business Portfolio | [business.facebook.com](https://business.facebook.com) | Nombre legal |
| WABA | Business Settings → Accounts → WhatsApp accounts | **WABA ID** |
| Meta App + producto WhatsApp | [developers.facebook.com](https://developers.facebook.com) | App ID |

La app **WhatsApp Business** del teléfono no es Cloud API. Necesitas app en Developers con producto **WhatsApp**.

Docs: [Cloud API Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/).

### A2. Primer mensaje de prueba

1. Create App → **Connect with customers through WhatsApp**.
2. WhatsApp → **API Setup**.
3. Copiar **Phone number ID** y **WhatsApp Business Account ID**.
4. Token temporal → enviar mensaje a tu celular.
5. **Responder** en WhatsApp (abre ventana 24h para texto libre).

### A3. Número producción

- Número **sin** WhatsApp personal/Business app activo en el mismo número.
- Perfil: Eleveri, sitio `https://eleveri.app`.
- Activar **billing** en Meta.

### A4. Token permanente (System User)

1. Business Settings → Users → **System users** → Create.
2. Assign assets: App + WABA (full control).
3. Generate token: `whatsapp_business_messaging`, `whatsapp_business_management`, `business_management`.

### A5. Verificación del negocio

Business Settings → Security Center → **Business verification** (documentos Eleveri).

### A6. Plantillas (enviar a aprobación Meta)

Categoría **Utility** salvo campañas marketing. Idioma **es**. Nombres deben coinar con el código:

| Nombre en Meta | Uso | Variables body (orden) |
|----------------|-----|-------------------------|
| `booking_confirmation` | Pago confirmado | 1 nombre, 2 propiedad, 3 check-in, 4 check-out, 5 total, 6 link |
| `checkin_reminder` | 1 día antes check-in | 1 nombre, 2 propiedad, 3 check-in, 4 link |
| `booking_cancellation` | Cancelación | 1 nombre, 2 propiedad, 3 check-in, 4 check-out |
| `invoice_receipt` | Comprobante / factura | 1 nombre, 2 monto, 3 referencia, 4 link |
| `host_new_booking` | Aviso anfitrión | 1 propiedad, 2 huésped, 3 check-in, 4 check-out |

Ejemplo body `booking_confirmation`:

```
Hola {{1}}, tu reserva en {{2}} está confirmada.
Entrada: {{3}} · Salida: {{4}}
Total: {{5}}
Detalle: {{6}}
— Eleveri
```

### A7. Webhook en Meta

1. App → WhatsApp → Configuration → Webhook.
2. Callback URL: `https://eleveri.app/api/v1/webhooks/whatsapp`
3. Verify token: mismo valor que `WHATSAPP_WEBHOOK_VERIFY_TOKEN` en el servidor.
4. Subscribe: **messages**.
5. App Secret (Settings → Basic) → `WHATSAPP_APP_SECRET`.

---

## Variables de entorno (servidor)

```bash
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WABA_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_GRAPH_API_VERSION=v21.0

# Opcional: override nombres plantilla si Meta usa otro slug
WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION=booking_confirmation
WHATSAPP_TEMPLATE_CHECKIN_REMINDER=checkin_reminder
WHATSAPP_TEMPLATE_BOOKING_CANCELLATION=booking_cancellation
WHATSAPP_TEMPLATE_INVOICE_RECEIPT=invoice_receipt
WHATSAPP_TEMPLATE_HOST_NEW_BOOKING=host_new_booking

# Alertas handoff humano (email Resend)
WHATSAPP_HANDOFF_EMAIL=ops@eleveri.app
```

Nunca commitear tokens. Plantillas en [`deploy/.env.production.example`](../deploy/.env.production.example).

---

## Parte B — Comportamiento en código

| Evento | Canal |
|--------|--------|
| Pago confirmado | Email + plantilla `booking_confirmation` (+ factura) |
| Cancelación | Email + plantilla `booking_cancellation` |
| Recordatorio check-in | Email + plantilla `checkin_reminder` |
| Mensaje entrante | Bot menú / FAQ; opción 4 → `needs_human` + email ops |

Requisitos para WhatsApp saliente:

- `guest_phone` en reserva (E.164, ej. `+573001234567`)
- `guest_whatsapp_opt_in = true`
- Plantilla **aprobada** en Meta

---

## Pruebas

```bash
# Health API
curl -s https://eleveri.app/health

# Verificación webhook (Meta hace GET con hub.verify_token)
curl "https://eleveri.app/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=TU_TOKEN&hub.challenge=12345"
```

1. Escribe **hola** al número Eleveri → menú bot.
2. Reserva mock con tu teléfono + opt-in → plantilla confirmación.
3. Cancela → plantilla cancelación.

---

## Troubleshooting

| Síntoma | Causa probable |
|---------|----------------|
| Webhook no verifica | `WHATSAPP_WEBHOOK_VERIFY_TOKEN` distinto al de Meta |
| 401 en POST | `WHATSAPP_APP_SECRET` incorrecto o body alterado por proxy |
| Template failed | Nombre no aprobado o variables en orden distinto |
| No llega saliente | Sin opt-in, sin teléfono, o fuera de ventana sin plantilla |
