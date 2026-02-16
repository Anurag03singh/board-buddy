import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Plus, Pencil, Trash2, MoveRight } from "lucide-react";

const actionIcons: Record<string, any> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  moved: MoveRight,
};

interface ActivityPanelProps {
  boardId: string;
}

export default function ActivityPanel({ boardId }: ActivityPanelProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const fetchActivities = async () => {
    const { data } = await supabase
      .from("activity_log")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      setActivities(data);
      // fetch unique user profiles
      const userIds = [...new Set(data.map((a) => a.user_id))];
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name, email")
          .in("user_id", userIds);
        if (profs) {
          const map: Record<string, string> = {};
          profs.forEach((p) => (map[p.user_id] = p.display_name || p.email));
          setProfiles(map);
        }
      }
    }
  };

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel(`activity-${boardId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log", filter: `board_id=eq.${boardId}` },
        () => fetchActivities()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [boardId]);

  return (
    <div className="border-l bg-card/50 w-72 flex flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-heading text-sm font-semibold">Activity</h3>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {activities.map((a) => {
            const Icon = actionIcons[a.action] || Activity;
            return (
              <div key={a.id} className="flex gap-2 text-xs animate-fade-in">
                <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">{profiles[a.user_id] || "User"}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="text-muted-foreground">{a.entity_type}</span>{" "}
                  {a.entity_title && (
                    <span className="font-medium">"{a.entity_title}"</span>
                  )}
                  <p className="text-muted-foreground mt-0.5">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-8">
              No activity yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
