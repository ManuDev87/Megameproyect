"use client";

import { useParams } from "next/navigation";
import { LaunchPanel } from "@/components/launch/LaunchPanel";
import { useAppStore } from "@/lib/store";

export default function LaunchPage() {
  const params = useParams<{ id: string }>();
  const project = useAppStore((state) => state.projects.find((item) => item.id === params.id));
  const hydrated = useAppStore((state) => state.hydrated);

  if (!hydrated) return <p className="text-sm text-ink-500">Cargando lanzamiento…</p>;
  if (!project) return <p>No se encontró el proyecto.</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-400">Seguimiento de lanzamiento</p>
        <h1 className="font-display text-3xl">{project.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Importa emails y teléfonos desde Excel, registra llamadas y mira el ratio de conversión del embudo.
        </p>
      </div>
      <LaunchPanel projectId={project.id} />
    </div>
  );
}
