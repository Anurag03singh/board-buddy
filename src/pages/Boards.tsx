import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Kanban, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const BOARD_COLORS = [
  "#14b8a6", "#6366f1", "#f43f5e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#10b981",
];

export default function Boards() {
  const { user, signOut } = useAuth();
  const [boards, setBoards] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(BOARD_COLORS[0]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBoards = async () => {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBoards(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const createBoard = async () => {
    if (!newTitle.trim() || !user) return;
    const { error } = await supabase.from("boards").insert({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      owner_id: user.id,
      color: newColor,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewTitle("");
      setNewDesc("");
      setDialogOpen(false);
      fetchBoards();
    }
  };

  const filtered = boards.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Kanban className="h-5 w-5 text-primary" />
            <span className="font-heading text-lg font-bold tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Your Boards</h1>
            <p className="text-sm text-muted-foreground">
              Organize your projects with collaborative boards
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search boards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Board
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading">Create Board</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Brief description..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      {BOARD_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setNewColor(c)}
                          className={`h-8 w-8 rounded-md transition-transform ${
                            newColor === c ? "scale-110 ring-2 ring-ring ring-offset-2 ring-offset-background" : ""
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button onClick={createBoard} className="w-full">
                    Create Board
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Kanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-heading text-lg font-medium">No boards yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first board to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="group relative overflow-hidden rounded-lg border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 animate-fade-in"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ backgroundColor: board.color }}
                />
                <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                  {board.title}
                </h3>
                {board.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {board.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Created {new Date(board.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
