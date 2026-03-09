"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard, KanbanItem } from "./kanban-card";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/quote";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddProspectModal } from "./add-prospect-modal";

interface Column {
  id: string;
  title: string;
  color: string;
}

const COLUMNS: Column[] = [
  { id: "prospect", title: "Prospects", color: "bg-slate-500" },
  { id: "envoyé", title: "Envoyés", color: "bg-blue-500" },
  { id: "signé", title: "Signés", color: "bg-amber-500" },
  { id: "payé", title: "Payés", color: "bg-emerald-500" },
];

function KanbanColumn({
  column,
  items,
  onAddProspect,
}: {
  column: Column;
  items: KanbanItem[];
  onAddProspect?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
          <h3 className="text-sm font-semibold">{column.title}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {items.length}
          </span>
        </div>
        {column.id === "prospect" && onAddProspect && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onAddProspect}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="mb-3 text-xs font-medium text-muted-foreground">
        {formatCurrency(total)}
      </p>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 rounded-lg border-2 border-dashed p-2 transition-colors ${
          isOver
            ? "border-primary/40 bg-primary/5"
            : "border-transparent bg-slate-50/50"
        }`}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Aucun élément
          </p>
        )}
      </div>
    </div>
  );
}

interface PipelineData {
  quotes: Array<{
    id: string;
    title: string;
    number: number;
    total_ttc: number;
    currency: string;
    status: string;
    created_at: string;
    viewed_at: string | null;
    view_count: number;
    client_id: string | null;
    clients: { name: string; email: string | null }[] | null;
  }>;
  prospects: Array<{
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    notes: string | null;
    estimated_amount: number;
    source: string;
    created_at: string;
  }>;
}

export function KanbanBoard() {
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProspect, setShowAddProspect] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/pipeline");
      if (!res.ok) throw new Error("Erreur chargement pipeline");
      const data: { quotes: PipelineData["quotes"]; prospects: PipelineData["prospects"] } = await res.json();

      const kanbanItems: KanbanItem[] = [
        ...(data.quotes || []).map((q) => {
          const client = Array.isArray(q.clients) ? q.clients[0] : q.clients;
          return {
            id: q.id,
            type: "quote" as const,
            title: q.title,
            clientName: client?.name || "Client inconnu",
            clientEmail: client?.email || null,
            amount: q.total_ttc,
            currency: q.currency || "EUR",
            status: q.status,
            createdAt: q.created_at,
            viewedAt: q.viewed_at,
            viewCount: q.view_count,
            quoteNumber: q.number,
          };
        }),
        ...(data.prospects || []).map((p) => ({
          id: p.id,
          type: "prospect" as const,
          title: p.notes || "Nouveau prospect",
          clientName: p.name,
          clientEmail: p.email,
          amount: p.estimated_amount,
          currency: "EUR",
          status: "prospect",
          createdAt: p.created_at,
          viewedAt: null,
          viewCount: 0,
          source: p.source || "manual",
        })),
      ];

      setItems(kanbanItems);
    } catch {
      toast.error("Impossible de charger le pipeline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleDragStart(event: DragStartEvent) {
    const item = items.find((i) => i.id === event.active.id);
    setActiveItem(item || null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    const targetColumn = COLUMNS.find((c) => c.id === overId);
    const newStatus = targetColumn
      ? targetColumn.id
      : items.find((i) => i.id === overId)?.status;

    if (!newStatus) return;

    const draggedItem = items.find((i) => i.id === activeId);
    if (!draggedItem || draggedItem.status === newStatus) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === activeId ? { ...i, status: newStatus } : i
      )
    );

    try {
      const res = await fetch(`/api/pipeline/${activeId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: draggedItem.type, newStatus }),
      });

      if (!res.ok) {
        throw new Error("Erreur déplacement");
      }

      const result = await res.json();

      // If prospect was converted to quote, refresh data
      if (draggedItem.type === "prospect" && result.quoteId) {
        toast.success("Prospect converti en devis");
        fetchData();
      } else {
        toast.success("Statut mis à jour");
      }
    } catch {
      // Revert optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.id === activeId ? { ...i, status: draggedItem.status } : i
        )
      );
      toast.error("Erreur lors du déplacement");
    }
  }

  function handleProspectAdded() {
    setShowAddProspect(false);
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-72 shrink-0">
            <div className="mb-3 flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="space-y-2">
              {[1, 2].map((n) => (
                <Card key={n}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              items={items.filter((i) => i.status === col.id)}
              onAddProspect={
                col.id === "prospect"
                  ? () => setShowAddProspect(true)
                  : undefined
              }
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? <KanbanCard item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>

      <AddProspectModal
        open={showAddProspect}
        onClose={() => setShowAddProspect(false)}
        onSuccess={handleProspectAdded}
      />
    </>
  );
}
