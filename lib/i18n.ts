import { ReactNode } from 'react'

type Locale = 'es' | 'en'

// Import translations
import es from '@/messages/es.json'
import en from '@/messages/en.json'

const translations: Record<Locale, typeof es> = {
  es,
  en,
}

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.es
}

export function useTranslations(locale: Locale) {
  return getTranslations(locale)
}

export const locales: Locale[] = ['es', 'en']
export const defaultLocale: Locale = 'es'
