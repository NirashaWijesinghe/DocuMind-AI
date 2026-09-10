"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  Loader2, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  BarChart3, 
  AlertCircle, 
  HelpCircle,
  FileDown,
  Printer,
  ClipboardCopy,
  CheckCheck,
  ChevronDown,
  Paperclip,
  X
} from "lucide-react";
import { 
  sendChatMessage, 
  summarizeDocument, 
  fetchSessionDetail,
  uploadDocument,
  ChatMessage, 
  DocumentMeta, 
  ChatSession 
} from "../lib/api";
import SourceBadge from "./SourceBadge";

interface ChatInterfaceProps {
  documents: DocumentMeta[];
  selectedDocId: string | null;
  setSelectedDocId?: (docId: string | null) => void;
  onUploadDocSuccess?: (doc: DocumentMeta) => void;
  triggerSummaryDocId?: string | null;
  onResetTriggerSummary?: () => void;
  activeSessionId: string | null;
  sessions: ChatSession[];
  onRefreshSessions: () => void;
  onSelectSession?: (sessionId: string) => void;
  setActiveSessionId: (sessionId: string | null) => void;
  onNewChat: () => void;
  onDeleteSession?: (sessionId: string, e: React.MouseEvent) => void;
}

export default function ChatInterface({ 
  documents, 
  selectedDocId,
  setSelectedDocId,
  onUploadDocSuccess,
  triggerSummaryDocId,
  onResetTriggerSummary,
  activeSessionId,
  sessions,
  onRefreshSessions,
  onSelectSession,
  setActiveSessionId,
  onNewChat,
  onDeleteSession
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAttach, setIsUploadingAttach] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const selectedDoc = documents.find((d) => d.doc_id === selectedDocId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load session messages when activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      const loadSessionMessages = async () => {
        setIsLoading(true);
        try {
          const detail = await fetchSessionDetail(activeSessionId);
          if (detail && detail.messages) {
            setMessages(detail.messages);
          }
        } catch (error) {
          console.error("Failed to load session messages", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadSessionMessages();
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  // Handle external trigger for document summarization (from DocumentList)
  useEffect(() => {
    if (triggerSummaryDocId) {
      handleAutoSummarize(triggerSummaryDocId);
      if (onResetTriggerSummary) onResetTriggerSummary();
    }
  }, [triggerSummaryDocId]);

  const handleAutoSummarize = async (docId: string) => {
    const doc = documents.find((d) => d.doc_id === docId);
    if (!doc || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: `⚡ Generate an Executive Summary and Key Takeaways for '${doc.filename}'`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await summarizeDocument(docId);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      onRefreshSessions();
    } catch (error: any) {
      try {
        const response = await sendChatMessage(
          "Summarize the entire document and list key takeaways with metrics.",
          docId,
          [],
          activeSessionId
        );
        if (!activeSessionId && response.session_id) {
          setActiveSessionId(response.session_id);
        }
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        onRefreshSessions();
      } catch (err: any) {
        const errMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Failed to generate document summary. Please check backend connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setAttachError("Please select a valid PDF document (.pdf only).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setAttachError("File size exceeds 20MB limit.");
      return;
    }

    setIsUploadingAttach(true);
    setAttachError(null);
    try {
      const res = await uploadDocument(file);
      if (res.document) {
        if (onUploadDocSuccess) {
          onUploadDocSuccess(res.document);
        }
        if (setSelectedDocId) {
          setSelectedDocId(res.document.doc_id);
        }
      }
    } catch (err: any) {
      setAttachError(
        err.response?.data?.detail || "Could not extract text. This PDF might be scanned or image-only."
      );
    } finally {
      setIsUploadingAttach(false);
      if (chatFileInputRef.current) {
        chatFileInputRef.current.value = "";
      }
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInputPrompt("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage(
        userMessage.content, 
        selectedDocId || undefined, 
        history,
        activeSessionId
      );

      if (!activeSessionId && response.session_id) {
        setActiveSessionId(response.session_id);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onRefreshSessions();
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.response?.data?.detail || "Sorry, an error occurred while connecting to the AI model. Please check your backend server.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [allCopied, setAllCopied] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateMarkdownTranscript = () => {
    let markdown = `# LexiGuard AI - Contract Legal Consultation Transcript\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n`;
    markdown += `Focus Contract: ${selectedDoc ? selectedDoc.filename : "All Indexed Agreements"}\n\n`;
    markdown += `---\n\n`;

    messages.forEach((m) => {
      const author = m.role === "user" ? "👤 Legal Counsel / User" : "⚖️ LexiGuard AI Legal Copilot";
      markdown += `### ${author} [${m.timestamp}]\n\n${m.content}\n\n`;
      if (m.sources && m.sources.length > 0) {
        markdown += `**Verified Clause Citations:**\n`;
        m.sources.forEach((s) => {
          markdown += `- **${s.filename}** (Page ${s.page_number}): "${s.content}"\n`;
        });
        markdown += `\n`;
      }
      markdown += `---\n\n`;
    });
    return markdown;
  };

  const handleExportMarkdown = () => {
    if (messages.length === 0) return;
    const markdown = generateMarkdownTranscript();
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LexiGuard_Legal_Consult_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    if (messages.length === 0) return;
    setShowExportMenu(false);

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let contentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>LexiGuard AI Legal Consultation Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1a202c;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 8px; font-size: 22px; }
          .meta { color: #64748b; font-size: 13px; margin-bottom: 30px; }
          .message { margin-bottom: 24px; padding: 18px; border-radius: 12px; }
          .user { background-color: #f1f5f9; border-left: 4px solid #3b82f6; }
          .assistant { background-color: #f8fafc; border-left: 4px solid #10b981; border: 1px solid #e2e8f0; border-left-width: 4px; }
          .author { font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #334155; }
          .body { font-size: 14px; white-space: pre-wrap; }
          .citations { margin-top: 14px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #475569; }
        </style>
      </head>
      <body>
        <h1>⚖️ LexiGuard AI Legal Consultation Report</h1>
        <div class="meta">
          <strong>Target Agreement:</strong> ${selectedDoc ? selectedDoc.filename : "All Indexed Contracts"}<br>
          <strong>Generated:</strong> ${new Date().toLocaleString()}
        </div>
    `;

    messages.forEach((m) => {
      const isUser = m.role === "user";
      contentHtml += `
        <div class="message ${isUser ? "user" : "assistant"}">
          <div class="author">${isUser ? "User / Legal Counsel" : "LexiGuard Legal Copilot"} (${m.timestamp})</div>
          <div class="body">${m.content.replace(/\n/g, "<br>")}</div>
      `;

      if (m.sources && m.sources.length > 0) {
        contentHtml += `<div class="citations"><strong>Verified Citations:</strong><br>`;
        m.sources.forEach((s) => {
          contentHtml += `• <em>${s.filename}</em> (Page ${s.page_number}): "${s.content}"<br>`;
        });
        contentHtml += `</div>`;
      }

      contentHtml += `</div>`;
    });

    contentHtml += `
      </body>
      </html>
    `;

    printWindow.document.write(contentHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleCopyTranscript = () => {
    if (messages.length === 0) return;
    const markdown = generateMarkdownTranscript();
    navigator.clipboard.writeText(markdown);
    setAllCopied(true);
    setTimeout(() => {
      setAllCopied(false);
      setShowExportMenu(false);
    }, 1500);
  };

  const samplePrompts = [
    { label: "Liability & Indemnity", text: "What is the liability cap and what are the indemnification obligations in this agreement?", icon: AlertCircle },
    { label: "Non-Compete & Restrictions", text: "Is there a non-compete, exclusivity, or non-solicitation clause? What are the restrictions?", icon: FileText },
    { label: "Termination & Breach", text: "What are the termination rights, notice periods, and breach remedies in this contract?", icon: BarChart3 },
    { label: "Draft Redline Counter-Clause", text: "Draft a fair, mutual redline counter-clause for the highest risk liability section in this agreement.", icon: HelpCircle },
  ];

  const currentActiveSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="relative flex flex-col h-[740px] bg-slate-900/50 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100 truncate">
                {currentActiveSession ? currentActiveSession.title : "LexiGuard Legal Copilot"}
              </h3>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20 shrink-0">
                Legal AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {selectedDoc ? (
                <span className="text-sky-400 font-medium">Contract: {selectedDoc.filename}</span>
              ) : (
                <span>All Indexed Contracts</span>
              )}
            </p>
          </div>
        </div>

        {/* Clean Header Actions (Export Dropdown & Clear only) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Export Dropdown - Always visible */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => messages.length > 0 && setShowExportMenu(!showExportMenu)}
              disabled={messages.length === 0}
              className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                messages.length === 0
                  ? "bg-slate-800/30 border-slate-800/60 text-slate-400 cursor-not-allowed opacity-50"
                  : showExportMenu
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-300 cursor-pointer shadow-sm"
                  : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-sky-500/40 hover:text-sky-300 cursor-pointer"
              }`}
              title={messages.length === 0 ? "Ask a question to enable export options" : "Export research options"}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && messages.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#090d24] border border-slate-700/80 shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Export Research Transcript
                </div>

                <button
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-sky-500/15 hover:text-sky-300 transition-colors text-left cursor-pointer group"
                >
                  <FileDown className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="font-medium leading-tight">Markdown (.md)</div>
                    <div className="text-[10px] text-slate-400">For Notion, Obsidian & Notes</div>
                  </div>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-indigo-500/15 hover:text-indigo-300 transition-colors text-left cursor-pointer group"
                >
                  <Printer className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-medium leading-tight">Print / Save as PDF</div>
                    <div className="text-[10px] text-slate-400">Formatted Report for sharing</div>
                  </div>
                </button>

                <button
                  onClick={handleCopyTranscript}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-emerald-500/15 hover:text-emerald-300 transition-colors text-left cursor-pointer group"
                >
                  {allCopied ? (
                    <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ClipboardCopy className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-medium leading-tight">
                      {allCopied ? "Copied to Clipboard!" : "Copy Full Transcript"}
                    </div>
                    <div className="text-[10px] text-slate-400">Copy text with citations</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                onNewChat();
              }}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-rose-900/50 hover:bg-rose-950/20 transition-colors cursor-pointer"
              title="Clear current conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-200">Ask LexiGuard Legal Copilot</h4>
              <p className="text-xs text-slate-400 mt-1">
                Retrieve exact contract clauses, verify liability limits, draft counter-clauses, and cite pinpoint page numbers.
              </p>
            </div>

            {documents.length > 0 && (
              <div className="w-full pt-2 space-y-2">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Legal Consultation Quick Actions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {samplePrompts.map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt.text)}
                        className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/80 text-xs text-slate-300 transition-all text-left flex items-center gap-2 group cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium truncate">{prompt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm group relative ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-200">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-5 space-y-1 my-2 text-slate-300">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-5 space-y-1 my-2 text-slate-300">{children}</ol>,
                        li: ({ children }) => <li className="text-slate-300">{children}</li>,
                        h1: ({ children }) => <h1 className="text-base font-bold text-sky-200 mt-3 mb-1">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-bold text-sky-200 mt-2.5 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300 mt-2 mb-1">{children}</h3>,
                        strong: ({ children }) => <strong className="font-semibold text-sky-200">{children}</strong>,
                        code: ({ children }) => (
                          <code className="bg-slate-950 px-1.5 py-0.5 rounded text-sky-300 font-mono text-[11px] border border-slate-800">
                            {children}
                          </code>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2">
                            <table className="min-w-full divide-y divide-slate-800 text-xs text-left border border-slate-800 rounded-lg">{children}</table>
                          </div>
                        ),
                        th: ({ children }) => <th className="px-2 py-1 bg-slate-800/80 font-semibold text-slate-200 border-b border-slate-700">{children}</th>,
                        td: ({ children }) => <td className="px-2 py-1 border-b border-slate-800/60 text-slate-300">{children}</td>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <SourceBadge sources={msg.sources} />
                )}

                <div className="flex items-center justify-between mt-2 pt-1">
                  {msg.role === "assistant" ? (
                    <button
                      onClick={() => handleCopyMessage(msg.content, msg.id)}
                      className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  ) : <div />}

                  <div
                    className={`text-[10px] ${
                      msg.role === "user" ? "text-sky-200/80" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3.5 justify-start animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              <span className="text-xs text-slate-400">Searching vector embeddings & formulating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field & Prompt Chips */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 flex flex-col gap-2">
        {/* Attachment Error Banner */}
        {attachError && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{attachError}</span>
            </div>
            <button
              onClick={() => setAttachError(null)}
              className="text-rose-400 hover:text-rose-200 p-1 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Attached Document Pill / Context Bar */}
        {selectedDoc && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 text-sky-300 min-w-0">
              <Paperclip className="w-3.5 h-3.5 shrink-0 text-sky-400" />
              <span className="font-medium truncate max-w-[280px] sm:max-w-[400px]">
                Target Document: {selectedDoc.filename}
              </span>
              <span className="text-[10px] text-sky-400/80 shrink-0">
                ({selectedDoc.total_pages} pages, {selectedDoc.total_chunks} chunks)
              </span>
            </div>
            {setSelectedDocId && (
              <button
                type="button"
                onClick={() => setSelectedDocId(null)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 px-2 py-0.5 rounded-md hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
                title="Switch scope to search across all documents"
              >
                <span>Query All Docs</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {selectedDoc && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Quick Ask:</span>
            <button
              onClick={() => handleSend("Give me a comprehensive executive summary of this document.")}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-sky-950/60 hover:border-sky-500/40 border border-slate-700/60 text-slate-300 text-[11px] whitespace-nowrap transition-all cursor-pointer"
            >
              ⚡ Executive Summary
            </button>
            <button
              onClick={() => handleSend("List all important numbers, statistics, and metrics in bullet points.")}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-sky-950/60 hover:border-sky-500/40 border border-slate-700/60 text-slate-300 text-[11px] whitespace-nowrap transition-all cursor-pointer"
            >
              📊 Key Metrics
            </button>
            <button
              onClick={() => handleSend("What are the key conclusions, action items, and next steps?")}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-sky-950/60 hover:border-sky-500/40 border border-slate-700/60 text-slate-300 text-[11px] whitespace-nowrap transition-all cursor-pointer"
            >
              🎯 Next Steps
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={chatFileInputRef}
            onChange={handleAttachFile}
            accept=".pdf"
            className="hidden"
          />

          {/* Attachment Paperclip Button */}
          <button
            type="button"
            onClick={() => chatFileInputRef.current?.click()}
            disabled={isUploadingAttach || isLoading}
            title="Attach a new PDF document directly to chat"
            className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900 text-slate-400 hover:text-sky-300 transition-all cursor-pointer disabled:opacity-40"
          >
            {isUploadingAttach ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              documents.length === 0
                ? "Please upload a document or attach PDF to enable AI chat..."
                : selectedDoc
                ? `Ask anything about ${selectedDoc.filename}...`
                : "Ask a question across all documents in knowledge base..."
            }
            disabled={documents.length === 0 || isLoading}
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading || documents.length === 0}
            className="p-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium transition-all shadow-lg shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
