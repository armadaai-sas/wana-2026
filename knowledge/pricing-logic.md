# Pricing Logic

## Source of truth in code
- Fee calculation: `lib/tax-logic.ts` (`calculateWanaFees`)
- Reservation + payment: `actions/reserve-property.ts`, `actions/payment-actions.ts`

## Model (summary)
- **Base amount** = `precio_por_noche` × number of nights (`days`).
- **Waná fees** = computed by `calculateWanaFees(baseAmount)` (Colombian tax and platform fee rules).
- **Total charged** = base + fees as returned by the fee breakdown.

## Operational notes
- Prices are stored on the `domos` table (`precio_por_noche`).
- Bookings record `fees_breakdown` and status (`pending_payment`, `PENDING`, etc.—align statuses when refactoring).
- All monetary calculations for implementation changes must use `calculateWanaFees`; do not duplicate tax logic elsewhere.

## For agents
When answering pricing questions for guests, cite this file and `policies.txt`. For implementation work, read `lib/tax-logic.ts` directly.
