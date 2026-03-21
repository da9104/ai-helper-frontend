"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import TaskList from "@/components/TaskList";
import ChatPanel from "@/components/ChatPanel";
import SlackHistory from "@/components/SlackHistory";
import { useTheme } from "@/components/ThemeProvider";
import type { User } from "@supabase/supabase-js";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {theme === "light" ? (
        /* Moon icon */
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ) : (
        /* Sun icon */
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  );
}

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
            AI
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Helper</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/settings"
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Settings
          </a>
          <span className="text-xs text-gray-400 dark:text-gray-600">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* 3-panel dashboard */}
      <main className="flex flex-1 min-h-0 gap-0 divide-x divide-gray-200 dark:divide-gray-800">
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
