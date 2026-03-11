"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GripVertical, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/quote";
import { RelanceModal } from "@/components/quotes/relance-modal";
import Link from "next/link";
import { toast } from "sonner";
import { EditProspectModal, ProspectData } from "./edit-prospect-modal";

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
  /** Raw fields used to prefill the edit modal (prospects only) */
  prospectData?: Omit<ProspectData, "id">;
}

// ── Lead scoring ─────────────────────────────────────────────

type LeadScore = "HOT" | "WARM" | "COLD";

function computeLeadScore(item: KanbanItem): LeadScore {
  if (item.amount >= 5000 || item.status === "signé" || item.status === "payé") {
    return "HOT";
  }
  if (item.amount >= 1000 || item.viewedAt !== null || item.status === "envoyé") {
    return "WARM";
  }
  return "COLD";
}

function LeadScoreBadge({ score }: { score: LeadScore }) {
  if (score === "HOT") {
    return (
      <Badge className="h-5 px-1.5 text-[10px] bg-red-100 text-red-600 border-red-200 hover:bg-red-100">
        🔥 HOT
      </Badge>
    );
  }
  if (score === "WARM") {
    return (
      <Badge className="h-5 px-1.5 text-[10px] bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-100">
        WARM
      </Badge>
    );
  }
  return (
    <Badge className="h-5 px-1.5 text-[10px] bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100">
      COLD
    </Badge>
  );
}

// ── Component ─────────────────────────────────────────────────

interface KanbanCardProps {
  item: KanbanItem;
  onRefresh?: () => void;
}

export function KanbanCard({ item, onRefresh }: KanbanCardProps) {
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

  const [showEdit, setShowEdit] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const leadScore = computeLeadScore(item);

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/prospects/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression");
      toast.success("Prospect supprimé");
      onRefresh?.();
    } catch {
      toast.error("Impossible de supprimer le prospect");
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  const editProspect: ProspectData = {
    id: item.id,
    name: item.clientName,
    email: item.clientEmail,
    company: item.prospectData?.company ?? null,
    notes: item.prospectData?.notes ?? null,
    estimated_amount: item.amount,
  };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card
          className={`cursor-grab active:cursor-grabbing ${
            isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
          }`}
        >
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

                  {/* Lead score badge */}
                  <LeadScoreBadge score={leadScore} />

                  {item.type === "quote" && item.status === "envoyé" && (
                    item.viewedAt ? (
                      <Badge
                        variant="secondary"
                        className="h-5 gap-1 bg-emerald-50 px-1.5 text-[10px] text-emerald-600"
                      >
                        <Eye className="h-2.5 w-2.5" />
                        Vu
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="h-5 gap-1 bg-slate-50 px-1.5 text-[10px] text-slate-400"
                      >
                        <EyeOff className="h-2.5 w-2.5" />
                        Non lu
                      </Badge>
                    )
                  )}

                  {item.type === "prospect" && (
                    <>
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[10px] bg-slate-100 text-slate-500"
                      >
                        Prospect
                      </Badge>
                      {item.source === "form" && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px] bg-violet-50 text-violet-600"
                        >
                          Via formulaire
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                {item.type === "quote" && (
                  <div className="mt-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      asChild
                    >
                      <Link href={`/devis/nouveau?edit=${item.id}`}>Voir</Link>
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

                {item.type === "prospect" && (
                  <div className="mt-2 flex items-center gap-1">
                    {/* Edit button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEdit(true);
                        setDeleteConfirm(false);
                      }}
                      title="Modifier le prospect"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    {/* Delete button / confirm */}
                    {deleteConfirm ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                          }}
                          disabled={deleting}
                        >
                          {deleting ? "..." : "Confirmer"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] text-slate-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(false);
                          }}
                        >
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(true);
                        }}
                        title="Supprimer le prospect"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit modal (only mounted when shown) */}
      {item.type === "prospect" && (
        <EditProspectModal
          open={showEdit}
          prospect={editProspect}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            onRefresh?.();
          }}
        />
      )}
    </>
  );
}
