/**
 * Client-side marketing events (GA4 + Meta Pixel).
 * Server-side purchase events fire from API on payment confirmation.
 */

type EventParams = Record<string, string | number | boolean | undefined>;

function getGaId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
}

function getMetaPixelId() {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID;
}

export function trackEvent(name: string, params?: EventParams) {
  if (typeof window === 'undefined') return;

  const gaId = getGaId();
  if (gaId && typeof window.gtag === 'function') {
    window.gtag('event', name, params ?? {});
  }

  const pixelId = getMetaPixelId();
  if (pixelId && typeof window.fbq === 'function') {
    window.fbq('track', mapToMetaEvent(name), params ?? {});
  }
}

function mapToMetaEvent(name: string): string {
  const map: Record<string, string> = {
    view_item: 'ViewContent',
    begin_checkout: 'InitiateCheckout',
    purchase: 'Purchase',
    search: 'Search',
    sign_up: 'CompleteRegistration',
  };
  return map[name] ?? name;
}

export const analytics = {
  viewProperty: (property: { id: string; slug: string; title: string; price: number }) => {
    trackEvent('view_item', {
      item_id: property.id,
      item_name: property.title,
      value: property.price,
      currency: 'COP',
    });
  },

  beginCheckout: (bookingId: string, value: number) => {
    trackEvent('begin_checkout', {
      transaction_id: bookingId,
      value,
      currency: 'COP',
    });
  },

  purchase: (bookingId: string, value: number) => {
    trackEvent('purchase', {
      transaction_id: bookingId,
      value,
      currency: 'COP',
    });
  },

  search: (term?: string) => {
    trackEvent('search', { search_term: term ?? 'properties' });
  },
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
