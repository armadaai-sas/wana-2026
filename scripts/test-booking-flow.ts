// scripts/test-booking-flow.ts
import 'dotenv/config';
import { reserveProperty } from '../actions/reserve-property';

async function runIntegrationTest() {
  console.log("🚀 Iniciando test de integración: Reserva y Pago...");
  
  try {
    // Datos de prueba (asegúrate de tener un propertyId válido en tu DB)
    const mockPropertyId = 'tu-uuid-de-propiedad';
    const result = await reserveProperty(mockPropertyId, new Date(), new Date(), 50000);
    
    console.log("✅ Test exitoso:", result);
  } catch (error) {
    console.error("❌ Test fallido:", error);
  }
}

runIntegrationTest();
