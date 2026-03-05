*This is a submission for the [Notion MCP Challenge](https://dev.to/challenges/notion-2026-03-04)*

## What I Built

**notion-architect** — describe your business, get a complete Notion workspace.

A CLI tool that takes a plain-text business description and creates a fully structured Notion workspace in seconds — databases with rich schemas, pages with real content, SOPs, templates, sample data, and a dashboard linking everything together.

```
$ notion-architect "saas startup building a CRM"

  ✔ 🚀 CRM Startup — Home (page)
  ✔ 🗺️ Product Roadmap (database)
  ✔ 🏃 Sprint Board (database)
  ✔ 💡 Feature Requests (database)
  ✔ 🐛 Bug Tracker (database)
  ✔ 🎯 OKRs (database)
  ✔ 👥 Hiring Pipeline (database)
  ✔ 💰 Investor Tracker (database)
  ✔ 📋 Release Notes (page)
  ✔ 📝 Meeting Notes (page)

  ✨ Workspace ready! 10 items created.
```

The tool detects your industry (SaaS, agency, e-commerce, freelancer, restaurant, etc.), plans the right workspace structure, and creates everything via the Notion API — all in one command. It even adapts to the user's language: describe your business in Portuguese, get a Portuguese workspace.

### What makes it different

This isn't a template gallery or a generic AI chat. notion-architect is a **specialized agent** that:

- **Understands business context** — "marketing agency with 5 clients" produces a completely different workspace than "SaaS startup building a CRM"
- **Creates production-ready structures** — databases have proper property types (select, multi-select, date, person, relations), pre-populated with industry-relevant options
- **Fills the workspace with content** — sample data, SOPs with real instructions, templates, and a Home dashboard connecting everything
- **Shows progress in real-time** — clickable Notion links appear as each item is created

## Demo

<!-- TODO: Add demo video/gif -->

## Show us the code

**GitHub**: [github.com/lucianfialho/notion-code](https://github.com/lucianfialho/notion-code)

Key files:
- [`src/agent.ts`](https://github.com/lucianfialho/notion-code/blob/main/src/agent.ts) — Agent SDK integration with Notion MCP
- [`src/system-prompt.ts`](https://github.com/lucianfialho/notion-code/blob/main/src/system-prompt.ts) — Workspace architecture prompt
- [`src/index.ts`](https://github.com/lucianfialho/notion-code/blob/main/src/index.ts) — CLI with interactive mode and progress display

## How I Used Notion MCP

Notion MCP is the **entire execution layer** of notion-architect. The architecture:

```
Business description → Claude Agent SDK → Notion MCP Server → Notion API
```

The CLI uses the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) to create an AI agent with a specialized system prompt for workspace architecture. The official **Notion MCP server** (`@notionhq/notion-mcp-server`) is connected as the tool provider via stdio.

When you run `notion-architect "marketing agency with 5 clients"`:

1. The agent receives the description + system prompt with workspace architecture rules
2. It plans the workspace structure based on the industry (agency → client tracker, project pipeline, content calendar, etc.)
3. It creates a Home page first, then creates each database and sub-page as children using MCP tools
4. For each database, it defines the schema (property types, select options) and adds sample entries
5. It creates SOP pages with real, useful content
6. Each created item is reported back with its Notion URL for real-time progress display

The Notion MCP tools used:
- **`notion-search`** — find existing pages to understand workspace context
- **`notion-create-pages`** — create pages with content and properties, create database entries with sample data
- **`notion-create-database`** — create databases with full schemas (select options, property types, relations)
- **`notion-update-page`** — update page content with rich Notion-flavored Markdown

The agent makes 15-25 MCP tool calls per workspace, creating a complete, interconnected structure that would take a human 30-60 minutes to set up manually.

### OAuth Integration

notion-architect implements the full Notion OAuth 2.0 flow — users authenticate via browser, the CLI receives the token via a local callback server, and credentials are stored securely at `~/.notion-code/credentials.json`. This means the tool works with any Notion workspace without requiring users to manually create API tokens.
