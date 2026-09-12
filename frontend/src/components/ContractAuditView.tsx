"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Scale, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Layers, 
  ArrowUpRight,
  BookOpen,
  Calendar,
  Globe,
  Users,
  Search,
  X
} from "lucide-react";
import { 
  ContractAuditReport, 
  ContractClauseRisk, 
  MissingClauseAlert, 
  auditContract, 
  getContractAudit, 
  exportAuditReport,
  DocumentMeta 
} from "../lib/api";

interface ContractAuditViewProps {
  selectedDoc: DocumentMeta | null;
  documents?: DocumentMeta[];
  onSelectDoc?: (docId: string) => void;
  onAskCopilot?: (prompt: string) => void;
  onNavigateToCopilot?: (docId?: string) => void;
  onAuditComplete?: (audit: ContractAuditReport) => void;
}

export default function ContractAuditView({ 
  selectedDoc, 
  documents = [],
  onSelectDoc,
  onAskCopilot,
  onNavigateToCopilot,
  onAuditComplete
}: ContractAuditViewProps) {
  const [auditReport, setAuditReport] = useState<ContractAuditReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "HIGH" | "MEDIUM" | "MISSING">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [expandedClauses, setExpandedClauses] = useState<Record<number, boolean>>({});

  const loadAudit = async (forceRefresh = false) => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      let data: ContractAuditReport;
      if (forceRefresh) {
        data = await auditContract(selectedDoc.doc_id);
      } else {
        data = await getContractAudit(selectedDoc.doc_id);
      }
      setAuditReport(data);
      if (onAuditComplete) {
        onAuditComplete(data);
      }
    } catch (err) {
      console.error("Failed to load contract audit", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoc) {
      loadAudit(false);
      setExpandedClauses({});
    } else {
      setAuditReport(null);
    }
  }, [selectedDoc?.doc_id]);

  const toggleClauseExpand = (index: number) => {
    setExpandedClauses((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClauseId(id);
    setTimeout(() => setCopiedClauseId(null), 2000);
  };

  const handleExportReport = async () => {
    if (!selectedDoc) return;
    try {
      const res = await exportAuditReport(selectedDoc.doc_id);
      const blob = new Blob([res.markdown_report], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedDoc.filename.replace(".pdf", "")}_LexiGuard_Report.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export report", err);
    }
  };

  if (!selectedDoc) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl backdrop-blur-md min-h-[560px] shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-md">
          <Scale className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">No Document Selected</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Select a legal agreement or research publication to inspect its executive summary, classification, and risk audit.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl backdrop-blur-md min-h-[560px] shadow-sm">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500 animate-spin flex items-center justify-center" />
          <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400 absolute inset-0 m-auto" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">Analyzing Document Intelligence...</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
          LexiGuard AI is classifying <span className="text-indigo-600 dark:text-sky-300 font-semibold">{selectedDoc.filename}</span>, synthesizing executive insights, and checking for liability risks.
        </p>
      </div>
    );
  }

  const isNonContract = auditReport?.is_legal_contract === false || auditReport?.risk_level === "NON_CONTRACT";
  const score = auditReport?.overall_risk_score ?? 50;
  const isHighRisk = !isNonContract && score >= 65;
  const isModerateRisk = !isNonContract && score >= 35 && score < 65;

  const scoreColor = isNonContract
    ? "text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10"
    : isHighRisk 
    ? "text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10" 
    : isModerateRisk 
    ? "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10" 
    : "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10";

  const filteredRisks = (auditReport?.identified_risks || []).filter((r) => {
    // Severity filter
    if (filterSeverity === "HIGH" && r.severity !== "HIGH" && r.severity !== "CRITICAL") return false;
    if (filterSeverity === "MEDIUM" && r.severity !== "MEDIUM") return false;
    
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.clause_title?.toLowerCase().includes(q);
      const matchCategory = r.category?.toLowerCase().includes(q);
      const matchOriginal = r.original_text?.toLowerCase().includes(q);
      const matchRisk = r.risk_explanation?.toLowerCase().includes(q);
      const matchRevision = r.recommended_revision?.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchOriginal && !matchRisk && !matchRevision) return false;
    }
    return true;
  });

  const filteredMissing = (auditReport?.missing_clauses || []).filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.clause_name?.toLowerCase().includes(q);
      const matchReason = m.reason?.toLowerCase().includes(q);
      const matchSuggested = m.suggested_language?.toLowerCase().includes(q);
      if (!matchName && !matchReason && !matchSuggested) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 pb-10">
      {/* Top Document Header & Selector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`p-3 rounded-2xl shrink-0 ${
            isNonContract ? "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30" : "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
          }`}>
            {isNonContract ? <FileText className="w-6 h-6" /> : <Scale className="w-6 h-6" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                isNonContract 
                  ? "bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30" 
                  : "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30"
              }`}>
                {auditReport?.document_category || auditReport?.contract_type || (isNonContract ? "Academic Research Paper" : "Commercial Contract")}
              </span>

              {auditReport?.audit_timestamp && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Analyzed: {auditReport.audit_timestamp}
                </span>
              )}
            </div>

            {/* Document Switcher or Title */}
            {documents.length > 1 && onSelectDoc ? (
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={selectedDoc.doc_id}
                  onChange={(e) => onSelectDoc(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 text-sm font-bold text-slate-900 dark:text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer truncate max-w-md shadow-inner"
                >
                  {documents.map((d) => (
                    <option key={d.doc_id} value={d.doc_id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                      {d.filename} ({d.is_legal_contract === false ? "Paper" : "Contract"})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">
                {selectedDoc.filename}
              </h2>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportReport}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => loadAudit(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Analyze</span>
          </button>
        </div>
      </div>

      {/* Bento Grid: Executive Summary & Metadata Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Executive Summary (7 Columns) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                {isNonContract ? "Executive Summary & Core Insights" : "Executive Legal Due Diligence Summary"}
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{selectedDoc.total_pages} Pages • {selectedDoc.file_size_kb} KB</span>
            </div>

            <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 font-normal">
              {auditReport?.executive_summary ? (
                <p className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60">
                  {auditReport.executive_summary}
                </p>
              ) : (
                <p className="text-slate-400 text-xs italic">No executive summary available for this document.</p>
              )}
            </div>
          </div>

          {/* Non-Contract Notice if applicable */}
          {isNonContract && (
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-500/20 text-xs text-sky-800 dark:text-sky-200 flex items-start gap-2.5 mt-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sky-900 dark:text-sky-100 font-semibold">Verified Non-Contract Document: </strong>
                <span>
                  {auditReport?.non_contract_notice || "This document is an Academic Research Paper or Scholarly Article. Standard commercial contract risk audits and liability caps are not applicable."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Entity & Classification Sidebar (5 Columns) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-xl flex flex-col justify-between gap-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-4">
              <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Key Entities & Context
            </h3>

            <div className="space-y-3.5">
              {/* Parties or Authors */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {isNonContract ? "Authors & Publishers:" : "Identified Parties:"}
                </span>
                {auditReport?.key_parties && auditReport.key_parties.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {auditReport.key_parties.map((party, pIdx) => (
                      <div key={pIdx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="font-medium truncate">{party}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">Unspecified entities</p>
                )}
              </div>

              {/* Jurisdiction or Scope */}
              {auditReport?.governing_law && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    {isNonContract ? "Scope / Licensing:" : "Governing Jurisdiction:"}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                    <span>{auditReport.governing_law}</span>
                  </div>
                </div>
              )}

              {/* Term or Date */}
              {auditReport?.effective_dates_or_term && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    {isNonContract ? "Publication Date / Term:" : "Contract Term:"}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{auditReport.effective_dates_or_term}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Classification / Risk Score Pill */}
          <div className={`p-4 rounded-2xl border ${scoreColor} flex items-center justify-between gap-4`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                {isNonContract ? "Document Status" : "Contract Risk Level"}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                {isNonContract ? "INFORMATIONAL DOC" : (auditReport?.risk_level || "SAFE")}
              </span>
            </div>

            {!isNonContract && (
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{score}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/100</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract Risk & Redline Matrix (Only for Genuine Legal Contracts) */}
      {!isNonContract && (
        <div className="flex flex-col gap-5">
          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
              <button
                onClick={() => setFilterSeverity("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterSeverity === "ALL"
                    ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-sky-300 shadow-sm border border-slate-200 dark:border-slate-700/80"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                All ({auditReport?.identified_risks?.length || 0})
              </button>
              <button
                onClick={() => setFilterSeverity("HIGH")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterSeverity === "HIGH"
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-sm border border-rose-200 dark:border-rose-800/60"
                    : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                High ({auditReport?.high_risk_count || 0})
              </button>
              <button
                onClick={() => setFilterSeverity("MEDIUM")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterSeverity === "MEDIUM"
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-200 dark:border-amber-800/60"
                    : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Med ({auditReport?.medium_risk_count || 0})
              </button>
              <button
                onClick={() => setFilterSeverity("MISSING")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterSeverity === "MISSING"
                    ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-800/60"
                    : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                Missing ({auditReport?.missing_clauses?.length || 0})
              </button>
            </div>

            {/* Instant Clause Search Bar */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clauses or topics..."
                className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:border-indigo-500 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {onAskCopilot && (
              <button
                onClick={() => onAskCopilot("What are the most critical liability and indemnity risks in this agreement?")}
                className="hidden lg:flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consult Copilot</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Clause Risks or Missing Terms */}
          <div className="flex flex-col gap-4">
            {filterSeverity === "MISSING" ? (
              filteredMissing.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-2xl text-slate-500 dark:text-slate-400 text-xs shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
                  {searchQuery ? "No missing terms match your search filter." : "All standard protective terms are present in this agreement."}
                </div>
              ) : (
                filteredMissing.map((missing, idx) => (
                  <div 
                    key={idx}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-purple-200 dark:border-purple-500/20 backdrop-blur-md shadow-sm dark:shadow-lg flex flex-col gap-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                          MISSING PROTECTIVE TERM
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{missing.clause_name}</h4>
                      </div>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/60">
                        Priority: {missing.importance}
                      </span>
                    </div>

                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-900 dark:text-slate-100 font-semibold">Why omission is hazardous: </strong>
                      {missing.reason}
                    </div>

                    {missing.suggested_language && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-100 relative group">
                        <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Recommended Protective Clause to Insert:
                          </span>
                          <button
                            onClick={() => handleCopyText(missing.suggested_language, `missing-${idx}`)}
                            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                          >
                            {copiedClauseId === `missing-${idx}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Clause</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="break-words whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed font-normal text-emerald-950 dark:text-emerald-100">
                          {missing.suggested_language}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              filteredRisks.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-2xl text-slate-500 dark:text-slate-400 text-xs shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
                  {searchQuery ? "No clauses match your search query." : "No clauses matching this risk filter."}
                </div>
              ) : (
                filteredRisks.map((risk, idx) => {
                  const isHigh = risk.severity === "HIGH" || risk.severity === "CRITICAL";
                  const isMed = risk.severity === "MEDIUM";
                  const badgeClass = isHigh
                    ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                    : isMed
                    ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";

                  const isExpanded = expandedClauses[idx] !== false;

                  return (
                    <div 
                      key={idx}
                      className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/60 border transition-all ${
                        isHigh ? "border-rose-200 dark:border-rose-500/30 hover:border-rose-300 dark:hover:border-rose-500/50" : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80"
                      } backdrop-blur-md shadow-sm dark:shadow-lg flex flex-col gap-4`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wider border ${badgeClass}`}>
                              {risk.severity} RISK
                            </span>
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                              {risk.category}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              Page {risk.page_number}
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">{risk.clause_title}</h4>
                        </div>

                        <button
                          onClick={() => toggleClauseExpand(idx)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
                          title={isExpanded ? "Collapse clause" : "Expand clause"}
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <>
                          {risk.original_text && (
                            <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                                Contract Excerpt (Page {risk.page_number}):
                              </span>
                              <p className="text-sm sm:text-[14.5px] leading-relaxed text-slate-800 dark:text-slate-200 font-normal">
                                "{risk.original_text}"
                              </p>
                            </div>
                          )}

                          <div className="text-sm sm:text-[14.5px] leading-relaxed text-slate-800 dark:text-slate-200 flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isHigh ? "text-rose-500 dark:text-rose-400" : "text-amber-500 dark:text-amber-400"}`} />
                            <div>
                              <strong className={`font-bold ${isHigh ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
                                Legal Risk Analysis:{" "}
                              </strong>
                              <span className="text-slate-700 dark:text-slate-200">{risk.risk_explanation}</span>
                            </div>
                          </div>

                          {risk.recommended_revision && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-100 relative group">
                              <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  AI Recommended Counter-Clause (Redline):
                                </span>
                                <button
                                  onClick={() => handleCopyText(risk.recommended_revision, `clause-${idx}`)}
                                  className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer text-xs font-semibold"
                                >
                                  {copiedClauseId === `clause-${idx}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Counter-Clause</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-sm sm:text-[15px] leading-relaxed text-emerald-950 dark:text-emerald-100 break-words whitespace-pre-wrap font-normal">
                                {risk.recommended_revision}
                              </p>
                            </div>
                          )}

                          {onAskCopilot && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => onAskCopilot(`How should I negotiate or redline the '${risk.clause_title}' clause on Page ${risk.page_number}?`)}
                                className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                              >
                                <span>Draft negotiation strategy for this clause</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
