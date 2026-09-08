"use client";

import React, { useState } from "react";
import { FileText, Trash2, Layers, Search, Sparkles, X, AlertTriangle } from "lucide-react";
import { DocumentMeta, deleteDocument } from "../lib/api";

interface DocumentListProps {
  documents: DocumentMeta[];
  selectedDocId: string | null;
  onSelectDoc: (docId: string | null) => void;
  onDeleteSuccess: (docId: string) => void;
  onSummarizeDoc?: (docId: string) => void;
}

export default function DocumentList({
  documents,
  selectedDocId,
  onSelectDoc,
  onDeleteSuccess,
  onSummarizeDoc,
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
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
      alert("Failed to delete document. Please check the backend.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Knowledge Base ({documents.length})
        </h3>
        <button
          onClick={() => onSelectDoc(null)}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            selectedDocId === null
              ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
              : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200"
          }`}
        >
          Query All Docs
        </button>
      </div>

      {documents.length > 0 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-400">
          No documents uploaded yet. Upload a PDF above to start chatting with AI.
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-400">
          No documents match "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredDocs.map((doc) => {
            const isSelected = selectedDocId === doc.doc_id;
            return (
              <div
                key={doc.doc_id}
                onClick={() => onSelectDoc(isSelected ? null : doc.doc_id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 group ${
                  isSelected
                    ? "bg-sky-950/40 border-sky-500/50 shadow-sm"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isSelected ? "bg-sky-500/20 text-sky-400" : "bg-slate-800 text-slate-400"}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium truncate ${isSelected ? "text-sky-200" : "text-slate-300"}`}>
                      {doc.filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{doc.total_pages} pages</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {doc.total_chunks} chunks
                      </span>
                      <span>•</span>
                      <span>{doc.file_size_kb} KB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {onSummarizeDoc && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDoc(doc.doc_id);
                        onSummarizeDoc(doc.doc_id);
                      }}
                      className="p-1.5 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-950/60 border border-transparent hover:border-sky-500/30 transition-all cursor-pointer"
                      title="Generate Executive Summary"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocToDelete(doc);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Glassmorphic Delete Confirmation Modal */}
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
