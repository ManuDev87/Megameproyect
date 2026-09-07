import { CONTACT_CHANNELS, type ContactChannel } from "./types";

const ALIASES: Record<string, ContactChannel> = {
  whatsapp: "whatsapp",
  wa: "whatsapp",
  "whats app": "whatsapp",
  email: "email",
  correo: "email",
  mail: "email",
  "e-mail": "email",
  llamada: "llamada",
  call: "llamada",
  telefono: "llamada",
  teléfono: "llamada",
  "cold call": "llamada",
  web: "web",
  landing: "web",
  webinar: "web",
  linkedin: "linkedin",
  excel: "excel",
  csv: "excel",
};

export function normalizeContactChannel(source?: string): ContactChannel {
  const raw = (source ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!raw) return "otro";
  if (ALIASES[raw]) return ALIASES[raw];
  if (raw.includes("whats")) return "whatsapp";
  if (raw.includes("mail") || raw.includes("correo")) return "email";
  if (raw.includes("llam") || raw.includes("call") || raw.includes("telef")) return "llamada";
  if (raw.includes("linked")) return "linkedin";
  if (raw.includes("excel") || raw.includes("csv")) return "excel";
  if (raw.includes("web") || raw.includes("land") || raw.includes("pixel") || raw.includes("anuncio")) {
    return "web";
  }
  return CONTACT_CHANNELS.includes(raw as ContactChannel) ? (raw as ContactChannel) : "otro";
}
