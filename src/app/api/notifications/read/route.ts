import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json() as { ids?: string[]; all?: boolean };

  if (body.all === true) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (Array.isArray(body.ids) && body.ids.length > 0) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .in("id", body.ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json(
      { error: "Fournir ids[] ou all: true" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
