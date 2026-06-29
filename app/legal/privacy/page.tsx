export const metadata = {
  title: 'Política de privacidad | Waná',
};

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl">
      <p className="wana-eyebrow">Legal</p>
      <h1 className="mt-2 font-display text-3xl text-wana-charcoal">Política de privacidad</h1>
      <p className="mt-2 text-sm text-wana-muted">Última actualización: junio 2026</p>

      <div className="mt-8 space-y-6 text-wana-charcoal leading-relaxed">
        <section>
          <h2 className="font-semibold text-wana-charcoal">1. Responsable</h2>
          <p className="mt-2">
            Glamping Waná («Waná») opera la plataforma de reservas de experiencias de glamping y
            refugios en Colombia. Para consultas sobre privacidad puedes contactarnos en
            hola@glampingwana.com.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-wana-charcoal">2. Datos que recopilamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Datos de cuenta: nombre, correo electrónico y rol (huésped o anfitrión).</li>
            <li>Datos de reserva: fechas, número de huéspedes y desglose de precios.</li>
            <li>Datos de pago: procesados por proveedores externos (Bold, Stripe); no almacenamos números completos de tarjeta.</li>
            <li>Contenido multimedia subido por anfitriones para describir sus espacios.</li>
            <li>Datos técnicos: cookies de sesión, logs de acceso y métricas de uso (analytics).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-wana-charcoal">3. Uso de la información</h2>
          <p className="mt-2">
            Utilizamos tus datos para gestionar reservas, procesar pagos, emitir facturas cuando
            aplique, comunicar el estado de tu estadía, mejorar la plataforma y cumplir obligaciones
            legales en Colombia.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-wana-charcoal">4. Compartición con terceros</h2>
          <p className="mt-2">
            Compartimos datos solo con proveedores necesarios para el servicio: procesadores de
            pago, almacenamiento de archivos, email transaccional, facturación (Alegra) y
            herramientas de analítica. No vendemos datos personales.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-wana-charcoal">5. Tus derechos</h2>
          <p className="mt-2">
            Puedes solicitar acceso, corrección o eliminación de tus datos contactándonos. Responderemos
            conforme a la Ley 1581 de 2012 y normas complementarias sobre protección de datos en Colombia.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-wana-charcoal">6. Seguridad</h2>
          <p className="mt-2">
            Aplicamos autenticación segura, comunicación cifrada en tránsito y controles de acceso
            por rol. Ningún sistema es 100% seguro; te recomendamos usar contraseñas fuertes.
          </p>
        </section>
      </div>
    </article>
  );
}
