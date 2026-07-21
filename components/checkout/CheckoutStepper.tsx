type Step = 'review' | 'payment' | 'confirm';

const STEPS: { id: Step; label: string }[] = [
  { id: 'review', label: 'Resumen' },
  { id: 'payment', label: 'Pago' },
  { id: 'confirm', label: 'Confirmación' },
];

export default function CheckoutStepper({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Progreso del checkout" className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:flex-row sm:items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    done
                      ? 'bg-wana-forest text-white'
                      : active
                        ? 'bg-wana-gold text-wana-black ring-2 ring-wana-gold/40'
                        : 'bg-wana-sand text-wana-muted'
                  }`}
                >
                  {done ? '✓' : index + 1}
                </span>
                <span
                  className={`truncate text-center text-xs font-medium sm:text-left sm:text-sm ${
                    active ? 'text-wana-charcoal' : done ? 'text-wana-forest' : 'text-wana-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`hidden h-px flex-1 sm:block ${done ? 'bg-wana-forest' : 'bg-wana-border'}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
