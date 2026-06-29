# wana-2026
Wana hospitality repo for connecting with VS Code and Nestlify

### 🧪 Verificación del Backend (Testing)
Para validar el flujo completo de reserva (disponibilidad + inserción + pago):
1. Asegúrate de tener `TEST_USER_ID` definido en tu `.env.local`.
2. Ejecuta el siguiente comando:
   `npx ts-node --compiler-options '{"allowImportingTsExtensions": true}' scripts/test-booking-flow.ts`
