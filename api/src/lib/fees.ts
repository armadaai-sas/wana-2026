/**
 * Waná fee calculation (Colombia) — shared logic with web lib/tax-logic.ts
 */
export interface WanaFees {
  subtotal: number;
  inc_tax: number;
  parafiscal_tax: number;
  subtotal_with_taxes: number;
  wana_commission: number;
  total_charge_to_guest: number;
  host_receives: number;
  nights: number;
  price_per_night: number;
}

export function calculateWanaFees(pricePerNight: number, nights: number): WanaFees {
  const baseAmount = pricePerNight * nights;
  const inc_tax = baseAmount * 0.08;
  const parafiscal_tax = baseAmount * 0.0025;
  const subtotal_with_taxes = baseAmount + inc_tax + parafiscal_tax;
  const wana_commission = baseAmount * 0.15;
  const total_charge_to_guest = subtotal_with_taxes + wana_commission;
  const host_receives = baseAmount - wana_commission;

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    subtotal: round(baseAmount),
    inc_tax: round(inc_tax),
    parafiscal_tax: round(parafiscal_tax),
    subtotal_with_taxes: round(subtotal_with_taxes),
    wana_commission: round(wana_commission),
    total_charge_to_guest: round(total_charge_to_guest),
    host_receives: round(host_receives),
    nights,
    price_per_night: pricePerNight,
  };
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}
