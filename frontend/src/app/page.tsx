"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Scale, 
  FileText, 
  ShieldCheck, 
  ShieldAlert,
  Layers, 
  MessageSquare, 
  Clock, 
  Shield, 
  FileSearch, 
  CheckCircle2,
  LayoutDashboard,
  FolderKanban,
  Activity,
  Sun,
  Moon
} from "lucide-react";
import OverviewDashboard from "../components/OverviewDashboard";
import ContractAuditView from "../components/ContractAuditView";
import ChatInterface from "../components/ChatInterface";
import RepositoryView from "../components/RepositoryView";
import { useTheme } from "../context/ThemeContext";
import { 
  fetchDocuments, 
  fetchSessions, 
  deleteSession, 
  DocumentMeta, 
  ChatSession, 
  checkBackendHealth 
} from "../lib/api";

type ActiveTab = "overview" | "auditor" | "copilot" | "repository";

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [triggerSummaryDocId, setTriggerSummaryDocId] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<{ status: string; has_gemini_key: boolean }>({
    status: "checking",
    has_gemini_key: false,
  });

  const loadDocs = async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].doc_id);
      }
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
    setActiveTab("copilot");
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setActiveTab("copilot");
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

  const selectedDoc = documents.find((d) => d.doc_id === selectedDocId) || (documents.length > 0 ? documents[0] : null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060919] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 transition-colors duration-300">
      {/* Background Ambient Glow Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-sky-400/10 dark:bg-sky-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Header & Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#060919]/90 backdrop-blur-xl px-6 py-3 shadow-md dark:shadow-xl dark:shadow-black/30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-sky-200 bg-clip-text text-transparent">
                  LexiGuard AI
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  v2.5 Workspace
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Enterprise Legal Contract Intelligence & Risk Auditor</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-inner backdrop-blur-md">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white dark:bg-gradient-to-r dark:from-indigo-900/90 dark:to-slate-800 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("auditor")}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "auditor"
                  ? "bg-white dark:bg-gradient-to-r dark:from-indigo-900/90 dark:to-slate-800 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <Scale className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Doc & Risk Auditor</span>
            </button>

            <button
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "copilot"
                  ? "bg-white dark:bg-gradient-to-r dark:from-indigo-900/90 dark:to-slate-800 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Legal Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab("repository")}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "repository"
                  ? "bg-white dark:bg-gradient-to-r dark:from-indigo-900/90 dark:to-slate-800 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <FolderKanban className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Repository ({documents.length})</span>
            </button>
          </nav>

          {/* Right Controls: Health Status + Theme Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Light/Dark Theme"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-semibold"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="hidden sm:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline text-[11px]">Dark</span>
                </>
              )}
            </button>

            {/* Health Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs shadow-inner">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth.status === "healthy" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-400"
                }`}
              />
              <span className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                {backendHealth.status === "healthy" ? "LexiGuard Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">
        {activeTab === "overview" && (
          <OverviewDashboard
            documents={documents}
            onUploadSuccess={(newDoc) => {
              setDocuments((prev) => [newDoc, ...prev]);
              setSelectedDocId(newDoc.doc_id);
              setActiveTab("auditor");
            }}
            onBatchUploadSuccess={(newDocs) => {
              setDocuments((prev) => [...newDocs, ...prev]);
              if (newDocs.length > 0) {
                setSelectedDocId(newDocs[0].doc_id);
                setActiveTab("auditor");
              }
            }}
            onNavigateToAudit={(docId) => {
              setSelectedDocId(docId);
              setActiveTab("auditor");
            }}
            onNavigateToCopilot={(docId, prompt) => {
              if (docId) setSelectedDocId(docId);
              setActiveTab("copilot");
            }}
            onNavigateToRepository={() => setActiveTab("repository")}
          />
        )}

        {activeTab === "auditor" && (
          <ContractAuditView
            selectedDoc={selectedDoc}
            documents={documents}
            onSelectDoc={(id) => setSelectedDocId(id)}
            onAskCopilot={(prompt) => {
              setActiveTab("copilot");
            }}
            onNavigateToCopilot={(docId) => {
              if (docId) setSelectedDocId(docId);
              setActiveTab("copilot");
            }}
          />
        )}

        {activeTab === "copilot" && (
          <div className="flex-1 flex flex-col">
            <ChatInterface
              documents={documents}
              selectedDocId={selectedDocId}
              setSelectedDocId={setSelectedDocId}
              onUploadDocSuccess={(newDoc) => {
                setDocuments((prev) => [newDoc, ...prev]);
                setSelectedDocId(newDoc.doc_id);
              }}
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
        )}

        {activeTab === "repository" && (
          <RepositoryView
            documents={documents}
            onSelectDocForAudit={(docId) => {
              setSelectedDocId(docId);
              setActiveTab("auditor");
            }}
            onSelectDocForCopilot={(docId) => {
              setSelectedDocId(docId);
              setActiveTab("copilot");
            }}
            onDeleteSuccess={(deletedId) => {
              setDocuments((prev) => prev.filter((d) => d.doc_id !== deletedId));
              if (selectedDocId === deletedId) {
                const remaining = documents.filter((d) => d.doc_id !== deletedId);
                setSelectedDocId(remaining.length > 0 ? remaining[0].doc_id : null);
              }
            }}
            onNavigateToOverview={() => setActiveTab("overview")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/40 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LexiGuard AI • Enterprise Legal Contract Intelligence & Risk Auditor (FastAPI + ChromaDB + Gemini 1.5)</span>
          <span className="text-slate-400 dark:text-slate-500 font-medium">Built for High-Impact Legal Due Diligence & Document Reasoning</span>
        </div>
      </footer>
    </div>
  );
}