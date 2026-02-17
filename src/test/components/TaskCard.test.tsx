import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import TaskCard from "../../components/TaskCard";

const mockTask = {
  id: "task-1",
  title: "Test Task",
  description: "Test description",
  priority: "high",
  due_date: "2024-01-15T00:00:00Z",
  position: 0,
};

const renderWithDnd = (component: React.ReactElement) => {
  return render(
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test-list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {component}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

describe("TaskCard", () => {
  it("should render task title", () => {
    renderWithDnd(
      <TaskCard task={mockTask} index={0} onClick={() => {}} />
    );
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("should render task description", () => {
    renderWithDnd(
      <TaskCard task={mockTask} index={0} onClick={() => {}} />
    );
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should render priority badge", () => {
    renderWithDnd(
      <TaskCard task={mockTask} index={0} onClick={() => {}} />
    );
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("should render due date", () => {
    renderWithDnd(
      <TaskCard task={mockTask} index={0} onClick={() => {}} />
    );
    const dateElement = screen.getByText(/1\/15\/2024/);
    expect(dateElement).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    renderWithDnd(
      <TaskCard task={mockTask} index={0} onClick={handleClick} />
    );
    
    const card = screen.getByText("Test Task").closest("div");
    card?.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render without description", () => {
    const taskWithoutDesc = { ...mockTask, description: null };
    renderWithDnd(
      <TaskCard task={taskWithoutDesc} index={0} onClick={() => {}} />
    );
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });

  it("should render assignee avatars when provided", () => {
    const assignees = [
      { display_name: "John Doe", email: "john@example.com" },
      { display_name: "Jane Doe", email: "jane@example.com" },
    ];
    renderWithDnd(
      <TaskCard 
        task={mockTask} 
        index={0} 
        onClick={() => {}} 
        assignees={assignees}
      />
    );
    // Check that avatars are rendered
    const avatars = screen.getAllByText(/JD/);
    expect(avatars.length).toBeGreaterThan(0);
  });
});
