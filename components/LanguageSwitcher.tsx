'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export function LanguageSwitcher() {
  const params = useParams()
  const currentLocale = (params.locale as string) || 'es'
  const pathname = params.slug ? `/${params.slug}` : '/'

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-gray-600">Idioma / Language:</span>
      <Link
        href={`/es${pathname}`}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          currentLocale === 'es'
            ? 'bg-[#D4AF37] text-[#1B4332] font-bold'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        Español
      </Link>
      <Link
        href={`/en${pathname}`}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          currentLocale === 'en'
            ? 'bg-[#D4AF37] text-[#1B4332] font-bold'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        English
      </Link>
    </div>
  )
}
