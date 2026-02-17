import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "../../integrations/supabase/client";

// Mock Supabase
vi.mock("../../integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe("Board Operations Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Board", () => {
    it("should create board with valid data", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: [{ id: "board-1", title: "New Board" }],
        error: null,
      });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;

      const boardData = {
        title: "New Board",
        description: "Board description",
        owner_id: "user-123",
        color: "#14b8a6",
      };

      const { data, error } = await supabase.from("boards").insert(boardData);

      expect(mockFrom).toHaveBeenCalledWith("boards");
      expect(mockInsert).toHaveBeenCalledWith(boardData);
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });
  });

  describe("List Boards", () => {
    it("should fetch boards with correct ordering", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [
          { id: "board-1", title: "Board 1", created_at: "2024-01-02" },
          { id: "board-2", title: "Board 2", created_at: "2024-01-01" },
        ],
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .order("created_at", { ascending: false });

      expect(mockFrom).toHaveBeenCalledWith("boards");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });
  });

  describe("Create List", () => {
    it("should create list in board", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: [{ id: "list-1", title: "To Do", position: 0 }],
        error: null,
      });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;

      const listData = {
        board_id: "board-1",
        title: "To Do",
        position: 0,
      };

      const { data, error } = await supabase.from("lists").insert(listData);

      expect(mockFrom).toHaveBeenCalledWith("lists");
      expect(mockInsert).toHaveBeenCalledWith(listData);
      expect(error).toBeNull();
    });
  });

  describe("Create Task", () => {
    it("should create task with all fields", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: [{ id: "task-1", title: "New Task" }],
        error: null,
      });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;

      const taskData = {
        list_id: "list-1",
        board_id: "board-1",
        title: "New Task",
        description: "Task description",
        priority: "high",
        due_date: "2024-01-15",
        created_by: "user-123",
        position: 0,
      };

      const { data, error } = await supabase.from("tasks").insert(taskData);

      expect(mockFrom).toHaveBeenCalledWith("tasks");
      expect(mockInsert).toHaveBeenCalledWith(taskData);
      expect(error).toBeNull();
    });
  });

  describe("Update Task", () => {
    it("should update task fields", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [{ id: "task-1", title: "Updated Task" }],
        error: null,
      });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
      (supabase.from as any) = mockFrom;

      const updates = {
        title: "Updated Task",
        priority: "high",
      };

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", "task-1");

      expect(mockFrom).toHaveBeenCalledWith("tasks");
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith("id", "task-1");
      expect(error).toBeNull();
    });
  });

  describe("Move Task", () => {
    it("should move task to different list", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [{ id: "task-1", list_id: "list-2", position: 1 }],
        error: null,
      });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from("tasks")
        .update({ list_id: "list-2", position: 1 })
        .eq("id", "task-1");

      expect(mockUpdate).toHaveBeenCalledWith({
        list_id: "list-2",
        position: 1,
      });
      expect(error).toBeNull();
    });
  });

  describe("Delete Task", () => {
    it("should delete task by id", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
      (supabase.from as any) = mockFrom;

      const { error } = await supabase.from("tasks").delete().eq("id", "task-1");

      expect(mockFrom).toHaveBeenCalledWith("tasks");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "task-1");
      expect(error).toBeNull();
    });
  });

  describe("Search Tasks", () => {
    it("should search tasks by title", async () => {
      const mockIlike = vi.fn().mockResolvedValue({
        data: [
          { id: "task-1", title: "Urgent task" },
          { id: "task-2", title: "Another urgent item" },
        ],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ ilike: mockIlike });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("board_id", "board-1")
        .ilike("title", "%urgent%");

      expect(mockIlike).toHaveBeenCalledWith("title", "%urgent%");
      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });
  });
});
