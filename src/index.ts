#!/usr/bin/env node

import chalk from "chalk";
import { parseArgs } from "./cli/args.js";
import { runOAuthFlow, getToken } from "./auth/oauth.js";
import { getCredentials, deleteCredentials } from "./auth/store.js";
import { runSinglePrompt } from "./cli/single.js";
import { runInteractiveMode } from "./cli/interactive.js";

const args = parseArgs(process.argv);

switch (args.command) {
  case "interactive":
    await runInteractiveMode();
    break;

  case "prompt":
    await runSinglePrompt(args.prompt!, args.outputFormat);
    break;

  case "auth-login": {
    const creds = await runOAuthFlow();
    console.log(chalk.green(`\nConnected to workspace: ${creds.workspace_name}`));
    break;
  }

  case "auth-logout":
    await deleteCredentials();
    console.log(chalk.green("Credentials removed."));
    break;

  case "auth-status": {
    const creds = await getCredentials();
    if (creds) {
      console.log(chalk.green(`Authenticated`));
      console.log(`  Workspace: ${creds.workspace_name}`);
      console.log(`  Workspace ID: ${chalk.dim(creds.workspace_id)}`);
      console.log(`  Bot ID: ${chalk.dim(creds.bot_id)}`);
    } else if (process.env.NOTION_TOKEN) {
      console.log(chalk.green("Using NOTION_TOKEN from environment"));
    } else {
      console.log(chalk.yellow("Not authenticated"));
      console.log(chalk.dim("Run: notion-code auth login"));
    }
    break;
  }
}
