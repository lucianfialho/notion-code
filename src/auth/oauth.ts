import { createServer } from "node:http";
import open from "open";
import chalk from "chalk";
import { saveCredentials, getCredentials, type Credentials } from "./store.js";

const CALLBACK_PORT = 1355;
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/callback`;

// OAuth credentials from environment
// Users must create their own Notion integration at https://www.notion.so/my-integrations

export async function getToken(): Promise<string> {
  // Direct token from env takes priority
  const envToken = process.env.NOTION_TOKEN;
  if (envToken) return envToken;

  const creds = await getCredentials();
  if (creds) return creds.access_token;

  // No token found, run OAuth
  const newCreds = await runOAuthFlow();
  return newCreds.access_token;
}

export async function runOAuthFlow(): Promise<Credentials> {
  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(chalk.red("Missing NOTION_CLIENT_ID or NOTION_CLIENT_SECRET."));
    console.error(chalk.dim("\nSetup:"));
    console.error(chalk.dim("  1. Create an integration at https://www.notion.so/my-integrations"));
    console.error(chalk.dim("  2. Set environment variables:"));
    console.error(chalk.dim("     export NOTION_CLIENT_ID=your_client_id"));
    console.error(chalk.dim("     export NOTION_CLIENT_SECRET=your_client_secret"));
    console.error(chalk.dim("\n  Or use a direct token: export NOTION_TOKEN=ntn_xxx"));
    process.exit(1);
  }

  return new Promise<Credentials>((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url!, `http://localhost:${CALLBACK_PORT}`);

      if (url.pathname === "/callback") {
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error || !code) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h1>Authorization failed</h1><p>You can close this window.</p>");
          server.close();
          reject(new Error(error || "No authorization code received"));
          return;
        }

        try {
          const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            },
            body: JSON.stringify({
              grant_type: "authorization_code",
              code,
              redirect_uri: REDIRECT_URI,
            }),
          });

          if (!tokenResponse.ok) {
            const errBody = await tokenResponse.text();
            throw new Error(`Token exchange failed: ${errBody}`);
          }

          const data = (await tokenResponse.json()) as {
            access_token: string;
            workspace_id: string;
            workspace_name: string;
            bot_id: string;
          };

          const creds: Credentials = {
            access_token: data.access_token,
            workspace_id: data.workspace_id,
            workspace_name: data.workspace_name,
            bot_id: data.bot_id,
          };

          await saveCredentials(creds);

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            `<h1>Connected to ${data.workspace_name}!</h1><p>You can close this window and return to the terminal.</p>`
          );

          server.close();
          resolve(creds);
        } catch (err) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("<h1>Something went wrong</h1><p>Check the terminal for details.</p>");
          server.close();
          reject(err);
        }
      }
    });

    server.listen(CALLBACK_PORT, () => {
      const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("owner", "user");
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);

      console.log(chalk.cyan("Opening browser for Notion authorization..."));
      console.log(chalk.dim(`If it doesn't open, visit: ${authUrl.toString()}`));
      open(authUrl.toString());
    });
  });
}
