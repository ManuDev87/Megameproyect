import type { CallLog, Lead, LeadStatus, MarketingEvent } from "./types";
import { LEAD_STATUSES } from "./types";
import { percent } from "./format";

export interface FunnelStep {
  status: LeadStatus;
  count: number;
  percent: number;
}

export interface LaunchMetrics {
  totalLeads: number;
  converted: number;
  lost: number;
  conversionRate: number;
  contactRate: number;
  totalCalls: number;
  answeredCalls: number;
  answerRate: number;
  callsPerLead: number;
  funnel: FunnelStep[];
}

export interface TrafficStep {
  key: string;
  label: string;
  count: number;
}

export interface ResultMetrics extends LaunchMetrics {
  visits: number;
  pending: number;
  rejected: number;
  rejectRate: number;
  trafficConversionRate: number;
  notInterestedCalls: number;
  trafficFunnel: TrafficStep[];
}

const CONTACTED_STATUSES: LeadStatus[] = [
  "contactado",
  "interesado",
  "negociacion",
  "convertido",
  "perdido",
];

const ANSWERED_OUTCOMES = new Set([
  "hablado",
  "reagendar",
  "interesado",
  "no_interesado",
  "convertido",
]);

export function computeLaunchMetrics(leads: Lead[], calls: CallLog[]): LaunchMetrics {
  const totalLeads = leads.length;
  const converted = leads.filter((lead) => lead.status === "convertido").length;
  const lost = leads.filter((lead) => lead.status === "perdido").length;
  const contacted = leads.filter((lead) => CONTACTED_STATUSES.includes(lead.status)).length;
  const answeredCalls = calls.filter((call) => ANSWERED_OUTCOMES.has(call.outcome)).length;

  return {
    totalLeads,
    converted,
    lost,
    conversionRate: percent(converted, totalLeads),
    contactRate: percent(contacted, totalLeads),
    totalCalls: calls.length,
    answeredCalls,
    answerRate: percent(answeredCalls, calls.length),
    callsPerLead: totalLeads ? Math.round((calls.length / totalLeads) * 10) / 10 : 0,
    funnel: LEAD_STATUSES.map((status) => {
      const count = leads.filter((lead) => lead.status === status).length;
      return { status, count, percent: percent(count, totalLeads) };
    }),
  };
}

export function computeResultMetrics(
  leads: Lead[],
  calls: CallLog[],
  events: MarketingEvent[],
): ResultMetrics {
  const launch = computeLaunchMetrics(leads, calls);
  const visits = events.filter((event) => event.type === "page_view").length;
  const pending = leads.filter((lead) => lead.status === "nuevo").length;
  const rejected = launch.lost;
  const contacted = leads.filter((lead) => CONTACTED_STATUSES.includes(lead.status)).length;

  return {
    ...launch,
    visits,
    pending,
    rejected,
    rejectRate: percent(rejected, launch.totalLeads),
    trafficConversionRate: percent(launch.totalLeads, visits),
    notInterestedCalls: calls.filter((call) => call.outcome === "no_interesado").length,
    trafficFunnel: [
      { key: "visits", label: "Visitas", count: visits },
      { key: "leads", label: "Contactos", count: launch.totalLeads },
      { key: "contacted", label: "Trabajados", count: contacted },
      { key: "converted", label: "Convertidos", count: launch.converted },
      { key: "rejected", label: "Rechazados", count: rejected },
    ],
  };
}
