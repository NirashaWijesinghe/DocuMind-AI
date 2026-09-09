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
  HelpCircle
} from "lucide-react";
import { 
  sendChatMessage, 
  summarizeDocument, 
  fetchSessionDetail,
  ChatMessage, 
  DocumentMeta, 
  ChatSession 
} from "../lib/api";
import SourceBadge from "./SourceBadge";

interface ChatInterfaceProps {
  documents: DocumentMeta[];
  selectedDocId: string | null;
  triggerSummaryDocId?: string | null;
  onResetTriggerSummary?: () => void;
  activeSessionId: string | null;
  sessions: ChatSession[];
  onRefreshSessions: () => void;
  setActiveSessionId: (sessionId: string | null) => void;
  onNewChat: () => void;
}

export default function ChatInterface({ 
  documents, 
  selectedDocId,
  triggerSummaryDocId,
  onResetTriggerSummary,
  activeSessionId,
  sessions,
  onRefreshSessions,
  setActiveSessionId,
  onNewChat
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleExportChat = () => {
    if (messages.length === 0) return;

    let markdown = `# DocuMind AI - Document Research Transcript\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n`;
    markdown += `Focus Document: ${selectedDoc ? selectedDoc.filename : "All Knowledge Base Documents"}\n\n`;
    markdown += `---\n\n`;

    messages.forEach((m) => {
      const author = m.role === "user" ? "👤 User" : "🧠 DocuMind AI";
      markdown += `### ${author} [${m.timestamp}]\n\n${m.content}\n\n`;
      if (m.sources && m.sources.length > 0) {
        markdown += `**Verified Sources Cited:**\n`;
        m.sources.forEach((s) => {
          markdown += `- **${s.filename}** (Page ${s.page_number}): "${s.content}"\n`;
        });
        markdown += `\n`;
      }
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `DocuMind_Chat_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const samplePrompts = [
    { label: "Executive Summary", text: "Provide a complete Executive Summary and key takeaways for this document.", icon: FileText },
    { label: "Key Metrics & Data", text: "Extract all important numerical metrics, statistics, and figures mentioned.", icon: BarChart3 },
    { label: "Risks & Limitations", text: "What are the main risks, limitations, or caveats discussed in this document?", icon: AlertCircle },
    { label: "Recommended Actions", text: "What are the recommended action items, next steps, and conclusions?", icon: HelpCircle },
  ];

  const currentActiveSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="relative flex flex-col h-[740px] bg-slate-900/50 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100 truncate">
                {currentActiveSession ? currentActiveSession.title : "DocuMind AI Assistant"}
              </h3>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20 shrink-0">
                Powered by Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {selectedDoc ? (
                <span className="text-sky-400 font-medium">Doc: {selectedDoc.filename}</span>
              ) : (
                <span>All documents</span>
              )}
            </p>
          </div>
        </div>

        {/* Clean Header Actions (Export & Clear only) */}
        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            <>
              <button
                onClick={handleExportChat}
                className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-sky-500/40 hover:bg-sky-950/20 transition-all cursor-pointer"
                title="Download chat transcript as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

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
            </>
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
              <h4 className="text-base font-semibold text-slate-200">Ask anything about your documents</h4>
              <p className="text-xs text-slate-400 mt-1">
                DocuMind will retrieve the exact paragraphs, cite page numbers, and formulate accurate answers.
              </p>
            </div>

            {documents.length > 0 && (
              <div className="w-full pt-2 space-y-2">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Quick Research Actions
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
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              documents.length === 0
                ? "Please upload a document to enable AI chat..."
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
