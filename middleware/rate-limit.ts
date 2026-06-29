/**
 * Rate Limiting Middleware for Payment Endpoints
 * 
 * Protección contra:
 * - Ataques de fuerza bruta (credential stuffing)
 * - DDoS en endpoints de pagos
 * - Abuso de API
 * 
 * NOTA: Requiere configuración de Upstash:
 * UPSTASH_REDIS_REST_URL
 * UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Inicializar cliente Redis solo si la configuración está presente
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
const redis = upstashUrl && upstashToken ? Redis.fromEnv() : null

type RateLimitInterval = `${number} d` | `${number} h` | `${number} m` | `${number} s` | `${number} ms`

function createLimiter(config: { window: number; interval: RateLimitInterval }) {
  if (!redis) {
    // Cuando Upstash no está configurado, no aplicamos rate limiting pero permitimos el flujo.
    return null
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.window, config.interval),
  })
}

// Rate limiters por tipo de operación
export const paymentLimiter = createLimiter({ window: 5, interval: "60 s" })
export const apiLimiter = createLimiter({ window: 100, interval: "1 h" })
export const authLimiter = createLimiter({ window: 10, interval: "15 m" })

/**
 * Aplicar rate limiting a una request
 * 
 * @param identifier - IP o user ID
 * @param limiter - Tipo de limitador (payment, api, auth)
 * @returns { allowed: boolean, remaining: number, reset: Date }
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null
): Promise<{ allowed: boolean; remaining: number; reset: Date }> {
  if (!limiter) {
    return { allowed: true, remaining: 0, reset: new Date() }
  }

  try {
    const { success, remaining, reset } = await limiter.limit(identifier)
    return {
      allowed: success,
      remaining: remaining || 0,
      reset: new Date(reset),
    }
  } catch (error) {
    console.error("Rate limit check failed:", error)
    // En caso de error, permitir pero registrar
    return { allowed: true, remaining: -1, reset: new Date() }
  }
}

/**
 * Middleware factory para Next.js
 * 
 * Uso en route handler:
 * ```
 * import { withRateLimit } from '@/middleware/rate-limit'
 * 
 * export const POST = withRateLimit(
 *   async (req, params) => { ... },
 *   paymentLimiter
 * )
 * ```
 */
export function withRateLimit(
  handler: (req: Request, params?: any) => Promise<Response>,
  limiter: Ratelimit
) {
  return async (req: Request, params?: any) => {
    const ip = req.headers.get("x-forwarded-for") ||
               req.headers.get("x-real-ip") ||
               "anonymous"

    const { allowed, remaining, reset } = await checkRateLimit(ip, limiter)

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "Demasiadas peticiones. Intenta de nuevo más tarde.",
          retryAfter: Math.ceil((reset.getTime() - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((reset.getTime() - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toISOString(),
          },
        }
      )
    }

    // Agregar headers de rate limit a la response
    const response = await handler(req, params)
    response.headers.set("X-RateLimit-Remaining", remaining.toString())
    response.headers.set("X-RateLimit-Reset", reset.toISOString())

    return response
  }
}
