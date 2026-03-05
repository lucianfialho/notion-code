import { query, type Query } from "@anthropic-ai/claude-agent-sdk";
import { buildSystemPrompt } from "./system-prompt.js";
import type { SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";
import type { WorkspaceContext } from "./context/workspace.js";

export interface AgentOptions {
  token: string;
  workspaceName?: string;
  workspaceContext?: WorkspaceContext;
  prompt: string | AsyncIterable<SDKUserMessage>;
  maxTurns?: number;
}

export function createNotionAgent(options: AgentOptions): Query {
  const { token, workspaceName, workspaceContext, prompt, maxTurns } = options;

  return query({
    prompt,
    options: {
      systemPrompt: buildSystemPrompt(workspaceName, workspaceContext),
      model: "sonnet",
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
      maxTurns,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });
}
