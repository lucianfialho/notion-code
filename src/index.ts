#!/usr/bin/env node

import chalk from "chalk";
import { parseArgs } from "./cli/args.js";
import { runOAuthFlow, getToken } from "./auth/oauth.js";
import { getCredentials, deleteCredentials } from "./auth/store.js";
import { getCachedContext, indexWorkspace } from "./context/workspace.js";
import { launchInteractive, runPrompt } from "./agent.js";

const args = parseArgs(process.argv);

switch (args.command) {
  case "interactive": {
    const token = await getToken();
    const creds = await getCredentials();

    let context = await getCachedContext();
    if (!context && creds) {
      try {
        context = await indexWorkspace(token, creds.workspace_name);
      } catch {
        // Non-fatal
      }
    }

    launchInteractive({
      token,
      workspaceName: creds?.workspace_name,
      workspaceContext: context ?? undefined,
    });
    break;
  }

  case "prompt": {
    const token = await getToken();
    const creds = await getCredentials();
    const context = await getCachedContext();

    runPrompt({
      token,
      workspaceName: creds?.workspace_name,
      workspaceContext: context ?? undefined,
      prompt: args.prompt!,
      outputFormat: args.outputFormat,
    });
    break;
  }

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
