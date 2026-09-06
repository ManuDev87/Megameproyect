"use client";

import { useState } from "react";
import { Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import type { PixelProvider, TrackingPixel } from "@/lib/types";
import { PIXEL_PROVIDER_LABEL } from "@/lib/types";
import { PIXEL_HELP, generatePixelSnippet, providerScriptSrc } from "@/lib/pixels";
import { useAppStore, useProjectData } from "@/lib/store";
import { Badge, Button, Card, Field, Input, Modal, Select, Textarea } from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/format";
import Link from "next/link";

export function MarketingPanel({ projectId }: { projectId: string }) {
  const { pixels, events } = useProjectData(projectId);
  const updatePixel = useAppStore((state) => state.updatePixel);
  const deletePixel = useAppStore((state) => state.deletePixel);
  const trackEvent = useAppStore((state) => state.trackEvent);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copySnippet(pixel: TrackingPixel) {
    const snippet = generatePixelSnippet(pixel);
    await navigator.clipboard.writeText(snippet);
    setCopied(pixel.id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-ink-600">
          Añade Meta Pixel, GA4, Google Ads, TikTok, LinkedIn o un snippet propio. Los píxeles activos se inyectan
          en la landing pública del proyecto.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/p/${projectId}`}
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm"
          >
            <ExternalLink size={16} /> Ver landing
          </Link>
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Nuevo píxel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {pixels.map((pixel) => {
          const snippet = generatePixelSnippet(pixel);
          const src = providerScriptSrc(pixel.provider, pixel.pixelId);
          return (
            <Card key={pixel.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{pixel.name}</p>
                  <p className="text-xs text-ink-500">
                    {PIXEL_PROVIDER_LABEL[pixel.provider]} · {pixel.pixelId || "sin ID"}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pixel.enabled}
                    onChange={(event) => updatePixel(pixel.id, { enabled: event.target.checked })}
                  />
                  Activo
                </label>
              </div>
              <pre className="max-h-40 overflow-auto rounded-xl bg-ink-950 p-3 text-[11px] leading-4 text-teal-soft">
                {src ? `<!-- ${src} -->\n` : ""}
                {snippet || "// Snippet vacío"}
              </pre>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => copySnippet(pixel)}>
                  <Copy size={14} /> {copied === pixel.id ? "Copiado" : "Copiar snippet"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    trackEvent({
                      projectId,
                      pixelId: pixel.id,
                      type: "page_view",
                      detail: `Prueba de ${pixel.name}`,
                    })
                  }
                >
                  Simular PageView
                </Button>
                <button
                  className="ml-auto text-ink-400 hover:text-red-700"
                  onClick={() => deletePixel(pixel.id)}
                  aria-label="Eliminar píxel"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {pixels.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-500">Todavía no hay píxeles. Añade uno para el seguimiento de campañas.</p>
        </Card>
      ) : null}

      <Card>
        <p className="mb-3 font-medium">Eventos de marketing</p>
        <div className="space-y-2">
          {events.slice(0, 12).map((event) => (
            <div key={event.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge tone={event.type === "conversion" ? "teal" : "neutral"}>{event.type}</Badge>
                <span>{event.detail}</span>
              </div>
              <span className="text-xs text-ink-400">{formatDateTime(event.timestamp)}</span>
            </div>
          ))}
          {events.length === 0 ? <p className="text-sm text-ink-400">Sin eventos todavía.</p> : null}
        </div>
      </Card>

      <PixelModal projectId={projectId} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function PixelModal({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const addPixel = useAppStore((state) => state.addPixel);
  const [provider, setProvider] = useState<PixelProvider>("meta");
  const [name, setName] = useState("Píxel de lanzamiento");
  const [pixelId, setPixelId] = useState("");
  const [customSnippet, setCustomSnippet] = useState("");
  const help = PIXEL_HELP[provider];

  return (
    <Modal open={open} title="Añadir píxel o snippet" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          addPixel({
            projectId,
            name,
            provider,
            pixelId,
            customSnippet,
            enabled: true,
          });
          onClose();
        }}
      >
        <Field label="Nombre">
          <Input value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Proveedor">
          <Select value={provider} onChange={(event) => setProvider(event.target.value as PixelProvider)}>
            {Object.entries(PIXEL_PROVIDER_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={help.idLabel}>
          <Input value={pixelId} onChange={(event) => setPixelId(event.target.value)} required />
        </Field>
        <p className="text-xs text-ink-500">{help.hint}</p>
        {provider === "custom" ? (
          <Field label="Snippet">
            <Textarea rows={6} value={customSnippet} onChange={(event) => setCustomSnippet(event.target.value)} />
          </Field>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit">Guardar píxel</Button>
        </div>
      </form>
    </Modal>
  );
}
