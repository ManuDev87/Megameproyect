"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { PixelScripts } from "@/components/marketing/PixelScripts";
import { PIXEL_PROVIDER_LABEL } from "@/lib/types";

export default function PublicLandingPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useAppStore((state) => state.hydrated);
  const project = useAppStore((state) => state.projects.find((item) => item.id === params.id));
  const pixels = useAppStore((state) => state.pixels.filter((pixel) => pixel.projectId === params.id));
  const enabled = pixels.filter((pixel) => pixel.enabled);

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
    <div className="min-h-screen bg-ink-950 text-white">
      <PixelScripts projectId={project.id} pixels={pixels} />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <p className="font-display text-lg">
          Mega<span className="text-teal-bright">me</span>
        </p>
        <Link href={`/proyectos/${project.id}/marketing`} className="text-sm text-ink-300">
          Volver al panel
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-teal-bright">Lanzamiento</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight md:text-6xl">{project.name}</h1>
        <p className="mt-6 max-w-xl text-lg text-ink-300">{project.description}</p>
        <a
          href={`mailto:hola@megame.app?subject=${encodeURIComponent("Quiero " + project.name)}`}
          className="mt-8 inline-flex rounded-full bg-teal px-6 py-3 text-sm font-medium"
        >
          Pedir una demo
        </a>

        <section className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-ink-300">Píxeles inyectados en esta página</p>
          <ul className="mt-3 space-y-2 text-sm">
            {enabled.map((pixel) => (
              <li key={pixel.id}>
                {pixel.name} · {PIXEL_PROVIDER_LABEL[pixel.provider]} · {pixel.pixelId}
              </li>
            ))}
            {enabled.length === 0 ? (
              <li className="text-ink-400">Ningún píxel activo. Actívalos en Marketing.</li>
            ) : null}
          </ul>
        </section>
      </main>
    </div>
  );
}
