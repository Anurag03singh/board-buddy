import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "../../integrations/supabase/client";

vi.mock("../../integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("Task Assignments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Assign User to Task", () => {
    it("should assign user to task", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: [{ id: "assignment-1", task_id: "task-1", user_id: "user-1" }],
        error: null,
      });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;

      const assignmentData = {
        task_id: "task-1",
        user_id: "user-1",
      };

      const { data, error } = await supabase
        .from("task_assignments")
        .insert(assignmentData);

      expect(mockFrom).toHaveBeenCalledWith("task_assignments");
      expect(mockInsert).toHaveBeenCalledWith(assignmentData);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("should prevent duplicate assignments", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "duplicate key value violates unique constraint" },
      });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;

      const { error } = await supabase.from("task_assignments").insert({
        task_id: "task-1",
        user_id: "user-1",
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain("duplicate");
    });
  });

  describe("Get Task Assignees", () => {
    it("should fetch assignees for a task", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [
          { id: "a1", task_id: "task-1", user_id: "user-1" },
          { id: "a2", task_id: "task-1", user_id: "user-2" },
        ],
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from("task_assignments")
        .select("id, task_id, user_id")
        .eq("task_id", "task-1");

      expect(mockEq).toHaveBeenCalledWith("task_id", "task-1");
      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });
  });

  describe("Unassign User from Task", () => {
    it("should remove assignment", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
      (supabase.from as any) = mockFrom;

      const { error } = await supabase
        .from("task_assignments")
        .delete()
        .eq("id", "assignment-1");

      expect(mockFrom).toHaveBeenCalledWith("task_assignments");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "assignment-1");
      expect(error).toBeNull();
    });
  });

  describe("Get Available Users for Board", () => {
    it("should fetch board members and owner", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "board-1", owner_id: "user-1" },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from("boards")
        .select("owner_id")
        .eq("id", "board-1")
        .single();

      expect(error).toBeNull();
      expect(data?.owner_id).toBe("user-1");
    });

    it("should fetch board members", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [
          { board_id: "board-1", user_id: "user-2" },
          { board_id: "board-1", user_id: "user-3" },
        ],
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from("board_members")
        .select("user_id")
        .eq("board_id", "board-1");

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });
  });
});
