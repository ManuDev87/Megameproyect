"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { KanbanSquare, Megaphone, PhoneCall } from "lucide-react";
import { useAppStore, useProjectData } from "@/lib/store";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Badge, Card } from "@/components/ui/primitives";
import { PROJECT_STATUS_LABEL } from "@/lib/types";
import { computeLaunchMetrics } from "@/lib/metrics";

export default function ProjectOverviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const project = useAppStore((state) => state.projects.find((item) => item.id === params.id));
  const { leads, calls, cards, pixels } = useProjectData(params.id);
  const deleteProject = useAppStore((state) => state.deleteProject);
  const hydrated = useAppStore((state) => state.hydrated);

  if (!hydrated) return <p className="text-sm text-ink-500">Cargando…</p>;
  if (!project) return <p>No se encontró el proyecto.</p>;

  const metrics = computeLaunchMetrics(leads, calls);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: project.color }} />
            <Badge tone="teal">{PROJECT_STATUS_LABEL[project.status]}</Badge>
          </div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{project.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-600">{project.description}</p>
        </div>
        <button
          className="text-sm text-red-700"
          onClick={() => {
            deleteProject(project.id);
            router.push("/proyectos");
          }}
        >
          Eliminar proyecto
        </button>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <Shortcut
          href={`/proyectos/${project.id}/tablero`}
          icon={<KanbanSquare size={18} />}
          title="Producto"
          copy={`${cards.length} tarjetas en el tablero tipo Trello.`}
        />
        <Shortcut
          href={`/proyectos/${project.id}/lanzamiento`}
          icon={<PhoneCall size={18} />}
          title="Lanzamiento"
          copy={`${leads.length} contactos · ${metrics.conversionRate}% conversión.`}
        />
        <Shortcut
          href={`/proyectos/${project.id}/marketing`}
          icon={<Megaphone size={18} />}
          title="Marketing"
          copy={`${pixels.filter((pixel) => pixel.enabled).length} píxeles activos.`}
        />
      </div>

      <Card>
        <h2 className="mb-4 font-display text-xl">Editar ficha</h2>
        <ProjectForm project={project} />
      </Card>
    </div>
  );
}

function Shortcut({
  href,
  icon,
  title,
  copy,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <Link href={href} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="mb-3 text-teal">{icon}</div>
      <p className="font-display text-lg">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{copy}</p>
    </Link>
  );
}
