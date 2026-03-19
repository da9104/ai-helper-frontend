"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { api, type IntegrationStatus } from "@/lib/api";

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
        connected
          ? "bg-green-500/15 text-green-400"
          : "bg-gray-700 text-gray-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-gray-500"}`} />
      {connected ? "Connected" : "Not connected"}
    </span>
  );
}

function SettingsContent() {
  const [status, setStatus]       = useState<IntegrationStatus | null>(null);
  const [loading, setLoading]     = useState(true);
  const [dbId, setDbId]           = useState("");
  const [dbSaving, setDbSaving]   = useState(false);
  const [dbSaved, setDbSaved]     = useState(false);
  const [dbError, setDbError]     = useState<string | null>(null);
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const supabase      = createClient();

  // Read success query params from OAuth redirects
  const notionConnected = searchParams.get("notion") === "connected";
  const slackConnected  = searchParams.get("slack") === "connected";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      api.getIntegrationStatus()
        .then((s) => { setStatus(s); setDbId(s.notion_database_id ?? ""); })
        .catch(() => setStatus({ notion: false, slack: false, notion_database_id: "" }))
        .finally(() => setLoading(false));
    });
  }, [router, supabase.auth, notionConnected, slackConnected]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  async function saveDbId() {
    setDbSaving(true);
    setDbError(null);
    setDbSaved(false);
    try {
      await api.saveNotionDatabaseId(dbId);
      setDbSaved(true);
      setTimeout(() => setDbSaved(false), 3000);
    } catch (e) {
      setDbError((e as Error).message);
    } finally {
      setDbSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <a href="/" className="text-gray-600 hover:text-gray-400 text-sm">
          &larr; Dashboard
        </a>
      </div>

      <h1 className="text-2xl font-semibold text-gray-100 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Connect your Notion and Slack accounts.</p>

      <div className="space-y-4">
        {/* Notion */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.887l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
                </svg>
                <h3 className="text-sm font-semibold text-gray-200">Notion</h3>
              </div>
              <p className="text-xs text-gray-500">Access your Notion databases and tasks.</p>
            </div>
            <StatusBadge connected={status?.notion ?? false} />
          </div>
          <button
            onClick={() => api.connectNotion()}
            className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium py-2.5 rounded-xl transition-colors border border-gray-700"
          >
            {status?.notion ? "Reconnect Notion" : "Connect Notion"}
          </button>

          {status?.notion && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Notion Database ID
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Found in your database URL: notion.so/.../<span className="text-gray-500">{"<database-id>"}</span>?v=...
              </p>
              <div className="flex gap-2">
                <input
                  value={dbId}
                  onChange={(e) => setDbId(e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
                <button
                  onClick={saveDbId}
                  disabled={dbSaving || !dbId.trim()}
                  className="px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {dbSaving ? "Saving…" : dbSaved ? "Saved ✓" : "Save"}
                </button>
              </div>
              {dbError && <p className="text-xs text-red-400 mt-1.5">{dbError}</p>}
            </div>
          )}
        </div>

        {/* Slack */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
                </svg>
                <h3 className="text-sm font-semibold text-gray-200">Slack</h3>
              </div>
              <p className="text-xs text-gray-500">Post messages to your Slack workspace.</p>
            </div>
            <StatusBadge connected={status?.slack ?? false} />
          </div>
          <button
            onClick={() => api.connectSlack()}
            className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium py-2.5 rounded-xl transition-colors border border-gray-700"
          >
            {status?.slack ? "Reconnect Slack" : "Connect Slack"}
          </button>
        </div>
      </div>

      {(notionConnected || slackConnected) && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-400">
          {notionConnected && "Notion connected successfully. "}
          {slackConnected && "Slack connected successfully."}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
