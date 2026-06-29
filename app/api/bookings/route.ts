/**
 * API Route: Process Booking Payment
 * 
 * POST /api/bookings/process
 * 
 * Integra:
 * - Rate limiting (5 peticiones/minuto)
 * - Validación de usuario
 * - Procesamiento de pago
 * - Facturación electrónica
 */

import { NextRequest, NextResponse } from 'next/server'
import { processPaymentAndInvoice } from '@/actions/payment-actions'
import { paymentLimiter, checkRateLimit } from '@/middleware/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Step 1: Rate limiting
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               'anonymous'
    
    const rateCheckResult = await checkRateLimit(ip, paymentLimiter)
    
    if (!rateCheckResult.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil(
            (rateCheckResult.reset.getTime() - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (rateCheckResult.reset.getTime() - Date.now()) / 1000
            ).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateCheckResult.remaining.toString(),
            'X-RateLimit-Reset': rateCheckResult.reset.toISOString(),
          },
        }
      )
    }

    // Step 2: Parse request body
    const body = await req.json()
    
    const { propertyId, days, guestEmail, guestName } = body
    
    if (!propertyId || !days || !guestEmail || !guestName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Step 3: Get current user (via session/auth header)
    // En producción, extrae del JWT o session
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Step 4: Process payment via server action
    const result = await processPaymentAndInvoice({
      propertyId,
      days: parseInt(days, 10),
      userId: 'user-id-from-auth', // Extract from session
      guestEmail,
      guestName,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment processing failed' },
        { status: 400 }
      )
    }

    // Step 5: Return success response
    return NextResponse.json(
      {
        success: true,
        transactionId: result.transactionId,
        bookingId: result.bookingId,
        message: 'Booking confirmed. Invoice will be sent to your email.',
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateCheckResult.remaining.toString(),
          'X-RateLimit-Reset': rateCheckResult.reset.toISOString(),
        },
      }
    )
  } catch (error) {
    console.error('Booking API error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error. Please try again later.',
        message: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bookings/:id
 * Retrieve booking details and fee breakdown
 */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

    // Rate limiting for reads (more generous)
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    const { allowed } = await checkRateLimit(ip, paymentLimiter)
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limited' },
        { status: 429 }
      )
    }

    // Fetch booking via server action
    const { getBookingDetails } = await import('@/actions/payment-actions')
    const result = await getBookingDetails(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }

    return NextResponse.json(result.booking, { status: 200 })
  } catch (error) {
    console.error('Booking GET error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
