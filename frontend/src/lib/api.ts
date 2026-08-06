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
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  timestamp: string;
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
  history: { role: string; content: string }[] = []
): Promise<{ answer: string; sources: SourceCitation[]; doc_id?: string }> {
  const response = await api.post("/api/chat", {
    message,
    doc_id: docId || null,
    history,
  });
  return response.data;
}

export async function summarizeDocument(docId: string): Promise<{ doc_id: string; filename: string; summary: string }> {
  const response = await api.post(`/api/documents/${docId}/summarize`);
  return response.data;
}

export async function checkBackendHealth(): Promise<{ status: string; has_gemini_key: boolean }> {
  try {
    const response = await api.get("/api/health");
    return response.data;
  } catch (error) {
    return { status: "offline", has_gemini_key: false };
  }
}
