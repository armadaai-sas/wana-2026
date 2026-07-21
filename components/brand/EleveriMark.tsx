type EleveriMarkProps = {
  className?: string;
  /** Icon only (no background plate) */
  plain?: boolean;
};

/** Airbnb-style 2026 mark: single continuous loop + elevation dot */
export default function EleveriMark({ className = 'h-9 w-9', plain = false }: EleveriMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {!plain && (
        <rect width="32" height="32" rx="10" className="fill-[#0A0A0A]" />
      )}
      <path
        d="M10.5 21.5C10.5 14.5 13.2 9.5 16 9.5C18.8 9.5 21.5 14.5 21.5 21.5"
        stroke="#D4AF7A"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M11.8 17.2H20.2"
        stroke="#D4AF7A"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M12.6 13.1H19.4"
        stroke="#E8D5B5"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="22.8" cy="10.2" r="1.35" fill="#E8D5B5" />
    </svg>
  );
}
