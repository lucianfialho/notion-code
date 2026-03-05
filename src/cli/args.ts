import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, "../../package.json"), "utf-8")
);

export type OutputFormat = "text" | "json";

export interface ParsedArgs {
  command: "interactive" | "prompt" | "auth-login" | "auth-logout" | "auth-status";
  prompt?: string;
  outputFormat: OutputFormat;
}

export function parseArgs(argv: string[]): ParsedArgs {
  let result: ParsedArgs = { command: "interactive", outputFormat: "text" };

  const program = new Command()
    .name("notion-code")
    .description("Claude Code for Notion — manage your Notion workspace from the terminal")
    .version(pkg.version)
    .option("-p, --print <prompt>", "Run a single prompt and exit")
    .option("--output-format <format>", "Output format: text or json", "text")
    .action((opts) => {
      if (opts.print) {
        result = {
          command: "prompt",
          prompt: opts.print,
          outputFormat: opts.outputFormat as OutputFormat,
        };
      } else {
        result = { command: "interactive", outputFormat: opts.outputFormat as OutputFormat };
      }
    });

  const auth = program.command("auth").description("Manage Notion authentication");

  auth
    .command("login")
    .description("Authenticate with Notion via OAuth")
    .action(() => {
      result = { command: "auth-login", outputFormat: "text" };
    });

  auth
    .command("logout")
    .description("Clear stored credentials")
    .action(() => {
      result = { command: "auth-logout", outputFormat: "text" };
    });

  auth
    .command("status")
    .description("Show current authentication status")
    .action(() => {
      result = { command: "auth-status", outputFormat: "text" };
    });

  program.parse(argv);
  return result;
}
