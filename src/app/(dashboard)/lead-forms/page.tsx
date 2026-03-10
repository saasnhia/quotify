"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Code,
  Link2,
  Check,
  Copy,
  FileInput,
} from "lucide-react";
import type { LeadForm, LeadFormFields } from "@/types";
import { FormConfigModal } from "@/components/lead-forms/form-config-modal";
import { EmbedModal } from "@/components/lead-forms/embed-modal";
import {
  getUserForms,
  createLeadForm,
  updateLeadForm,
  deleteLeadForm,
  duplicateSystemForm,
} from "./actions";
import { toast } from "sonner";

export default function LeadFormsPage() {
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<LeadForm | null>(null);
  const [embedSlug, setEmbedSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("free");

  const fetchForms = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .single();
      if (profile?.subscription_status) {
        setPlan(profile.subscription_status);
      }
      const data = await getUserForms();
      setForms(data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // Lead forms are Business-only
  if (!loading && plan !== "business") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Formulaires de leads</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
              <FileInput className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Lead Forms — Plan Business</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Capturez des leads qualifies directement depuis votre site avec des formulaires
              personnalises et des champs sur-mesure.
            </p>
            <Button asChild>
              <Link href="/pricing">
                Passer au Business — 39€/mois
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleNew() {
    setEditingForm(null);
    setConfigModalOpen(true);
  }

  function handleEdit(form: LeadForm) {
    setEditingForm(form);
    setConfigModalOpen(true);
  }

  async function handleSave(
    data: {
      name: string;
      title: string;
      subtitle: string;
      button_text: string;
      accent_color: string;
      fields: LeadFormFields;
      auto_pipeline_stage: string;
      notification_email: string | null;
      redirect_url: string | null;
    }
  ) {
    if (editingForm) {
      await updateLeadForm(editingForm.id, data);
      toast.success("Formulaire modifié");
    } else {
      await createLeadForm(data);
      toast.success("Formulaire créé");
    }
    fetchForms();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce formulaire ?")) return;
    try {
      await deleteLeadForm(id);
      toast.success("Formulaire supprimé");
      fetchForms();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  async function handleToggleActive(form: LeadForm) {
    try {
      await updateLeadForm(form.id, { is_active: !form.is_active });
      toast.success(
        form.is_active ? "Formulaire désactivé" : "Formulaire activé"
      );
      fetchForms();
    } catch {
      toast.error("Erreur");
    }
  }

  async function handleDuplicateSystem(formId: string) {
    try {
      await duplicateSystemForm(formId);
      toast.success("Formulaire copié dans vos formulaires");
      fetchForms();
    } catch {
      toast.error("Erreur lors de la copie");
    }
  }

  function handleCopyUrl(slug: string) {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Formulaires de contact</h1>
          <p className="text-muted-foreground">
            Recevez des demandes directement dans votre pipeline
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un formulaire
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Chargement...
        </div>
      ) : forms.filter((f) => !f.is_system).length === 0 &&
        forms.filter((f) => f.is_system).length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <FileInput className="mx-auto mb-4 h-16 w-16 opacity-30" />
          <p className="text-lg font-medium">Aucun formulaire</p>
          <p className="mt-1">
            Créez un formulaire embeddable pour recevoir des leads
          </p>
          <Button onClick={handleNew} variant="outline" className="mt-4">
            Créer un formulaire
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* User's own forms */}
          {forms.filter((f) => !f.is_system).length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Mes formulaires</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {forms
                  .filter((f) => !f.is_system)
                  .map((form) => (
                    <Card key={form.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">
                                {form.name}
                              </h3>
                              <Badge
                                variant={
                                  form.is_active ? "default" : "secondary"
                                }
                                className="shrink-0 cursor-pointer"
                                onClick={() => handleToggleActive(form)}
                              >
                                {form.is_active ? "Actif" : "Inactif"}
                              </Badge>
                              {form.suggested_template_id && (
                                <Badge
                                  variant="outline"
                                  className="shrink-0 text-xs text-emerald-600 border-emerald-200"
                                >
                                  Template lié
                                </Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleCopyUrl(form.slug)}
                              >
                                <Link2 className="mr-2 h-4 w-4" />
                                Copier le lien
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEmbedSlug(form.slug)}
                              >
                                <Code className="mr-2 h-4 w-4" />
                                Code embed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(form)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(form.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Public URL */}
                        <div className="mt-3 flex items-center gap-2">
                          <code className="flex-1 truncate rounded bg-slate-100 px-2 py-1 text-xs text-muted-foreground">
                            /f/{form.slug}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-7 w-7"
                            onClick={() => handleCopyUrl(form.slug)}
                          >
                            {copiedSlug === form.slug ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setEmbedSlug(form.slug)}
                          >
                            <Code className="mr-2 h-4 w-4" />
                            Code embed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(form)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* System forms (Devizly) */}
          {forms.filter((f) => f.is_system).length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">
                Formulaires Devizly
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Formulaires prêts à l&apos;emploi avec champs personnalisés par
                secteur. Copiez-les pour les utiliser avec vos leads.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {forms
                  .filter((f) => f.is_system)
                  .map((form) => (
                    <Card
                      key={form.id}
                      className="border-dashed border-primary/30"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">
                                {form.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className="shrink-0 text-xs text-primary border-primary/30"
                              >
                                Devizly
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                              {form.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDuplicateSystem(form.id)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Utiliser
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              window.open(
                                `/f/${form.slug}`,
                                "_blank"
                              )
                            }
                          >
                            Aperçu
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <FormConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        form={editingForm}
        onSave={handleSave}
      />

      {embedSlug && (
        <EmbedModal
          open={!!embedSlug}
          onOpenChange={(open) => {
            if (!open) setEmbedSlug(null);
          }}
          slug={embedSlug}
        />
      )}
    </div>
  );
}
