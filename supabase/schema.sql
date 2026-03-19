-- ============================================================
-- Supabase Schema for AI Helper Web
-- Run this in the Supabase SQL Editor
-- ============================================================

-- user_integrations: stores per-user Notion + Slack tokens
create table if not exists user_integrations (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users(id) on delete cascade unique,
  notion_access_token  text,
  notion_workspace_id  text,
  notion_datasource_id text,
  slack_bot_token      text,
  slack_channel        text,
  updated_at           timestamptz default now()
);

-- RLS
alter table user_integrations enable row level security;

create policy "Users can view own integrations"
  on user_integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert own integrations"
  on user_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own integrations"
  on user_integrations for update
  using (auth.uid() = user_id);


-- agent_conversations: chat history per user
create table if not exists agent_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  role       text check (role in ('user', 'assistant')),
  content    text,
  created_at timestamptz default now()
);

alter table agent_conversations enable row level security;

create policy "Users can view own conversations"
  on agent_conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on agent_conversations for insert
  with check (auth.uid() = user_id);


-- slack_post_history: records of Slack messages sent by the agent
create table if not exists slack_post_history (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references auth.users(id) on delete cascade,
  channel   text,
  title     text,
  body      text,
  posted_at timestamptz default now()
);

alter table slack_post_history enable row level security;

create policy "Users can view own slack history"
  on slack_post_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own slack history"
  on slack_post_history for insert
  with check (auth.uid() = user_id);
