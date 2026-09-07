"use client";

import { useParams } from "next/navigation";
import { MarketingPanel } from "@/components/marketing/MarketingPanel";
import { useAppStore } from "@/lib/store";

export default function MarketingPage() {
  const params = useParams<{ id: string }>();
  const project = useAppStore((state) => state.projects.find((item) => item.id === params.id));
  const hydrated = useAppStore((state) => state.hydrated);

  if (!hydrated) return <p className="text-sm text-ink-500">Cargando píxel…</p>;
  if (!project) return <p>No se encontró el proyecto.</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="page-kicker">Píxel</p>
        <h1 className="font-display text-3xl font-semibold">{project.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Pega el ID o el snippet. Lo activo se inyecta en la landing. Visitas y conversión están en Resultados.
        </p>
      </div>
      <MarketingPanel projectId={project.id} />
    </div>
  );
}
