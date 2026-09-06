"use client";

import Script from "next/script";
import { useEffect } from "react";
import type { TrackingPixel } from "@/lib/types";
import { generatePixelSnippet, providerScriptSrc } from "@/lib/pixels";
import { useAppStore } from "@/lib/store";

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
    if (!enabled.length) return;
    trackEvent({
      projectId,
      pixelId: enabled[0]?.id,
      type: "page_view",
      detail: "Visita a la landing pública",
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
