/**
 * api.ts — fetch helpers for the FastAPI backend
 * Automatically attaches the Supabase session JWT to every request.
 */

import { createClient } from "./supabase";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── API helpers ───────────────────────────────────────────────────────────────

export interface NotionTask {
  id: string;
  title: string;
  status: string;
  assignee: string;
  category: string[];
  description: string;
  date: string;
}

export interface SlackPost {
  id: string;
  channel: string;
  title: string;
  body: string;
  posted_at: string;
}

export interface IntegrationStatus {
  notion: boolean;
  slack: boolean;
  notion_database_id: string;
}

export const api = {
  debugTasks: () =>
    apiFetch<{
      saved_database_id: string;
      accessible_databases?: { id: string; title: string }[];
      db_query_count?: number;
      first_page_props?: string[];
      db_query_error?: string;
      search_error?: string;
    }>("/tasks/debug"),

  getTasks: () =>
    apiFetch<{ tasks: NotionTask[] }>("/tasks"),

  getSlackHistory: (limit = 20) =>
    apiFetch<{ posts: SlackPost[] }>(`/slack/history?limit=${limit}`),

  runAgent: (message: string, useHistory = true) =>
    apiFetch<{ response: string }>("/agent/run", {
      method: "POST",
      body: JSON.stringify({ message, use_history: useHistory }),
    }),

  getIntegrationStatus: () =>
    apiFetch<IntegrationStatus>("/oauth/status"),

  saveNotionDatabaseId: (database_id: string) =>
    apiFetch<{ ok: boolean }>("/oauth/notion/database", {
      method: "PATCH",
      body: JSON.stringify({ database_id }),
    }),

  saveNotionApiKey: (api_key: string) =>
    apiFetch<{ ok: boolean }>("/oauth/notion/apikey", {
      method: "PATCH",
      body: JSON.stringify({ api_key }),
    }),

  connectNotion: async () => {
    // POST with Authorization header → get a short-lived opaque redirect URL
    // (JWT never appears in the browser address bar or server logs)
    const { redirect_url } = await apiFetch<{ redirect_url: string }>("/oauth/notion/init", {
      method: "POST",
    });
    window.location.href = redirect_url;
  },

  connectSlack: async () => {
    const { redirect_url } = await apiFetch<{ redirect_url: string }>("/oauth/slack/init", {
      method: "POST",
    });
    window.location.href = redirect_url;
  },
};
