# Privacy Policy — notion-code

**Last updated:** March 5, 2026

## What notion-code does

notion-code is an open-source CLI tool that connects to your Notion workspace via the Notion API. It uses the Claude Agent SDK to interpret natural language commands and execute Notion operations.

## Data we collect

**None.** notion-code does not collect, store, or transmit any user data to third parties.

## Data that stays on your machine

- **Notion OAuth token**: stored locally at `~/.notion-code/credentials.json`
- **Workspace cache**: stored locally at `~/.notion-code/cache/workspace.json`

These files never leave your computer.

## Third-party services

notion-code communicates with:

1. **Notion API** (`api.notion.com`) — to read and write your workspace data, using your authorized token
2. **Anthropic API** (via Claude Agent SDK) — to process your natural language commands

Your Notion data is sent to Anthropic's API for processing as part of the AI agent loop. Anthropic's privacy policy applies to that processing: https://www.anthropic.com/privacy

## Data deletion

Run `notion-code auth logout` to delete all locally stored credentials. You can also manually delete `~/.notion-code/`.

To revoke API access, remove the integration from your Notion workspace settings.

## Contact

For questions, open an issue at https://github.com/lucianfialho/notion-code/issues
