import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import chalk from "chalk";
import { getToken } from "../auth/oauth.js";
import { getCredentials } from "../auth/store.js";
import { createNotionAgent } from "../agent.js";
import { printBanner, formatError } from "./ui.js";
import { getCachedContext, indexWorkspace } from "../context/workspace.js";
import type { SDKMessage, SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

export async function runInteractiveMode(): Promise<void> {
  const token = await getToken();
  const creds = await getCredentials();

  printBanner(creds?.workspace_name);

  // Load or build workspace context
  let context = await getCachedContext();
  if (!context && creds) {
    try {
      context = await indexWorkspace(token, creds.workspace_name);
    } catch {
      // Non-fatal, agent works without context
    }
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });

  // Create an async iterable that yields user messages
  async function* userMessages(): AsyncIterable<SDKUserMessage> {
    while (true) {
      let input: string;
      try {
        input = await rl.question(chalk.bold.cyan("\nnotion-code> "));
      } catch {
        // Ctrl+D or readline closed
        break;
      }

      const trimmed = input.trim();
      if (!trimmed) continue;
      if (trimmed === "/exit" || trimmed === "/quit") break;

      if (trimmed === "/help") {
        printHelp();
        continue;
      }

      yield {
        type: "user" as const,
        message: { role: "user" as const, content: trimmed },
        parent_tool_use_id: null,
        session_id: "",
      };
    }
  }

  const agent = createNotionAgent({
    token,
    workspaceName: creds?.workspace_name,
    workspaceContext: context ?? undefined,
    prompt: userMessages(),
  });

  try {
    for await (const message of agent) {
      renderMessage(message);
    }
  } catch (err) {
    if ((err as Error).message?.includes("interrupted")) {
      // Ctrl+C interrupt, graceful exit
    } else {
      console.error(chalk.red(`\nError: ${formatError(err)}`));
    }
  } finally {
    rl.close();
    console.log(chalk.dim("\nGoodbye!"));
  }
}

function renderMessage(msg: SDKMessage): void {
  if (msg.type === "assistant") {
    const text = extractText(msg);
    if (text) process.stdout.write(text);
  } else if (msg.type === "tool_use_summary") {
    process.stdout.write(chalk.dim(`\n[${msg.summary}]\n`));
  } else if (msg.type === "tool_progress") {
    process.stdout.write(chalk.dim(`.`));
  } else if (msg.type === "result") {
    // End of turn
  }
}

function extractText(msg: SDKMessage): string | undefined {
  if (msg.type !== "assistant") return undefined;
  const betaMsg = msg.message;
  if (!betaMsg || !("content" in betaMsg)) return undefined;

  const content = betaMsg.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((block) => block.type === "text")
      .map((block) => ("text" in block ? block.text : ""))
      .join("");
  }
  return undefined;
}

function printHelp(): void {
  console.log(`
${chalk.bold("notion-code")} — Claude Code for Notion

${chalk.bold("What you can do:")}
  ${chalk.cyan("Search")}     "find all pages about marketing"
  ${chalk.cyan("Read")}       "what's in the Q1 Roadmap database?"
  ${chalk.cyan("Create")}     "create a project tracker with Name, Status, Priority"
  ${chalk.cyan("Edit")}       "update the status of Auth Redesign to Done"
  ${chalk.cyan("Organize")}   "move archived pages to a 2024 folder"
  ${chalk.cyan("Comment")}    "add a comment on the Q1 Review saying approved"

${chalk.bold("Commands:")}
  /help     Show this help
  /exit     Exit notion-code
  Ctrl+C    Cancel current operation
  Ctrl+D    Exit
`);
}
