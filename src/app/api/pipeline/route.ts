import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const [{ data: quotes }, { data: prospects }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id, title, number, total_ttc, currency, status, created_at, updated_at, viewed_at, view_count, client_id, clients(name, email)")
      .eq("user_id", user.id)
      .in("status", ["envoyé", "signé", "accepté", "payé"])
      .order("updated_at", { ascending: false }),
    supabase
      .from("prospects")
      .select("*")
      .eq("user_id", user.id)
      .is("converted_quote_id", null)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    success: true,
    quotes: quotes || [],
    prospects: prospects || [],
  });
}
