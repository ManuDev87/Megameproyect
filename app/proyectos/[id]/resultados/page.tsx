"use client";

import { useParams } from "next/navigation";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { useAppStore } from "@/lib/store";

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const project = useAppStore((state) => state.projects.find((item) => item.id === params.id));
  const hydrated = useAppStore((state) => state.hydrated);

  if (!hydrated) return <p className="text-sm text-ink-500">Cargando resultados…</p>;
  if (!project) return <p>No se encontró el proyecto.</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="page-kicker">Resultados</p>
        <h1 className="font-display text-3xl font-semibold">{project.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Visitas del píxel, contactos, conversión comercial y rechazados. El listado de llamadas está en Contactos.
        </p>
      </div>
      <ResultsPanel projectId={project.id} />
    </div>
  );
}
