"use client";

import Link from "next/link";
import { useMemo } from "react";
import { KanbanSquare, Megaphone, PhoneCall } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { computeLaunchMetrics } from "@/lib/metrics";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { PROJECT_STATUS_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function DashboardPage() {
  const hydrated = useAppStore((state) => state.hydrated);
  const projects = useAppStore((state) => state.projects);
  const leads = useAppStore((state) => state.leads);
  const calls = useAppStore((state) => state.calls);
  const cards = useAppStore((state) => state.cards);
  const pixels = useAppStore((state) => state.pixels);
  const loadDemo = useAppStore((state) => state.loadDemo);
  const resetAll = useAppStore((state) => state.resetAll);
  const metrics = useMemo(() => computeLaunchMetrics(leads, calls), [leads, calls]);

  if (!hydrated) {
    return <p className="text-sm text-ink-500">Cargando workspace…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-ink-950 px-6 py-8 text-white md:px-10 md:py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-bright">Megame</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl leading-tight md:text-5xl">
          Lleva el producto, las llamadas y el píxel en el mismo tablero.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-ink-300 md:text-base">
          Crea el producto en columnas tipo Trello, importa contactos desde Excel, registra cada llamada y mide la
          conversión. En marketing, activa Meta, GA4 o el snippet que uses.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/proyectos/nuevo"
            className="rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white"
          >
            Crear proyecto
          </Link>
          <Button variant="secondary" onClick={loadDemo}>
            Cargar demo
          </Button>
          <Button variant="ghost" className="text-ink-200" onClick={resetAll}>
            Vaciar datos
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Proyectos" value={projects.length} />
        <Kpi label="Tarjetas de producto" value={cards.length} />
        <Kpi label="Conversión de lanzamiento" value={`${metrics.conversionRate}%`} />
        <Kpi label="Píxeles activos" value={pixels.filter((pixel) => pixel.enabled).length} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Proyectos</h2>
          <Link href="/proyectos" className="text-sm text-teal">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const projectLeads = leads.filter((lead) => lead.projectId === project.id);
            const projectCalls = calls.filter((call) => call.projectId === project.id);
            const stats = computeLaunchMetrics(projectLeads, projectCalls);
            return (
              <article key={project.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-2xl" style={{ background: project.color }} />
                    <div>
                      <h3 className="font-display text-lg">{project.name}</h3>
                      <p className="text-xs text-ink-500">{formatDate(project.updatedAt)}</p>
                    </div>
                  </div>
                  <Badge tone="teal">{PROJECT_STATUS_LABEL[project.status]}</Badge>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-ink-600">{project.description}</p>
                <p className="mt-3 text-xs text-ink-500">
                  {projectLeads.length} contactos · {stats.conversionRate}% conversión · {projectCalls.length} llamadas
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <Link className="rounded-xl bg-ink-50 px-3 py-2 text-center" href={`/proyectos/${project.id}/tablero`}>
                    <KanbanSquare size={14} className="mx-auto mb-1" /> Producto
                  </Link>
                  <Link className="rounded-xl bg-ink-50 px-3 py-2 text-center" href={`/proyectos/${project.id}/lanzamiento`}>
                    <PhoneCall size={14} className="mx-auto mb-1" /> Lanzamiento
                  </Link>
                  <Link className="rounded-xl bg-ink-50 px-3 py-2 text-center" href={`/proyectos/${project.id}/marketing`}>
                    <Megaphone size={14} className="mx-auto mb-1" /> Marketing
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        {projects.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-500">Crea un proyecto o carga la demo para empezar.</p>
          </Card>
        ) : null}
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </Card>
  );
}
