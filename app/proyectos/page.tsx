"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/primitives";
import { PROJECT_STATUS_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function ProjectsPage() {
  const projects = useAppStore((state) => state.projects);
  const hydrated = useAppStore((state) => state.hydrated);
  const deleteProject = useAppStore((state) => state.deleteProject);

  if (!hydrated) return <p className="text-sm text-ink-500">Cargando…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Proyectos</h1>
          <p className="mt-1 text-sm text-ink-500">Cada proyecto tiene tablero, lanzamiento y marketing.</p>
        </div>
        <Link href="/proyectos/nuevo" className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white">
          Nuevo
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project.id} className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="h-3 w-3 rounded-full" style={{ background: project.color }} />
              <Badge>{PROJECT_STATUS_LABEL[project.status]}</Badge>
            </div>
            <Link href={`/proyectos/${project.id}`} className="font-display text-xl hover:underline">
              {project.name}
            </Link>
            <p className="mt-2 line-clamp-3 text-sm text-ink-600">{project.description}</p>
            <p className="mt-3 text-xs text-ink-400">Actualizado {formatDate(project.updatedAt)}</p>
            <button
              className="mt-4 text-xs text-red-700"
              onClick={() => deleteProject(project.id)}
            >
              Eliminar
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
