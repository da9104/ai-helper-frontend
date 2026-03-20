# AI Helper — Documentation

> Last updated: 2026-03-19
>

## Screenshot
<img width="1497" height="802" alt="image" src="https://github.com/user-attachments/assets/2dffd0ed-1de3-4a96-9118-3f90856f3824" />


## Contents

| File | Description |
|------|-------------|
| [architecture.md](doc/architecture.md) | System architecture, folder structure, auth flow |
| [components.md](doc/components.md) | Frontend component reference (props, behaviors, patterns) |
| [api.md](doc/api.md) | Backend API endpoints and TypeScript interfaces |
| [agent.md](doc/agent.md) | AI agent loop, available tools, conversation history |
| [integrations.md](doc/integrations.md) | Notion and Slack integration details and troubleshooting |

---

## Quick Summary

AI Helper is a 3-panel dashboard that lets users:
1. **View Notion tasks** (left panel) — synced from a connected Notion database.
2. **Chat with an AI agent** (center panel) — natural language → Notion + Slack actions.
3. **See Slack history** (right panel) — log of messages posted by the agent.

### Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python), OpenAI `gpt-4o-mini`
- **Database:** Supabase (PostgreSQL + Auth)
- **Integrations:** Notion API (OAuth), Slack API (OAuth)

### Key Design Decisions
- **Per-user credentials:** All Notion/Slack tokens are stored per user; `build_tools()` creates scoped tool functions at request time.
- **No global state for tokens:** Tokens are never read from environment variables at runtime — only stored in the DB and injected per request.
- **Slack auto-refresh:** When the agent posts to Slack, the frontend detects success keywords in the response and increments a `refreshKey` prop to trigger SlackHistory to re-fetch.
