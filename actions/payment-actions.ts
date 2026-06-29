'use server'

import { createClient } from '@/utils/supabase/server'
import { calculateWanaFees, WanaFees } from '@/lib/tax-logic'
import { getAlegraClient } from '@/lib/alegra'

/**
 * Payment Processing Server Action
 * 
 * Orquesta el flujo completo:
 * 1. Validar booking y propiedad
 * 2. Calcular impuestos colombianos
 * 3. Procesar pago (Mock para Bold/Stripe)
 * 4. Emitir factura electrónica (Alegra con fallback)
 * 5. Guardar en audit trail
 */

interface BookingData {
  propertyId: string
  days: number
  userId: string
  guestEmail: string
  guestName: string
}

interface PaymentResult {
  success: boolean
  transactionId?: string
  bookingId?: string
  error?: string
}

export async function processPaymentAndInvoice(
  bookingData: BookingData
): Promise<PaymentResult> {
  const supabase = await createClient()

  try {
    // Step 1: Validar usuario autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    // Step 2: Obtener propiedad y validar
    const { data: property, error: propError } = await supabase
      .from('domos')
      .select('*')
      .eq('id', bookingData.propertyId)
      .single()

    if (propError || !property) {
      return { success: false, error: "Property not found" }
    }

    // Step 3: Cálculo financiero preciso
    const baseAmount = property.precio_por_noche * bookingData.days
    const fees = calculateWanaFees(baseAmount)

    // Step 4: Crear registro de booking
    const { data: bookingRecord, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        property_id: bookingData.propertyId,
        guest_id: user.id,
        guest_email: bookingData.guestEmail,
        guest_name: bookingData.guestName,
        check_in: new Date().toISOString(),
        days: bookingData.days,
        status: 'pending_payment',
        fees_breakdown: fees,
      }])
      .select()
      .single()

    if (bookingError || !bookingRecord) {
      return { success: false, error: "Failed to create booking" }
    }

    // Step 5: Procesar pago (Mock - en producción integrar Bold/Stripe)
    const transactionId = `WANA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Mock payment processing
      const paymentSuccess = true // En producción: await boldPaymentGateway.charge(...)
      
      if (!paymentSuccess) {
        await supabase
          .from('bookings')
          .update({ status: 'payment_failed' })
          .eq('id', bookingRecord.id)
        
        return { success: false, error: "Payment processing failed" }
      }

      // Step 6: Emitir factura electrónica
      const invoiceResult = await triggerAlegraInvoice(
        fees,
        bookingData,
        transactionId
      )

      // Step 7: Actualizar estado booking
      const finalStatus = invoiceResult.success ? 'confirmed' : 'payment_pending_invoice'
      
      await supabase
        .from('bookings')
        .update({
          status: finalStatus,
          transaction_id: transactionId,
          invoice_id: invoiceResult.invoiceId || null,
        })
        .eq('id', bookingRecord.id)

      // Step 8: Audit log
      await supabase.from('audit_logs').insert([{
        booking_id: bookingRecord.id,
        transaction_id: transactionId,
        action: 'payment_processed',
        fees_breakdown: fees,
        status: invoiceResult.success ? 'success' : 'pending_invoice',
        method: invoiceResult.method,
        timestamp: new Date().toISOString(),
      }])

      return {
        success: true,
        transactionId,
        bookingId: bookingRecord.id,
      }
    } catch (paymentError) {
      // Fallback: marcar como pending para manual review
      await supabase
        .from('bookings')
        .update({ status: 'payment_exception' })
        .eq('id', bookingRecord.id)
      
      throw new Error(`Payment processing exception: ${paymentError}`)
    }
  } catch (error) {
    console.error('Critical payment failure:', error)
    return {
      success: false,
      error: `Critical failure in payment ecosystem: ${error}`,
    }
  }
}

/**
 * Facturación Electrónica con fallback RLS
 * 
 * Intenta emitir con Alegra. Si falla, guarda en pending_invoices
 * para procesamiento manual o async.
 */
async function triggerAlegraInvoice(
  fees: WanaFees,
  bookingData: BookingData,
  transactionId: string
): Promise<{ success: boolean; invoiceId?: string; method: 'alegra' | 'backup' }> {
  const alegraClient = getAlegraClient()
  const supabase = await createClient()

  if (!alegraClient) {
    // Fallback: guardar en tabla pending_invoices
    const { error } = await supabase.from('pending_invoices').insert([{
      booking_id: bookingData.propertyId,
      transaction_id: transactionId,
      invoice_data: fees,
      guest_email: bookingData.guestEmail,
      guest_name: bookingData.guestName,
      status: 'pending',
      created_at: new Date().toISOString(),
    }])

    if (error) {
      console.error('Fallback invoice storage failed:', error)
      return { success: false, method: 'backup' }
    }

    console.warn('Alegra unavailable. Invoice stored in pending_invoices for manual processing.')
    return { success: false, method: 'backup' }
  }

  try {
    // Estructura para Alegra API
    const invoicePayload = {
      client: {
        name: bookingData.guestName,
        email: bookingData.guestEmail,
      },
      items: [
        {
          description: `Hospedaje - ${bookingData.days} noches`,
          quantity: bookingData.days,
          price: fees.subtotal / bookingData.days,
          tax: (fees.inc_tax + fees.parafiscal_tax) / bookingData.days,
        },
      ],
      currency: 'COP',
      observations: `Referencia de pago: ${transactionId}`,
    }

    const response = await fetch(`${alegraClient.baseUrl}/invoices`, {
      method: 'POST',
      headers: alegraClient.headers,
      body: JSON.stringify(invoicePayload),
    })

    if (!response.ok) {
      throw new Error(`Alegra API error: ${response.status}`)
    }

    const invoiceData = await response.json()
    
    return {
      success: true,
      invoiceId: invoiceData.id,
      method: 'alegra',
    }
  } catch (alegraError) {
    console.error('Alegra invoice generation failed:', alegraError)

    // Fallback: guardar en pending_invoices
    const { error } = await supabase.from('pending_invoices').insert([{
      booking_id: bookingData.propertyId,
      transaction_id: transactionId,
      invoice_data: fees,
      guest_email: bookingData.guestEmail,
      guest_name: bookingData.guestName,
      alegra_error: String(alegraError),
      status: 'pending',
      created_at: new Date().toISOString(),
    }])

    if (error) {
      console.error('Fallback invoice storage failed:', error)
    }

    return { success: false, method: 'backup' }
  }
}

/**
 * Get booking status and fee breakdown
 */
export async function getBookingDetails(bookingId: string) {
  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    return { success: false, error: "Booking not found" }
  }

  return { success: true, booking }
}
