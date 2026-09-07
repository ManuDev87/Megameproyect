"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  KanbanSquare,
  Megaphone,
  PhoneCall,
  FolderKanban,
  Layers,
  TrendingUp,
  BarChart3,
  Plus,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { computeLaunchMetrics } from "@/lib/metrics";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { PRIORITY_LABEL, PROJECT_STATUS_LABEL, type BoardCard, type Priority } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function DashboardPage() {
  const hydrated = useAppStore((state) => state.hydrated);
  const projects = useAppStore((state) => state.projects);
  const leads = useAppStore((state) => state.leads);
  const calls = useAppStore((state) => state.calls);
  const cards = useAppStore((state) => state.cards);
  const columns = useAppStore((state) => state.columns);
  const loadDemo = useAppStore((state) => state.loadDemo);
  const resetAll = useAppStore((state) => state.resetAll);
  const metrics = useMemo(() => computeLaunchMetrics(leads, calls), [leads, calls]);
  const featured = projects[0];
  const previewColumns = useMemo(() => {
    if (!featured) return [];
    return columns
      .filter((column) => column.projectId === featured.id)
      .sort((a, b) => a.order - b.order)
      .slice(0, 3)
      .map((column) => ({
        ...column,
        cards: cards
          .filter((card) => card.columnId === column.id)
          .sort((a, b) => a.order - b.order)
          .slice(0, 2),
      }));
  }, [featured, columns, cards]);

  if (!hydrated) {
    return <p className="text-sm text-ink-500">Cargando workspace…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="hero-grid overflow-hidden rounded-2xl px-6 py-8 text-white md:px-10 md:py-11">
        <p className="inline-flex rounded-md bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-950">
          Pixlanz
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight md:text-5xl">
          Lleva el producto, las llamadas y el píxel en el mismo tablero.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-ink-300 md:text-base">
          Crea el producto en columnas tipo Trello, importa contactos desde Excel y registra cada llamada. El píxel
          solo guarda el código; visitas y conversión se ven en Resultados.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/proyectos/nuevo"
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2.5 text-sm font-semibold text-ink-950"
          >
            <Plus size={16} /> Crear proyecto
          </Link>
          <button
            type="button"
            onClick={loadDemo}
            className="inline-flex items-center rounded-xl border border-white/35 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Cargar demo
          </button>
          <Button variant="ghost" className="text-ink-300 hover:bg-white/10 hover:text-white" onClick={resetAll}>
            Vaciar datos
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Proyectos" value={projects.length} icon={<FolderKanban size={18} />} accent="bg-amber-100 text-amber-800" />
        <Kpi label="Tarjetas" value={cards.length} icon={<Layers size={18} />} accent="bg-ink-100 text-ink-700" />
        <Kpi
          label="Conversión"
          value={`${metrics.conversionRate}%`}
          icon={<TrendingUp size={18} />}
          accent="bg-lime-soft text-lime-ink"
        />
        <Kpi
          label="Contactos"
          value={leads.length}
          icon={<PhoneCall size={18} />}
          accent="bg-sky-100 text-sky-800"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_1.2fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Proyectos</h2>
            <Link href="/proyectos" className="text-sm font-medium text-ink-600 hover:text-ink-950">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4">
            {projects.map((project) => {
              const projectLeads = leads.filter((lead) => lead.projectId === project.id);
              const projectCalls = calls.filter((call) => call.projectId === project.id);
              const stats = computeLaunchMetrics(projectLeads, projectCalls);
              return (
                <article key={project.id} className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                        style={{ background: project.color }}
                      >
                        {project.name.slice(0, 1)}
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-semibold">{project.name}</h3>
                        <p className="text-xs text-ink-500">{formatDate(project.updatedAt)}</p>
                      </div>
                    </div>
                    <Badge tone="blue">{PROJECT_STATUS_LABEL[project.status]}</Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-ink-600">{project.description}</p>
                  <p className="mt-3 text-xs text-ink-500">
                    {projectLeads.length} contactos · {stats.conversionRate}% conversión · {projectCalls.length} llamadas
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <Link className="rounded-xl bg-canvas px-3 py-2 text-center font-medium hover:bg-ink-100" href={`/proyectos/${project.id}/tablero`}>
                      <KanbanSquare size={14} className="mx-auto mb-1" /> Producto
                    </Link>
                    <Link className="rounded-xl bg-canvas px-3 py-2 text-center font-medium hover:bg-ink-100" href={`/proyectos/${project.id}/lanzamiento`}>
                      <PhoneCall size={14} className="mx-auto mb-1" /> Contactos
                    </Link>
                    <Link className="rounded-xl bg-canvas px-3 py-2 text-center font-medium hover:bg-ink-100" href={`/proyectos/${project.id}/resultados`}>
                      <BarChart3 size={14} className="mx-auto mb-1" /> Resultados
                    </Link>
                    <Link className="rounded-xl bg-canvas px-3 py-2 text-center font-medium hover:bg-ink-100" href={`/proyectos/${project.id}/marketing`}>
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
        </div>

        {featured ? (
          <Card className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Tablero de proyecto</h2>
              <Link href={`/proyectos/${featured.id}/tablero`} className="text-sm font-medium text-ink-500 hover:text-ink-950">
                Abrir
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {previewColumns.map((column) => (
                <div key={column.id} className="rounded-xl bg-canvas p-2.5">
                  <p className="mb-2 px-1 text-xs font-semibold text-ink-500">
                    {column.title} <span className="text-ink-400">{column.cards.length}</span>
                  </p>
                  <div className="space-y-2">
                    {column.cards.map((card) => (
                      <PreviewCard key={card.id} card={card} />
                    ))}
                    {column.cards.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-ink-200 px-2 py-3 text-center text-xs text-ink-400">
                        + Añadir tarjeta
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </section>
    </div>
  );
}

function PreviewCard({ card }: { card: BoardCard }) {
  const tone: Record<Priority, "neutral" | "teal" | "coral" | "red"> = {
    baja: "neutral",
    media: "coral",
    alta: "teal",
    urgente: "red",
  };
  return (
    <div className="rounded-lg bg-white p-2.5 shadow-sm">
      <p className="text-xs font-semibold leading-4">{card.title}</p>
      <div className="mt-1.5">
        <Badge tone={tone[card.priority]}>{PRIORITY_LABEL[card.priority]}</Badge>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      </div>
      <span className={`rounded-lg p-2 ${accent}`}>{icon}</span>
    </Card>
  );
}
