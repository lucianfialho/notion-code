import chalk from "chalk";

export function printBanner(workspaceName?: string): void {
  console.log(`
${chalk.bold.cyan("notion-code")} ${chalk.dim("v0.1.0")}
${chalk.dim("Claude Code for Notion")}
${workspaceName ? chalk.green(`Connected to: ${workspaceName}`) : chalk.yellow("Not connected — run 'notion-code auth login'")}

${chalk.dim("Type /help for commands, /exit to quit")}
`);
}
