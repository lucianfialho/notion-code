# notion-code

**Claude Code for Notion** — manage your entire Notion workspace from the terminal using natural language.

Like Claude Code talks to your codebase, notion-code talks to your Notion workspace.

```
notion-code> create a project tracker with Name, Status, Priority, and Due Date
[Creating database "Project Tracker"...]
Done! Created database with 4 properties.

notion-code> add three sample tasks to it
[Creating pages in "Project Tracker"...]
Created 3 tasks: "Setup CI/CD", "Design review", "Write documentation"

notion-code> show me everything due this week
[Searching workspace...]
Found 5 items due this week across 2 databases...
```

## How it works

notion-code uses the **Claude Agent SDK** as its AI engine and **Notion MCP** as the tool layer. You type in natural language, Claude decides which Notion operations to perform, and executes them through the MCP protocol.

```
You (terminal) → Claude Agent SDK → Notion MCP Server → Notion API
```

## Install

```bash
npm install -g notion-code
```

## Requirements

- Node.js >= 18
- [Claude Code](https://claude.ai/code) subscription (powers the Agent SDK)
- Notion account

## Quick Start

### Option 1: OAuth (recommended)

```bash
# Set up your Notion integration credentials
export NOTION_CLIENT_ID=your_client_id
export NOTION_CLIENT_SECRET=your_client_secret

# Authenticate
notion-code auth login
```

### Option 2: Direct token (for internal integrations)

```bash
export NOTION_TOKEN=ntn_your_integration_token
```

Then start using it:

```bash
# Interactive mode
notion-code

# Single command
notion-code -p "list all databases in my workspace"

# JSON output (for scripting)
notion-code -p "find pages about marketing" --output-format json
```

## Usage

### Interactive mode

```bash
notion-code
```

Opens a REPL where you can have a conversation with your Notion workspace:

```
notion-code> find all pages about Q1 planning
notion-code> summarize the Engineering Roadmap database
notion-code> create a meeting notes page for today
notion-code> update the status of "Auth Redesign" to Done
notion-code> move all archived pages to a 2024 folder
```

### Single prompt mode

```bash
notion-code -p "how many tasks are overdue?"
notion-code -p "create a sprint board for next week" --output-format json
```

### Auth management

```bash
notion-code auth login    # OAuth flow
notion-code auth logout   # Clear credentials
notion-code auth status   # Show connection info
```

## What you can do

| Action | Example |
|--------|---------|
| **Search** | "find all pages about marketing" |
| **Read** | "what's in the Engineering Roadmap database?" |
| **Create** | "create a project tracker with Name, Status, Priority" |
| **Edit** | "update the status of Auth Redesign to Done" |
| **Organize** | "move archived pages to a 2024 folder" |
| **Comment** | "add a comment on Q1 Review saying approved" |

## How is this different from other Notion CLIs?

Existing Notion CLIs are API wrappers — structured commands for structured operations. notion-code is an **AI agent** that understands natural language, maintains conversation context, and can chain multiple operations to accomplish complex tasks.

| | Traditional CLI | notion-code |
|---|---|---|
| Input | `notion-cli page create --title "X"` | "create a page about the new project" |
| Multi-step | One command = one action | "reorganize my workspace by quarter" |
| Context | Stateless | Remembers conversation |
| AI | None | Claude as reasoning engine |

## Built with

- [Claude Agent SDK](https://docs.anthropic.com/en/docs/claude-code/sdk) — AI agent loop
- [Notion MCP](https://github.com/notionhq/notion-mcp-server) — Notion API via Model Context Protocol
- TypeScript

## License

MIT
