"use client";

import React from "react";
import { 
  Scale, 
  ShieldCheck, 
  ShieldAlert, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Upload, 
  CheckCircle2, 
  Activity,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { DocumentMeta } from "../lib/api";
import FileUpload from "./FileUpload";

interface OverviewDashboardProps {
  documents: DocumentMeta[];
  onUploadSuccess: (newDoc: DocumentMeta) => void;
  onBatchUploadSuccess: (newDocs: DocumentMeta[]) => void;
  onNavigateToAudit: (docId: string) => void;
  onNavigateToCopilot: (docId?: string, prompt?: string) => void;
  onNavigateToRepository: () => void;
}

export default function OverviewDashboard({
  documents,
  onUploadSuccess,
  onBatchUploadSuccess,
  onNavigateToAudit,
  onNavigateToCopilot,
  onNavigateToRepository,
}: OverviewDashboardProps) {
  // Metrics calculation
  const totalDocs = documents.length;
  const totalClauses = documents.reduce((acc, d) => acc + (d.total_chunks || 0), 0);
  const highRiskCount = documents.filter((d) => d.risk_score && d.risk_score >= 65).length;
  const moderateRiskCount = documents.filter((d) => d.risk_score && d.risk_score >= 35 && d.risk_score < 65).length;
  const safeCount = documents.filter((d) => d.risk_score && d.risk_score < 35).length;

  const recentDocs = documents.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 pb-10">
      {/* Top Hero & Quick Upload Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Welcome Banner (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/20 backdrop-blur-xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Enterprise Legal Contract Intelligence & Risk Auditor</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Audit Legal Contracts with{" "}
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Automated AI Due Diligence
              </span>
            </h2>

            <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              LexiGuard AI parses commercial agreements, calculates contract risk scores (0–100), detects hazardous liability traps, identifies omitted protective terms, and powers an interactive Legal Copilot.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-indigo-500/20">
            <button
              onClick={() => {
                if (documents.length > 0) onNavigateToAudit(documents[0].doc_id);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Open Risk & Redline Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateToCopilot()}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700/80 shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Ask Legal Copilot</span>
            </button>
          </div>
        </div>

        {/* Right Primary Upload Dropzone (5 cols) - Prominently at Top */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-indigo-500/30 dark:border-indigo-500/40 backdrop-blur-xl shadow-lg dark:shadow-2xl dark:shadow-indigo-950/40 flex flex-col justify-between gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Upload className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Upload Legal Agreement
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              Instant AI Scan
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <FileUpload
              onUploadSuccess={onUploadSuccess}
              onBatchUploadSuccess={onBatchUploadSuccess}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>Supports: NDAs, MSAs, SLAs, Employment PDFs</span>
            <span>Max 20MB</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Horizontal 3-Step Guided Legal AI Flow */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              How LexiGuard AI Works
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
            Instant AI Due Diligence Flow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/70 flex items-start gap-3.5 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">Step 1</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Upload & Smart Scan</h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Upload your contract. AI instantly scans and reads every page and clause in seconds.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/70 flex items-start gap-3.5 hover:border-amber-400 dark:hover:border-amber-500/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">Step 2</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Automated Risk Audit</h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Calculates an instant Risk Score (0–100), flagging unfair terms, liability traps, and missing protections.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/70 flex items-start gap-3.5 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">Step 3</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Ask AI Legal Assistant</h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Ask questions, draft safer counter-clauses, and get clear answers backed by exact page citations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time System Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">Total Contracts</span>
            <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalDocs}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Indexed Legal Agreements</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">Audited Clauses</span>
            <Layers className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalClauses}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Semantic Vector Provisions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">Risk Status</span>
            <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-200 mt-0.5">
            <span className="text-rose-600 dark:text-rose-400">{highRiskCount} High</span> / <span className="text-emerald-600 dark:text-emerald-400">{safeCount} Safe</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Automated Rubric Audit</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">Critical Hazards</span>
            <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{highRiskCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Contracts Flagged</div>
        </div>
      </div>

      {/* Bottom Section: Recent Legal Agreements (Full Width) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            Recent Legal Agreements
          </h3>
          <button
            onClick={onNavigateToRepository}
            className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All ({documents.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentDocs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
            No legal contracts indexed yet. Upload an NDA, MSA, or employment agreement above to start.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentDocs.map((doc) => {
              const isDocHighRisk = doc.risk_score && doc.risk_score >= 65;
              const isDocModerateRisk = doc.risk_score && doc.risk_score >= 35 && doc.risk_score < 65;

              return (
                <div
                  key={doc.doc_id}
                  onClick={() => onNavigateToAudit(doc.doc_id)}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800/70 flex items-center justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl shrink-0 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                      <Scale className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-sky-300 transition-colors">
                        {doc.filename}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{doc.total_pages} pages</span>
                        <span>•</span>
                        <span>{doc.total_chunks} clauses</span>
                        <span>•</span>
                        <span>{doc.uploaded_at?.split(" ")[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.risk_score !== null && doc.risk_score !== undefined ? (
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        isDocHighRisk 
                          ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30" 
                          : isDocModerateRisk 
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30" 
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                      }`}>
                        Risk Score: {doc.risk_score}/100
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Ready to Audit
                      </span>
                    )}

                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-sky-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
