# Architecture Overview

## Project Structure

```
ai-helper-web/
├── frontend/          # Next.js 14 App Router (TypeScript + Tailwind)
│   ├── app/           # Pages (App Router)
│   ├── components/    # Shared UI components
│   ├── lib/           # Utilities (API client, Supabase client)
│   └── doc/           # This documentation
└── backend/           # FastAPI (Python)
    ├── routers/       # Route handlers
    ├── middleware/    # Auth middleware
    ├── agent.py       # OpenAI agentic loop
    ├── tools.py       # Notion + Slack tool factory
    └── db.py          # Supabase DB helpers
```

## System Architecture

```
Browser (Next.js)
    │
    │  JWT (Supabase)
    ▼
FastAPI Backend
    ├── /agent/run   → agent.py (OpenAI GPT-4o-mini loop)
    │                       └── tools.py (Notion + Slack)
    ├── /tasks       → Notion databases.query
    ├── /slack/history → DB records of past posts
    └── /oauth/*     → Notion & Slack OAuth flows
    │
    ▼
Supabase (PostgreSQL)
    ├── users / sessions (auth)
    ├── user_integrations (tokens, datasource IDs)
    ├── conversation_history (chat turns)
    └── slack_posts (history log)
```

## Authentication Flow

1. User signs in via Supabase Auth (email/password or OAuth).
2. Supabase issues a JWT stored in the browser session.
3. Every API call from `lib/api.ts` attaches the JWT as `Authorization: Bearer <token>`.
4. FastAPI's `middleware/auth.py` verifies the JWT and extracts `user_id`.
5. `user_id` is used to look up per-user tokens from `user_integrations`.

## Per-User Credential Pattern

Notion and Slack tokens are stored per user in the database. The `build_tools()` factory in `tools.py` accepts these at request time and returns scoped tool functions — no global tokens are used.

```python
tool_functions, tool_specs = build_tools(
    notion_token=...,
    datasource_id=...,
    slack_token=...,
    slack_channel=...,
    on_slack_post=callback,
)
```
