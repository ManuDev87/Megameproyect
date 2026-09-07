import * as XLSX from "xlsx";
import type { Lead, LeadStatus } from "./types";
import { LEAD_STATUSES } from "./types";
import { createId, nowIso } from "./id";

export interface ParsedLeadRow {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  notes: string;
  status: LeadStatus;
  warnings: string[];
}

const HEADER_ALIASES: Record<string, keyof Omit<ParsedLeadRow, "warnings" | "status">> = {
  nombre: "name",
  name: "name",
  contacto: "name",
  fullname: "name",
  "nombre completo": "name",
  email: "email",
  correo: "email",
  mail: "email",
  "e-mail": "email",
  telefono: "phone",
  teléfono: "phone",
  phone: "phone",
  movil: "phone",
  móvil: "phone",
  celular: "phone",
  whatsapp: "phone",
  empresa: "company",
  company: "company",
  organizacion: "company",
  organización: "company",
  fuente: "source",
  source: "source",
  origen: "source",
  canal: "source",
  notas: "notes",
  notes: "notes",
  comentarios: "notes",
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") return String(value);
  return String(value).trim();
}

function parseStatus(value: unknown): LeadStatus {
  const raw = normalizeHeader(value);
  const match = LEAD_STATUSES.find((status) => status === raw);
  if (match) return match;
  const map: Record<string, LeadStatus> = {
    nuevo: "nuevo",
    new: "nuevo",
    contactado: "contactado",
    contacted: "contactado",
    interesado: "interesado",
    interested: "interesado",
    negociacion: "negociacion",
    negotiation: "negociacion",
    convertido: "convertido",
    conversion: "convertido",
    ganado: "convertido",
    won: "convertido",
    perdido: "perdido",
    lost: "perdido",
  };
  return map[raw] ?? "nuevo";
}

export function parseLeadWorkbook(buffer: ArrayBuffer): ParsedLeadRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  return rows.map((row) => {
    const mapped: ParsedLeadRow = {
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "",
      notes: "",
      status: "nuevo",
      warnings: [],
    };

    for (const [key, value] of Object.entries(row)) {
      const header = normalizeHeader(key);
      const field = HEADER_ALIASES[header];
      if (field) {
        mapped[field] = cell(value);
      } else if (header === "estado" || header === "status") {
        mapped.status = parseStatus(value);
      }
    }

    if (!mapped.name && (mapped.email || mapped.phone)) {
      mapped.name = mapped.email || mapped.phone;
    }
    if (!mapped.name && !mapped.email && !mapped.phone) {
      mapped.warnings.push("Fila sin nombre, email ni teléfono");
    }
    if (mapped.email && !mapped.email.includes("@")) {
      mapped.warnings.push("Email con formato dudoso");
    }

    return mapped;
  }).filter((row) => row.name || row.email || row.phone);
}

export function parsedRowsToLeads(rows: ParsedLeadRow[], projectId: string): Lead[] {
  const stamp = nowIso();
  return rows.map((row) => ({
    id: createId("lead"),
    projectId,
    name: row.name || "Sin nombre",
    email: row.email,
    phone: row.phone,
    company: row.company,
    source: row.source || "Excel",
    status: row.status,
    notes: row.notes,
    createdAt: stamp,
    updatedAt: stamp,
  }));
}

export function buildLeadTemplate(): ArrayBuffer {
  const data = [
    {
      Nombre: "Ana Ruiz",
      Email: "ana@empresa.com",
      Telefono: "+34 600 111 222",
      Empresa: "Empresa Demo",
      Fuente: "WhatsApp",
      Estado: "nuevo",
      Notas: "Pidió demo del producto",
    },
  ];
  const sheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Leads");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export function downloadTemplate(): void {
  const buffer = buildLeadTemplate();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla-leads-lanzamiento.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}
