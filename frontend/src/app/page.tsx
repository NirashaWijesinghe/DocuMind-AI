"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Brain, 
  FileText, 
  ShieldCheck, 
  Layers, 
  MessageSquare,
  Clock
} from "lucide-react";
import FileUpload from "../components/FileUpload";
import DocumentList from "../components/DocumentList";
import ChatInterface from "../components/ChatInterface";
import ChatHistorySidebar from "../components/ChatHistorySidebar";
import { 
  fetchDocuments, 
  fetchSessions, 
  deleteSession,
  DocumentMeta, 
  ChatSession,
  checkBackendHealth 
} from "../lib/api";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [triggerSummaryDocId, setTriggerSummaryDocId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"documents" | "recents">("documents");
  const [backendHealth, setBackendHealth] = useState<{ status: string; has_gemini_key: boolean }>({
    status: "checking",
    has_gemini_key: false,
  });

  const loadDocs = async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  const loadSessions = async () => {
    try {
      const sess = await fetchSessions();
      setSessions(sess);
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  const checkHealth = async () => {
    const health = await checkBackendHealth();
    setBackendHealth(health);
  };

  useEffect(() => {
    loadDocs();
    loadSessions();
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session && session.doc_id) {
      setSelectedDocId(session.doc_id);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const totalPages = documents.reduce((acc, d) => acc + d.total_pages, 0);
  const totalChunks = documents.reduce((acc, d) => acc + d.total_chunks, 0);

  return (
    <div className="min-h-screen bg-[#060919] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Background Neon Glow Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#060919]/90 backdrop-blur-md px-6 py-4 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  DocuMind AI
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  AI Assistant v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enterprise Document Intelligence & Research Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs shadow-inner">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth.status === "healthy" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"
                }`}
              />
              <span className="text-slate-300 text-[11px] font-medium">
                {backendHealth.status === "healthy" ? "System Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar / Document Management & Recents (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Document Pages</span>
                <FileText className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{totalPages}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Knowledge Blocks</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{totalChunks}</p>
            </div>
          </div>

          {/* Left Panel Tabs: Documents vs Recents (NotebookLM style) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <button
              onClick={() => setSidebarTab("documents")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                sidebarTab === "documents"
                  ? "bg-slate-800 text-sky-300 shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Documents ({documents.length})</span>
            </button>
            <button
              onClick={() => setSidebarTab("recents")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                sidebarTab === "recents"
                  ? "bg-slate-800 text-sky-300 shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recents ({sessions.length})</span>
            </button>
          </div>

          {/* Tab 1: Documents View (Upload & Documents List) */}
          {sidebarTab === "documents" ? (
            <div className="flex flex-col gap-5">
              {/* Upload Card */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Upload & Vectorize PDF
                </h2>
                <FileUpload
                  onUploadSuccess={(newDoc) => {
                    setDocuments((prev) => [newDoc, ...prev]);
                    setSelectedDocId(newDoc.doc_id);
                  }}
                />
              </div>

              {/* Document Knowledge Base Card */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex-1">
                <DocumentList
                  documents={documents}
                  selectedDocId={selectedDocId}
                  onSelectDoc={setSelectedDocId}
                  onSummarizeDoc={(docId) => setTriggerSummaryDocId(docId)}
                  onDeleteSuccess={(deletedId) => {
                    setDocuments((prev) => prev.filter((d) => d.doc_id !== deletedId));
                    if (selectedDocId === deletedId) setSelectedDocId(null);
                  }}
                />
              </div>
            </div>
          ) : (
            /* Tab 2: Recents / Chat History View */
            <div className="h-[520px]">
              <ChatHistorySidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                onDeleteSession={handleDeleteSession}
              />
            </div>
          )}
        </div>

        {/* Right Section / AI Chat Interface (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <ChatInterface 
            documents={documents} 
            selectedDocId={selectedDocId} 
            triggerSummaryDocId={triggerSummaryDocId}
            onResetTriggerSummary={() => setTriggerSummaryDocId(null)}
            activeSessionId={activeSessionId}
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onRefreshSessions={loadSessions}
            setActiveSessionId={setActiveSessionId}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/40 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DocuMind AI • Full-Stack Python FastAPI & Next.js RAG Research Platform</span>
          <span className="text-slate-400">Built for Enterprise Production & Technical Showcase</span>
        </div>
      </footer>
    </div>
  );
}