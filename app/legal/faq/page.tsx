import Accordion from '@/components/Accordion';

const faqItems = [
  {
    title: '¿Cómo reservo un espacio?',
    content:
      'Explora propiedades, elige fechas en el calendario de la propiedad y pulsa Reservar. Tras iniciar sesión completas el pago en checkout (modo demo en staging).',
  },
  {
    title: '¿Cómo publico mi propiedad?',
    content:
      'Regístrate como anfitrión, entra a Anfitrión → Publicar espacio, completa el formulario y sube fotos. Un administrador revisa el media y publica el listado.',
  },
  {
    title: '¿Cómo cancelo una reserva?',
    content:
      'En Mi cuenta puedes cancelar reservas pendientes de pago. Para reservas confirmadas, contáctanos en hola@glampingwana.com.',
  },
  {
    title: '¿Qué métodos de pago aceptan?',
    content:
      'Bold y Stripe en producción. En staging usamos pagos simulados (mock) para probar el flujo completo sin cobro real.',
  },
  {
    title: '¿Cómo cambio mi contraseña?',
    content: 'Inicia sesión y ve a Mi cuenta → Cambiar contraseña.',
  },
];

export default function FAQPage() {
  return (
    <article className="max-w-3xl">
        <h1 className="font-display text-3xl text-slate-900">Preguntas frecuentes</h1>
        <p className="mt-2 text-slate-600">
          Respuestas sobre reservas, anfitriones y tu cuenta en Waná.
        </p>
        <div className="mt-8 space-y-3">
          {faqItems.map((item) => (
            <Accordion key={item.title} title={item.title} content={item.content} />
          ))}
        </div>
      </article>
  );
}
