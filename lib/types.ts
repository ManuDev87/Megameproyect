export const PROJECT_STATUSES = [
  "idea",
  "desarrollo",
  "lanzamiento",
  "activo",
  "pausado",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PRIORITIES = ["baja", "media", "alta", "urgente"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const LEAD_STATUSES = [
  "nuevo",
  "contactado",
  "interesado",
  "negociacion",
  "convertido",
  "perdido",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const CALL_OUTCOMES = [
  "no_contesta",
  "buzon",
  "hablado",
  "reagendar",
  "interesado",
  "no_interesado",
  "convertido",
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

export const PIXEL_PROVIDERS = [
  "meta",
  "ga4",
  "google_ads",
  "tiktok",
  "linkedin",
  "custom",
] as const;
export type PixelProvider = (typeof PIXEL_PROVIDERS)[number];

export const MARKETING_EVENT_TYPES = [
  "page_view",
  "lead",
  "call",
  "conversion",
] as const;
export type MarketingEventType = (typeof MARKETING_EVENT_TYPES)[number];

export const CONTACT_CHANNELS = [
  "whatsapp",
  "email",
  "llamada",
  "web",
  "linkedin",
  "excel",
  "otro",
] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: string;
  projectId: string;
  title: string;
  order: number;
}

export interface BoardCard {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  labels: string[];
  priority: Priority;
  dueDate?: string;
  order: number;
  createdAt: string;
}

export interface Lead {
  id: string;
  projectId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallLog {
  id: string;
  projectId: string;
  leadId: string;
  date: string;
  durationMinutes: number;
  outcome: CallOutcome;
  notes: string;
  nextFollowUp?: string;
}

export interface TrackingPixel {
  id: string;
  projectId: string;
  name: string;
  provider: PixelProvider;
  pixelId: string;
  customSnippet: string;
  enabled: boolean;
  createdAt: string;
}

export interface MarketingEvent {
  id: string;
  projectId: string;
  pixelId?: string;
  type: MarketingEventType;
  timestamp: string;
  detail: string;
  source?: string;
  device?: "mobile" | "desktop" | "tablet";
  sessionId?: string;
  path?: string;
}

export interface AppState {
  projects: Project[];
  columns: BoardColumn[];
  cards: BoardCard[];
  leads: Lead[];
  calls: CallLog[];
  pixels: TrackingPixel[];
  events: MarketingEvent[];
  seeded: boolean;
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Idea",
  desarrollo: "En desarrollo",
  lanzamiento: "Lanzamiento",
  activo: "Activo",
  pausado: "Pausado",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  interesado: "Interesado",
  negociacion: "Negociación",
  convertido: "Convertido",
  perdido: "Perdido",
};

export const CALL_OUTCOME_LABEL: Record<CallOutcome, string> = {
  no_contesta: "No contesta",
  buzon: "Buzón",
  hablado: "Hablado",
  reagendar: "Reagendar",
  interesado: "Interesado",
  no_interesado: "No interesado",
  convertido: "Convertido",
};

export const CONTACT_CHANNEL_LABEL: Record<ContactChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  llamada: "Llamada",
  web: "Web / landing",
  linkedin: "LinkedIn",
  excel: "Excel",
  otro: "Otro",
};

export const PIXEL_PROVIDER_LABEL: Record<PixelProvider, string> = {
  meta: "Meta Pixel",
  ga4: "Google Analytics 4",
  google_ads: "Google Ads",
  tiktok: "TikTok Pixel",
  linkedin: "LinkedIn Insight",
  custom: "Snippet personalizado",
};

export const DEFAULT_COLUMNS = [
  "Ideas",
  "Backlog",
  "Diseño",
  "Desarrollo",
  "QA",
  "Listo",
  "Lanzado",
];

export const PROJECT_COLORS = [
  "#16A34A",
  "#111318",
  "#2563EB",
  "#C8F542",
  "#FF8A73",
  "#7C3AED",
  "#0F766E",
];
