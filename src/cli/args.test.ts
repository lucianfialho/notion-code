import { describe, it, expect } from "vitest";
import { parseArgs } from "./args.js";

// Helper: commander expects argv like [node, script, ...args]
const argv = (...args: string[]) => ["node", "notion-code", ...args];

describe("parseArgs", () => {
  it("defaults to interactive mode with no args", () => {
    const result = parseArgs(argv());
    expect(result.command).toBe("interactive");
    expect(result.outputFormat).toBe("text");
  });

  it("parses --print flag as prompt mode", () => {
    const result = parseArgs(argv("-p", "list databases"));
    expect(result.command).toBe("prompt");
    expect(result.prompt).toBe("list databases");
    expect(result.outputFormat).toBe("text");
  });

  it("parses --output-format json", () => {
    const result = parseArgs(argv("-p", "hello", "--output-format", "json"));
    expect(result.command).toBe("prompt");
    expect(result.outputFormat).toBe("json");
  });

  it("parses auth login subcommand", () => {
    const result = parseArgs(argv("auth", "login"));
    expect(result.command).toBe("auth-login");
  });

  it("parses auth logout subcommand", () => {
    const result = parseArgs(argv("auth", "logout"));
    expect(result.command).toBe("auth-logout");
  });

  it("parses auth status subcommand", () => {
    const result = parseArgs(argv("auth", "status"));
    expect(result.command).toBe("auth-status");
  });
});
