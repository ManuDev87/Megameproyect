import type { CallLog, Lead, LeadStatus } from "./types";
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
