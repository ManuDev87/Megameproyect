import { describe, expect, it } from "vitest";
import { computeLaunchMetrics, computeResultMetrics } from "./metrics";
import type { CallLog, Lead, MarketingEvent } from "./types";
import { parseLeadWorkbook } from "./excel";
import * as XLSX from "xlsx";

function lead(partial: Partial<Lead> & Pick<Lead, "id" | "status">): Lead {
  return {
    projectId: "p1",
    name: "Test",
    email: `${partial.id}@mail.com`,
    phone: "600",
    company: "",
    source: "",
    notes: "",
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

describe("computeLaunchMetrics", () => {
  it("calcula ratio de conversión y embudo", () => {
    const leads: Lead[] = [
      lead({ id: "1", status: "nuevo" }),
      lead({ id: "2", status: "contactado" }),
      lead({ id: "3", status: "convertido" }),
      lead({ id: "4", status: "perdido" }),
    ];
    const calls: CallLog[] = [
      {
        id: "c1",
        projectId: "p1",
        leadId: "2",
        date: "",
        durationMinutes: 5,
        outcome: "hablado",
        notes: "",
      },
      {
        id: "c2",
        projectId: "p1",
        leadId: "1",
        date: "",
        durationMinutes: 0,
        outcome: "no_contesta",
        notes: "",
      },
    ];

    const metrics = computeLaunchMetrics(leads, calls);
    expect(metrics.totalLeads).toBe(4);
    expect(metrics.converted).toBe(1);
    expect(metrics.conversionRate).toBe(25);
    expect(metrics.contactRate).toBe(75);
    expect(metrics.answerRate).toBe(50);
    expect(metrics.callsPerLead).toBe(0.5);
    expect(metrics.funnel.find((step) => step.status === "nuevo")?.count).toBe(1);
  });

  it("devuelve ceros si no hay leads", () => {
    const metrics = computeLaunchMetrics([], []);
    expect(metrics.conversionRate).toBe(0);
    expect(metrics.callsPerLead).toBe(0);
  });
});

describe("computeResultMetrics", () => {
  it("separa conversión de tráfico, comercial y rechazados", () => {
    const leads: Lead[] = [
      lead({ id: "1", status: "nuevo" }),
      lead({ id: "2", status: "contactado" }),
      lead({ id: "3", status: "convertido" }),
      lead({ id: "4", status: "perdido" }),
    ];
    const events: MarketingEvent[] = [
      { id: "e1", projectId: "p1", type: "page_view", timestamp: "", detail: "" },
      { id: "e2", projectId: "p1", type: "page_view", timestamp: "", detail: "" },
      { id: "e3", projectId: "p1", type: "page_view", timestamp: "", detail: "" },
      { id: "e4", projectId: "p1", type: "page_view", timestamp: "", detail: "" },
      { id: "e5", projectId: "p1", type: "conversion", timestamp: "", detail: "" },
    ];
    const metrics = computeResultMetrics(leads, [], events);
    expect(metrics.visits).toBe(4);
    expect(metrics.totalLeads).toBe(4);
    expect(metrics.trafficConversionRate).toBe(100);
    expect(metrics.conversionRate).toBe(25);
    expect(metrics.rejected).toBe(1);
    expect(metrics.rejectRate).toBe(25);
    expect(metrics.pending).toBe(1);
  });
});

describe("parseLeadWorkbook", () => {
  it("mapea cabeceras en español", () => {
    const sheet = XLSX.utils.json_to_sheet([
      {
        Nombre: "Ana",
        Correo: "ana@demo.com",
        Teléfono: "600111222",
        Empresa: "Demo",
        Fuente: "Web",
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Leads");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    const rows = parseLeadWorkbook(buffer);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Ana");
    expect(rows[0].email).toBe("ana@demo.com");
    expect(rows[0].phone).toBe("600111222");
    expect(rows[0].company).toBe("Demo");
  });
});
