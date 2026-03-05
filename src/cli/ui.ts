import chalk from "chalk";

const LOGO = `
  ${chalk.bold.cyan("  ╔══╗")}
  ${chalk.bold.cyan("  ║  ║")}  ${chalk.bold("notion-code")} ${chalk.dim("v0.1.0")}
  ${chalk.bold.cyan("  ║  ║")}  ${chalk.dim("Claude Code for Notion")}
  ${chalk.bold.cyan("  ╚══╝")}
`;

export function printBanner(workspaceName?: string): void {
  console.log(LOGO);
  if (workspaceName) {
    console.log(chalk.green(`  Connected to: ${workspaceName}`));
  } else if (process.env.NOTION_TOKEN) {
    console.log(chalk.green("  Using NOTION_TOKEN from environment"));
  } else {
    console.log(chalk.yellow("  Not connected — run 'notion-code auth login'"));
  }
  console.log(chalk.dim("\n  Type /help for commands, /exit to quit\n"));
}

export function printConnecting(): void {
  process.stderr.write(chalk.dim("  Connecting to Notion MCP server..."));
}

export function printConnected(): void {
  process.stderr.write(chalk.dim(" done\n\n"));
}

export function formatError(err: unknown): string {
  const error = err as Error;
  const msg = error.message || String(err);

  if (msg.includes("ECONNREFUSED") || msg.includes("fetch failed")) {
    return "Could not connect to Notion API. Check your internet connection.";
  }
  if (msg.includes("unauthorized") || msg.includes("401")) {
    return "Authentication expired. Run: notion-code auth login";
  }
  if (msg.includes("rate_limit") || msg.includes("429")) {
    return "Rate limited by Notion API. Wait a moment and try again.";
  }
  return msg;
}
