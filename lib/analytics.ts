import { addDays, format, parseISO, startOfDay, subDays } from "date-fns";
import { es } from "date-fns/locale";
import type { CallLog, ContactChannel, Lead, MarketingEvent } from "./types";
import { CONTACT_CHANNEL_LABEL } from "./types";
import { normalizeContactChannel } from "./channels";
import { percent } from "./format";

export interface DayBucket {
  key: string;
  label: string;
  visits: number;
  contacts: number;
  whatsapp: number;
  email: number;
  calls: number;
}

export interface NamedCount {
  key: string;
  label: string;
  count: number;
}

export interface AnalyticsSnapshot {
  days: DayBucket[];
  visits: number;
  sessions: number;
  devices: NamedCount[];
  trafficSources: NamedCount[];
  contactChannels: NamedCount[];
  whatsappContacts: number;
  emailContacts: number;
  callContacts: number;
  totalCalls: number;
  converted: number;
  webToContactRate: number;
}

function dayKey(iso: string): string {
  try {
    return format(parseISO(iso), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

export function buildDayRange(days: number, now = new Date()): DayBucket[] {
  const start = startOfDay(subDays(now, days - 1));
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    return {
      key: format(date, "yyyy-MM-dd"),
      label: format(date, "d MMM", { locale: es }),
      visits: 0,
      contacts: 0,
      whatsapp: 0,
      email: 0,
      calls: 0,
    };
  });
}

export function computeAnalytics(
  leads: Lead[],
  calls: CallLog[],
  events: MarketingEvent[],
  days = 14,
  now = new Date(),
): AnalyticsSnapshot {
  const buckets = buildDayRange(days, now);
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  const pageViews = events.filter((event) => event.type === "page_view");
  for (const event of pageViews) {
    const bucket = byKey.get(dayKey(event.timestamp));
    if (bucket) bucket.visits += 1;
  }
  for (const lead of leads) {
    const bucket = byKey.get(dayKey(lead.createdAt));
    if (!bucket) continue;
    bucket.contacts += 1;
    const channel = normalizeContactChannel(lead.source);
    if (channel === "whatsapp") bucket.whatsapp += 1;
    if (channel === "email") bucket.email += 1;
  }
  for (const call of calls) {
    const bucket = byKey.get(dayKey(call.date));
    if (bucket) bucket.calls += 1;
  }

  const channelCounts = new Map<ContactChannel, number>();
  for (const lead of leads) {
    const channel = normalizeContactChannel(lead.source);
    channelCounts.set(channel, (channelCounts.get(channel) ?? 0) + 1);
  }

  const sourceCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const sessions = new Set<string>();
  for (const event of pageViews) {
    const source = event.source?.trim() || "Directo";
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
    const device = event.device || "desktop";
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);
    if (event.sessionId) sessions.add(event.sessionId);
  }

  const toNamed = (map: Map<string, number>, labels?: Record<string, string>): NamedCount[] =>
    [...map.entries()]
      .map(([key, count]) => ({ key, label: labels?.[key] ?? key, count }))
      .sort((a, b) => b.count - a.count);

  const whatsappContacts = channelCounts.get("whatsapp") ?? 0;
  const emailContacts = channelCounts.get("email") ?? 0;
  const callContacts = channelCounts.get("llamada") ?? 0;

  return {
    days: buckets,
    visits: pageViews.length,
    sessions: sessions.size || pageViews.length,
    devices: toNamed(deviceCounts, { mobile: "Móvil", desktop: "Escritorio", tablet: "Tablet" }),
    trafficSources: toNamed(sourceCounts).slice(0, 6),
    contactChannels: toNamed(channelCounts, CONTACT_CHANNEL_LABEL),
    whatsappContacts,
    emailContacts,
    callContacts,
    totalCalls: calls.length,
    converted: leads.filter((lead) => lead.status === "convertido").length,
    webToContactRate: percent(leads.length, pageViews.length),
  };
}
