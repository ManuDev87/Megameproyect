"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Code2, ExternalLink, PhoneCall } from "lucide-react";
import { useProjectData } from "@/lib/store";
import { computeResultMetrics } from "@/lib/metrics";
import { LEAD_STATUS_LABEL } from "@/lib/types";
import { Badge, Card } from "@/components/ui/primitives";
import { formatDateTime, percent } from "@/lib/format";

export function ResultsPanel({ projectId }: { projectId: string }) {
  const { leads, calls, events, pixels } = useProjectData(projectId);
  const metrics = useMemo(() => computeResultMetrics(leads, calls, events), [leads, calls, events]);
  const maxTraffic = Math.max(...metrics.trafficFunnel.map((step) => step.count), 1);
  const enabledPixels = pixels.filter((pixel) => pixel.enabled).length;
  const recent = events.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Visitas" value={String(metrics.visits)} hint="PageViews de la landing" />
        <Stat label="Contactos" value={String(metrics.totalLeads)} hint="Importados + manuales" />
        <Stat label="Convertidos" value={String(metrics.converted)} hint={`${metrics.conversionRate}% comercial`} />
        <Stat label="Rechazados" value={String(metrics.rejected)} hint={`${metrics.rejectRate}% del listado`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-500">Conversión de tráfico</p>
          <p className="mt-1 font-display text-3xl">{metrics.trafficConversionRate}%</p>
          <p className="mt-1 text-xs text-ink-400">Contactos ÷ visitas. Si baja, la landing no captura.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-500">Conversión comercial</p>
          <p className="mt-1 font-display text-3xl">{metrics.conversionRate}%</p>
          <p className="mt-1 text-xs text-ink-400">Cerrados ÷ contactos. Si baja, el problema es la llamada.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-500">Llamadas</p>
          <p className="mt-1 font-display text-3xl">{metrics.totalCalls}</p>
          <p className="mt-1 text-xs text-ink-400">
            {metrics.answerRate}% contestadas · {metrics.notInterestedCalls} no interesados
          </p>
        </Card>
      </div>

      <Card>
        <p className="mb-4 text-sm font-medium">Embudo de tráfico a cierre</p>
        <div className="grid gap-2 sm:grid-cols-5">
          {metrics.trafficFunnel.map((step) => (
            <div key={step.key} className="rounded-xl bg-canvas p-3">
              <p className="text-xs text-ink-500">{step.label}</p>
              <p className="mt-1 font-display text-2xl">{step.count}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full bg-lime" style={{ width: `${percent(step.count, maxTraffic)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-4 text-sm font-medium">Estados del listado</p>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.funnel.map((step) => (
            <div key={step.status} className="rounded-xl bg-canvas p-3">
              <p className="text-xs text-ink-500">{LEAD_STATUS_LABEL[step.status]}</p>
              <p className="mt-1 font-display text-2xl">{step.count}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full bg-ink-900" style={{ width: `${percent(step.count, metrics.totalLeads)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/proyectos/${projectId}/lanzamiento`}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium"
        >
          <PhoneCall size={16} /> Abrir contactos
        </Link>
        <Link
          href={`/proyectos/${projectId}/marketing`}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium"
        >
          <Code2 size={16} /> Configurar píxel
        </Link>
        <Link
          href={`/p/${projectId}?preview=1`}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium"
        >
          <ExternalLink size={16} /> Ver prueba
        </Link>
        <p className="self-center text-xs text-ink-400">{enabledPixels} píxel{enabledPixels === 1 ? "" : "es"} activo{enabledPixels === 1 ? "" : "s"}</p>
      </div>

      <Card>
        <p className="mb-3 font-medium">Actividad reciente</p>
        <div className="space-y-2">
          {recent.map((event) => (
            <div key={event.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge tone={event.type === "conversion" ? "teal" : event.type === "page_view" ? "blue" : "neutral"}>
                  {event.type === "page_view" ? "visita" : event.type}
                </Badge>
                <span>{event.detail}</span>
              </div>
              <span className="text-xs text-ink-400">{formatDateTime(event.timestamp)}</span>
            </div>
          ))}
          {recent.length === 0 ? (
            <p className="text-sm text-ink-400">Sin visitas todavía. Abre la landing con un píxel activo para registrar PageViews.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
      <p className="mt-1 text-xs text-ink-400">{hint}</p>
    </Card>
  );
}
