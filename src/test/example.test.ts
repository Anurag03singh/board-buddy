import { describe, it, expect } from "vitest";
import { formatDate, getPriorityColor, validateEmail } from "../lib/utils";

describe("Utility Functions", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const formatted = formatDate(date);
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should handle invalid dates", () => {
      const result = formatDate(null);
      expect(result).toBe("");
    });
  });

  describe("getPriorityColor", () => {
    it("should return correct color for high priority", () => {
      expect(getPriorityColor("high")).toContain("destructive");
    });

    it("should return correct color for medium priority", () => {
      expect(getPriorityColor("medium")).toContain("warning");
    });

    it("should return correct color for low priority", () => {
      expect(getPriorityColor("low")).toContain("success");
    });

    it("should return default color for unknown priority", () => {
      expect(getPriorityColor("unknown")).toContain("muted");
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email", () => {
      expect(validateEmail("user@example.com")).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
    });
  });
});
