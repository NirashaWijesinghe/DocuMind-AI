"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  ChevronRight,
  Sparkles,
  MessageSquareDashed
} from "lucide-react";
import { ChatSession } from "../lib/api";

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  isLoading?: boolean;
}

export default function ChatHistorySidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isLoading = false,
}: ChatHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-xl">
      {/* Sidebar Header & New Chat Button */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Conversations</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded-full">
            {sessions.length} saved
          </span>
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Search Bar */}
        {sessions.length > 3 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Recents Section Header */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          Recents
        </h4>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 custom-scrollbar">
        {filteredSessions.length === 0 ? (
          <div className="py-8 text-center px-4">
            <MessageSquareDashed className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-400 font-medium">
              {searchQuery ? "No matching chats found" : "No recent conversations yet"}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Ask a question to start your first session
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = activeSessionId === session.id;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 text-xs ${
                  isActive
                    ? "bg-sky-500/15 border border-sky-500/30 text-sky-200 shadow-sm"
                    : "hover:bg-slate-800/60 text-slate-300 border border-transparent hover:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-300"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium leading-tight">
                      {session.title || "Untitled Conversation"}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      {formatDate(session.updated_at || session.created_at)}
                      {session.message_count > 0 && (
                        <>
                          <span>•</span>
                          <span>{session.message_count} msgs</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Delete button on hover */}
                <button
                  onClick={(e) => onDeleteSession(session.id, e)}
                  title="Delete chat session"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
