import { spawn } from "node:child_process";
import { buildSystemPrompt } from "./system-prompt.js";
import type { WorkspaceContext } from "./context/workspace.js";

export interface AgentOptions {
  token: string;
  workspaceName?: string;
  workspaceContext?: WorkspaceContext;
}

function buildMcpConfig(token: string): string {
  return JSON.stringify({
    mcpServers: {
      notion: {
        command: "npx",
        args: ["-y", "@notionhq/notion-mcp-server"],
        env: {
          OPENAPI_MCP_HEADERS: JSON.stringify({
            Authorization: `Bearer ${token}`,
            "Notion-Version": "2022-06-28",
          }),
        },
      },
    },
  });
}

/**
 * Launch claude CLI in interactive mode with Notion MCP pre-configured.
 * This gives the full Claude Code UX (markdown rendering, tool panels, etc.)
 */
export function launchInteractive(options: AgentOptions): void {
  const { token, workspaceName, workspaceContext } = options;
  const systemPrompt = buildSystemPrompt(workspaceName, workspaceContext);

  const args = [
    "--system-prompt", systemPrompt,
    "--mcp-config", buildMcpConfig(token),
    "--permission-mode", "bypassPermissions",
    "--allow-dangerously-skip-permissions",
    "--disallowedTools", "Read,Write,Edit,Bash,Glob,Grep,Agent,WebSearch,WebFetch",
  ];

  const child = spawn("claude", args, {
    stdio: "inherit",
    env: { ...process.env, CLAUDECODE: undefined },
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

/**
 * Run a single prompt via claude -p and stream output to stdout.
 */
export function runPrompt(options: AgentOptions & { prompt: string; outputFormat: string }): void {
  const { token, workspaceName, workspaceContext, prompt, outputFormat } = options;
  const systemPrompt = buildSystemPrompt(workspaceName, workspaceContext);

  const args = [
    "-p", prompt,
    "--system-prompt", systemPrompt,
    "--mcp-config", buildMcpConfig(token),
    "--permission-mode", "bypassPermissions",
    "--allow-dangerously-skip-permissions",
    "--disallowedTools", "Read,Write,Edit,Bash,Glob,Grep,Agent,WebSearch,WebFetch",
    "--output-format", outputFormat,
  ];

  const child = spawn("claude", args, {
    stdio: "inherit",
    env: { ...process.env, CLAUDECODE: undefined },
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}
