import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface WorkspaceContext {
  workspace_name: string;
  indexed_at: number;
  databases: Array<{
    id: string;
    title: string;
    properties: string[];
  }>;
  top_pages: Array<{
    id: string;
    title: string;
  }>;
}

const CACHE_DIR = join(homedir(), ".notion-code", "cache");
const CACHE_PATH = join(CACHE_DIR, "workspace.json");
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getCachedContext(): Promise<WorkspaceContext | null> {
  try {
    const data = await readFile(CACHE_PATH, "utf-8");
    const ctx = JSON.parse(data) as WorkspaceContext;
    if (Date.now() - ctx.indexed_at > CACHE_TTL_MS) return null;
    return ctx;
  } catch {
    return null;
  }
}

export async function cacheContext(ctx: WorkspaceContext): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(ctx, null, 2), "utf-8");
}

export async function indexWorkspace(token: string, workspaceName: string): Promise<WorkspaceContext> {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  // Fetch databases
  const dbResponse = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers,
    body: JSON.stringify({
      filter: { value: "database", property: "object" },
      page_size: 50,
    }),
  });

  const databases: WorkspaceContext["databases"] = [];
  if (dbResponse.ok) {
    const dbData = (await dbResponse.json()) as {
      results: Array<{
        id: string;
        title?: Array<{ plain_text: string }>;
        properties?: Record<string, { name: string }>;
      }>;
    };
    for (const db of dbData.results) {
      const title = db.title?.map((t) => t.plain_text).join("") || "Untitled";
      const properties = db.properties
        ? Object.values(db.properties).map((p) => p.name)
        : [];
      databases.push({ id: db.id, title, properties });
    }
  }

  // Fetch top-level pages
  const pageResponse = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers,
    body: JSON.stringify({
      filter: { value: "page", property: "object" },
      page_size: 30,
    }),
  });

  const top_pages: WorkspaceContext["top_pages"] = [];
  if (pageResponse.ok) {
    const pageData = (await pageResponse.json()) as {
      results: Array<{
        id: string;
        properties?: Record<
          string,
          { title?: Array<{ plain_text: string }> }
        >;
      }>;
    };
    for (const page of pageData.results) {
      const titleProp = page.properties
        ? Object.values(page.properties).find((p) => p.title)
        : undefined;
      const title = titleProp?.title?.map((t) => t.plain_text).join("") || "Untitled";
      top_pages.push({ id: page.id, title });
    }
  }

  const ctx: WorkspaceContext = {
    workspace_name: workspaceName,
    indexed_at: Date.now(),
    databases,
    top_pages,
  };

  await cacheContext(ctx);
  return ctx;
}
