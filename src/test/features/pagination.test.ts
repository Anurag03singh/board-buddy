import { describe, it, expect } from "vitest";

describe("Pagination Logic", () => {
  const ITEMS_PER_PAGE = 9;

  const paginateItems = <T,>(items: T[], page: number, itemsPerPage: number) => {
    return items.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  };

  const getTotalPages = (totalItems: number, itemsPerPage: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  it("should paginate items correctly", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    
    const page0 = paginateItems(items, 0, ITEMS_PER_PAGE);
    const page1 = paginateItems(items, 1, ITEMS_PER_PAGE);
    const page2 = paginateItems(items, 2, ITEMS_PER_PAGE);

    expect(page0).toHaveLength(9);
    expect(page1).toHaveLength(9);
    expect(page2).toHaveLength(7);
    expect(page0[0].id).toBe(0);
    expect(page1[0].id).toBe(9);
    expect(page2[0].id).toBe(18);
  });

  it("should calculate total pages correctly", () => {
    expect(getTotalPages(25, ITEMS_PER_PAGE)).toBe(3);
    expect(getTotalPages(9, ITEMS_PER_PAGE)).toBe(1);
    expect(getTotalPages(0, ITEMS_PER_PAGE)).toBe(0);
    expect(getTotalPages(10, ITEMS_PER_PAGE)).toBe(2);
  });

  it("should handle empty array", () => {
    const items: any[] = [];
    const result = paginateItems(items, 0, ITEMS_PER_PAGE);
    expect(result).toHaveLength(0);
  });

  it("should handle page out of bounds", () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    const result = paginateItems(items, 10, ITEMS_PER_PAGE);
    expect(result).toHaveLength(0);
  });

  it("should handle single page", () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    const result = paginateItems(items, 0, ITEMS_PER_PAGE);
    expect(result).toHaveLength(5);
    expect(getTotalPages(5, ITEMS_PER_PAGE)).toBe(1);
  });
});
