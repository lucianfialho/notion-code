import { readFile, writeFile, unlink, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Credentials {
  access_token: string;
  workspace_id: string;
  workspace_name: string;
  bot_id: string;
}

const CONFIG_DIR = join(homedir(), ".notion-code");
const CREDENTIALS_PATH = join(CONFIG_DIR, "credentials.json");

export async function getCredentials(): Promise<Credentials | null> {
  try {
    const data = await readFile(CREDENTIALS_PATH, "utf-8");
    return JSON.parse(data) as Credentials;
  } catch {
    return null;
  }
}

export async function saveCredentials(creds: Credentials): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CREDENTIALS_PATH, JSON.stringify(creds, null, 2), "utf-8");
}

export async function deleteCredentials(): Promise<void> {
  try {
    await unlink(CREDENTIALS_PATH);
  } catch {
    // File doesn't exist, that's fine
  }
}
