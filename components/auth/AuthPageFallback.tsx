import Image from 'next/image';
import Logo from '@/components/Logo';

const FALLBACK_IMAGE = '/properties/glamping-wana/04.webp';

export default function AuthPageFallback() {
  return (
    <div className="wana-auth-immersive relative min-h-screen overflow-hidden">
      <Image
        src={FALLBACK_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="wana-auth-immersive-overlay" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <Logo onDark />
        <p className="mt-8 text-sm text-white/75">Cargando…</p>
      </div>
    </div>
  );
}
