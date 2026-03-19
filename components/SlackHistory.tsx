"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type SlackPost } from "@/lib/api";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function SlackHistory({ connected, refreshKey }: { connected: boolean; refreshKey?: number }) {
  const [posts, setPosts]   = useState<SlackPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSlackHistory();
      setPosts(data.posts);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (connected) load(); }, [connected, load, refreshKey]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Slack History
        </h2>
        <button
          onClick={load}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && (
          <p className="text-xs text-gray-500 text-center py-4">Loading...</p>
        )}
        {!connected && (
          <div className="flex flex-col items-center gap-3 py-8 px-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="opacity-40">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
            </svg>
            <p className="text-xs text-gray-500 text-center">Connect Slack to see your message history.</p>
            <button
              onClick={() => api.connectSlack()}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-4 py-2 rounded-xl border border-gray-700 transition-colors"
            >
              Connect Slack
            </button>
          </div>
        )}
        {connected && error && (
          <p className="text-xs text-red-400 text-center py-4">{error}</p>
        )}
        {!loading && !error && posts.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">
            No posts yet. Ask the agent to send something to Slack.
          </p>
        )}
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-gray-200 truncate">{post.title}</p>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">{formatDate(post.posted_at)}</p>
                <p className="text-xs text-gray-600">{formatTime(post.posted_at)}</p>
              </div>
            </div>
            {post.body && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-3">{post.body}</p>
            )}
            {post.channel && (
              <p className="text-xs text-blue-500/70 mt-1">#{post.channel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
