"use client";

import { useMemo, useState } from "react";
import { Download, Phone, Plus, Upload } from "lucide-react";
import type { CallOutcome, Lead, LeadStatus } from "@/lib/types";
import { CALL_OUTCOME_LABEL, LEAD_STATUS_LABEL } from "@/lib/types";
import { useAppStore, useProjectData } from "@/lib/store";
import { computeLaunchMetrics } from "@/lib/metrics";
import { downloadTemplate, parseLeadWorkbook, parsedRowsToLeads, type ParsedLeadRow } from "@/lib/excel";
import { Badge, Button, Card, Field, Input, Modal, Select, Textarea } from "@/components/ui/primitives";
import { formatDateTime, percent } from "@/lib/format";

const STATUS_TONE: Record<LeadStatus, "neutral" | "teal" | "amber" | "red" | "violet" | "blue"> = {
  nuevo: "blue",
  contactado: "neutral",
  interesado: "teal",
  negociacion: "violet",
  convertido: "teal",
  perdido: "red",
};

export function LaunchPanel({ projectId }: { projectId: string }) {
  const { leads, calls } = useProjectData(projectId);
  const metrics = useMemo(() => computeLaunchMetrics(leads, calls), [leads, calls]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "todos">("todos");
  const [importOpen, setImportOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = leads.filter((lead) => {
    const haystack = `${lead.name} ${lead.email} ${lead.phone} ${lead.company}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesStatus = status === "todos" || lead.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Contactos" value={String(metrics.totalLeads)} hint="Importados + manuales" />
        <Stat label="Conversión" value={`${metrics.conversionRate}%`} hint={`${metrics.converted} cerrados`} />
        <Stat label="Contactados" value={`${metrics.contactRate}%`} hint="Al menos un avance de estado" />
        <Stat
          label="Llamadas"
          value={String(metrics.totalCalls)}
          hint={`${metrics.answerRate}% contestadas · ${metrics.callsPerLead}/lead`}
        />
      </div>

      <Card>
        <p className="mb-4 text-sm font-medium">Embudo de lanzamiento</p>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.funnel.map((step) => (
            <div key={step.status} className="rounded-xl bg-canvas p-3">
              <p className="text-xs text-ink-500">{LEAD_STATUS_LABEL[step.status]}</p>
              <p className="mt-1 font-display text-2xl">{step.count}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full bg-lime" style={{ width: `${percent(step.count, metrics.totalLeads)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar nombre, email o teléfono…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select value={status} onChange={(event) => setStatus(event.target.value as LeadStatus | "todos")}>
          <option value="todos">Todos los estados</option>
          {Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={downloadTemplate}>
            <Download size={16} /> Plantilla
          </Button>
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            <Upload size={16} /> Importar Excel
          </Button>
          <Button onClick={() => setLeadOpen(true)}>
            <Plus size={16} /> Contacto
          </Button>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-ink-100 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Fuente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Llamadas</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => {
              const leadCalls = calls.filter((call) => call.leadId === lead.id);
              return (
                <tr
                  key={lead.id}
                  className="cursor-pointer border-t border-ink-50 hover:bg-canvas"
                  onClick={() => setSelected(lead)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-ink-500">
                      {lead.email || "sin email"} {lead.company ? `· ${lead.company}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">{lead.phone || "—"}</td>
                  <td className="px-4 py-3">{lead.source || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[lead.status]}>{LEAD_STATUS_LABEL[lead.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">{leadCalls.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-500">No hay contactos con ese filtro.</p>
        ) : null}
      </div>

      <div className="grid gap-3 md:hidden">
        {filtered.map((lead) => (
          <button
            key={lead.id}
            onClick={() => setSelected(lead)}
            className="rounded-xl border border-ink-100 bg-white p-4 text-left shadow-card"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-sm text-ink-500">{lead.phone || lead.email}</p>
              </div>
              <Badge tone={STATUS_TONE[lead.status]}>{LEAD_STATUS_LABEL[lead.status]}</Badge>
            </div>
          </button>
        ))}
      </div>

      <ImportModal projectId={projectId} open={importOpen} onClose={() => setImportOpen(false)} />
      <LeadFormModal projectId={projectId} open={leadOpen} onClose={() => setLeadOpen(false)} />
      <LeadDrawer
        projectId={projectId}
        lead={selected ? leads.find((item) => item.id === selected.id) ?? null : null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
      <p className="mt-1 text-xs text-ink-400">{hint}</p>
    </Card>
  );
}

function ImportModal({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const importLeads = useAppStore((state) => state.importLeads);
  const [rows, setRows] = useState<ParsedLeadRow[]>([]);
  const [error, setError] = useState("");
  const [imported, setImported] = useState<number | null>(null);

  async function onFile(file?: File) {
    if (!file) return;
    setError("");
    setImported(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseLeadWorkbook(buffer);
      if (!parsed.length) {
        setError("No se encontraron filas con nombre, email o teléfono.");
        setRows([]);
        return;
      }
      setRows(parsed);
    } catch {
      setError("No se pudo leer el archivo. Usa .xlsx o .csv.");
      setRows([]);
    }
  }

  return (
    <Modal open={open} title="Importar contactos" onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-sm text-ink-600">
          Acepta Excel o CSV. Detecta columnas como Nombre, Email, Teléfono, Empresa, Fuente y Estado.
        </p>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(event) => onFile(event.target.files?.[0])}
          className="block w-full text-sm"
        />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {imported != null ? (
          <p className="text-sm font-medium text-lime-ink">Se importaron {imported} contactos nuevos (los duplicados se omiten).</p>
        ) : null}
        {rows.length ? (
          <div className="max-h-64 overflow-auto rounded-xl border border-ink-100">
            <table className="w-full text-xs">
              <thead className="bg-ink-50 text-left">
                <tr>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Teléfono</th>
                  <th className="px-3 py-2">Avisos</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 40).map((row, index) => (
                  <tr key={index} className="border-t border-ink-50">
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.email}</td>
                    <td className="px-3 py-2">{row.phone}</td>
                    <td className="px-3 py-2 text-amber-800">{row.warnings.join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!rows.length}
            onClick={() => {
              const count = importLeads(parsedRowsToLeads(rows, projectId));
              setImported(count);
              setRows([]);
            }}
          >
            Importar {rows.length || ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function LeadFormModal({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const addLead = useAppStore((state) => state.addLead);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("Manual");

  return (
    <Modal open={open} title="Nuevo contacto" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          addLead({
            projectId,
            name,
            email,
            phone,
            company,
            source,
            status: "nuevo",
            notes: "",
          });
          setName("");
          setEmail("");
          setPhone("");
          setCompany("");
          onClose();
        }}
      >
        <Field label="Nombre">
          <Input value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </Field>
        </div>
        <Field label="Empresa">
          <Input value={company} onChange={(event) => setCompany(event.target.value)} />
        </Field>
        <Field label="Fuente">
          <Input value={source} onChange={(event) => setSource(event.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
}

function LeadDrawer({
  projectId,
  lead,
  onClose,
}: {
  projectId: string;
  lead: Lead | null;
  onClose: () => void;
}) {
  const updateLead = useAppStore((state) => state.updateLead);
  const deleteLead = useAppStore((state) => state.deleteLead);
  const addCall = useAppStore((state) => state.addCall);
  const allCalls = useAppStore((state) => state.calls);
  const calls = useMemo(
    () =>
      allCalls
        .filter((call) => call.leadId === lead?.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [allCalls, lead?.id],
  );
  const [outcome, setOutcome] = useState<CallOutcome>("hablado");
  const [duration, setDuration] = useState("8");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");

  if (!lead) return null;

  return (
    <Modal open title={lead.name} onClose={onClose} wide>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <p className="text-sm text-ink-500">
            {lead.email || "sin email"} · {lead.phone || "sin teléfono"}
          </p>
          <Field label="Estado">
            <Select
              value={lead.status}
              onChange={(event) => updateLead(lead.id, { status: event.target.value as LeadStatus })}
            >
              {Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Notas">
            <Textarea
              rows={4}
              value={lead.notes}
              onChange={(event) => updateLead(lead.id, { notes: event.target.value })}
            />
          </Field>
          <Button
            variant="danger"
            onClick={() => {
              deleteLead(lead.id);
              onClose();
            }}
          >
            Eliminar contacto
          </Button>
        </div>

        <div className="space-y-3">
          <p className="font-medium">Registrar llamada</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Resultado">
              <Select value={outcome} onChange={(event) => setOutcome(event.target.value as CallOutcome)}>
                {Object.entries(CALL_OUTCOME_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Minutos">
              <Input type="number" min={0} value={duration} onChange={(event) => setDuration(event.target.value)} />
            </Field>
          </div>
          <Field label="Siguiente seguimiento">
            <Input type="datetime-local" value={followUp} onChange={(event) => setFollowUp(event.target.value)} />
          </Field>
          <Field label="Notas de la llamada">
            <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Field>
          <Button
            onClick={() => {
              addCall({
                projectId,
                leadId: lead.id,
                date: new Date().toISOString(),
                durationMinutes: Number(duration) || 0,
                outcome,
                notes,
                nextFollowUp: followUp ? new Date(followUp).toISOString() : undefined,
              });
              setNotes("");
            }}
          >
            <Phone size={16} /> Guardar llamada
          </Button>

          <div className="space-y-2 pt-2">
            {calls.map((call) => (
              <div key={call.id} className="rounded-xl bg-ink-50 p-3 text-sm">
                <p className="font-medium">
                  {CALL_OUTCOME_LABEL[call.outcome]} · {call.durationMinutes} min
                </p>
                <p className="text-xs text-ink-500">{formatDateTime(call.date)}</p>
                {call.notes ? <p className="mt-1 text-ink-700">{call.notes}</p> : null}
              </div>
            ))}
            {calls.length === 0 ? <p className="text-sm text-ink-400">Aún no hay llamadas.</p> : null}
          </div>
        </div>
      </div>
    </Modal>
  );
}
