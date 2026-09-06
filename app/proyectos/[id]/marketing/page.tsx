"use client";

import { useParams } from "next/navigation";
import { MarketingPanel } from "@/components/marketing/MarketingPanel";
import { useAppStore } from "@/lib/store";

export default function MarketingPage() {
  const params = useParams<{ id: string }>();
  const project = useAppStore((state) => state.projects.find((item) => item.id === params.id));
  const hydrated = useAppStore((state) => state.hydrated);

  if (!hydrated) return <p className="text-sm text-ink-500">Cargando marketing…</p>;
  if (!project) return <p>No se encontró el proyecto.</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-ink-400">Marketing y medición</p>
        <h1 className="font-display text-3xl">{project.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Configura píxeles o snippets. Lo que marques como activo se inyecta en la landing pública.
        </p>
      </div>
      <MarketingPanel projectId={project.id} />
    </div>
  );
}
