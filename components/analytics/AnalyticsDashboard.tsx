"use client";

import { useMemo, useState } from "react";
import { computeAnalytics } from "@/lib/analytics";
import { useProjectData } from "@/lib/store";
import { Card } from "@/components/ui/primitives";
import { BarList, LineChart } from "@/components/analytics/Charts";
import { clsx } from "@/lib/format";

export function AnalyticsDashboard({
  projectId,
  compact = false,
}: {
  projectId: string;
  compact?: boolean;
}) {
  const { leads, calls, events } = useProjectData(projectId);
  const analytics = useMemo(() => computeAnalytics(leads, calls, events), [leads, calls, events]);
  const [combined, setCombined] = useState(false);

  const webSeries = [
    { id: "visits", label: "Visitas web", color: "#111318", values: analytics.days.map((day) => day.visits) },
  ];
  const contactSeries = [
    { id: "whatsapp", label: "WhatsApp", color: "#16A34A", values: analytics.days.map((day) => day.whatsapp) },
    { id: "email", label: "Email", color: "#2563EB", values: analytics.days.map((day) => day.email) },
    { id: "calls", label: "Llamadas", color: "#7C3AED", values: analytics.days.map((day) => day.calls) },
  ];
  const allSeries = [...webSeries, ...contactSeries];
  const labels = analytics.days.map((day) => day.label);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-600">
          {combined
            ? "Todo junto: visitas del píxel, contactos por WhatsApp o email y llamadas."
            : "Paneles distintos: analítica web del píxel a un lado, contactos y llamadas al otro."}
        </p>
        <button
          type="button"
          onClick={() => setCombined((value) => !value)}
          className={clsx(
            "inline-flex rounded-xl px-4 py-2 text-sm font-semibold",
            combined ? "bg-ink-900 text-white" : "border border-ink-200 bg-white text-ink-900",
          )}
        >
          {combined ? "Separar paneles" : "Mostrar todo"}
        </button>
      </div>

      {combined ? (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Últimos 14 días</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Kpi label="Visitas" value={analytics.visits} />
            <Kpi label="WhatsApp" value={analytics.whatsappContacts} />
            <Kpi label="Email" value={analytics.emailContacts} />
            <Kpi label="Llamadas" value={analytics.totalCalls} />
          </div>
          <div className="mt-4">
            <LineChart labels={labels} series={allSeries} />
          </div>
        </Card>
      ) : (
        <div className={clsx("grid gap-4", compact ? "lg:grid-cols-1" : "lg:grid-cols-2")}>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Analítica web</p>
            <p className="mt-1 text-sm text-ink-500">Píxel y visitas a la landing, estilo Google Analytics.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Kpi label="Visitas" value={analytics.visits} />
              <Kpi label="Sesiones" value={analytics.sessions} />
            </div>
            <div className="mt-4">
              <LineChart labels={labels} series={webSeries} />
            </div>
            {!compact ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Fuentes</p>
                  <BarList items={analytics.trafficSources} color="#111318" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Dispositivo</p>
                  <BarList items={analytics.devices} color="#C8F542" />
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Contactos</p>
            <p className="mt-1 text-sm text-ink-500">
              Por canal: WhatsApp, email, llamada u otra fuente que marques en el contacto.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Kpi label="WhatsApp" value={analytics.whatsappContacts} />
              <Kpi label="Email" value={analytics.emailContacts} />
              <Kpi label="Llamadas" value={analytics.totalCalls} />
            </div>
            <div className="mt-4">
              <LineChart labels={labels} series={contactSeries} />
            </div>
            {!compact ? (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Canales</p>
                <BarList items={analytics.contactChannels} color="#16A34A" />
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-canvas p-3">
      <p className="text-[11px] uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-0.5 font-display text-2xl">{value}</p>
    </div>
  );
}
