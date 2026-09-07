import type { AppState } from "./types";
import { createId, nowIso } from "./id";

function daysAgo(days: number, hour = 11): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, (days * 7) % 60, 0, 0);
  return date.toISOString();
}

const TRAFFIC_SOURCES = ["Directo", "Meta", "google.com", "linkedin.com"];
const DEVICES = ["desktop", "mobile", "tablet"] as const;

function buildDemoEvents(projectId: string, pixelId: string) {
  const visits = Array.from({ length: 14 }, (_, dayOffset) => {
    const count = 2 + ((dayOffset * 3) % 4);
    return Array.from({ length: count }, (_, visit) => ({
      id: createId("evt"),
      projectId,
      pixelId,
      type: "page_view" as const,
      timestamp: daysAgo(13 - dayOffset, 9 + visit),
      detail: TRAFFIC_SOURCES[visit % TRAFFIC_SOURCES.length] === "Meta" ? "Visita desde anuncio Meta" : "Visita a la landing pública",
      source: TRAFFIC_SOURCES[(dayOffset + visit) % TRAFFIC_SOURCES.length],
      device: DEVICES[(dayOffset + visit) % DEVICES.length],
      sessionId: `demo_${dayOffset}_${visit}`,
      path: `/p/${projectId}`,
    }));
  }).flat();

  return [
    ...visits,
    {
      id: createId("evt"),
      projectId,
      pixelId,
      type: "conversion" as const,
      timestamp: daysAgo(5, 16),
      detail: "Lead convertido: Sofía Herrera",
    },
  ];
}

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
      source: "WhatsApp",
      status: "interesado" as const,
      createdAt: daysAgo(8),
    },
    {
      name: "Carlos Vidal",
      email: "cvidal@nortech.es",
      phone: "+34 600 221 118",
      company: "Nortech",
      source: "Email",
      status: "contactado" as const,
      createdAt: daysAgo(7),
    },
    {
      name: "Sofía Herrera",
      email: "sofia@kable.app",
      phone: "+34 655 009 441",
      company: "Kable",
      source: "Excel",
      status: "convertido" as const,
      createdAt: daysAgo(6),
    },
    {
      name: "Miguel Prado",
      email: "miguel@prado.tech",
      phone: "+34 678 333 210",
      company: "Prado Tech",
      source: "WhatsApp",
      status: "nuevo" as const,
      createdAt: daysAgo(4),
    },
    {
      name: "Elena Costa",
      email: "elena@costa.dev",
      phone: "+34 611 888 004",
      company: "Costa Dev",
      source: "Email",
      status: "negociacion" as const,
      createdAt: daysAgo(3),
    },
    {
      name: "Iván Soler",
      email: "ivan@soler.agency",
      phone: "+34 622 147 963",
      company: "Soler Agency",
      source: "Llamada",
      status: "perdido" as const,
      createdAt: daysAgo(2),
    },
  ].map((lead) => ({
    id: createId("lead"),
    projectId,
    notes: "",
    updatedAt: lead.createdAt,
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
      date: daysAgo(5, 16),
    },
    {
      leadId: laura.id,
      durationMinutes: 12,
      outcome: "interesado" as const,
      notes: "Quiere ver el tablero con su equipo el jueves.",
      date: daysAgo(4, 12),
    },
    {
      leadId: carlos.id,
      durationMinutes: 0,
      outcome: "buzon" as const,
      notes: "Dejar mensaje. Reintentar mañana.",
      date: daysAgo(1, 9),
    },
  ].map((call) => ({
    id: createId("call"),
    projectId,
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
        color: "#16A34A",
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
    events: buildDemoEvents(projectId, pixels[0].id),
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
