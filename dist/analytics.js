const measurementId = 'G-5XFT3VQ054';
const features = new Set(['catalog', 'combat', 'demolition', 'factions']);

// Only the public GitHub Pages project collects analytics, never local previews.
export function initAnalytics(win = window, doc = document) {
  const { protocol, hostname, pathname } = win.location;
  if (protocol !== 'https:' || hostname !== 'jj-dot-eng.github.io' ||
      !(pathname === '/superguide' || pathname.startsWith('/superguide/'))) return () => {};

  win.dataLayer = win.dataLayer || [];
  win.gtag = win.gtag || function () { win.dataLayer.push(arguments); };
  win.gtag('js', new Date());
  win.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = doc.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  doc.head.appendChild(script);

  let lastFeature;
  return feature => {
    if (!features.has(feature) || feature === lastFeature) return;
    lastFeature = feature;
    // Enhanced measurement owns pageviews; this event only identifies app tabs.
    win.gtag('event', 'view_feature', { feature, send_to: measurementId });
  };
}
