import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Layers, LogOut, Grid3x3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Notifications from "@/components/Notifications";
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
  "#14b8a6",
  "#6366f1",
  "#f43f5e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#10b981",
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
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 9;
  const { toast } = useToast();

  const fetchBoards = async () => {
    // Use RPC function to get boards (includes member access)
    const { data, error } = await supabase.rpc("get_accessible_boards");
    
    if (!error && data) {
      setBoards(data);
    } else if (error) {
      console.error("Error fetching boards:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const createBoard = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Board title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a board",
        variant: "destructive",
      });
      return;
    }

    console.log("Creating board:", { title: newTitle, owner_id: user.id });
    
    const { data, error } = await supabase.from("boards").insert({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      owner_id: user.id,
      color: newColor,
    }).select();
    
    if (error) {
      console.error("Board creation error:", error);
      toast({
        title: "Error Creating Board",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log("Board created successfully:", data);
      toast({
        title: "Success!",
        description: `Board "${newTitle}" created successfully`,
      });
      setNewTitle("");
      setNewDesc("");
      setDialogOpen(false);
      fetchBoards();
    }
  };

  const filtered = boards.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedBoards = filtered.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-zinc-100 noise-bg">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="glass flex items-center justify-between p-3">
          {/* Logo */}
          <div className="flex items-center pl-4 pr-6 hairline-r">
            <Layers className="h-5 w-5 text-zinc-900 mr-2" strokeWidth={1.5} />
            <span className="font-['Inter_Tight'] font-semibold tracking-tight text-lg">
              TASKFLOW
            </span>
          </div>

          {/* Center Info */}
          <div className="hidden md:flex items-center gap-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse-subtle" />
              ACTIVE
            </span>
            <span className="text-zinc-300">|</span>
            <span>{user?.email}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Notifications />
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="hover:bg-zinc-200"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-4">
            <Grid3x3 className="w-3 h-3" />
            // WORKSPACE OVERVIEW
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <h1 className="font-['Inter_Tight'] text-5xl font-semibold tracking-tight text-zinc-900 mb-3">
                YOUR BOARDS
              </h1>
              <p className="text-zinc-500 font-mono text-sm">
                {filtered.length} active project{filtered.length !== 1 ? "s" : ""} // Real-time collaboration enabled
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Search boards..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-[240px] h-10 bg-white/50 border-zinc-300 focus:border-zinc-900 font-mono text-sm"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-zinc-900 text-white hover:bg-zinc-800 h-10 px-6 font-mono text-xs uppercase tracking-wider">
                    <Plus className="mr-2 h-4 w-4" /> NEW BOARD
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-zinc-300">
                  <DialogHeader>
                    <DialogTitle className="font-['Inter_Tight'] text-2xl tracking-tight">
                      CREATE BOARD
                    </DialogTitle>
                    <p className="text-sm text-zinc-500 font-mono">
                      // Initialize new project workspace
                    </p>
                  </DialogHeader>
                  <div className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs uppercase tracking-wider text-zinc-600">
                        Board Title
                      </Label>
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Project Alpha"
                        className="h-11 bg-white/50 border-zinc-300 focus:border-zinc-900 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs uppercase tracking-wider text-zinc-600">
                        Description
                      </Label>
                      <Textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Brief project overview..."
                        rows={3}
                        className="bg-white/50 border-zinc-300 focus:border-zinc-900 font-mono text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs uppercase tracking-wider text-zinc-600">
                        Accent Color
                      </Label>
                      <div className="flex gap-2">
                        {BOARD_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setNewColor(c)}
                            className={`h-10 w-10 rounded border-2 transition-all ${
                              newColor === c
                                ? "scale-110 border-zinc-900 shadow-lg"
                                : "border-zinc-200 hover:border-zinc-400"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={createBoard}
                      className="w-full h-11 bg-zinc-900 text-white hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider mt-6"
                    >
                      INITIALIZE BOARD
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
            <div className="bg-white p-4">
              <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1">
                Total Boards
              </div>
              <div className="font-['Inter_Tight'] text-2xl font-semibold">
                {boards.length}
              </div>
            </div>
            <div className="bg-white p-4">
              <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1">
                Active Projects
              </div>
              <div className="font-['Inter_Tight'] text-2xl font-semibold text-emerald-600">
                {boards.length}
              </div>
            </div>
            <div className="bg-white p-4">
              <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1">
                Sync Status
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-subtle" />
                <span className="font-mono text-sm font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Boards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-px bg-zinc-200 border border-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-white animate-pulse relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-transparent" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center glass">
            <Layers
              className="mb-6 h-16 w-16 text-zinc-300"
              strokeWidth={1}
            />
            <h3 className="font-['Inter_Tight'] text-xl font-semibold mb-2">
              NO BOARDS FOUND
            </h3>
            <p className="text-sm text-zinc-500 font-mono max-w-md">
              {search
                ? "// No results match your search query"
                : "// Initialize your first board to begin"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-px bg-zinc-200 border border-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedBoards.map((board) => (
                <Link
                  key={board.id}
                  to={`/board/${board.id}`}
                  className="group relative bg-white p-6 transition-all hover:bg-zinc-50 animate-fade-in overflow-hidden"
                >
                  {/* Accent Bar */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 transition-all group-hover:h-2"
                    style={{ backgroundColor: board.color }}
                  />

                  {/* Hover Effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
                    style={{ backgroundColor: board.color }}
                  />

                  <div className="relative z-10 flex flex-col h-full min-h-[200px]">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <Layers
                          className="h-5 w-5 text-zinc-300 group-hover:text-zinc-900 transition-colors"
                          strokeWidth={1.5}
                        />
                        <span className="font-mono text-[10px] text-zinc-400">
                          {new Date(board.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>

                      <h3 className="font-['Inter_Tight'] text-xl font-semibold tracking-tight mb-2 group-hover:text-zinc-900 transition-colors">
                        {board.title}
                      </h3>

                      {board.description && (
                        <p className="text-sm text-zinc-500 line-clamp-2 font-mono">
                          {board.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                        ACTIVE
                      </span>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: board.color }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="font-mono text-xs uppercase tracking-wider border-zinc-300 hover:bg-zinc-900 hover:text-white"
                >
                  PREV
                </Button>
                <span className="font-mono text-sm text-zinc-500">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="font-mono text-xs uppercase tracking-wider border-zinc-300 hover:bg-zinc-900 hover:text-white"
                >
                  NEXT
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
