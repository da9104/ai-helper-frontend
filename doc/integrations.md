# Integrations

## Notion

### Connection Flow
1. User clicks "Connect Notion" → frontend calls `POST /oauth/notion/init`.
2. Backend generates a short-lived redirect URL (JWT stays in headers, never in the URL).
3. Browser is redirected to Notion's OAuth consent page.
4. Notion redirects back to the callback URL with an authorization code.
5. Backend exchanges the code for an access token and stores it in `user_integrations`.

### Database ID
After connecting, the user must provide their Notion database ID in Settings (`/settings`).
This is stored as `notion_datasource_id` and used in every `databases.query` call.

### SDK
Uses `notion-client` (Python SDK v2.2.1 — `ramnes/notion-sdk-py`).

**Important:** The SDK only exposes public Notion API endpoints:
- `notion.databases.query(database_id=...)` ✅
- `notion.pages.update(...)` ✅
- `notion.pages.create(...)` ✅
- `notion.data_sources.query(...)` ❌ — does not exist in the public API

### Notion Data Parsing (`_parse_page`)

The `_parse_page()` helper in `tools.py` safely extracts fields from a Notion page response.

| Field | Notion Property | Fallback |
|-------|----------------|----------|
| `title` | `Title`, `Name`, `이름`, `제목` | `(제목 없음)` |
| `status` | `Status.status.name` or `.select.name` | `알 수 없음` |
| `assignee` | `Created by`, `Assignee`, `생성자` | `미배정` |
| `category` | `Category.multi_select` or `.select` | `[]` |
| `date` | `Date.date.start` or `날짜.date.start` | `""` |
| `description` | `Description.rich_text` | `""` |

### Troubleshooting: No data returned

If `GET /tasks` returns an empty array:
1. Check Notion → Settings → Connections → confirm the integration has access to the database.
2. Verify the database ID in Settings matches the actual Notion database URL.
3. Use `GET /tasks/debug` to inspect what the backend can see.

---

## Slack

### Connection Flow
Same OAuth pattern as Notion — `POST /oauth/slack/init` → redirect → callback → token stored.

### Posting Messages
The agent calls `slack_post_message(channel, title, body)`.

Messages are sent as Slack **attachments** with:
- A `header` block (title)
- A `section` block (body in mrkdwn)
- A `context` block: `"🤖 AI Agent가 자동으로 발송했습니다"`

Default channel: `all-todo-list`

### History Logging
Every successful Slack post is saved to the `slack_posts` table in Supabase via `on_slack_post` callback. This is what `GET /slack/history` reads — it does **not** call the Slack API to read messages.

### `slack_read_messages`
This tool reads live messages from Slack via `conversations.history`. It requires the Slack channel **ID** (e.g. `C012AB3CD`), not the name.
