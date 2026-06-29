import Image from 'next/image';

type Props = {
  image: string;
  alt?: string;
  overlay?: 'forest' | 'dark' | 'light';
  children: React.ReactNode;
  className?: string;
};

export default function CinematicBand({
  image,
  alt = '',
  overlay = 'forest',
  children,
  className = '',
}: Props) {
  const overlayClass =
    overlay === 'dark'
      ? 'bg-black/55'
      : overlay === 'light'
        ? 'bg-wana-cream/88'
        : 'bg-gradient-to-r from-wana-forest-deep/92 via-wana-forest/78 to-wana-forest-deep/65';

  return (
    <section className={`relative overflow-hidden min-h-[240px] ${className}`}>
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          quality={70}
          className="object-cover scale-105 transition-transform duration-[8s] ease-out hover:scale-110"
          priority={false}
        />
        <div className={`absolute inset-0 ${overlayClass}`} />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 20%, rgba(196,165,116,0.35) 0%, transparent 45%)',
          }}
          aria-hidden
        />
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
