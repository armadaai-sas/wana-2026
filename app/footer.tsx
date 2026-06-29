import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-wana-border py-6 text-center text-sm text-wana-muted">
      <nav className="flex flex-wrap justify-center gap-4">
        <Link href="/legal/faq" className="hover:text-wana-charcoal">
          FAQ
        </Link>
        <Link href="/account" className="hover:text-wana-charcoal">
          Mi cuenta
        </Link>
      </nav>
    </footer>
  );
}
