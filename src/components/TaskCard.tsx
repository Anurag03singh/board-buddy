import { Draggable } from "@hello-pangea/dnd";
import { Calendar, User, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    priority: string;
    due_date?: string | null;
    position: number;
  };
  index: number;
  onClick: () => void;
  assignees?: { display_name: string | null; email: string }[];
}

const priorityStyles: Record<string, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
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

export default function TaskCard({ task, index, onClick, assignees = [] }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={onClick}
          className={`group cursor-pointer rounded-lg border bg-card p-3 transition-shadow ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-primary/30" : "hover:shadow-sm"
          }`}
        >
          <div className="flex items-start gap-2">
            <div
              {...provided.dragHandleProps}
              className="mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug">{task.title}</p>
              {task.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityStyles[task.priority] || ""}`}>
                  {task.priority}
                </Badge>
                {task.due_date && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
                {assignees.length > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      {assignees.slice(0, 3).map((assignee, idx) => (
                        <Avatar key={idx} className="h-5 w-5 border-2 border-card">
                          <AvatarFallback className="text-[8px]">
                            {getInitials(assignee.display_name, assignee.email)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    {assignees.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{assignees.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
