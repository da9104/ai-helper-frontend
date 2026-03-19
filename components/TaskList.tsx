"use client";

import { useEffect, useState } from "react";
import { api, type NotionTask } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  "In progress":  "bg-blue-500",
  "Not started":  "bg-gray-500",
  "To-do":        "bg-yellow-500",
  "Done":         "bg-green-500",
  "Complete":     "bg-emerald-500",
};

export default function TaskList({ connected }: { connected: boolean }) {
  const [tasks, setTasks]     = useState<NotionTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!connected) return;
    setLoading(true);
    setError(null);
    api.getTasks()
      .then((data) => setTasks(data.tasks))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [connected]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Notion Tasks
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && (
          <p className="text-xs text-gray-500 text-center py-4">Loading...</p>
        )}
        {!connected && (
          <div className="flex flex-col items-center gap-3 py-8 px-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="opacity-30">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.887l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
            </svg>
            <p className="text-xs text-gray-500 text-center">Connect Notion to see your tasks.</p>
            <button
              onClick={() => api.connectNotion()}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-4 py-2 rounded-xl border border-gray-700 transition-colors"
            >
              Connect Notion
            </button>
          </div>
        )}
        {connected && error && (
          <p className="text-xs text-red-400 text-center py-4">{error}</p>
        )}
        {!loading && !error && connected && tasks.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">No tasks found</p>
        )}
        {tasks.map((task) => (
          <div key={task.id} className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600 transition-colors">
            <div className="flex items-start gap-2">
              <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status] ?? "bg-gray-500"}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-gray-500">{task.status}</span>
                  {task.assignee && task.assignee !== "미배정" && (
                    <span className="text-xs text-gray-600">· {task.assignee}</span>
                  )}
                  {task.date && (
                    <span className="text-xs text-gray-600">· {task.date}</span>
                  )}
                  {task.category.map((c) => (
                    <span key={c} className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
