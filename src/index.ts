#!/usr/bin/env node

import "dotenv/config";
import chalk from "chalk";
import ora from "ora";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getToken, runOAuthFlow } from "./auth/oauth.js";
import { getCredentials, deleteCredentials } from "./auth/store.js";
import { buildWorkspace, type CreatedItem } from "./agent.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));

const ICONS: Record<CreatedItem["type"], string> = {
  database: "📊",
  page: "📄",
  template: "📋",
};

function printBanner() {
  console.log("");
  console.log(chalk.bold.magenta("  🏗️  notion-architect") + chalk.dim(` v${pkg.version}`));
  console.log(chalk.dim("  Describe your business. Get a workspace.\n"));
}

function link(text: string, url: string): string {
  // OSC 8 hyperlink: clickable in modern terminals (iTerm2, Warp, Ghostty, etc.)
  return `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;
}

function printResult(items: CreatedItem[]) {
  console.log("");
  console.log(chalk.bold.green(`  ✨ Workspace ready! ${items.length} items created.\n`));

  const maxTitle = Math.max(...items.map((i) => i.title.length), 10);
  for (const item of items) {
    const icon = ICONS[item.type];
    const title = item.title.padEnd(maxTitle);
    const type = chalk.dim(`(${item.type})`);
    const clickable = item.url ? link(chalk.bold(title), item.url) : chalk.bold(title);
    console.log(`  ${icon} ${clickable} ${type}`);
  }

  console.log("");
  if (items.length > 0 && items[0].url) {
    console.log(chalk.dim("  Open in Notion: ") + link(chalk.cyan(items[0].url), items[0].url));
  }
  console.log("");
}

const program = new Command()
  .name("notion-architect")
  .description("Describe your business, get a complete Notion workspace")
  .version(pkg.version)
  .argument("[description...]", "Describe your business or project")
  .action(async (descriptionParts: string[]) => {
    const description = descriptionParts.join(" ");

    if (!description) {
      printBanner();
      // Interactive mode — ask the user
      const rl = readline.createInterface({ input: stdin, output: stdout });

      console.log(chalk.dim("  Examples:"));
      console.log(chalk.dim('    "marketing agency with 5 clients"'));
      console.log(chalk.dim('    "saas startup building a CRM"'));
      console.log(chalk.dim('    "freelance designer tracking projects"'));
      console.log(chalk.dim('    "restaurante com 3 unidades"\n'));

      const answer = await rl.question(chalk.bold.cyan("  Describe your business: "));
      rl.close();

      if (!answer.trim()) {
        console.log(chalk.dim("\n  Nothing to build. Bye!\n"));
        return;
      }

      return runBuild(answer.trim());
    }

    printBanner();
    return runBuild(description);
  });

async function runBuild(description: string) {
  const token = await getToken();
  const creds = await getCredentials();

  if (creds) {
    console.log(chalk.dim(`  Workspace: ${creds.workspace_name}\n`));
  }

  const spinner = ora({
    text: "Analyzing your business...",
    prefixText: " ",
  }).start();

  const items: CreatedItem[] = [];
  let lastPhase = "";
  let agentOutput = "";

  try {
    const result = await buildWorkspace({
      token,
      description,
      onItemCreated: (item) => {
        items.push(item);
        spinner.succeed(
          chalk.bold(item.title) +
          chalk.dim(` (${item.type})`) +
          (item.url ? "\n    " + chalk.dim("→ ") + link(chalk.underline.cyan(item.url), item.url) : "")
        );
        spinner.start("Creating next item...");
      },
      onText: (text) => {
        agentOutput += text + "\n";
      },
      onThinking: (text) => {
        const short = text.length > 60 ? text.slice(0, 57) + "..." : text;
        if (short !== lastPhase) {
          spinner.text = short;
          lastPhase = short;
        }
      },
    });

    spinner.stop();
    if (items.length === 0 && result.length === 0) {
      console.log(chalk.yellow("\n  No items were created. Agent output:"));
      console.log(chalk.dim(`  ${agentOutput.slice(0, 500)}`));
    } else {
      printResult(items.length > 0 ? items : result);
    }
  } catch (err) {
    spinner.fail(chalk.red(`Error: ${(err as Error).message}`));
    process.exit(1);
  }
}

const auth = program.command("auth").description("Manage Notion authentication");

auth.command("login").description("Authenticate with Notion").action(async () => {
  const creds = await runOAuthFlow();
  console.log(chalk.green(`\nConnected to workspace: ${creds.workspace_name}`));
});

auth.command("logout").description("Clear credentials").action(async () => {
  await deleteCredentials();
  console.log(chalk.green("Credentials removed."));
});

auth.command("status").description("Show auth status").action(async () => {
  const creds = await getCredentials();
  if (creds) {
    console.log(chalk.green("Authenticated"));
    console.log(`  Workspace: ${creds.workspace_name}`);
    console.log(`  Bot ID: ${chalk.dim(creds.bot_id)}`);
  } else if (process.env.NOTION_TOKEN) {
    console.log(chalk.green("Using NOTION_TOKEN from environment"));
  } else {
    console.log(chalk.yellow("Not authenticated"));
    console.log(chalk.dim("Run: notion-architect auth login"));
  }
});

program.parse(process.argv);
