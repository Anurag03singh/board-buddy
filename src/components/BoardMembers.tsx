import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, X, Users, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BoardMembersProps {
  boardId: string;
  isOwner: boolean;
  ownerId?: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  profile?: {
    display_name: string | null;
    email: string;
  };
}

export default function BoardMembers({ boardId, isOwner, ownerId }: BoardMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [canManageMembers, setCanManageMembers] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if current user can manage members
  useEffect(() => {
    const checkPermissions = async () => {
      if (isOwner) {
        setCanManageMembers(true);
        return;
      }

      // Check if user is an admin
      const { data } = await supabase
        .from("board_members")
        .select("role")
        .eq("board_id", boardId)
        .eq("user_id", user?.id)
        .single();

      setCanManageMembers(data?.role === "admin");
    };

    checkPermissions();
  }, [boardId, isOwner, user]);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("board_members")
      .select("id, user_id, role")
      .eq("board_id", boardId);

    if (data) {
      // Fetch profiles for members
      const userIds = data.map((m) => m.user_id);
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, email")
          .in("user_id", userIds);

        const membersWithProfiles = data.map((m) => ({
          ...m,
          profile: profiles?.find((p) => p.user_id === m.user_id),
        }));
        setMembers(membersWithProfiles);
      }
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [boardId]);

  const addMember = async () => {
    if (!email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!canManageMembers) {
      toast({
        title: "Permission Denied",
        description: "Only the board owner can add members",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", email.trim())
        .single();

      if (profileError || !profile) {
        toast({
          title: "User Not Found",
          description: "No user exists with that email address",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Add as board member with 'member' role
      const { error } = await supabase.from("board_members").insert({
        board_id: boardId,
        user_id: profile.user_id,
        role: "member", // Default role
      });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast({
            title: "Already a Member",
            description: "This user is already a board member",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: `Added ${email} as a member`,
        });
        setEmail("");
        setDialogOpen(false);
        fetchMembers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string, userEmail: string) => {
    if (!canManageMembers) {
      toast({
        title: "Permission Denied",
        description: "Only the board owner can remove members",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("board_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Member Removed",
        description: `${userEmail} removed from board`,
      });
      fetchMembers();
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    if (!isOwner) {
      toast({
        title: "Permission Denied",
        description: "Only the board owner can change roles",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("board_members")
      .update({ role: newRole })
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Role Updated",
        description: `Member role changed to ${newRole}`,
      });
      fetchMembers();
    }
  };

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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-xs uppercase tracking-wider border-zinc-300 hover:bg-zinc-900 hover:text-white"
        >
          <Users className="h-4 w-4 mr-2" />
          MEMBERS ({members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-zinc-300 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Inter_Tight'] text-2xl tracking-tight">
            BOARD MEMBERS
          </DialogTitle>
          <p className="text-sm text-zinc-500 font-mono">
            // Manage board access
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Add Member Section - Only for owner/admin */}
          {canManageMembers && (
            <div className="space-y-3 pb-4 border-b border-zinc-200">
              <Label className="font-mono text-xs uppercase tracking-wider text-zinc-600">
                Add New Member
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="h-10 bg-white/50 border-zinc-300 focus:border-zinc-900 font-mono text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addMember()}
                />
                <Button
                  onClick={addMember}
                  disabled={loading}
                  className="bg-zinc-900 text-white hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                // User must have an account
              </p>
            </div>
          )}

          {/* Permission Notice for Regular Members */}
          {!canManageMembers && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded mb-4">
              <p className="text-xs text-amber-800 font-mono">
                <Shield className="h-3 w-3 inline mr-1" />
                Only the board owner can add or remove members
              </p>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-zinc-600">
              Current Members
            </Label>
            {members.length === 0 ? (
              <p className="text-sm text-zinc-500 font-mono py-4 text-center">
                // No members yet
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-white/50 border border-zinc-200 rounded"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-zinc-200">
                          {getInitials(
                            member.profile?.display_name || null,
                            member.profile?.email || ""
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {member.profile?.display_name ||
                            member.profile?.email}
                        </p>
                        {isOwner ? (
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              updateMemberRole(member.id, value)
                            }
                          >
                            <SelectTrigger className="h-6 w-24 text-xs font-mono">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">member</SelectItem>
                              <SelectItem value="admin">admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                            {member.role === "admin" && (
                              <Shield className="h-3 w-3" />
                            )}
                            {member.role}
                          </p>
                        )}
                      </div>
                    </div>
                    {canManageMembers && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeMember(
                            member.id,
                            member.profile?.email || ""
                          )
                        }
                        className="h-8 w-8 text-zinc-400 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
