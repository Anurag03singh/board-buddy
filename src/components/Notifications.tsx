import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
  task_id?: string;
  board_id?: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to new task assignments
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "task_assignments",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch task details
          const { data: task } = await supabase
            .from("tasks")
            .select("title, board_id")
            .eq("id", payload.new.task_id)
            .single();

          if (task) {
            const notification = {
              id: payload.new.id,
              message: `You've been assigned to: "${task.title}"`,
              created_at: new Date().toISOString(),
              read: false,
              task_id: payload.new.task_id,
              board_id: task.board_id,
            };

            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Show toast notification
            toast({
              title: "New Task Assignment",
              description: `You've been assigned to: "${task.title}"`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    // Get recent task assignments
    const { data: assignments } = await supabase
      .from("task_assignments")
      .select("id, task_id, assigned_at")
      .eq("user_id", user.id)
      .order("assigned_at", { ascending: false })
      .limit(10);

    if (assignments) {
      const taskIds = assignments.map((a) => a.task_id);
      if (taskIds.length > 0) {
        const { data: tasks } = await supabase
          .from("tasks")
          .select("id, title, board_id")
          .in("id", taskIds);

        const notifs: Notification[] = assignments.map((a) => {
          const task = tasks?.find((t) => t.id === a.task_id);
          return {
            id: a.id,
            message: `Assigned to: "${task?.title || "Unknown task"}"`,
            created_at: a.assigned_at,
            read: true, // Mark old ones as read
            task_id: a.task_id,
            board_id: task?.board_id,
          };
        });

        setNotifications(notifs);
      }
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  return (
    <Popover onOpenChange={(open) => open && markAsRead()}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-zinc-200"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-mono flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass border-zinc-300" align="end">
        <div className="p-4 border-b border-zinc-200">
          <h3 className="font-['Inter_Tight'] font-semibold tracking-tight">
            NOTIFICATIONS
          </h3>
          <p className="text-xs text-zinc-500 font-mono">
            // Task assignments
          </p>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500 font-mono">
                // No notifications yet
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 mb-2 rounded border transition-colors ${
                    notif.read
                      ? "bg-white border-zinc-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">{notif.message}</p>
                  <p className="text-xs text-zinc-500 font-mono">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
