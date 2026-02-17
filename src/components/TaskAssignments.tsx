import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, UserPlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface TaskAssignmentsProps {
  taskId: string;
  boardId: string;
}

interface Profile {
  user_id: string;
  display_name: string | null;
  email: string;
}

interface Assignment {
  id: string;
  user_id: string;
  profile?: Profile;
}

export default function TaskAssignments({ taskId, boardId }: TaskAssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("task_assignments")
      .select("id, user_id")
      .eq("task_id", taskId);

    if (data) {
      // Fetch profiles for assigned users
      const userIds = data.map((a) => a.user_id);
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, email")
          .in("user_id", userIds);

        const assignmentsWithProfiles = data.map((a) => ({
          ...a,
          profile: profiles?.find((p) => p.user_id === a.user_id),
        }));
        setAssignments(assignmentsWithProfiles);
      } else {
        setAssignments([]);
      }
    }
  };

  const fetchAvailableUsers = async () => {
    // Get board members and owner
    const [boardRes, membersRes] = await Promise.all([
      supabase.from("boards").select("owner_id").eq("id", boardId).single(),
      supabase.from("board_members").select("user_id").eq("board_id", boardId),
    ]);

    const userIds = new Set<string>();
    if (boardRes.data?.owner_id) userIds.add(boardRes.data.owner_id);
    membersRes.data?.forEach((m) => userIds.add(m.user_id));

    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .in("user_id", Array.from(userIds));

      setAvailableUsers(profiles || []);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchAvailableUsers();
  }, [taskId, boardId]);

  const assignUser = async (userId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("task_assignments")
      .insert({ task_id: taskId, user_id: userId });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchAssignments();
    }
    setLoading(false);
  };

  const unassignUser = async (assignmentId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("task_assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchAssignments();
    }
    setLoading(false);
  };

  const assignedUserIds = new Set(assignments.map((a) => a.user_id));
  const unassignedUsers = availableUsers.filter(
    (u) => !assignedUserIds.has(u.user_id)
  );

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="group relative flex items-center gap-1 rounded-full bg-muted pl-1 pr-2 py-1"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getInitials(
                  assignment.profile?.display_name || null,
                  assignment.profile?.email || ""
                )}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">
              {assignment.profile?.display_name || assignment.profile?.email}
            </span>
            <button
              onClick={() => unassignUser(assignment.id)}
              disabled={loading}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        ))}

        {unassignedUsers.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <UserPlus className="h-3 w-3 mr-1" />
                Assign
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                {unassignedUsers.map((user) => (
                  <button
                    key={user.user_id}
                    onClick={() => assignUser(user.user_id)}
                    disabled={loading}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.display_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.display_name || user.email}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
