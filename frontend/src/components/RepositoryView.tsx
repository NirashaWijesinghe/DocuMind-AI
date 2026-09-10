"use client";

import React, { useState } from "react";
import { 
  Search, 
  X, 
  Scale, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  Trash2, 
  Sparkles, 
  ArrowUpRight, 
  Filter, 
  BookOpen, 
  Download,
  AlertTriangle
} from "lucide-react";
import { DocumentMeta, deleteDocument } from "../lib/api";

interface RepositoryViewProps {
  documents: DocumentMeta[];
  onSelectDocForAudit: (docId: string) => void;
  onSelectDocForCopilot: (docId: string) => void;
  onDeleteSuccess: (docId: string) => void;
  onNavigateToOverview: () => void;
}

export default function RepositoryView({
  documents,
  onSelectDocForAudit,
  onSelectDocForCopilot,
  onDeleteSuccess,
  onNavigateToOverview,
}: RepositoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "CONTRACTS" | "PAPERS" | "HIGH_RISK" | "SAFE">("ALL");
  const [docToDelete, setDocToDelete] = useState<DocumentMeta | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument(docToDelete.doc_id);
      onDeleteSuccess(docToDelete.doc_id);
      setDocToDelete(null);
    } catch (err) {
      alert("Failed to delete agreement. Please check the backend.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = d.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isNonContract = d.is_legal_contract === false || d.risk_level === "NON_CONTRACT";
    const score = d.risk_score ?? 0;

    if (selectedFilter === "CONTRACTS") return !isNonContract;
    if (selectedFilter === "PAPERS") return isNonContract;
    if (selectedFilter === "HIGH_RISK") return !isNonContract && score >= 65;
    if (selectedFilter === "SAFE") return isNonContract || score < 35;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 pb-10">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Vector Repository
            </span>
            <span className="text-xs text-slate-400">Total: {documents.length} files</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Document & Agreement Library
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect indexed agreements, extracted vector chunks, and scholarly papers.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <button
          onClick={() => setSelectedFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedFilter === "ALL"
              ? "bg-slate-800 text-sky-300 border border-slate-700 shadow-sm"
              : "bg-slate-900/40 text-slate-400 border border-slate-800/80 hover:text-slate-200"
          }`}
        >
          All Documents ({documents.length})
        </button>

        <button
          onClick={() => setSelectedFilter("CONTRACTS")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedFilter === "CONTRACTS"
              ? "bg-indigo-950/70 text-indigo-300 border border-indigo-700 shadow-sm"
              : "bg-slate-900/40 text-slate-400 border border-slate-800/80 hover:text-indigo-300"
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-indigo-400" />
          <span>Contracts ({documents.filter((d) => d.is_legal_contract !== false && d.risk_level !== "NON_CONTRACT").length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter("PAPERS")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedFilter === "PAPERS"
              ? "bg-sky-950/70 text-sky-300 border border-sky-700 shadow-sm"
              : "bg-slate-900/40 text-slate-400 border border-slate-800/80 hover:text-sky-300"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span>Academic & General Docs ({documents.filter((d) => d.is_legal_contract === false || d.risk_level === "NON_CONTRACT").length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter("HIGH_RISK")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedFilter === "HIGH_RISK"
              ? "bg-rose-950/70 text-rose-300 border border-rose-700 shadow-sm"
              : "bg-slate-900/40 text-slate-400 border border-slate-800/80 hover:text-rose-300"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>High Risk ({documents.filter((d) => d.is_legal_contract !== false && d.risk_score && d.risk_score >= 65).length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter("SAFE")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedFilter === "SAFE"
              ? "bg-emerald-950/70 text-emerald-300 border border-emerald-700 shadow-sm"
              : "bg-slate-900/40 text-slate-400 border border-slate-800/80 hover:text-emerald-300"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Safe / Informational ({documents.filter((d) => (d.risk_score && d.risk_score < 35) || d.risk_level === "NON_CONTRACT" || d.is_legal_contract === false).length})</span>
        </button>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-slate-600 mb-2" />
          <p className="font-semibold text-slate-300">No documents match your query.</p>
          <p className="text-slate-500">Try changing the search keyword or filter options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const isNonContract = doc.is_legal_contract === false || doc.risk_level === "NON_CONTRACT";
            const score = doc.risk_score ?? 0;
            const isHigh = !isNonContract && score >= 65;
            const isMed = !isNonContract && score >= 35 && score < 65;

            return (
              <div
                key={doc.doc_id}
                className="p-5 rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-2xl shrink-0 ${
                        isNonContract ? "bg-sky-500/15 text-sky-400" : "bg-indigo-500/15 text-indigo-400"
                      }`}>
                        {isNonContract ? <FileText className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isNonContract 
                              ? "bg-sky-500/15 text-sky-300 border border-sky-500/20" 
                              : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                          }`}>
                            {doc.document_category || (isNonContract ? "Academic / Scholarly" : "Legal Contract")}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white truncate mt-1 group-hover:text-indigo-200 transition-colors">
                          {doc.filename}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-400">
                    <span>📄 {doc.total_pages} Pages</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {doc.total_chunks} {isNonContract ? "Sections" : "Clauses"}
                    </span>
                    <span>•</span>
                    <span>{doc.file_size_kb} KB</span>
                    <span>•</span>
                    <span className="text-slate-500">{doc.uploaded_at}</span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  {/* Status Pill */}
                  {isNonContract ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      NON-CONTRACT (SAFE)
                    </span>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      isHigh 
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30" 
                        : isMed 
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30" 
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}>
                      RISK SCORE: {score}/100 ({doc.risk_level || "SAFE"})
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDocForAudit(doc.doc_id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isNonContract ? "Inspect Doc" : "Audit Risk"}</span>
                    </button>

                    <button
                      onClick={() => onSelectDocForCopilot(doc.doc_id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Copilot</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-100">Delete Document?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete <span className="text-rose-300 font-semibold truncate">"{docToDelete.filename}"</span>? All indexed vector embeddings will be permanently removed from ChromaDB.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-xs font-semibold text-white transition-all shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
