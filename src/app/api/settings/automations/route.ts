import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = [
  "auto_invoice_on_sign",
  "auto_invoice_on_payment",
  "auto_send_invoice",
] as const;

/**
 * GET /api/settings/automations — Fetch current automation settings.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("auto_invoice_on_sign, auto_invoice_on_payment, auto_send_invoice")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    auto_invoice_on_sign: data?.auto_invoice_on_sign ?? true,
    auto_invoice_on_payment: data?.auto_invoice_on_payment ?? true,
    auto_send_invoice: data?.auto_send_invoice ?? true,
  });
}

/**
 * PATCH /api/settings/automations — Update automation settings.
 * Body: { auto_invoice_on_sign?: boolean, auto_invoice_on_payment?: boolean, auto_send_invoice?: boolean }
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();

  // Only allow known fields with boolean values
  const updates: Record<string, boolean> = {};
  for (const field of ALLOWED_FIELDS) {
    if (typeof body[field] === "boolean") {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, ...updates });
}
