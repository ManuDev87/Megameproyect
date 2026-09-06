import type { AppState } from "./types";
import { createId, nowIso } from "./id";

export function createDemoState(): AppState {
  const projectId = createId("prj");
  const stamp = nowIso();
  const columns = [
    "Ideas",
    "Backlog",
    "Diseño",
    "Desarrollo",
    "QA",
    "Listo",
    "Lanzado",
  ].map((title, order) => ({
    id: createId("col"),
    projectId,
    title,
    order,
  }));

  const [ideas, backlog, diseno, desarrollo, qa, listo] = columns;

  const cards = [
    {
      columnId: ideas.id,
      title: "App de onboarding para partners",
      description: "Flujo guiado para que un partner active su cuenta en menos de 10 minutos.",
      labels: ["UX", "Partners"],
      priority: "media" as const,
    },
    {
      columnId: backlog.id,
      title: "API de importación Excel",
      description: "Validar columnas, detectar duplicados por email y teléfono.",
      labels: ["Backend"],
      priority: "alta" as const,
    },
    {
      columnId: diseno.id,
      title: "Tablero de producto",
      description: "Columnas tipo Trello, arrastrar tarjetas, etiquetas y prioridad.",
      labels: ["Producto"],
      priority: "alta" as const,
    },
    {
      columnId: desarrollo.id,
      title: "Registro de llamadas",
      description: "Cada llamada guarda resultado, duración y siguiente seguimiento.",
      labels: ["CRM"],
      priority: "urgente" as const,
    },
    {
      columnId: qa.id,
      title: "Landing con píxeles",
      description: "Inyectar Meta, GA4 y TikTok en la página pública del lanzamiento.",
      labels: ["Marketing"],
      priority: "media" as const,
    },
    {
      columnId: listo.id,
      title: "Dashboard de conversión",
      description: "Embudo nuevo → contactado → interesado → convertido.",
      labels: ["Métricas"],
      priority: "baja" as const,
    },
  ].map((card, order) => ({
    id: createId("card"),
    projectId,
    order,
    dueDate: undefined,
    createdAt: stamp,
    ...card,
  }));

  const leads = [
    {
      name: "Laura Méndez",
      email: "laura@orbitas.io",
      phone: "+34 612 445 890",
      company: "Órbitas",
      source: "Webinar",
      status: "interesado" as const,
    },
    {
      name: "Carlos Vidal",
      email: "cvidal@nortech.es",
      phone: "+34 600 221 118",
      company: "Nortech",
      source: "LinkedIn",
      status: "contactado" as const,
    },
    {
      name: "Sofía Herrera",
      email: "sofia@kable.app",
      phone: "+34 655 009 441",
      company: "Kable",
      source: "Excel",
      status: "convertido" as const,
    },
    {
      name: "Miguel Prado",
      email: "miguel@prado.tech",
      phone: "+34 678 333 210",
      company: "Prado Tech",
      source: "Feria",
      status: "nuevo" as const,
    },
    {
      name: "Elena Costa",
      email: "elena@costa.dev",
      phone: "+34 611 888 004",
      company: "Costa Dev",
      source: "Referral",
      status: "negociacion" as const,
    },
    {
      name: "Iván Soler",
      email: "ivan@soler.agency",
      phone: "+34 622 147 963",
      company: "Soler Agency",
      source: "Cold call",
      status: "perdido" as const,
    },
  ].map((lead) => ({
    id: createId("lead"),
    projectId,
    notes: "",
    createdAt: stamp,
    updatedAt: stamp,
    ...lead,
  }));

  const sofia = leads.find((lead) => lead.status === "convertido")!;
  const laura = leads.find((lead) => lead.status === "interesado")!;
  const carlos = leads.find((lead) => lead.status === "contactado")!;

  const calls = [
    {
      leadId: sofia.id,
      durationMinutes: 18,
      outcome: "convertido" as const,
      notes: "Cierra plan anual. Enviar contrato.",
    },
    {
      leadId: laura.id,
      durationMinutes: 12,
      outcome: "interesado" as const,
      notes: "Quiere ver el tablero con su equipo el jueves.",
    },
    {
      leadId: carlos.id,
      durationMinutes: 0,
      outcome: "buzon" as const,
      notes: "Dejar mensaje. Reintentar mañana.",
    },
  ].map((call) => ({
    id: createId("call"),
    projectId,
    date: stamp,
    ...call,
  }));

  const pixels = [
    {
      name: "Meta — lanzamiento",
      provider: "meta" as const,
      pixelId: "123456789012345",
      customSnippet: "",
      enabled: true,
    },
    {
      name: "GA4 producto",
      provider: "ga4" as const,
      pixelId: "G-NEXUSDEMO1",
      customSnippet: "",
      enabled: true,
    },
    {
      name: "TikTok ads",
      provider: "tiktok" as const,
      pixelId: "C1DEMOPIXEL",
      customSnippet: "",
      enabled: false,
    },
  ].map((pixel) => ({
    id: createId("px"),
    projectId,
    createdAt: stamp,
    ...pixel,
  }));

  return {
    seeded: true,
    projects: [
      {
        id: projectId,
        name: "Nexus Launch",
        description:
          "Suite para llevar un producto tecnológico desde el tablero hasta las primeras llamadas de venta.",
        status: "lanzamiento",
        color: "#0F766E",
        owner: "Manuel",
        createdAt: stamp,
        updatedAt: stamp,
      },
    ],
    columns,
    cards,
    leads,
    calls,
    pixels,
    events: [
      {
        id: createId("evt"),
        projectId,
        pixelId: pixels[0].id,
        type: "page_view",
        timestamp: stamp,
        detail: "Visita a la landing pública",
      },
      {
        id: createId("evt"),
        projectId,
        pixelId: pixels[0].id,
        type: "conversion",
        timestamp: stamp,
        detail: "Lead convertido: Sofía Herrera",
      },
    ],
  };
}

export const emptyState = (): AppState => ({
  projects: [],
  columns: [],
  cards: [],
  leads: [],
  calls: [],
  pixels: [],
  events: [],
  seeded: false,
});
