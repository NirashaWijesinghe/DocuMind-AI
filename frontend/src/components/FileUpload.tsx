"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileUp } from "lucide-react";
import { uploadDocument, DocumentMeta } from "../lib/api";

interface FileUploadProps {
  onUploadSuccess: (doc: DocumentMeta) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadStatus({
        type: "error",
        message: "Please upload a PDF document (.pdf only).",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadStatus({
        type: "error",
        message: "File size exceeds 20MB limit.",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const result = await uploadDocument(file);
      setUploadStatus({
        type: "success",
        message: `Indexed "${file.name}" (${result.document.total_pages} pages, ${result.document.total_chunks} vector chunks)`,
      });
      onUploadSuccess(result.document);
    } catch (error: any) {
      setUploadStatus({
        type: "error",
        message: error.response?.data?.detail || "Failed to process PDF. Please check backend server.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-sky-400 bg-sky-950/30 scale-[1.01]"
            : "border-slate-700/80 bg-slate-900/40 hover:border-sky-500/50 hover:bg-slate-900/60"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          accept=".pdf"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              {isUploading ? "Processing & Indexing Document..." : "Drop PDF here or click to browse"}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Supports Research Papers, Financial Reports, Contracts (Max 20MB)
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] text-sky-400 font-medium px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
            <FileUp className="w-3 h-3" />
            <span>Automatic Vector Chunking & Embedding</span>
          </div>
        </div>
      </div>

      {uploadStatus.type && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn ${
            uploadStatus.type === "success"
              ? "bg-emerald-950/40 border border-emerald-800/50 text-emerald-300"
              : "bg-rose-950/40 border border-rose-800/50 text-rose-300"
          }`}
        >
          {uploadStatus.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="truncate">{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
}
