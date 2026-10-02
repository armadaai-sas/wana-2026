-- WhatsApp Business: guest phone, opt-in, outbound logs, inbound conversations

ALTER TABLE "users" ADD COLUMN "phone_e164" TEXT;
ALTER TABLE "users" ADD COLUMN "whatsapp_opt_in" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "users_phone_e164_key" ON "users"("phone_e164");

ALTER TABLE "bookings" ADD COLUMN "guest_phone" TEXT;
ALTER TABLE "bookings" ADD COLUMN "guest_whatsapp_opt_in" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "whatsapp_message_logs" (
    "id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "to_phone" TEXT NOT NULL,
    "template_name" TEXT,
    "wa_message_id" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_message_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whatsapp_message_logs_idempotency_key_key" ON "whatsapp_message_logs"("idempotency_key");
CREATE INDEX "whatsapp_message_logs_to_phone_created_at_idx" ON "whatsapp_message_logs"("to_phone", "created_at");

CREATE TABLE "whatsapp_conversations" (
    "id" TEXT NOT NULL,
    "phone_e164" TEXT NOT NULL,
    "user_id" TEXT,
    "state" JSONB NOT NULL DEFAULT '{}',
    "needs_human" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whatsapp_conversations_phone_e164_key" ON "whatsapp_conversations"("phone_e164");
