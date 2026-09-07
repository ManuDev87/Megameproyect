"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useAppStore, useProjectData } from "@/lib/store";
import { PixelScripts } from "@/components/marketing/PixelScripts";
import { PIXEL_PROVIDER_LABEL } from "@/lib/types";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { computeAnalytics } from "@/lib/analytics";

export default function PublicLandingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950 text-ink-200">Cargando landing…</div>}>
      <LandingBody />
    </Suspense>
  );
}

function LandingBody() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const preview = search.get("preview") === "1";
  const hydrated = useAppStore((state) => state.hydrated);
  const project = useAppStore((state) => state.projects.find((item) => item.id === params.id));
  const { pixels, leads, calls, events } = useProjectData(params.id);
  const enabled = pixels.filter((pixel) => pixel.enabled);
  const analytics = useMemo(() => computeAnalytics(leads, calls, events), [leads, calls, events]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-ink-200">
        Cargando landing…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-white">
        <p>Esta landing no existe en este navegador.</p>
      </div>
    );
  }

  return (
    <div className="hero-grid min-h-screen text-white">
      <PixelScripts projectId={project.id} pixels={pixels} />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <p className="font-display text-lg font-semibold">
          Pix<span className="text-lime">lanz</span>
        </p>
        <Link href={`/proyectos/${project.id}/marketing`} className="text-sm text-ink-300 hover:text-white">
          Volver al panel
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <p className="inline-flex rounded-md bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-950">
          Lanzamiento
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">{project.name}</h1>
        <p className="mt-6 max-w-xl text-lg text-ink-300">{project.description}</p>
        <a
          href={`mailto:hola@pixlanz.app?subject=${encodeURIComponent("Quiero " + project.name)}`}
          className="mt-8 inline-flex rounded-xl bg-lime px-6 py-3 text-sm font-semibold text-ink-950"
        >
          Pedir una demo
        </a>

        <section className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-ink-300">Píxeles inyectados en esta página</p>
          <ul className="mt-3 space-y-2 text-sm">
            {enabled.map((pixel) => (
              <li key={pixel.id}>
                {pixel.name} · {PIXEL_PROVIDER_LABEL[pixel.provider]} · {pixel.pixelId}
              </li>
            ))}
            {enabled.length === 0 ? (
              <li className="text-ink-400">Ningún píxel activo. Pega el código en Píxel.</li>
            ) : null}
          </ul>
        </section>
      </main>

      {preview ? (
        <aside className="fixed inset-x-3 bottom-3 z-30 max-h-[58vh] overflow-y-auto rounded-2xl border border-white/10 bg-white p-4 text-ink-950 shadow-lift md:inset-x-auto md:bottom-6 md:right-6 md:w-[420px]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">Prueba</p>
              <p className="font-display text-lg font-semibold">Estadísticas de visitas</p>
              <p className="text-xs text-ink-500">{analytics.visits} visitas · {analytics.whatsappContacts} WhatsApp · {analytics.emailContacts} email</p>
            </div>
            <Link href={`/proyectos/${project.id}/marketing?tab=analitica`} className="text-xs font-semibold text-ink-700 hover:text-ink-950">
              Abrir analítica
            </Link>
          </div>
          <AnalyticsDashboard projectId={project.id} compact />
        </aside>
      ) : null}
    </div>
  );
}
