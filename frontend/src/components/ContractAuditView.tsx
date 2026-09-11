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
  Users
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
}

export default function ContractAuditView({ 
  selectedDoc, 
  documents = [],
  onSelectDoc,
  onAskCopilot,
  onNavigateToCopilot
}: ContractAuditViewProps) {
  const [auditReport, setAuditReport] = useState<ContractAuditReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "HIGH" | "MEDIUM" | "MISSING">("ALL");
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [expandedClauses, setExpandedClauses] = useState<Record<number, boolean>>({});

  const loadAudit = async (forceRefresh = false) => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      if (forceRefresh) {
        const data = await auditContract(selectedDoc.doc_id);
        setAuditReport(data);
      } else {
        const data = await getContractAudit(selectedDoc.doc_id);
        setAuditReport(data);
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
    if (filterSeverity === "HIGH") return r.severity === "HIGH" || r.severity === "CRITICAL";
    if (filterSeverity === "MEDIUM") return r.severity === "MEDIUM";
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
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{selectedDoc.total_pages} Pages • {selectedDoc.total_chunks} Chunks</span>
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

      {/* If Non-Contract, show interactive AI Prompt Hub */}
      {isNonContract && onAskCopilot && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              Ask Copilot About This Publication
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Instant AI Reasoning with Citations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Summarize the key research findings and conclusions of this paper.",
              "Explain the research methodology and empirical data sources used.",
              "Who are the primary authors, publishers, and affiliated institutions?",
              "What are the practical applications and recommendations from this work?"
            ].map((promptText, pIdx) => (
              <button
                key={pIdx}
                onClick={() => onAskCopilot(promptText)}
                className="text-left p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-200 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <span className="leading-relaxed">{promptText}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 ml-2 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contract Risk & Redline Matrix (Only for Genuine Legal Contracts) */}
      {!isNonContract && (
        <div className="flex flex-col gap-5">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
              <button
                onClick={() => setFilterSeverity("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterSeverity === "ALL"
                    ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-sky-300 shadow-sm border border-slate-200 dark:border-slate-700/80"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                All Clauses ({auditReport?.identified_risks?.length || 0})
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
                High Risk ({auditReport?.high_risk_count || 0})
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
                Medium Risk ({auditReport?.medium_risk_count || 0})
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
                Missing Terms ({auditReport?.missing_clauses?.length || 0})
              </button>
            </div>

            {onAskCopilot && (
              <button
                onClick={() => onAskCopilot("What are the most critical liability and indemnity risks in this agreement?")}
                className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consult Copilot on Risks</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Clause Risks or Missing Terms */}
          <div className="flex flex-col gap-4">
            {filterSeverity === "MISSING" ? (
              (auditReport?.missing_clauses || []).length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-2xl text-slate-500 dark:text-slate-400 text-xs shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
                  All standard protective terms are present in this agreement.
                </div>
              ) : (
                (auditReport?.missing_clauses || []).map((missing, idx) => (
                  <div 
                    key={idx}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-purple-200 dark:border-purple-500/20 backdrop-blur-md shadow-sm dark:shadow-lg flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                          MISSING PROTECTIVE TERM
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{missing.clause_name}</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                        Priority: {missing.importance}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Why omission is hazardous: </span>
                      {missing.reason}
                    </div>

                    {missing.suggested_language && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-emerald-800 dark:text-emerald-300/90 relative group">
                        <div className="flex items-center justify-between mb-1.5 text-[10px] font-sans font-semibold text-slate-500 dark:text-slate-400">
                          <span>RECOMMENDED CLAUSE TO INSERT:</span>
                          <button
                            onClick={() => handleCopyText(missing.suggested_language, `missing-${idx}`)}
                            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedClauseId === `missing-${idx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        {missing.suggested_language}
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              filteredRisks.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-2xl text-slate-500 dark:text-slate-400 text-xs shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
                  No clauses matching this risk filter.
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
                      className={`p-5 rounded-3xl bg-white dark:bg-slate-900/60 border transition-all ${
                        isHigh ? "border-rose-200 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/40" : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80"
                      } backdrop-blur-md shadow-sm dark:shadow-lg flex flex-col gap-3.5`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                              {risk.severity} RISK
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                              {risk.category}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Page {risk.page_number}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{risk.clause_title}</h4>
                        </div>

                        <button
                          onClick={() => toggleClauseExpand(idx)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <>
                          {risk.original_text && (
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 italic">
                              <span className="text-[10px] font-sans font-semibold uppercase text-slate-500 dark:text-slate-400 not-italic block mb-1">
                                Contract Excerpt (Page {risk.page_number}):
                              </span>
                              "{risk.original_text}"
                            </div>
                          )}

                          <div className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2">
                            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isHigh ? "text-rose-500 dark:text-rose-400" : "text-amber-500 dark:text-amber-400"}`} />
                            <div>
                              <strong className="text-slate-900 dark:text-slate-100 font-semibold">Legal Risk: </strong>
                              <span className="text-slate-600 dark:text-slate-300">{risk.risk_explanation}</span>
                            </div>
                          </div>

                          {risk.recommended_revision && (
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 relative group">
                              <div className="flex items-center justify-between mb-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3" />
                                  AI Recommended Counter-Clause (Redline):
                                </span>
                                <button
                                  onClick={() => handleCopyText(risk.recommended_revision, `clause-${idx}`)}
                                  className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                                >
                                  {copiedClauseId === `clause-${idx}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Counter-Clause</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="font-mono text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-200/90">
                                {risk.recommended_revision}
                              </p>
                            </div>
                          )}

                          {onAskCopilot && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => onAskCopilot(`How should I negotiate or redline the '${risk.clause_title}' clause on Page ${risk.page_number}?`)}
                                className="text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                              >
                                <span>Draft negotiation strategy for this clause</span>
                                <ArrowUpRight className="w-3 h-3" />
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
