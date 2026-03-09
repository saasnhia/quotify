"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/quote";
import { RelanceModal } from "@/components/quotes/relance-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface KanbanItem {
  id: string;
  type: "quote" | "prospect";
  title: string;
  clientName: string;
  clientEmail: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  viewedAt: string | null;
  viewCount: number;
  quoteNumber?: number;
  source?: string;
}

interface KanbanCardProps {
  item: KanbanItem;
}

export function KanbanCard({ item }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { type: item.type } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`cursor-grab active:cursor-grabbing ${isDragging ? "shadow-lg ring-2 ring-primary/20" : ""}`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <button
              className="mt-1 shrink-0 text-slate-300 hover:text-slate-500"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              {/* Client name + ref */}
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  {item.clientName}
                </p>
                {item.quoteNumber && (
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    DEV-{String(item.quoteNumber).padStart(4, "0")}
                  </span>
                )}
              </div>

              {/* Title */}
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.title}
              </p>

              {/* Amount */}
              <p className="mt-1.5 text-sm font-bold">
                {formatCurrency(item.amount, item.currency)}
              </p>

              {/* Meta row */}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(item.createdAt)}
                </span>

                {item.type === "quote" && item.status === "envoyé" && (
                  item.viewedAt ? (
                    <Badge variant="secondary" className="h-5 gap-1 bg-emerald-50 px-1.5 text-[10px] text-emerald-600">
                      <Eye className="h-2.5 w-2.5" />
                      Vu
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="h-5 gap-1 bg-slate-50 px-1.5 text-[10px] text-slate-400">
                      <EyeOff className="h-2.5 w-2.5" />
                      Non lu
                    </Badge>
                  )
                )}

                {item.type === "prospect" && (
                  <>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-slate-100 text-slate-500">
                      Prospect
                    </Badge>
                    {item.source === "form" && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-violet-50 text-violet-600">
                        Via formulaire
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              {item.type === "quote" && (
                <div className="mt-2 flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                    <Link href={`/devis/nouveau?edit=${item.id}`}>
                      Voir
                    </Link>
                  </Button>
                  {item.status === "envoyé" && item.clientName && (
                    <RelanceModal
                      quoteId={item.id}
                      clientName={item.clientName}
                      variant="button"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
