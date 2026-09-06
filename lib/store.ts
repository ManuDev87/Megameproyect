"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppState,
  BoardCard,
  BoardColumn,
  CallLog,
  Lead,
  LeadStatus,
  Priority,
  Project,
  ProjectStatus,
  TrackingPixel,
} from "./types";
import { DEFAULT_COLUMNS } from "./types";
import { createId, nowIso } from "./id";
import { createDemoState, emptyState } from "./seed";

interface Store extends AppState {
  hydrated: boolean;
  setHydrated: () => void;
  loadDemo: () => void;
  resetAll: () => void;

  createProject: (input: {
    name: string;
    description: string;
    status: ProjectStatus;
    color: string;
    owner: string;
  }) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addColumn: (projectId: string, title: string) => void;
  renameColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => void;

  addCard: (input: {
    projectId: string;
    columnId: string;
    title: string;
    description: string;
    labels: string[];
    priority: Priority;
    dueDate?: string;
  }) => void;
  updateCard: (id: string, patch: Partial<BoardCard>) => void;
  deleteCard: (id: string) => void;

  importLeads: (leads: Lead[]) => number;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addLead: (input: Omit<Lead, "id" | "createdAt" | "updatedAt">) => void;

  addCall: (input: Omit<CallLog, "id">) => void;
  deleteCall: (id: string) => void;

  addPixel: (input: Omit<TrackingPixel, "id" | "createdAt">) => void;
  updatePixel: (id: string, patch: Partial<TrackingPixel>) => void;
  deletePixel: (id: string) => void;

  trackEvent: (input: {
    projectId: string;
    pixelId?: string;
    type: AppState["events"][number]["type"];
    detail: string;
  }) => void;
}

function withDefaultColumns(projectId: string): BoardColumn[] {
  return DEFAULT_COLUMNS.map((title, order) => ({
    id: createId("col"),
    projectId,
    title,
    order,
  }));
}

function orderedCards(cards: BoardCard[], columnId: string): BoardCard[] {
  return cards
    .filter((card) => card.columnId === columnId)
    .sort((a, b) => a.order - b.order);
}

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...emptyState(),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      loadDemo: () => set({ ...createDemoState(), hydrated: true }),
      resetAll: () => set({ ...emptyState(), hydrated: true, seeded: true }),

      createProject: (input) => {
        const id = createId("prj");
        const stamp = nowIso();
        const project: Project = {
          id,
          ...input,
          createdAt: stamp,
          updatedAt: stamp,
        };
        set((state) => ({
          projects: [project, ...state.projects],
          columns: [...state.columns, ...withDefaultColumns(id)],
        }));
        return id;
      },

      updateProject: (id, patch) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...patch, updatedAt: nowIso() } : project,
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          columns: state.columns.filter((column) => column.projectId !== id),
          cards: state.cards.filter((card) => card.projectId !== id),
          leads: state.leads.filter((lead) => lead.projectId !== id),
          calls: state.calls.filter((call) => call.projectId !== id),
          pixels: state.pixels.filter((pixel) => pixel.projectId !== id),
          events: state.events.filter((event) => event.projectId !== id),
        })),

      addColumn: (projectId, title) =>
        set((state) => {
          const order = state.columns.filter((column) => column.projectId === projectId).length;
          return {
            columns: [
              ...state.columns,
              { id: createId("col"), projectId, title, order },
            ],
          };
        }),

      renameColumn: (id, title) =>
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === id ? { ...column, title } : column,
          ),
        })),

      deleteColumn: (id) =>
        set((state) => ({
          columns: state.columns.filter((column) => column.id !== id),
          cards: state.cards.filter((card) => card.columnId !== id),
        })),

      moveCard: (cardId, toColumnId, toIndex) =>
        set((state) => {
          const moving = state.cards.find((card) => card.id === cardId);
          if (!moving) return state;

          const without = state.cards.filter((card) => card.id !== cardId);
          const destination = orderedCards(without, toColumnId);
          destination.splice(toIndex, 0, { ...moving, columnId: toColumnId });

          const reindexed = destination.map((card, order) => ({ ...card, order }));
          const others = without.filter((card) => card.columnId !== toColumnId);
          return { cards: [...others, ...reindexed] };
        }),

      addCard: (input) =>
        set((state) => {
          const order = state.cards.filter((card) => card.columnId === input.columnId).length;
          const card: BoardCard = {
            id: createId("card"),
            order,
            createdAt: nowIso(),
            ...input,
          };
          return { cards: [...state.cards, card] };
        }),

      updateCard: (id, patch) =>
        set((state) => ({
          cards: state.cards.map((card) => (card.id === id ? { ...card, ...patch } : card)),
        })),

      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        })),

      importLeads: (incoming) => {
        const existing = get().leads;
        const unique = incoming.filter((lead) => {
          const email = lead.email.toLowerCase();
          const phone = lead.phone.replace(/\s/g, "");
          return !existing.some(
            (current) =>
              current.projectId === lead.projectId &&
              ((email && current.email.toLowerCase() === email) ||
                (phone && current.phone.replace(/\s/g, "") === phone)),
          );
        });
        set((state) => ({
          leads: [...unique, ...state.leads],
          events: [
            {
              id: createId("evt"),
              projectId: incoming[0]?.projectId ?? "",
              type: "lead",
              timestamp: nowIso(),
              detail: `Importados ${unique.length} contactos`,
            },
            ...state.events,
          ],
        }));
        return unique.length;
      },

      addLead: (input) =>
        set((state) => {
          const stamp = nowIso();
          const lead: Lead = {
            id: createId("lead"),
            createdAt: stamp,
            updatedAt: stamp,
            ...input,
          };
          return { leads: [lead, ...state.leads] };
        }),

      updateLead: (id, patch) =>
        set((state) => {
          const previous = state.leads.find((lead) => lead.id === id);
          const nextStatus = patch.status as LeadStatus | undefined;
          const extraEvents = [...state.events];
          if (previous && nextStatus === "convertido" && previous.status !== "convertido") {
            extraEvents.unshift({
              id: createId("evt"),
              projectId: previous.projectId,
              type: "conversion",
              timestamp: nowIso(),
              detail: `Lead convertido: ${previous.name}`,
            });
          }
          return {
            leads: state.leads.map((lead) =>
              lead.id === id ? { ...lead, ...patch, updatedAt: nowIso() } : lead,
            ),
            events: extraEvents,
          };
        }),

      deleteLead: (id) =>
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id),
          calls: state.calls.filter((call) => call.leadId !== id),
        })),

      addCall: (input) =>
        set((state) => {
          const call: CallLog = { id: createId("call"), ...input };
          const lead = state.leads.find((item) => item.id === input.leadId);
          let leads = state.leads;
          if (lead && input.outcome === "convertido") {
            leads = leads.map((item) =>
              item.id === lead.id
                ? { ...item, status: "convertido", updatedAt: nowIso() }
                : item,
            );
          } else if (lead && input.outcome === "interesado" && lead.status === "nuevo") {
            leads = leads.map((item) =>
              item.id === lead.id
                ? { ...item, status: "interesado", updatedAt: nowIso() }
                : item,
            );
          } else if (lead && lead.status === "nuevo") {
            leads = leads.map((item) =>
              item.id === lead.id
                ? { ...item, status: "contactado", updatedAt: nowIso() }
                : item,
            );
          }

          return {
            calls: [call, ...state.calls],
            leads,
            events: [
              {
                id: createId("evt"),
                projectId: input.projectId,
                type: "call",
                timestamp: nowIso(),
                detail: `Llamada a ${lead?.name ?? "contacto"}`,
              },
              ...state.events,
            ],
          };
        }),

      deleteCall: (id) =>
        set((state) => ({
          calls: state.calls.filter((call) => call.id !== id),
        })),

      addPixel: (input) =>
        set((state) => ({
          pixels: [
            {
              id: createId("px"),
              createdAt: nowIso(),
              ...input,
            },
            ...state.pixels,
          ],
        })),

      updatePixel: (id, patch) =>
        set((state) => ({
          pixels: state.pixels.map((pixel) =>
            pixel.id === id ? { ...pixel, ...patch } : pixel,
          ),
        })),

      deletePixel: (id) =>
        set((state) => ({
          pixels: state.pixels.filter((pixel) => pixel.id !== id),
        })),

      trackEvent: (input) =>
        set((state) => ({
          events: [
            {
              id: createId("evt"),
              timestamp: nowIso(),
              ...input,
            },
            ...state.events,
          ],
        })),
    }),
    {
      name: "megame-store",
      skipHydration: true,
      partialize: (state) => {
        const { hydrated, ...rest } = state;
        void hydrated;
        return rest;
      },
    },
  ),
);

export function useProject(projectId?: string) {
  return useAppStore((state) => state.projects.find((project) => project.id === projectId));
}

export function useProjectData(projectId: string) {
  const columns = useAppStore((state) => state.columns);
  const cards = useAppStore((state) => state.cards);
  const leads = useAppStore((state) => state.leads);
  const calls = useAppStore((state) => state.calls);
  const pixels = useAppStore((state) => state.pixels);
  const events = useAppStore((state) => state.events);

  return useMemo(
    () => ({
      columns: columns
        .filter((column) => column.projectId === projectId)
        .sort((a, b) => a.order - b.order),
      cards: cards.filter((card) => card.projectId === projectId),
      leads: leads.filter((lead) => lead.projectId === projectId),
      calls: calls.filter((call) => call.projectId === projectId),
      pixels: pixels.filter((pixel) => pixel.projectId === projectId),
      events: events.filter((event) => event.projectId === projectId),
    }),
    [projectId, columns, cards, leads, calls, pixels, events],
  );
}
