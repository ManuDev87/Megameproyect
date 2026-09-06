"use client";

import { ProjectForm } from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Nuevo proyecto tecnológico</h1>
        <p className="mt-1 text-sm text-ink-500">
          Se crea con un tablero de producto vacío, listo para importar leads y configurar píxeles.
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
