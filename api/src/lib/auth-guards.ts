import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyTurnstileToken, turnstileRequired } from './turnstile.js';

export async function requireTurnstile(
  request: FastifyRequest,
  reply: FastifyReply,
  token: string | undefined,
): Promise<boolean> {
  if (!turnstileRequired()) return true;

  const ok = await verifyTurnstileToken(token ?? '');
  if (!ok) {
    reply.status(400).send({ error: 'Verificación de seguridad fallida. Recarga e intenta de nuevo.' });
    return false;
  }
  return true;
}
