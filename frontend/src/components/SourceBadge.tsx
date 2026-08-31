"use client";

import React, { useState } from "react";
import { BookOpen, FileText, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { SourceCitation } from "../lib/api";

interface SourceBadgeProps {
  sources: SourceCitation[];
}

export default function SourceBadge({ sources }: SourceBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  const handleCopySnippet = (content: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/80">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium text-sky-400 hover:text-sky-300 transition-all bg-sky-950/40 hover:bg-sky-950/70 border border-sky-800/40 px-3 py-1.5 rounded-lg cursor-pointer shadow-sm"
      >
        <BookOpen className="w-3.5 h-3.5 text-sky-400" />
        <span>Verified from {sources.length} document source{sources.length > 1 ? "s" : ""}</span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="mt-2.5 space-y-2 animate-fadeIn">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 flex flex-col gap-1.5 shadow-sm hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 font-semibold gap-2">
                <span className="flex items-center gap-1.5 text-sky-300 truncate max-w-[260px]">
                  <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{src.filename}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-mono border border-slate-700/50">
                    Page {src.page_number}
                  </span>
                  <button
                    onClick={(e) => handleCopySnippet(src.content, idx, e)}
                    className="p-1 rounded-md text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
                    title="Copy excerpt"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed italic border-l-2 border-sky-500/50 pl-2.5 mt-0.5 bg-slate-900/40 py-1 rounded-r-md">
                "{src.content}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
