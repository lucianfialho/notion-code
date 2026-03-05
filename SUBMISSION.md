*This is a submission for the [Notion MCP Challenge](https://dev.to/challenges/notion-2026-03-04)*

## What I Built

**notion-code** — Claude Code for Notion.

An interactive CLI where you manage your entire Notion workspace through natural language, right from your terminal. Think of it as Claude Code, but instead of your codebase, your environment is your Notion workspace.

```
notion-code> create a project tracker with Name, Status, Priority, and Due Date
[Creating database "Project Tracker"...]
Done!

notion-code> show me everything due this week
[Searching workspace...]
Found 5 items due this week across 2 databases...
```

You can search, read, create, edit, organize, and comment on anything in your Notion workspace — all through conversation. The AI agent understands context, chains multiple operations, and remembers what you asked previously.

### Key features:
- **Interactive REPL** — multi-turn conversations with your workspace
- **Single prompt mode** — `notion-code -p "query"` for scripts and pipelines
- **Workspace awareness** — indexes your databases and pages for smarter responses
- **OAuth authentication** — secure browser-based login flow
- **Full CRUD** — search, create pages, create databases, edit, move, comment

## Video Demo

<!-- TODO: Record with terminalizer and upload -->

## Show us the code

<!-- TODO: Add GitHub repo URL after push -->

## How I Used Notion MCP

Notion MCP is the **entire tool layer** of notion-code. The architecture is:

```
User (terminal) → Claude Agent SDK → Notion MCP Server → Notion API
```

The CLI uses the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) to create an AI agent, and connects the official **Notion MCP server** (`@notionhq/notion-mcp-server`) as its tool provider via stdio.

When you type something like "create a sprint board for next week", here's what happens:

1. Your input goes to the Claude Agent SDK
2. Claude interprets the intent and decides to call `notion-search` (to check for existing boards), then `notion-create-pages` (to create the database and entries)
3. Each tool call goes through the Notion MCP server, which translates it to Notion API calls
4. Results flow back through the agent loop
5. Claude summarizes what happened and streams the response to your terminal

The MCP tools used include:
- `notion-search` — semantic search across the workspace
- `notion-fetch` — read pages, databases, data sources
- `notion-create-pages` — create pages with content and properties
- `notion-create-database` — create databases with schemas
- `notion-update-page` — edit content, properties
- `notion-move-pages` — reorganize content
- `notion-create-comment` — add comments to pages
- `notion-get-users` / `notion-get-teams` — workspace members

What makes this different from other Notion CLIs: those are API wrappers with structured commands. notion-code is an **AI agent** — it reasons about your request, decides which MCP tools to call (and in what order), handles errors, and maintains conversation context. The Notion MCP server gives it the full power of the Notion API without any custom API code.
