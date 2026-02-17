import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logActivity } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ArrowLeft,
  Search,
  MoreHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import TaskCard from "@/components/TaskCard";
import TaskDialog from "@/components/TaskDialog";
import ActivityPanel from "@/components/ActivityPanel";
import BoardMembers from "@/components/BoardMembers";
import Notifications from "@/components/Notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BoardView() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id: boardId } = useParams<{ id: string }>();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const [board, setBoard] = useState<any>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskAssignees, setTaskAssignees] = useState<Record<string, any[]>>({});
  const [search, setSearch] = useState("");
  const [showActivity, setShowActivity] = useState(true);
  const [newListTitle, setNewListTitle] = useState("");
  const [addingList, setAddingList] = useState(false);

  // Horizontal scroll ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Task dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedListId, setSelectedListId] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (!boardId) return;
    const [boardRes, listsRes, tasksRes] = await Promise.all([
      supabase.from("boards").select("*").eq("id", boardId).single(),
      supabase.from("lists").select("*").eq("board_id", boardId).order("position"),
      supabase.from("tasks").select("*").eq("board_id", boardId).order("position"),
    ]);
    if (boardRes.data) setBoard(boardRes.data);
    if (listsRes.data) setLists(listsRes.data);
    if (tasksRes.data) {
      setTasks(tasksRes.data);
      
      // Fetch assignees for all tasks
      const taskIds = tasksRes.data.map((t) => t.id);
      if (taskIds.length > 0) {
        const { data: assignments } = await supabase
          .from("task_assignments")
          .select("task_id, user_id")
          .in("task_id", taskIds);

        if (assignments && assignments.length > 0) {
          const userIds = [...new Set(assignments.map((a) => a.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name, email")
            .in("user_id", userIds);

          const assigneeMap: Record<string, any[]> = {};
          assignments.forEach((a) => {
            if (!assigneeMap[a.task_id]) assigneeMap[a.task_id] = [];
            const profile = profiles?.find((p) => p.user_id === a.user_id);
            if (profile) assigneeMap[a.task_id].push(profile);
          });
          setTaskAssignees(assigneeMap);
        } else {
          setTaskAssignees({});
        }
      }
    }
  }, [boardId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update scroll button visibility
  useEffect(() => {
    const updateScrollButtons = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      updateScrollButtons();
      container.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);

      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, [lists, tasks]);

  // Keyboard shortcuts for scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow keys for scrolling (when not in input)
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && e.shiftKey) {
        e.preventDefault();
        scroll("left");
      } else if (e.key === "ArrowRight" && e.shiftKey) {
        e.preventDefault();
        scroll("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!boardId) return;

    const channel = supabase
      .channel(`board-${boardId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `board_id=eq.${boardId}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "lists", filter: `board_id=eq.${boardId}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [boardId, fetchData]);

  const addList = async () => {
    if (!newListTitle.trim() || !boardId) return;
    await supabase.from("lists").insert({
      title: newListTitle.trim(),
      board_id: boardId,
      position: lists.length,
    });
    await logActivity(boardId, "created", "list", undefined, newListTitle.trim());
    setNewListTitle("");
    setAddingList(false);
    fetchData();
  };

  const deleteList = async (listId: string, title: string) => {
    if (!boardId) return;
    await supabase.from("lists").delete().eq("id", listId);
    await logActivity(boardId, "deleted", "list", listId, title);
    fetchData();
  };

  const onDragEnd = async (result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination || !boardId) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskId = draggableId;
    const destListId = destination.droppableId;

    // Optimistic: reorder in state
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newTasks = tasks.filter((t) => t.id !== taskId);
    const destTasks = newTasks
      .filter((t) => t.list_id === destListId)
      .sort((a, b) => a.position - b.position);

    // Insert at new index
    destTasks.splice(destination.index, 0, { ...task, list_id: destListId });

    // Update positions
    const updates = destTasks.map((t, i) => ({
      id: t.id,
      list_id: destListId,
      position: i,
      board_id: t.board_id,
      title: t.title,
      created_by: t.created_by,
    }));

    // Also update source list if different
    if (source.droppableId !== destination.droppableId) {
      const sourceTasks = newTasks
        .filter((t) => t.list_id === source.droppableId)
        .sort((a, b) => a.position - b.position);
      sourceTasks.forEach((t, i) => {
        updates.push({
          id: t.id,
          list_id: source.droppableId,
          position: i,
          board_id: t.board_id,
          title: t.title,
          created_by: t.created_by,
        });
      });
    }

    // Persist
    for (const u of updates) {
      await supabase
        .from("tasks")
        .update({ list_id: u.list_id, position: u.position })
        .eq("id", u.id);
    }

    if (source.droppableId !== destination.droppableId) {
      const destList = lists.find((l) => l.id === destListId);
      await logActivity(boardId, "moved", "task", taskId, task.title, {
        to_list: destList?.title,
      });
    }

    fetchData();
  };

  const filteredTasks = search
    ? tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  if (!board) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex h-14 items-center gap-4 px-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: board.color }} />
            <h1 className="font-heading text-lg font-bold">{board.title}</h1>
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[180px] h-8 text-sm"
            />
          </div>
          <BoardMembers
            boardId={boardId}
            isOwner={board.owner_id === user?.id}
            ownerId={board.owner_id}
          />
          <Notifications />
          <Button
            variant={showActivity ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowActivity(!showActivity)}
          >
            Activity
          </Button>
        </div>
      </header>

      {/* Board content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-2 bg-gradient-to-r from-background to-transparent pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="pointer-events-auto shadow-lg bg-white hover:bg-zinc-100 border-zinc-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pr-2 bg-gradient-to-l from-background to-transparent pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="pointer-events-auto shadow-lg bg-white hover:bg-zinc-100 border-zinc-300"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto overflow-y-hidden board-scroll"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="flex gap-4 p-4 h-full">
              {lists.map((list) => {
                const listTasks = filteredTasks
                  .filter((t) => t.list_id === list.id)
                  .sort((a, b) => a.position - b.position);

                return (
                  <div
                    key={list.id}
                    className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30"
                  >
                    {/* List header */}
                    <div className="flex items-center justify-between px-3 py-2.5 border-b">
                      <h3 className="font-heading text-sm font-semibold">
                        {list.title}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {listTasks.length}
                        </span>
                      </h3>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setSelectedTask(null);
                            setSelectedListId(list.id);
                            setTaskDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => deleteList(list.id, list.title)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete list
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Droppable area */}
                    <Droppable droppableId={list.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px] transition-colors ${
                            snapshot.isDraggingOver ? "bg-primary/5" : ""
                          }`}
                        >
                          {listTasks.map((task, index) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              index={index}
                              onClick={() => {
                                setSelectedTask(task);
                                setSelectedListId(list.id);
                                setTaskDialogOpen(true);
                              }}
                              assignees={taskAssignees[task.id] || []}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}

              {/* Add list column */}
              <div className="w-72 shrink-0">
                {addingList ? (
                  <div className="rounded-lg border bg-card p-3 space-y-2">
                    <Input
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="List title"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && addList()}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addList}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingList(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start border border-dashed text-muted-foreground hover:text-foreground"
                    onClick={() => setAddingList(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add list
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DragDropContext>

        {/* Activity sidebar */}
        {showActivity && boardId && <ActivityPanel boardId={boardId} />}
      </div>

      {/* Task dialog */}
      {boardId && (
        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          boardId={boardId}
          listId={selectedListId}
          task={selectedTask}
          onSaved={fetchData}
          position={filteredTasks.filter((t) => t.list_id === selectedListId).length}
        />
      )}
    </div>
  );
}
