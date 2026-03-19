"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import TaskList from "@/components/TaskList";
import ChatPanel from "@/components/ChatPanel";
import SlackHistory from "@/components/SlackHistory";
import type { User } from "@supabase/supabase-js";

export default function Dashboard() {
  const [user, setUser]               = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);
  const [notionConnected, setNotion]  = useState(false);
  const [slackConnected, setSlack]    = useState(false);
  const [slackRefreshKey, setSlackRefreshKey] = useState(0);
  const router  = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      api.getIntegrationStatus()
        .then((s) => { setNotion(s.notion); setSlack(s.slack); })
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [router, supabase.auth]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function debugNotion() {
    try {
      const result = await api.debugTasks();
      console.log("Notion debug:", result);
      alert(JSON.stringify(result, null, 2));
    } catch (e) {
      alert("Debug error: " + (e as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">
            AI
          </div>
          <span className="text-sm font-semibold text-gray-200">AI Helper</span>
        </div>
        <div className="flex items-center gap-4">
          {/* <button
            onClick={debugNotion}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Debug
          </button> */}
          <a
            href="/settings"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Settings
          </a>
          <span className="text-xs text-gray-600">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* 3-panel dashboard */}
      <main className="flex flex-1 min-h-0 gap-0 divide-x divide-gray-800">
        {/* Left: Notion Tasks */}
        <div className="w-[28%] flex flex-col p-4 min-h-0">
          <TaskList connected={notionConnected} />
        </div>

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col p-4 min-h-0">
          <ChatPanel onSlackPost={() => setSlackRefreshKey((k) => k + 1)} />
        </div>

        {/* Right: Slack History */}
        <div className="w-[28%] flex flex-col p-4 min-h-0">
          <SlackHistory connected={slackConnected} refreshKey={slackRefreshKey} />
        </div>
      </main>
    </div>
  );
}
