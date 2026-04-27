import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (className utility)", () => {
  it("should return an empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("should return a single class name unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("should join multiple class names with a space", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should ignore falsy values (false, null, undefined, 0)", () => {
    expect(cn("foo", false, "bar")).toBe("foo bar");
    expect(cn("foo", null, "bar")).toBe("foo bar");
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
    expect(cn("foo", 0, "bar")).toBe("foo bar");
  });

  it("should include truthy conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("should exclude falsy conditional classes", () => {
    const isActive = false;
    expect(cn("base", isActive && "active")).toBe("base");
  });

  it("should merge conflicting Tailwind classes (last one wins)", () => {
    // tailwind-merge: later class wins for conflicting utilities
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
  });

  it("should merge conflicting text color classes", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("should keep non-conflicting classes", () => {
    const result = cn("text-red-500", "font-bold");
    expect(result).toContain("text-red-500");
    expect(result).toContain("font-bold");
  });

  it("should handle object syntax for conditional classes", () => {
    const result = cn({ "font-bold": true, italic: false });
    expect(result).toBe("font-bold");
  });

  it("should handle mixed string and object arguments", () => {
    const result = cn("base", { active: true, disabled: false });
    expect(result).toContain("base");
    expect(result).toContain("active");
    expect(result).not.toContain("disabled");
  });

  it("should handle array arguments", () => {
    const result = cn(["foo", "bar"]);
    expect(result).toBe("foo bar");
  });

  it("should handle deeply nested arrays", () => {
    const result = cn(["foo", ["bar", "baz"]]);
    expect(result).toBe("foo bar baz");
  });

  it("should deduplicate identical class names via tailwind-merge", () => {
    // tailwind-merge deduplicates same-utility classes
    const result = cn("p-4", "p-4");
    expect(result).toBe("p-4");
  });
});
