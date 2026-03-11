"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Loader2,
  MoreHorizontal,
  Trash2,
  Shield,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import type { TeamMember, TeamRole } from "@/types";

const ROLE_LABELS: Record<TeamRole, string> = {
  admin: "Admin",
  editor: "Éditeur",
  viewer: "Lecteur",
};

const ROLE_BADGE_CLASS: Record<TeamRole, string> = {
  admin: "bg-violet-100 text-violet-700 border-violet-200",
  editor: "bg-blue-100 text-blue-700 border-blue-200",
  viewer: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Accepté",
  rejected: "Refusé",
};

export default function EquipePage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("viewer");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const teamLimit = PLANS["business"].teamLimit;
  const maxMembers = teamLimit - 1;

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();

      setSubscriptionStatus(profile?.subscription_status ?? "free");
    }
    init();
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const json = await res.json();
        setMembers(json.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    setInviteLoading(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Erreur lors de l'invitation");
        return;
      }
      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("viewer");
      await fetchMembers();
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleChangeRole(id: string, role: TeamRole) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Erreur lors de la mise à jour");
        return;
      }
      toast.success("Rôle mis à jour");
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, role } : m))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string, email: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Erreur lors de la suppression");
        return;
      }
      toast.success(`${email} retiré de l'équipe`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const isBusiness = subscriptionStatus === "business";
  const activeCount = members.filter((m) => m.status !== "rejected").length;

  if (!isBusiness) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Équipe</h1>
        <Card className="border-violet-200 bg-violet-50">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
              <Users className="h-7 w-7 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-violet-900">
                Fonctionnalité Business
              </h2>
              <p className="mt-1 text-sm text-violet-700">
                La gestion d&apos;équipe permet d&apos;inviter jusqu&apos;à{" "}
                {PLANS.business.teamLimit - 1} collaborateurs sur votre compte.
                Disponible avec le plan Business.
              </p>
            </div>
            <Button asChild className="mt-2">
              <a href="/pricing">
                <CreditCard className="mr-2 h-4 w-4" />
                Passer au plan Business
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Équipe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCount}/{maxMembers} membre{maxMembers > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          disabled={activeCount >= maxMembers}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Inviter un membre
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-violet-500" />
            Membres de l&apos;équipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Aucun membre pour l&apos;instant. Invitez vos premiers collaborateurs.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Invité le</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.member_email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={ROLE_BADGE_CLASS[member.role]}
                      >
                        {ROLE_LABELS[member.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_BADGE_CLASS[member.status] ?? ""}
                      >
                        {STATUS_LABELS[member.status] ?? member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.invited_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      {updatingId === member.id || deletingId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member.id, "admin")}
                              disabled={member.role === "admin"}
                            >
                              <Shield className="mr-2 h-3.5 w-3.5 text-violet-500" />
                              Définir Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member.id, "editor")}
                              disabled={member.role === "editor"}
                            >
                              <Shield className="mr-2 h-3.5 w-3.5 text-blue-500" />
                              Définir Éditeur
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member.id, "viewer")}
                              disabled={member.role === "viewer"}
                            >
                              <Shield className="mr-2 h-3.5 w-3.5 text-slate-400" />
                              Définir Lecteur
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDelete(member.id, member.member_email)
                              }
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Retirer de l&apos;équipe
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inviter un membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Adresse email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="collaborateur@exemple.fr"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Rôle</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as TeamRole)}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Lecteur — consulte uniquement
                    </span>
                  </SelectItem>
                  <SelectItem value="editor">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Éditeur — crée et modifie
                    </span>
                  </SelectItem>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-violet-500" />
                      Admin — accès complet
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteOpen(false)}
              disabled={inviteLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleInvite}
              disabled={inviteLoading || !inviteEmail}
            >
              {inviteLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Inviter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
