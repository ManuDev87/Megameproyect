"use client";

import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import type { PixelProvider, TrackingPixel } from "@/lib/types";
import { PIXEL_PROVIDER_LABEL } from "@/lib/types";
import { PIXEL_HELP } from "@/lib/pixels";
import { useAppStore, useProjectData } from "@/lib/store";
import { Badge, Button, Card, Field, Input, Modal, Select, Textarea } from "@/components/ui/primitives";
import Link from "next/link";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { clsx } from "@/lib/format";

export function MarketingPanel({
  projectId,
  initialTab = "codigo",
}: {
  projectId: string;
  initialTab?: "codigo" | "analitica";
}) {
  const { pixels } = useProjectData(projectId);
  const updatePixel = useAppStore((state) => state.updatePixel);
  const deletePixel = useAppStore((state) => state.deletePixel);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"codigo" | "analitica">(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "codigo"} onClick={() => setTab("codigo")}>
          Código de píxel
        </TabButton>
        <TabButton active={tab === "analitica"} onClick={() => setTab("analitica")}>
          Analítica
        </TabButton>
      </div>

      {tab === "analitica" ? (
        <AnalyticsDashboard projectId={projectId} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm text-ink-600">
              Pega el ID o el snippet. Lo activo se inyecta en la landing. Las visitas se ven en Analítica.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/p/${projectId}?preview=1`}
                className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium"
              >
                <ExternalLink size={16} /> Ver prueba
              </Link>
              <Button onClick={() => setOpen(true)}>
                <Plus size={16} /> Nuevo píxel
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {pixels.map((pixel) => (
              <PixelCard
                key={pixel.id}
                pixel={pixel}
                onChange={(patch) => updatePixel(pixel.id, patch)}
                onDelete={() => deletePixel(pixel.id)}
              />
            ))}
          </div>

          {pixels.length === 0 ? (
            <Card>
              <p className="text-sm text-ink-500">Todavía no hay píxeles. Añade el código de Meta, GA4 u otro proveedor.</p>
            </Card>
          ) : null}

          <PixelModal projectId={projectId} open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-semibold",
        active ? "bg-ink-900 text-white" : "border border-ink-200 bg-white text-ink-600 hover:text-ink-950",
      )}
    >
      {children}
    </button>
  );
}

function PixelCard({
  pixel,
  onChange,
  onDelete,
}: {
  pixel: TrackingPixel;
  onChange: (patch: Partial<TrackingPixel>) => void;
  onDelete: () => void;
}) {
  const help = PIXEL_HELP[pixel.provider];

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Input value={pixel.name} onChange={(event) => onChange({ name: event.target.value })} />
          <p className="mt-1 text-xs text-ink-500">{PIXEL_PROVIDER_LABEL[pixel.provider]}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pixel.enabled}
            onChange={(event) => onChange({ enabled: event.target.checked })}
          />
          Activo
        </label>
      </div>
      <Field label={help.idLabel}>
        <Input
          value={pixel.pixelId}
          onChange={(event) => onChange({ pixelId: event.target.value })}
          placeholder={help.idLabel}
        />
      </Field>
      {pixel.provider === "custom" ? (
        <Field label="Snippet">
          <Textarea
            rows={6}
            value={pixel.customSnippet}
            onChange={(event) => onChange({ customSnippet: event.target.value })}
          />
        </Field>
      ) : (
        <p className="text-xs text-ink-500">{help.hint}</p>
      )}
      <div className="flex items-center justify-between">
        <Badge tone={pixel.enabled ? "teal" : "neutral"}>{pixel.enabled ? "En landing" : "Pausado"}</Badge>
        <button className="text-ink-400 hover:text-red-700" onClick={onDelete} aria-label="Eliminar píxel">
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
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
    <Modal open={open} title="Pegar código de píxel" onClose={onClose}>
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
