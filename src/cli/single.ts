import chalk from "chalk";
import { getToken } from "../auth/oauth.js";
import { getCredentials } from "../auth/store.js";
import { createNotionAgent } from "../agent.js";
import type { OutputFormat } from "./args.js";
import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

export async function runSinglePrompt(
  prompt: string,
  outputFormat: OutputFormat
): Promise<void> {
  const token = await getToken();
  const creds = await getCredentials();

  const agent = createNotionAgent({
    token,
    workspaceName: creds?.workspace_name,
    prompt,
  });

  const chunks: string[] = [];

  for await (const message of agent) {
    if (message.type === "assistant") {
      const text = extractText(message);
      if (text) {
        if (outputFormat === "text") {
          process.stdout.write(text);
        }
        chunks.push(text);
      }
    } else if (message.type === "tool_use_summary" && outputFormat === "text") {
      process.stderr.write(chalk.dim(`\n[${message.summary}]\n`));
    } else if (message.type === "tool_progress" && outputFormat === "text") {
      process.stderr.write(chalk.dim(`.`));
    }
  }

  if (outputFormat === "text") {
    process.stdout.write("\n");
  } else {
    console.log(JSON.stringify({ result: chunks.join("") }));
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
