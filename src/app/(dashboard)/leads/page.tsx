"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  UserPlus,
  FileText,
  Trash2,
  Inbox,
  Mail,
  Phone,
  Building2,
  Calendar,
} from "lucide-react";
import type { LeadWithForm, LeadStatus, LeadForm } from "@/types";
import {
  getUserLeads,
  updateLeadStatus,
  convertLeadToClient,
  deleteLead,
} from "./actions";
import { getUserForms } from "@/app/(dashboard)/lead-forms/actions";
import { toast } from "sonner";

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string }
> = {
  new: { label: "Nouveau", color: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacté", color: "bg-yellow-100 text-yellow-700" },
  qualified: { label: "Qualifié", color: "bg-purple-100 text-purple-700" },
  converted: { label: "Converti", color: "bg-green-100 text-green-700" },
  lost: { label: "Perdu", color: "bg-red-100 text-red-700" },
};

const STATUS_OPTIONS: { label: string; value: LeadStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Nouveau", value: "new" },
  { label: "Contacté", value: "contacted" },
  { label: "Qualifié", value: "qualified" },
  { label: "Converti", value: "converted" },
  { label: "Perdu", value: "lost" },
];

function getLeadScore(lead: LeadWithForm): { label: string; color: string } {
  const budget = lead.budget_range || "";
  const amount = parseInt(budget.replace(/[^0-9]/g, "")) || 0;
  if (amount >= 5000 || lead.status === "converted") {
    return { label: "HOT", color: "bg-red-100 text-red-600" };
  }
  if (
    amount >= 1000 ||
    lead.status === "qualified" ||
    lead.status === "contacted"
  ) {
    return { label: "WARM", color: "bg-amber-100 text-amber-600" };
  }
  return { label: "COLD", color: "bg-slate-100 text-slate-500" };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `il y a ${diffD}j`;
  return date.toLocaleDateString("fr-FR");
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadWithForm[]>([]);
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [formFilter, setFormFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    try {
      const [leadsData, formsData] = await Promise.all([
        getUserLeads({
          status: statusFilter === "all" ? undefined : statusFilter,
          formId: formFilter === "all" ? undefined : formFilter,
        }),
        getUserForms(),
      ]);
      setLeads(leadsData);
      setForms(formsData);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, formFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(id: string, status: LeadStatus) {
    try {
      await updateLeadStatus(id, status);
      toast.success(`Statut changé : ${STATUS_CONFIG[status].label}`);
      fetchData();
    } catch {
      toast.error("Erreur");
    }
  }

  async function handleConvert(id: string) {
    try {
      const client = await convertLeadToClient(id);
      toast.success(`Client "${client.name}" créé`);
      fetchData();
    } catch {
      toast.error("Erreur lors de la conversion");
    }
  }

  async function handleCreateQuote(lead: LeadWithForm, templateId?: string) {
    // Navigate to quote creation with pre-filled client info (and template if available)
    let url = `/devis/nouveau?lead_name=${encodeURIComponent(lead.name)}&lead_email=${encodeURIComponent(lead.email)}`;
    if (templateId) {
      url += `&template=${templateId}`;
    }
    router.push(url);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce lead ?")) return;
    try {
      await deleteLead(id);
      toast.success("Lead supprimé");
      fetchData();
    } catch {
      toast.error("Erreur");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads reçus</h1>
        <p className="text-muted-foreground">
          Demandes reçues via vos formulaires de contact
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={statusFilter === opt.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            {forms.length > 0 && (
              <Select value={formFilter} onValueChange={setFormFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les formulaires" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les formulaires</SelectItem>
                  {forms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : leads.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Inbox className="mx-auto mb-4 h-16 w-16 opacity-30" />
              <p className="text-lg font-medium">Aucun lead</p>
              <p className="mt-1">
                Les demandes de vos formulaires apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => {
                const statusConf =
                  STATUS_CONFIG[lead.status as LeadStatus] || STATUS_CONFIG.new;

                return (
                  <div
                    key={lead.id}
                    className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-slate-50/50"
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {lead.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{lead.name}</span>
                        {(() => {
                          const score = getLeadScore(lead);
                          return (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${score.color}`}
                            >
                              {score.label}
                            </span>
                          );
                        })()}
                        <Badge
                          variant="secondary"
                          className={statusConf.color}
                        >
                          {statusConf.label}
                        </Badge>
                        {lead.lead_forms?.suggested_template_id && (
                          <Badge
                            variant="outline"
                            className="text-xs text-emerald-600 border-emerald-200 cursor-pointer hover:bg-emerald-50"
                            onClick={() =>
                              handleCreateQuote(
                                lead,
                                lead.lead_forms!.suggested_template_id!
                              )
                            }
                          >
                            Template suggéré
                          </Badge>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        )}
                        {lead.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {lead.company}
                          </span>
                        )}
                      </div>

                      {lead.message && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {lead.message}
                        </p>
                      )}

                      {/* Custom field responses */}
                      {lead.responses &&
                        Object.keys(lead.responses).length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {Object.entries(lead.responses)
                              .slice(0, 4)
                              .map(([key, val]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs text-muted-foreground"
                                  title={`${key}: ${val}`}
                                >
                                  {String(val).slice(0, 30)}
                                  {String(val).length > 30 ? "…" : ""}
                                </span>
                              ))}
                            {Object.keys(lead.responses).length > 4 && (
                              <span className="text-xs text-muted-foreground">
                                +{Object.keys(lead.responses).length - 4}
                              </span>
                            )}
                          </div>
                        )}

                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {timeAgo(lead.created_at)}
                        </span>
                        {lead.lead_forms && (
                          <span>via {lead.lead_forms.name}</span>
                        )}
                        {lead.budget_range && (
                          <span>Budget : {lead.budget_range}</span>
                        )}
                        {lead.project_type && (
                          <span>Projet : {lead.project_type}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {lead.status !== "converted" && (
                          <DropdownMenuItem
                            onClick={() => handleConvert(lead.id)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Créer client
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            handleCreateQuote(
                              lead,
                              lead.lead_forms?.suggested_template_id || undefined
                            )
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Créer devis
                          {lead.lead_forms?.suggested_template_id && (
                            <span className="ml-1 text-xs text-emerald-600">
                              (template)
                            </span>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            Changer statut
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {(
                              Object.entries(STATUS_CONFIG) as [
                                LeadStatus,
                                { label: string },
                              ][]
                            ).map(([value, conf]) => (
                              <DropdownMenuItem
                                key={value}
                                onClick={() =>
                                  handleStatusChange(lead.id, value)
                                }
                                disabled={lead.status === value}
                              >
                                {conf.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
