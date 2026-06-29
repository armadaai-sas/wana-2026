export const metadata = {
  title: 'Términos y condiciones | Waná',
};

export default function TermsPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="font-display text-3xl text-slate-900">Términos y condiciones</h1>
      <p className="mt-2 text-sm text-slate-500">Última actualización: junio 2026</p>

      <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-slate-900">1. Aceptación</h2>
          <p className="mt-2">
            Al usar Waná aceptas estos términos. Si no estás de acuerdo, no utilices la plataforma.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">2. Servicio</h2>
          <p className="mt-2">
            Waná conecta huéspedes con anfitriones de espacios de glamping y refugios. Waná no es
            propietario de los alojamientos salvo que se indique expresamente.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">3. Reservas y pagos</h2>
          <p className="mt-2">
            El precio total mostrado antes del pago incluye el desglose de tarifas aplicables. El
            pago confirma la solicitud de reserva según la política de cada propiedad. Los reembolsos
            dependen de la cancelación y las políticas publicadas en el espacio.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">4. Anfitriones</h2>
          <p className="mt-2">
            Los anfitriones deben proporcionar información veraz, mantener calendarios actualizados y
            cumplir normas locales de turismo y seguridad. Waná puede suspender listados que incumplan
            estándares de calidad o legalidad.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">5. Huéspedes</h2>
          <p className="mt-2">
            Los huéspedes deben respetar las reglas del espacio, el entorno natural y las comunidades
            locales. Conductas dañinas pueden resultar en cancelación sin reembolso.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">6. Limitación de responsabilidad</h2>
          <p className="mt-2">
            Waná facilita la conexión entre partes. No garantizamos disponibilidad continua del
            servicio ni ausencia de errores. La responsabilidad directa de Waná se limita al valor
            de la reserva correspondiente cuando la ley lo permita.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">7. Cambios</h2>
          <p className="mt-2">
            Podemos actualizar estos términos. Los cambios relevantes se comunicarán en la plataforma.
            El uso continuado implica aceptación de la versión vigente.
          </p>
        </section>
      </div>
    </article>
  );
}
