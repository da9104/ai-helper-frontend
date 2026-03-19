# API Reference

All calls go through `frontend/lib/api.ts` which automatically attaches the Supabase JWT.

Base URL: `NEXT_PUBLIC_BACKEND_URL` (defaults to `http://localhost:8000`)

---

## Auth

Every request includes:
```
Authorization: Bearer <supabase-jwt>
Content-Type: application/json
```

---

## Endpoints

### `GET /tasks`
Fetch all Notion tasks for the authenticated user.

**Response:**
```json
{
  "tasks": [
    {
      "id": "notion-page-id",
      "title": "Task title",
      "status": "In progress",
      "assignee": "Name",
      "category": ["Engineering"],
      "description": "...",
      "date": "2024-01-15"
    }
  ]
}
```

**Notes:** Returns all entries from the user's Notion database. No status filtering.

---

### `GET /tasks/debug`
Debug endpoint to inspect Notion integration state.

**Response:**
```json
{
  "saved_database_id": "...",
  "accessible_databases": [{ "id": "...", "title": "..." }],
  "db_query_count": 5,
  "first_page_props": ["Title", "Status", "Assignee"]
}
```

---

### `POST /agent/run`
Run the AI agent with a user message.

**Body:**
```json
{
  "message": "Show me tasks in progress",
  "use_history": true
}
```

**Response:**
```json
{
  "response": "현재 진행 중인 작업은 다음과 같습니다..."
}
```

**Notes:**
- Uses `gpt-4o-mini` with function calling.
- Automatically uses persisted conversation history when `use_history: true`.
- Agent responds in Korean.

---

### `GET /slack/history?limit=20`
Fetch recent Slack posts logged to the DB.

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "channel": "all-todo-list",
      "title": "Daily Report",
      "body": "...",
      "posted_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

### `GET /oauth/status`
Returns integration connection status for the authenticated user.

**Response:**
```json
{
  "notion": true,
  "slack": false,
  "notion_database_id": "abc123"
}
```

---

### `POST /oauth/notion/init`
Initiates the Notion OAuth flow.

**Response:**
```json
{ "redirect_url": "https://..." }
```
The frontend redirects the browser to `redirect_url`. The JWT never appears in the browser address bar.

---

### `POST /oauth/slack/init`
Initiates the Slack OAuth flow. Same pattern as Notion.

---

### `PATCH /oauth/notion/database`
Manually set the Notion database ID for the user.

**Body:**
```json
{ "database_id": "notion-db-id" }
```

---

## TypeScript Interfaces

```typescript
interface NotionTask {
  id: string;
  title: string;
  status: string;
  assignee: string;
  category: string[];
  description: string;
  date: string;
}

interface SlackPost {
  id: string;
  channel: string;
  title: string;
  body: string;
  posted_at: string;
}

interface IntegrationStatus {
  notion: boolean;
  slack: boolean;
  notion_database_id: string;
}
```
