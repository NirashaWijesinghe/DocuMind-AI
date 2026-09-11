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
  const contractsCount = documents.filter((d) => d.is_legal_contract !== false && d.risk_level !== "NON_CONTRACT").length;
  const nonContractsCount = documents.filter((d) => d.is_legal_contract === false || d.risk_level === "NON_CONTRACT").length;
  const highRiskCount = documents.filter((d) => d.risk_score && d.risk_score >= 65).length;
  const safeCount = documents.filter((d) => (d.risk_score && d.risk_score < 35) || d.risk_level === "NON_CONTRACT").length;

  const recentDocs = documents.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 pb-10">
      {/* Hero Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/20 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>AI Legal & Document Intelligence Suite</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Analyze Contracts & Publications with{" "}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              High-Precision AI
            </span>
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
            LexiGuard AI automatically indexes legal agreements and research papers, classifies document types, calculates hazard risks, detects missing protective terms, and powers an interactive Legal Copilot.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => {
                if (documents.length > 0) onNavigateToAudit(documents[0].doc_id);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Explore Document Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateToCopilot()}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700/80 shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Start Legal Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Guided Workflow Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            How LexiGuard AI Works
          </h3>
          <span className="text-[11px] text-slate-500">Automated 3-Step Intelligence Flow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-md flex flex-col gap-3 group hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step 1</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">Vectorize & Chunk</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Upload PDF agreements or publications. Content is extracted into semantic vector chunks and indexed into ChromaDB.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-md flex flex-col gap-3 group hover:border-amber-400 dark:hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Step 2</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">Audit & Classify</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Smart classification identifies genuine contracts vs scholarly papers, auditing liability traps and missing terms.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-md flex flex-col gap-3 group hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Step 3</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">Copilot Consultation</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Ask deep questions, negotiate redlines, draft counter-clauses, and extract insights with grounded source citations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time System Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">Total Documents</span>
            <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalDocs}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Uploaded Files</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">Analyzed Clauses</span>
            <Layers className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalClauses}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Audited Legal Provisions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">Document Types</span>
            <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-200 mt-0.5">
            <span className="text-amber-600 dark:text-amber-300">{contractsCount}</span> Contracts / <span className="text-sky-600 dark:text-sky-300">{nonContractsCount}</span> Reports
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Automated Classification</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-medium">Critical Risks</span>
            <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{highRiskCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Flagged Agreements</div>
        </div>
      </div>

      {/* Main Bottom Section: Quick Upload Dropzone + Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Quick Dropzone (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              Upload & Vectorize PDF
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Auto ChromaDB indexing</span>
          </div>

          <FileUpload
            onUploadSuccess={onUploadSuccess}
            onBatchUploadSuccess={onBatchUploadSuccess}
          />
        </div>

        {/* Recent Documents Library Preview (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              Recent Documents & Publications
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
              No documents indexed yet. Upload a contract or scholarly paper to start.
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => {
                const isNonContract = doc.is_legal_contract === false || doc.risk_level === "NON_CONTRACT";
                const score = doc.risk_score ?? 0;
                const isHigh = !isNonContract && score >= 65;
                const isMed = !isNonContract && score >= 35 && score < 65;

                return (
                  <div
                    key={doc.doc_id}
                    onClick={() => onNavigateToAudit(doc.doc_id)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 hover:bg-indigo-50/70 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isNonContract ? "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20" : "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                      }`}>
                        {isNonContract ? <FileText className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors">
                          {doc.filename}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{doc.total_pages} pages</span>
                          <span>•</span>
                          <span>{doc.total_chunks} {isNonContract ? "sections" : "clauses"}</span>
                          <span>•</span>
                          <span className="text-slate-400 dark:text-slate-500">{doc.uploaded_at}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {isNonContract ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20">
                          {doc.document_category || "Scholarly Doc"}
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isHigh 
                            ? "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30" 
                            : isMed 
                            ? "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30" 
                            : "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                        }`}>
                          Risk: {score}/100
                        </span>
                      )}

                      <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white group-hover:bg-slate-200/60 dark:group-hover:bg-slate-700/60 transition-all">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
