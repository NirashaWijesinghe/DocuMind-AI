import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface DocumentMeta {
  doc_id: string;
  filename: string;
  file_size_kb: number;
  total_pages: number;
  total_chunks: number;
  uploaded_at: string;
}

export interface SourceCitation {
  page_number: number;
  content: string;
  doc_id: string;
  filename: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  session_id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  doc_id?: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SessionDetail {
  session: ChatSession;
  messages: ChatMessage[];
}

export async function uploadDocument(file: File): Promise<{ success: boolean; message: string; document: DocumentMeta }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function fetchDocuments(): Promise<DocumentMeta[]> {
  const response = await api.get("/api/documents");
  return response.data.documents || [];
}

export async function deleteDocument(docId: string): Promise<void> {
  await api.delete(`/api/documents/${docId}`);
}

export async function sendChatMessage(
  message: string, 
  docId?: string, 
  history: { role: string; content: string }[] = [],
  sessionId?: string | null
): Promise<{ answer: string; sources: SourceCitation[]; doc_id?: string; session_id: string }> {
  const response = await api.post("/api/chat", {
    message,
    doc_id: docId || null,
    history,
    session_id: sessionId || null,
  });
  return response.data;
}

export async function summarizeDocument(docId: string): Promise<{ doc_id: string; filename: string; summary: string }> {
  const response = await api.post(`/api/documents/${docId}/summarize`);
  return response.data;
}

export async function fetchSessions(): Promise<ChatSession[]> {
  try {
    const response = await api.get("/api/sessions");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch sessions", error);
    return [];
  }
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  try {
    const response = await api.get(`/api/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch session detail for ${sessionId}`, error);
    return null;
  }
}

export async function createSession(title: string = "New Chat", docId?: string | null): Promise<ChatSession> {
  const response = await api.post("/api/sessions", {
    title,
    doc_id: docId || null,
  });
  return response.data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/api/sessions/${sessionId}`);
}

export async function checkBackendHealth(): Promise<{ status: string; has_gemini_key: boolean }> {
  try {
    const response = await api.get("/api/health");
    return response.data;
  } catch (error) {
    return { status: "offline", has_gemini_key: false };
  }
}
