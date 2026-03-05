# notion-architect

**Describe your business. Get a complete Notion workspace.**

One command turns a business description into a fully structured Notion workspace — databases, pages, SOPs, templates, and sample data — all wired together and ready to use.

```
$ notion-architect "marketing agency with 5 clients"

  🏗️  notion-architect v0.1.0
  Describe your business. Get a workspace.

  Workspace: Personal

  ✔ 🚀 Agency HQ — Marketing Agency (page)
    → https://notion.so/abc123
  ✔ 👥 Client Tracker (database)
    → https://notion.so/def456
  ✔ 🗂️ Project Pipeline (database)
    → https://notion.so/ghi789
  ✔ 📅 Content Calendar (database)
    → https://notion.so/jkl012
  ✔ 🧾 Invoice Log (database)
    → https://notion.so/mno345
  ✔ 📝 Meeting Notes (page)
    → https://notion.so/pqr678

  ✨ Workspace ready! 6 items created.

  Open in Notion: https://notion.so/abc123
```

## How it works

```
You (describe business) → Claude Agent SDK → Notion MCP Server → Notion API
```

1. You describe your business, project, or team in plain text
2. An AI agent analyzes your description and plans the ideal workspace structure
3. The agent creates everything in Notion via the official MCP server
4. You get a complete, ready-to-use workspace with clickable links

The agent adapts to your industry — SaaS, agency, e-commerce, freelancer, restaurant, startup, and more. It creates databases with proper property types, pre-populated select options, sample data, SOPs with real content, and a Home dashboard linking everything together.

## Install

```bash
npm install -g notion-architect
```

## Requirements

- Node.js >= 18
- [Claude Code](https://claude.ai/code) subscription (powers the Agent SDK)
- Notion account

## Quick Start

### 1. Set up Notion integration

Create an OAuth integration at [notion.so/my-integrations](https://www.notion.so/my-integrations), then:

```bash
# Create a .env file in the project directory, or export:
export NOTION_CLIENT_ID=your_client_id
export NOTION_CLIENT_SECRET=your_client_secret
```

### 2. Authenticate

```bash
notion-architect auth login
```

This opens your browser for OAuth authorization. Select the workspace you want to use.

### 3. Build a workspace

```bash
# With args
notion-architect "saas startup building a CRM"

# Interactive mode
notion-architect
```

## Usage

### Interactive mode (no args)

```
$ notion-architect

  🏗️  notion-architect v0.1.0
  Describe your business. Get a workspace.

  Examples:
    "marketing agency with 5 clients"
    "saas startup building a CRM"
    "freelance designer tracking projects"
    "restaurante com 3 unidades"

  Describe your business: _
```

### Direct mode

```bash
notion-architect "freelance designer tracking projects"
notion-architect "restaurante com 3 unidades"
notion-architect "e-commerce store selling electronics"
```

### Auth management

```bash
notion-architect auth login    # OAuth flow (opens browser)
notion-architect auth logout   # Clear stored credentials
notion-architect auth status   # Show connection info
```

## What gets created

The agent adapts the workspace to your industry:

| Industry | What you get |
|----------|-------------|
| **Agency** | Client tracker, Project pipeline, Content calendar, Invoicing, Meeting notes |
| **SaaS** | Product roadmap, Bug tracker, Sprint board, Feature requests, Release notes |
| **E-commerce** | Product catalog, Order tracker, Inventory, Supplier contacts |
| **Freelancer** | Client CRM, Project tracker, Invoice log, Time tracking, Portfolio |
| **Startup** | OKRs, Sprint board, Hiring pipeline, Investor tracker |
| **Restaurant** | Menu database, Inventory, Staff schedule, Supplier contacts, Recipe book |

Every workspace includes:
- A **Home/Dashboard** page linking everything
- Databases with **rich property types** (select, multi-select, date, person, relations)
- **Pre-populated options** relevant to your industry
- **Sample data** (2-3 entries per database) so the workspace feels alive
- **SOPs and templates** with real, useful content
- Content in **your language** (write in Portuguese, get Portuguese workspace)

## Built with

- [Claude Agent SDK](https://docs.anthropic.com/en/docs/claude-code/sdk) — AI agent loop
- [Notion MCP Server](https://github.com/notionhq/notion-mcp-server) — Notion API via Model Context Protocol
- TypeScript, Commander.js, Ora, Ink

## License

MIT
