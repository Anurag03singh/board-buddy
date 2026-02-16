import { supabase } from "@/integrations/supabase/client";

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  return data;
}

export async function logActivity(
  boardId: string,
  action: string,
  entityType: string,
  entityId?: string,
  entityTitle?: string,
  metadata?: Record<string, unknown>
) {
  const user = await getCurrentUser();
  if (!user) return;
  await supabase.from("activity_log").insert({
    board_id: boardId,
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle,
    metadata: metadata as any,
  });
}
