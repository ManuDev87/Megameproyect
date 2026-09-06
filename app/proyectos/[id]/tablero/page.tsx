"use client";

import { useParams } from "next/navigation";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { useAppStore } from "@/lib/store";

export default function BoardPage() {
  const params = useParams<{ id: string }>();
  const project = useAppStore((state) => state.projects.find((item) => item.id === params.id));
  const hydrated = useAppStore((state) => state.hydrated);

  if (!hydrated) return <p className="text-sm text-ink-500">Cargando tablero…</p>;
  if (!project) return <p>No se encontró el proyecto.</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="page-kicker">Creación de producto</p>
        <h1 className="font-display text-3xl font-semibold">{project.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Arrastra tarjetas entre columnas, igual que en Trello. En el móvil, desliza el tablero en horizontal.
        </p>
      </div>
      <KanbanBoard projectId={project.id} />
    </div>
  );
}
