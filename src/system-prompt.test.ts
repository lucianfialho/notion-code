import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./system-prompt.js";
import type { WorkspaceContext } from "./context/workspace.js";

describe("buildSystemPrompt", () => {
  it("returns base prompt without workspace name or context", () => {
    const result = buildSystemPrompt();
    expect(result).toContain("You are notion-code");
    expect(result).toContain("Your capabilities");
    expect(result).toContain("Tool usage patterns");
  });

  it("includes workspace name when provided", () => {
    const result = buildSystemPrompt("My Workspace");
    expect(result).toContain("Connected workspace: My Workspace");
  });

  it("includes databases and pages from context", () => {
    const context: WorkspaceContext = {
      workspace_name: "Test WS",
      indexed_at: Date.now(),
      databases: [
        { id: "db1", title: "Tasks", properties: ["Status", "Priority"] },
        { id: "db2", title: "Notes", properties: ["Tag"] },
      ],
      top_pages: [
        { id: "p1", title: "Welcome Page" },
        { id: "p2", title: "Getting Started" },
      ],
    };

    const result = buildSystemPrompt("Test WS", context);
    expect(result).toContain("Workspace structure");
    expect(result).toContain('"Tasks" (properties: Status, Priority)');
    expect(result).toContain('"Notes" (properties: Tag)');
    expect(result).toContain('"Welcome Page"');
    expect(result).toContain('"Getting Started"');
  });

  it("handles empty databases and pages", () => {
    const context: WorkspaceContext = {
      workspace_name: "Empty",
      indexed_at: Date.now(),
      databases: [],
      top_pages: [],
    };

    const result = buildSystemPrompt("Empty", context);
    expect(result).toContain("No databases found yet.");
  });

  it("limits top pages to 20", () => {
    const pages = Array.from({ length: 30 }, (_, i) => ({
      id: `p${i}`,
      title: `Page ${i}`,
    }));
    const context: WorkspaceContext = {
      workspace_name: "Big",
      indexed_at: Date.now(),
      databases: [],
      top_pages: pages,
    };

    const result = buildSystemPrompt("Big", context);
    expect(result).toContain("Page 19");
    expect(result).not.toContain("Page 20");
  });
});
