import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  boardId: string,
  action: string,
  entityType: string,
  entityId?: string,
  entityTitle?: string,
  metadata?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activity_log").insert({
    board_id: boardId,
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle,
    metadata,
  });
}

export function reorderTasks<T extends { id: string; position: number }>(
  tasks: T[],
  sourceIndex: number,
  destinationIndex: number
): T[] {
  if (sourceIndex === destinationIndex) return tasks;
  if (tasks.length === 0) return tasks;

  const result = Array.from(tasks);
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);

  // Update positions
  return result.map((task, index) => ({
    ...task,
    position: index,
  }));
}
