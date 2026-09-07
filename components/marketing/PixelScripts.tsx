"use client";

import Script from "next/script";
import { useEffect } from "react";
import type { TrackingPixel } from "@/lib/types";
import { generatePixelSnippet, providerScriptSrc } from "@/lib/pixels";
import { useAppStore } from "@/lib/store";

function sessionId(): string {
  const key = "pixlanz-session";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(key, next);
  return next;
}

function device(): "mobile" | "desktop" | "tablet" {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function trafficSource(): string {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  if (utm) return utm;
  const referrer = document.referrer;
  if (!referrer) return "Directo";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Directo";
  }
}

export function PixelScripts({
  projectId,
  pixels,
}: {
  projectId: string;
  pixels: TrackingPixel[];
}) {
  const trackEvent = useAppStore((state) => state.trackEvent);
  const enabled = pixels.filter((pixel) => pixel.enabled && (pixel.pixelId || pixel.customSnippet));

  useEffect(() => {
    trackEvent({
      projectId,
      pixelId: enabled[0]?.id,
      type: "page_view",
      detail: "Visita a la landing pública",
      source: trafficSource(),
      device: device(),
      sessionId: sessionId(),
      path: window.location.pathname,
    });
    // one visit per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <>
      {enabled.map((pixel) => {
        const src = providerScriptSrc(pixel.provider, pixel.pixelId);
        const snippet = generatePixelSnippet(pixel);
        return (
          <span key={pixel.id}>
            {src ? <Script src={src} strategy="afterInteractive" /> : null}
            {snippet ? (
              <Script id={`pixel-${pixel.id}`} strategy="afterInteractive">
                {snippet}
              </Script>
            ) : null}
          </span>
        );
      })}
    </>
  );
}
