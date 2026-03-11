import { createServerClient } from "@supabase/ssr";
import type { NotificationType } from "@/types";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
}): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message ?? null,
    link: params.link ?? null,
  });
}
