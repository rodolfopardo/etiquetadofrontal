/**
 * Envío de eventos a GA4 (y al dataLayer de GTM, por si querés armar triggers).
 *
 * gtag lo inyecta <GoogleAnalytics> de @next/third-parties cuando hay GA_ID.
 * Si no hay GA configurado, las llamadas son no-ops silenciosas.
 */

type GtagFn = (
  command: "event",
  action: string,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
  window.dataLayer?.push({ event: name, ...params });
}
