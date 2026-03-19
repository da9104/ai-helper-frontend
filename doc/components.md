# Frontend Components

All components live in `frontend/components/` and are `"use client"` React components.

---

## `ChatPanel.tsx`

**Purpose:** Main chat interface for interacting with the AI agent.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `onSlackPost` | `() => void` (optional) | Called when the agent successfully posts to Slack |

**Key behaviors:**
- Renders a 2×2 grid of clickable prompt chips when the chat history is empty (quick-start state).
- Sends messages to `POST /agent/run` via `api.runAgent()`.
- Detects Slack post success by scanning the agent response for Korean/English keywords: `"전송 완료"`, `"슬랙"`, `"slack"`, `"발송"`.
- On detection, calls `onSlackPost()` to trigger a Slack history refresh in the parent.
- Handles `401` errors by showing inline Notion/Slack connect buttons.
- Supports `Enter` to send, `Shift+Enter` for newline.

**Slack detection pattern:**
```typescript
const SLACK_SUCCESS_PATTERNS = ["전송 완료", "슬랙", "slack", "발송"];
if (onSlackPost && SLACK_SUCCESS_PATTERNS.some((p) => lower.includes(p))) {
  onSlackPost();
}
```

---

## `TaskList.tsx`

**Purpose:** Displays all Notion tasks for the connected database.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `connected` | `boolean` | Whether Notion is connected |

**Key behaviors:**
- Fetches all tasks from `GET /tasks` when `connected` becomes `true`.
- No status filtering — all entries from the Notion database are returned.
- Shows status dot (colored), title, description preview, assignee, date, and category tags.
- Prompts to connect Notion if `connected` is `false`.

**Status color map:**
```typescript
const STATUS_COLORS = {
  "In progress": "bg-blue-500",
  "Not started": "bg-gray-500",
  "To-do":       "bg-yellow-500",
  "Done":        "bg-green-500",
  "Complete":    "bg-emerald-500",
};
```

---

## `SlackHistory.tsx`

**Purpose:** Shows a log of Slack messages posted by the agent.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `connected` | `boolean` | Whether Slack is connected |
| `refreshKey` | `number` (optional) | Increment to trigger a re-fetch |

**Key behaviors:**
- Fetches from `GET /slack/history` when `connected` is `true`.
- Re-fetches whenever `refreshKey` changes — used by `page.tsx` to auto-refresh after agent Slack posts.
- Manual "Refresh" button available in the header.
- Shows title, body preview, channel name, and formatted date/time.

**Auto-refresh wiring:**
```tsx
// page.tsx
<ChatPanel onSlackPost={() => setSlackRefreshKey((k) => k + 1)} />
<SlackHistory connected={slackConnected} refreshKey={slackRefreshKey} />
```

---

## Page: `app/page.tsx` (Dashboard)

**Purpose:** Root dashboard with 3-panel layout.

**Layout:**
```
┌─────────────┬──────────────────┬─────────────┐
│ Notion Tasks│   Chat (Agent)   │Slack History│
│   (28%)     │    (flex-1)      │   (28%)     │
└─────────────┴──────────────────┴─────────────┘
```

**State managed:**
| State | Purpose |
|-------|---------|
| `user` | Supabase user object |
| `notionConnected` | Whether Notion integration is set up |
| `slackConnected` | Whether Slack integration is set up |
| `slackRefreshKey` | Incremented to trigger SlackHistory reload |

**On mount:** Checks Supabase session → redirects to `/login` if unauthenticated → fetches integration status.
