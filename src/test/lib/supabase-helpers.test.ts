import { describe, it, expect, vi, beforeEach } from "vitest";
import { logActivity, reorderTasks } from "../../lib/supabase-helpers";
import { supabase } from "../../integrations/supabase/client";

// Mock Supabase client
vi.mock("../../integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe("Supabase Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logActivity", () => {
    it("should insert activity log with correct data", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;
      (supabase.auth.getUser as any) = vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      await logActivity("board-1", "created", "task", "task-1", "New Task");

      expect(mockFrom).toHaveBeenCalledWith("activity_log");
      expect(mockInsert).toHaveBeenCalledWith({
        board_id: "board-1",
        user_id: "user-123",
        action: "created",
        entity_type: "task",
        entity_id: "task-1",
        entity_title: "New Task",
        metadata: undefined,
      });
    });

    it("should handle metadata parameter", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;
      (supabase.auth.getUser as any) = vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      const metadata = { priority: "high" };
      await logActivity("board-1", "updated", "task", "task-1", "Task", metadata);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { priority: "high" },
        })
      );
    });

    it("should handle missing user gracefully", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;
      (supabase.auth.getUser as any) = vi.fn().mockResolvedValue({
        data: { user: null },
      });

      await logActivity("board-1", "created", "task", "task-1", "New Task");

      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe("reorderTasks", () => {
    it("should reorder tasks correctly", () => {
      const tasks = [
        { id: "1", position: 0 },
        { id: "2", position: 1 },
        { id: "3", position: 2 },
      ];

      const result = reorderTasks(tasks, 0, 2);

      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("3");
      expect(result[2].id).toBe("1");
      expect(result[0].position).toBe(0);
      expect(result[1].position).toBe(1);
      expect(result[2].position).toBe(2);
    });

    it("should handle same position", () => {
      const tasks = [
        { id: "1", position: 0 },
        { id: "2", position: 1 },
      ];

      const result = reorderTasks(tasks, 1, 1);

      expect(result).toEqual(tasks);
    });

    it("should handle empty array", () => {
      const result = reorderTasks([], 0, 0);
      expect(result).toEqual([]);
    });
  });
});
