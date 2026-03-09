import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";
import { BriefingActions } from "./briefing-actions";
import { RelanceModal } from "@/components/quotes/relance-modal";
import { formatCurrency, formatDate } from "@/lib/utils/quote";

interface BriefingRow {
  id: string;
  summary: string;
  actions: string[];
  stats: {
    pendingQuotes: number;
    pendingRevenue: string;
    caThisWeek: string;
    caLastWeek: string;
    caVariation: string;
    remindersToday: number;
    overdueQuotes: number;
  };
  created_at: string;
}

export default async function BriefingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: briefings } = await supabase
    .from("daily_briefings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(7);

  const latest = (briefings?.[0] as BriefingRow) || null;
  const history = (briefings?.slice(1) as BriefingRow[]) || [];

  const variationPositive = latest?.stats?.caVariation?.startsWith("+");

  // Fetch overdue quotes (envoyé > 2 days) for relance section
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const { data: overdueQuotes } = await supabase
    .from("quotes")
    .select("id, title, number, total_ttc, created_at, viewed_at, view_count, clients(name, email)")
    .eq("user_id", user.id)
    .eq("status", "envoyé")
    .lt("created_at", twoDaysAgo)
    .order("created_at", { ascending: true })
    .limit(10);

  const overdueRaw = (overdueQuotes || []) as unknown as {
    id: string;
    title: string;
    number: number;
    total_ttc: number;
    created_at: string;
    viewed_at: string | null;
    view_count: number;
    clients: { name: string; email: string | null }[] | null;
  }[];
  const overdue = overdueRaw.map((q) => ({
    ...q,
    clients: q.clients?.[0] || null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-violet-500" />
          <h1 className="text-2xl font-bold">Briefing IA</h1>
          <Badge variant="secondary" className="bg-violet-100 text-violet-700">
            Mistral AI
          </Badge>
        </div>
        <BriefingActions />
      </div>

      {!latest ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Brain className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p className="text-lg font-medium">Aucun briefing disponible</p>
            <p className="mt-1 text-sm">
              Votre premier briefing sera genere demain matin a 8h00, ou cliquez
              sur &quot;Generer maintenant&quot;.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card className="border-violet-200 bg-violet-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Resume du jour</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {new Date(latest.created_at).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[15px] leading-relaxed text-slate-700">
                {latest.summary}
              </p>
            </CardContent>
          </Card>

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                  {variationPositive ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    CA cette semaine
                  </p>
                  <p className="text-xl font-bold">
                    {latest.stats.caThisWeek}
                  </p>
                  <p
                    className={`text-xs ${variationPositive ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {latest.stats.caVariation} vs sem. derniere
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-xl font-bold">
                    {latest.stats.pendingQuotes}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {latest.stats.pendingRevenue}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    En retard (&gt;2j)
                  </p>
                  <p className="text-xl font-bold">
                    {latest.stats.overdueQuotes}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    sans reponse client
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Relances du jour
                  </p>
                  <p className="text-xl font-bold">
                    {latest.stats.remindersToday}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    envoyees automatiquement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowRight className="h-5 w-5 text-emerald-500" />
                Actions prioritaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {latest.actions.map((action, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Overdue quotes with relance */}
          {overdue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5 text-amber-500" />
                  Devis a relancer
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    {overdue.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {overdue.map((q) => {
                    const daysSince = Math.floor(
                      (Date.now() - new Date(q.created_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <li
                        key={q.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              DEV-{String(q.number).padStart(4, "0")}
                            </span>
                            <span className="truncate text-sm font-medium">
                              {q.title}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{q.clients?.name || "—"}</span>
                            <span>{formatCurrency(Number(q.total_ttc))}</span>
                            <span className="text-amber-600">
                              {daysSince}j sans reponse
                            </span>
                            {q.viewed_at ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600">
                                <Eye className="h-3 w-3" /> Vu ({q.view_count}x)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <EyeOff className="h-3 w-3" /> Non lu
                              </span>
                            )}
                          </div>
                        </div>
                        {q.clients?.name && (
                          <RelanceModal
                            quoteId={q.id}
                            clientName={q.clients.name}
                            variant="button"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Briefings precedents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {history.map((b) => (
                    <li
                      key={b.id}
                      className="rounded-lg border p-4 text-sm text-slate-600"
                    >
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        {new Date(b.created_at).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                      <p>{b.summary}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
