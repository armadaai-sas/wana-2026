/**
 * Tax and Fee Calculation Engine for Waná (Colombia)
 * 
 * Estructura de cálculo:
 * - Base: precio_por_noche × días
 * - INC (Impuesto Nacional al Consumo): 8%
 * - Parafiscal (SENA + ICBF + CFF): 0.25%
 * - Comisión Waná: 15% (sobre base después de impuestos)
 */

export interface WanaFees {
  subtotal: number;
  inc_tax: number;           // 8% national consumption tax
  parafiscal_tax: number;    // 0.25% training/welfare tax
  subtotal_with_taxes: number;
  wana_commission: number;   // 15% platform fee
  total_charge_to_guest: number;
  host_receives: number;
}

export function calculateWanaFees(baseAmount: number): WanaFees {
  // Step 1: Calculate taxes on base amount
  const inc_tax = baseAmount * 0.08;           // 8% INC
  const parafiscal_tax = baseAmount * 0.0025;  // 0.25% Parafiscal
  const subtotal_with_taxes = baseAmount + inc_tax + parafiscal_tax;

  // Step 2: Calculate Waná commission (15% on base, not on taxes)
  const wana_commission = baseAmount * 0.15;

  // Step 3: Total charge to guest
  const total_charge_to_guest = subtotal_with_taxes + wana_commission;

  // Step 4: Host receives (after all deductions)
  const host_receives = baseAmount - wana_commission;

  return {
    subtotal: baseAmount,
    inc_tax: Math.round(inc_tax * 100) / 100,
    parafiscal_tax: Math.round(parafiscal_tax * 100) / 100,
    subtotal_with_taxes: Math.round(subtotal_with_taxes * 100) / 100,
    wana_commission: Math.round(wana_commission * 100) / 100,
    total_charge_to_guest: Math.round(total_charge_to_guest * 100) / 100,
    host_receives: Math.round(host_receives * 100) / 100,
  };
}

/**
 * Audit log entry for compliance tracking
 */
export interface AuditLog {
  booking_id: string;
  transaction_id: string;
  fees_breakdown: WanaFees;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  method: 'alegra' | 'backup';
}
