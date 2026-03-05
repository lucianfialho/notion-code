import { query } from "@anthropic-ai/claude-agent-sdk";
import { buildArchitectPrompt } from "./system-prompt.js";

export interface ArchitectOptions {
  token: string;
  description: string;
  onItemCreated?: (item: CreatedItem) => void;
  onThinking?: (text: string) => void;
  onText?: (text: string) => void;
}

export interface CreatedItem {
  type: "database" | "page" | "template";
  title: string;
  url: string;
}

export async function buildWorkspace(options: ArchitectOptions): Promise<CreatedItem[]> {
  const { token, description, onItemCreated, onThinking, onText } = options;
  const items: CreatedItem[] = [];

  const result = query({
    prompt: `Create a complete Notion workspace for: ${description}`,
    options: {
      systemPrompt: buildArchitectPrompt(),
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
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      env: {
        ...process.env,
        CLAUDECODE: undefined,
      },
    },
  });

  for await (const message of result) {
    if (message.type === "assistant") {
      const text = extractText(message);
      if (text) {
        // Parse CREATED: lines for structured output
        const lines = text.split("\n");
        for (const line of lines) {
          const match = line.match(/^CREATED:(database|page|template):(.+?):(https?:\/\/.+)$/);
          if (match) {
            const item: CreatedItem = {
              type: match[1] as CreatedItem["type"],
              title: match[2],
              url: match[3],
            };
            items.push(item);
            onItemCreated?.(item);
          }
        }
        onText?.(text);
      }
    } else if (message.type === "tool_use_summary") {
      onThinking?.(message.summary);
    }
  }

  return items;
}

function extractText(msg: { type: string; message?: { content?: unknown } }): string | undefined {
  const betaMsg = (msg as { message?: { content?: unknown } }).message;
  if (!betaMsg || !("content" in betaMsg)) return undefined;

  const content = betaMsg.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return (content as Array<{ type: string; text?: string }>)
      .filter((block) => block.type === "text")
      .map((block) => block.text || "")
      .join("");
  }
  return undefined;
}
