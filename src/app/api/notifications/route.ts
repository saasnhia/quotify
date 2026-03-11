import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifications: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json() as {
    type: NotificationType;
    title: string;
    message?: string;
    link?: string;
  };

  const { type, title, message, link } = body;

  if (!type || !title) {
    return NextResponse.json({ error: "type et title requis" }, { status: 400 });
  }

  const validTypes: NotificationType[] = ['lead', 'signature', 'payment', 'reminder', 'system'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: user.id,
    type,
    title,
    message: message ?? null,
    link: link ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
