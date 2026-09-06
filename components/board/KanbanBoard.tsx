"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { BoardCard, BoardColumn, Priority } from "@/lib/types";
import { PRIORITY_LABEL } from "@/lib/types";
import { useAppStore, useProjectData } from "@/lib/store";
import { Badge, Button, Field, Input, Modal, Select, Textarea } from "@/components/ui/primitives";
import { clsx, formatDate } from "@/lib/format";

const PRIORITY_TONE: Record<Priority, "neutral" | "teal" | "coral" | "red"> = {
  baja: "neutral",
  media: "coral",
  alta: "teal",
  urgente: "red",
};

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { columns, cards } = useProjectData(projectId);
  const moveCard = useAppStore((state) => state.moveCard);
  const addColumn = useAppStore((state) => state.addColumn);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newColumn, setNewColumn] = useState("");
  const [editing, setEditing] = useState<BoardCard | null>(null);
  const [creatingIn, setCreatingIn] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const activeCard = cards.find((card) => card.id === activeId) ?? null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeCardId = String(active.id);
    const overId = String(over.id);
    const overColumn = columns.find((column) => column.id === overId);
    const overCard = cards.find((card) => card.id === overId);
    const toColumnId = overColumn?.id ?? overCard?.columnId;
    if (!toColumnId) return;
    const siblings = cards
      .filter((card) => card.columnId === toColumnId && card.id !== activeCardId)
      .sort((a, b) => a.order - b.order);
    let toIndex = siblings.length;
    if (overCard) {
      toIndex = siblings.findIndex((card) => card.id === overCard.id);
      if (toIndex < 0) toIndex = siblings.length;
    }
    moveCard(activeCardId, toColumnId, toIndex);
  }

  return (
    <div className="space-y-4">
      <form
        className="flex max-w-md gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!newColumn.trim()) return;
          addColumn(projectId, newColumn.trim());
          setNewColumn("");
        }}
      >
        <Input
          placeholder="Nueva columna…"
          value={newColumn}
          onChange={(event) => setNewColumn(event.target.value)}
        />
        <Button type="submit">Añadir</Button>
      </form>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="kanban-scroll -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={cards.filter((card) => card.columnId === column.id).sort((a, b) => a.order - b.order)}
              onAdd={() => setCreatingIn(column.id)}
              onEdit={setEditing}
            />
          ))}
        </div>
        <DragOverlay>{activeCard ? <CardFace card={activeCard} dragging /> : null}</DragOverlay>
      </DndContext>

      <CardEditor
        key={`${creatingIn ?? "none"}-${editing?.id ?? "new"}`}
        projectId={projectId}
        columnId={creatingIn}
        card={editing}
        onClose={() => {
          setCreatingIn(null);
          setEditing(null);
        }}
      />
    </div>
  );
}

function KanbanColumn({
  column,
  cards,
  onAdd,
  onEdit,
}: {
  column: BoardColumn;
  cards: BoardCard[];
  onAdd: () => void;
  onEdit: (card: BoardCard) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const renameColumn = useAppStore((state) => state.renameColumn);
  const deleteColumn = useAppStore((state) => state.deleteColumn);
  const ids = useMemo(() => cards.map((card) => card.id), [cards]);

  return (
    <section
      ref={setNodeRef}
      className={clsx(
        "flex w-[280px] shrink-0 flex-col rounded-xl border bg-white p-3 shadow-card",
        isOver ? "border-lime bg-lime-soft/50" : "border-ink-100",
      )}
    >
      <header className="mb-3 flex items-center gap-2">
        <input
          className="w-full bg-transparent font-display text-sm font-semibold outline-none"
          defaultValue={column.title}
          onBlur={(event) => {
            const title = event.target.value.trim();
            if (title && title !== column.title) renameColumn(column.id, title);
          }}
        />
        <span className="text-xs text-ink-400">{cards.length}</span>
        <button
          onClick={() => deleteColumn(column.id)}
          className="text-ink-300 hover:text-red-700"
          aria-label="Eliminar columna"
        >
          <Trash2 size={14} />
        </button>
      </header>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[80px] flex-1 flex-col gap-2">
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} onClick={() => onEdit(card)} />
          ))}
        </div>
      </SortableContext>
      <button
        onClick={onAdd}
        className="mt-3 flex items-center gap-1 rounded-lg border border-dashed border-ink-200 px-2 py-2 text-sm text-ink-500 hover:bg-canvas"
      >
        <Plus size={14} /> Nueva tarjeta
      </button>
    </section>
  );
}

function SortableCard({ card, onClick }: { card: BoardCard; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardFace card={card} dragging={isDragging} onClick={onClick} />
    </div>
  );
}

function CardFace({
  card,
  dragging,
  onClick,
}: {
  card: BoardCard;
  dragging?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full rounded-lg border border-ink-100 bg-white p-3 text-left shadow-sm hover:border-ink-200",
        dragging && "opacity-40",
      )}
    >
      <p className="text-sm font-medium leading-5">{card.title}</p>
      {card.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-ink-500">{card.description}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge tone={PRIORITY_TONE[card.priority]}>{PRIORITY_LABEL[card.priority]}</Badge>
        {card.labels.map((label) => (
          <Badge key={label}>{label}</Badge>
        ))}
        {card.dueDate ? <span className="text-[11px] text-ink-400">{formatDate(card.dueDate)}</span> : null}
      </div>
    </button>
  );
}

function CardEditor({
  projectId,
  columnId,
  card,
  onClose,
}: {
  projectId: string;
  columnId: string | null;
  card: BoardCard | null;
  onClose: () => void;
}) {
  const addCard = useAppStore((state) => state.addCard);
  const updateCard = useAppStore((state) => state.updateCard);
  const deleteCard = useAppStore((state) => state.deleteCard);
  const open = Boolean(columnId || card);
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [labels, setLabels] = useState(card?.labels.join(", ") ?? "");
  const [priority, setPriority] = useState<Priority>(card?.priority ?? "media");
  const [dueDate, setDueDate] = useState(card?.dueDate?.slice(0, 10) ?? "");

  const key = `${columnId ?? ""}-${card?.id ?? ""}`;

  return (
    <Modal
      key={key}
      open={open}
      title={card ? "Editar tarjeta" : "Nueva tarjeta"}
      onClose={onClose}
    >
      <EditorBody
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        labels={labels}
        setLabels={setLabels}
        priority={priority}
        setPriority={setPriority}
        dueDate={dueDate}
        setDueDate={setDueDate}
        onSubmit={() => {
          const payload = {
            title: title.trim() || "Sin título",
            description,
            labels: labels
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            priority,
            dueDate: dueDate || undefined,
          };
          if (card) updateCard(card.id, payload);
          else if (columnId) addCard({ projectId, columnId, ...payload });
          onClose();
        }}
        onDelete={
          card
            ? () => {
                deleteCard(card.id);
                onClose();
              }
            : undefined
        }
      />
    </Modal>
  );
}

function EditorBody(props: {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  labels: string;
  setLabels: (value: string) => void;
  priority: Priority;
  setPriority: (value: Priority) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  onSubmit: () => void;
  onDelete?: () => void;
}) {
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit();
      }}
    >
      <Field label="Título">
        <Input value={props.title} onChange={(event) => props.setTitle(event.target.value)} required />
      </Field>
      <Field label="Descripción">
        <Textarea rows={4} value={props.description} onChange={(event) => props.setDescription(event.target.value)} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Prioridad">
          <Select
            value={props.priority}
            onChange={(event) => props.setPriority(event.target.value as Priority)}
          >
            {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha">
          <Input type="date" value={props.dueDate} onChange={(event) => props.setDueDate(event.target.value)} />
        </Field>
      </div>
      <Field label="Etiquetas (separadas por coma)">
        <Input value={props.labels} onChange={(event) => props.setLabels(event.target.value)} />
      </Field>
      <div className="flex justify-between pt-2">
        {props.onDelete ? (
          <Button type="button" variant="danger" onClick={props.onDelete}>
            Eliminar
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
