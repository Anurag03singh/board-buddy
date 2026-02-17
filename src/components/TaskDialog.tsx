import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logActivity } from "@/lib/supabase-helpers";
import TaskAssignments from "@/components/TaskAssignments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  listId: string;
  task?: any;
  onSaved: () => void;
  position?: number;
}

export default function TaskDialog({
  open,
  onOpenChange,
  boardId,
  listId,
  task,
  onSaved,
  position = 0,
}: TaskDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
    }
  }, [task, open]);

  const handleSave = async () => {
    if (!title.trim() || !user) return;
    setLoading(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
    };

    if (task) {
      await supabase.from("tasks").update(payload).eq("id", task.id);
      await logActivity(boardId, "updated", "task", task.id, title);
    } else {
      await supabase.from("tasks").insert({
        ...payload,
        list_id: listId,
        board_id: boardId,
        created_by: user.id,
        position,
      });
      await logActivity(boardId, "created", "task", undefined, title);
    }

    setLoading(false);
    onSaved();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    await supabase.from("tasks").delete().eq("id", task.id);
    await logActivity(boardId, "deleted", "task", task.id, task.title);
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {task ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          {task && (
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <TaskAssignments taskId={task.id} boardId={boardId} />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || !title.trim()} className="flex-1">
              {task ? "Update" : "Create"}
            </Button>
            {task && (
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
