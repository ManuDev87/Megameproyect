import type { PixelProvider, TrackingPixel } from "./types";

export function generatePixelSnippet(pixel: Pick<TrackingPixel, "provider" | "pixelId" | "customSnippet">): string {
  const id = pixel.pixelId.trim();
  switch (pixel.provider) {
    case "meta":
      return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');`;
    case "ga4":
      return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`;
    case "google_ads":
      return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`;
    case "tiktok":
      return `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
  ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
  ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
  var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
  var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${id}');
  ttq.page();
}(window, document, 'ttq');`;
    case "linkedin":
      return `_linkedin_partner_id = "${id}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);`;
    case "custom":
      return pixel.customSnippet.trim();
  }
}

export function providerScriptSrc(provider: PixelProvider, pixelId: string): string | null {
  if (provider === "ga4" || provider === "google_ads") {
    return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(pixelId)}`;
  }
  if (provider === "linkedin") {
    return "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  }
  return null;
}

export const PIXEL_HELP: Record<PixelProvider, { idLabel: string; hint: string }> = {
  meta: {
    idLabel: "Pixel ID",
    hint: "En Events Manager de Meta, copia el identificador numérico del píxel.",
  },
  ga4: {
    idLabel: "Measurement ID",
    hint: "Formato G-XXXXXXXX. Lo encuentras en Administrar → Flujos de datos.",
  },
  google_ads: {
    idLabel: "Conversion ID",
    hint: "Formato AW-XXXXXXXXX. Desde Google Ads → Herramientas → Medición.",
  },
  tiktok: {
    idLabel: "Pixel ID",
    hint: "En TikTok Ads Manager → Assets → Events → Pixel.",
  },
  linkedin: {
    idLabel: "Partner ID",
    hint: "En Campaign Manager → Analizar → Insight Tag.",
  },
  custom: {
    idLabel: "Identificador interno",
    hint: "Pega el snippet completo (GTM, Hotjar, Clarity u otro).",
  },
};
