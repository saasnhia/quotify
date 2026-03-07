"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Filter, Users } from "lucide-react";

/* ── Types ── */

interface MonthlyRevenue {
  month: string;
  amount: number;
}

interface FunnelStep {
  name: string;
  count: number;
  color: string;
}

interface TopClient {
  name: string;
  total: number;
}

interface DashboardChartsProps {
  monthlyRevenue: MonthlyRevenue[];
  funnel: FunnelStep[];
  topClients: TopClient[];
}

/* ── Formatters ── */

function fmtEur(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k€`;
  return `${Math.round(n)}€`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(payload[0].value)}
      </p>
    </div>
  );
}

/* ── Component ── */

export function DashboardCharts({
  monthlyRevenue,
  funnel,
  topClients,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* CA Mensuel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            CA mensuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyRevenue.every((m) => m.amount === 0) ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              Aucun paiement recu pour le moment
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtEur}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366F1" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Conversion des devis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {funnel.every((s) => s.count === 0) ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              Envoyez des devis pour voir votre funnel
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnel} layout="vertical" barSize={28}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 13, fill: "#0F172A" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  formatter={(value) => [`${value} devis`, ""]}
                  cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnel.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Top clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topClients.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              Aucun client avec un devis signe
            </div>
          ) : (
            <div className="space-y-3">
              {topClients.map((client, i) => {
                const max = topClients[0].total;
                const pct = max > 0 ? (client.total / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{client.name}</span>
                      <span className="ml-2 text-muted-foreground">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(client.total)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
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
