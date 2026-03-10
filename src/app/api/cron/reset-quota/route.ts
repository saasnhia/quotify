import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Monthly quota reset cron — runs 1st of each month at midnight.
 * Calls the existing reset_monthly_devis() function in Supabase
 * which resets devis_used=0 for profiles where devis_reset_at <= now().
 * Protected by CRON_SECRET.
 */

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Call the existing SQL function that resets quotas
  const { error } = await supabase.rpc("reset_monthly_devis");

  if (error) {
    console.error("[Reset Quota] Error:", error);

    // Fallback: manual reset if RPC fails
    const { error: fallbackError } = await supabase
      .from("profiles")
      .update({
        devis_used: 0,
        devis_reset_at: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ).toISOString(),
      })
      .lte("devis_reset_at", new Date().toISOString());

    if (fallbackError) {
      console.error("[Reset Quota] Fallback error:", fallbackError);
      return NextResponse.json(
        { error: "Reset failed" },
        { status: 500 }
      );
    }
  }

  console.log("[Reset Quota] Monthly quota reset completed");
  return NextResponse.json({ success: true });
}
