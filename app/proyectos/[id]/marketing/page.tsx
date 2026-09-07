"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MarketingPanel } from "@/components/marketing/MarketingPanel";
import { useAppStore } from "@/lib/store";

export default function MarketingPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-500">Cargando marketing…</p>}>
      <MarketingBody />
    </Suspense>
  );
}

function MarketingBody() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const project = useAppStore((state) => state.projects.find((item) => item.id === params.id));
  const hydrated = useAppStore((state) => state.hydrated);
  const initialTab = search.get("tab") === "analitica" ? "analitica" : "codigo";

  if (!hydrated) return <p className="text-sm text-ink-500">Cargando marketing…</p>;
  if (!project) return <p>No se encontró el proyecto.</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="page-kicker">Marketing</p>
        <h1 className="font-display text-3xl font-semibold">{project.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Código del píxel en una pestaña. Analítica web y de contactos (WhatsApp, email, llamadas) en la otra.
        </p>
      </div>
      <MarketingPanel projectId={project.id} initialTab={initialTab} />
    </div>
  );
}
