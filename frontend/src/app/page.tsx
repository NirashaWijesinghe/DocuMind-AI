"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Brain, FileText, ShieldCheck, Layers } from "lucide-react";
import FileUpload from "../components/FileUpload";
import DocumentList from "../components/DocumentList";
import ChatInterface from "../components/ChatInterface";
import { fetchDocuments, DocumentMeta, checkBackendHealth } from "../lib/api";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
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
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  const checkHealth = async () => {
    const health = await checkBackendHealth();
    setBackendHealth(health);
  };

  useEffect(() => {
    loadDocs();
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

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
                  RAG SaaS v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enterprise Document Intelligence & Research Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Backend Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth.status === "healthy" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"
                }`}
              />
              <span className="text-slate-400 text-[11px]">
                API:{" "}
                <strong className={backendHealth.status === "healthy" ? "text-emerald-300" : "text-amber-300"}>
                  {backendHealth.status === "healthy" ? "FastAPI Online" : "Connecting..."}
                </strong>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Chroma Vector DB Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar / Document Management (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Parsed Pages</span>
                <FileText className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{totalPages}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Vector Chunks</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{totalChunks}</p>
            </div>
          </div>

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

        {/* Right Section / AI Chat Interface (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <ChatInterface 
            documents={documents} 
            selectedDocId={selectedDocId} 
            triggerSummaryDocId={triggerSummaryDocId}
            onResetTriggerSummary={() => setTriggerSummaryDocId(null)}
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