import { describe, expect, it } from "vitest";
import { computeAnalytics } from "./analytics";
import { normalizeContactChannel } from "./channels";
import type { CallLog, Lead, MarketingEvent } from "./types";

function lead(partial: Partial<Lead> & Pick<Lead, "id" | "status" | "source">): Lead {
  return {
    projectId: "p1",
    name: "Test",
    email: `${partial.id}@mail.com`,
    phone: "600",
    company: "",
    notes: "",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    ...partial,
  };
}

describe("normalizeContactChannel", () => {
  it("reconoce WhatsApp, email y llamada", () => {
    expect(normalizeContactChannel("WhatsApp")).toBe("whatsapp");
    expect(normalizeContactChannel("correo")).toBe("email");
    expect(normalizeContactChannel("Cold call")).toBe("llamada");
    expect(normalizeContactChannel("LinkedIn")).toBe("linkedin");
  });
});

describe("computeAnalytics", () => {
  it("separa visitas web de contactos WhatsApp y email", () => {
    const leads: Lead[] = [
      lead({ id: "1", status: "nuevo", source: "WhatsApp", createdAt: "2026-09-06T10:00:00.000Z" }),
      lead({ id: "2", status: "convertido", source: "Email", createdAt: "2026-09-06T11:00:00.000Z" }),
    ];
    const calls: CallLog[] = [
      {
        id: "c1",
        projectId: "p1",
        leadId: "2",
        date: "2026-09-06T12:00:00.000Z",
        durationMinutes: 5,
        outcome: "hablado",
        notes: "",
      },
    ];
    const events: MarketingEvent[] = [
      {
        id: "e1",
        projectId: "p1",
        type: "page_view",
        timestamp: "2026-09-06T09:00:00.000Z",
        detail: "",
        source: "Meta",
        device: "mobile",
        sessionId: "s1",
      },
      {
        id: "e2",
        projectId: "p1",
        type: "page_view",
        timestamp: "2026-09-06T09:30:00.000Z",
        detail: "",
        source: "Directo",
        device: "desktop",
        sessionId: "s2",
      },
    ];
    const now = new Date("2026-09-07T12:00:00.000Z");
    const analytics = computeAnalytics(leads, calls, events, 7, now);
    expect(analytics.visits).toBe(2);
    expect(analytics.whatsappContacts).toBe(1);
    expect(analytics.emailContacts).toBe(1);
    expect(analytics.totalCalls).toBe(1);
    expect(analytics.days.find((day) => day.key === "2026-09-06")?.visits).toBe(2);
    expect(analytics.days.find((day) => day.key === "2026-09-06")?.whatsapp).toBe(1);
  });
});
