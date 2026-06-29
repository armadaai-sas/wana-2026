import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-600">
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/legal/faq" className="hover:text-slate-900">
          FAQ Legal
        </Link>
        <Link href="/account" className="hover:text-slate-900">
          Mi cuenta
        </Link>
      </div>
    </footer>
  );
}
