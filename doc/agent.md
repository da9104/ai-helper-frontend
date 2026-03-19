# AI Agent

## Overview

The agent is an OpenAI function-calling loop (`backend/agent.py`) that translates natural language requests into Notion and Slack actions.

- **Model:** `gpt-4o-mini`
- **Language:** Responds in Korean
- **Max iterations:** 10 (runaway guard)

---

## System Prompt Summary

The agent is instructed to:
1. Explain what it is about to do in one line before acting.
2. Decide the next step based on tool results.
3. Summarize results concisely when done.
4. Default to Slack channel `all-todo-list` when no channel is specified.
5. Always call `get_notion_tasks` before `update_notion_task_status` (to get the page ID first).

---

## Available Tools

All tools are built per-user by `build_tools()` in `backend/tools.py`.

### `get_notion_tasks`
Fetch all entries from the user's Notion database.

```
Parameters: none
Returns: JSON array of task objects
```

### `search_notion_tasks`
Filter Notion tasks by category, keyword, or date range.

```
Parameters:
  category          (string) — multi-select filter
  keyword           (string) — searches title + description
  date_on_or_after  (string) — ISO date
  date_on_or_before (string) — ISO date
Returns: JSON array of matching tasks
```

### `update_notion_task_status`
Change the status of an existing Notion page.

```
Parameters:
  page_id    (string, required)
  new_status (enum: "Not started" | "In progress" | "To-do" | "Done" | "Complete")
Returns: confirmation string
```

### `create_notion_task`
Create a new page in the Notion database.

```
Parameters:
  title   (string, required)
  content (string, required) — body text
  status  (enum, default: "Not started")
Returns: URL of created page
```

### `slack_post_message`
Post a formatted message to a Slack channel.

```
Parameters:
  channel (string, required)
  title   (string, required)
  body    (string, required)
  color   (string, default: "#4A90E2")
Returns: confirmation string (e.g. "#all-todo-list 전송 완료")
```
The message is sent as a Slack attachment with header, body, and an agent footer.
After posting, the `on_slack_post` callback saves the record to the DB.

### `slack_read_messages`
Read recent messages from a Slack channel (by channel ID).

```
Parameters:
  channel_id (string, required)
  limit      (integer, default: 5)
Returns: JSON array of message texts
```

---

## Conversation History

Conversation turns are persisted to Supabase and reloaded on each request when `use_history: true`. This gives the agent memory across chat sessions.

```python
history = get_conversation_history(user_id)
# → [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
```

After each run, both the user message and assistant response are saved via `save_conversation_turn()`.

---

## Slack Auto-Refresh

When the agent posts to Slack, the frontend detects success via keyword matching in the response:

```typescript
const SLACK_SUCCESS_PATTERNS = ["전송 완료", "슬랙", "slack", "발송"];
```

On match, `onSlackPost()` is called → `slackRefreshKey` increments → `SlackHistory` re-fetches.
