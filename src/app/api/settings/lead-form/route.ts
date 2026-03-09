import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = [
  "lead_form_enabled",
  "lead_form_title",
  "lead_form_description",
  "lead_form_color",
] as const;

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
    .select("lead_form_enabled, lead_form_title, lead_form_description, lead_form_color")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();

  // Whitelist fields
  const updates: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
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

  return NextResponse.json({ success: true });
}
