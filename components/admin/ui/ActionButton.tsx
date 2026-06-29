interface ActionButtonProps {
  onClick: () => void;
  label: string;
  variant: 'primary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export default function ActionButton({
  onClick,
  label,
  variant,
  disabled = false,
  loading = false,
}: ActionButtonProps) {
  const baseClasses = 'rounded-full px-4 py-2 text-white font-medium transition-colors disabled:cursor-not-allowed disabled:bg-slate-300';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    danger: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {loading ? 'Processing...' : label}
    </button>
  );
}
