"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Project, ProjectStatus } from "@/lib/types";
import { PROJECT_COLORS, PROJECT_STATUSES, PROJECT_STATUS_LABEL } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const createProject = useAppStore((state) => state.createProject);
  const updateProject = useAppStore((state) => state.updateProject);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "idea");
  const [color, setColor] = useState(project?.color ?? PROJECT_COLORS[0]);
  const [owner, setOwner] = useState(project?.owner ?? "");

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (project) {
          updateProject(project.id, { name, description, status, color, owner });
          router.push(`/proyectos/${project.id}`);
          return;
        }
        const id = createProject({ name, description, status, color, owner });
        router.push(`/proyectos/${id}/tablero`);
      }}
    >
      <Field label="Nombre del proyecto">
        <Input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Nexus Launch" />
      </Field>
      <Field label="Descripción">
        <Textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Qué se construye y a quién se lanza."
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Estado">
          <Select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)}>
            {PROJECT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {PROJECT_STATUS_LABEL[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Responsable">
          <Input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Tú o el equipo" />
        </Field>
      </div>
      <Field label="Color">
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setColor(value)}
              className="h-8 w-8 rounded-full border-2"
              style={{
                background: value,
                borderColor: color === value ? "#111318" : "transparent",
              }}
              aria-label={value}
            />
          ))}
        </div>
      </Field>
      <Button type="submit">{project ? "Guardar cambios" : "Crear proyecto"}</Button>
    </form>
  );
}
