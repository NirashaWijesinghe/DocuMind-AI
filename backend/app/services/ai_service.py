import os
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from app.config import settings

class AIService:
    def __init__(self):
        self._configured_key = None
        self._model = None
        self.model_candidates = [
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-2.5-flash",
            "gemini-pro",
            "gemini-3.6-flash",
            "gemini-3.7-flash"
        ]

    def _get_model(self):
        api_key = os.getenv("GOOGLE_API_KEY") or settings.GOOGLE_API_KEY
        if api_key and api_key != self._configured_key:
            genai.configure(api_key=api_key)
            self._configured_key = api_key
            model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            self._model = genai.GenerativeModel(model_name)
        return self._model, api_key

    def generate_rag_response(
        self, 
        query: str, 
        context_chunks: List[Dict[str, Any]], 
        history: Optional[List[Any]] = None
    ) -> str:
        """
        Synthesizes a response to the user question based on the retrieved context chunks.
        """
        if not context_chunks:
            return "I couldn't find any relevant information in the uploaded documents to answer your question. Please ensure the document is uploaded properly or rephrase your question."

        # Format context with source citations
        context_text = "\n\n---\n\n".join([
            f"[Source: {c['filename']}, Page: {c['page_number']}]\n{c['text']}"
            for c in context_chunks
        ])

        system_prompt = f"""You are DocuMind AI, an elite enterprise document research assistant.
You provide clear, highly accurate, and comprehensive answers based STRICTLY on the provided document excerpts.

CRITICAL INSTRUCTIONS:
1. Base your answer ONLY on the context provided below. Do not make up facts.
2. When mentioning facts or quotes, cite the source clearly (e.g. `[Doc: filename, Page: X]`).
3. If the answer cannot be found in the excerpts, politely explain that the document does not contain that specific detail.
4. Format your output cleanly using markdown bullet points, bold highlights, tables, and headers where appropriate.

DOCUMENT CONTEXT EXCERPTS:
{context_text}

USER QUESTION:
{query}

ANSWER:"""

        model, api_key = self._get_model()

        if api_key:
            default_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            candidate_models = [default_model] + [m for m in self.model_candidates if m != default_model]
            last_error = None

            for m_name in candidate_models:
                try:
                    m = genai.GenerativeModel(m_name)
                    response = m.generate_content(system_prompt)
                    if response and response.text:
                        return response.text
                except Exception as e:
                    last_error = str(e)
                    continue

            return f"Error connecting to Gemini AI: {last_error}. Please verify your GOOGLE_API_KEY."

        # Fallback demonstration mode
        return f"""**[Demo Mode Notice: Please configure GOOGLE_API_KEY in backend/.env]**

Based on the **{len(context_chunks)} relevant sections** found in your document:

{context_chunks[0]['text'][:300]}...

*(Source: **{context_chunks[0]['filename']}**, Page: **{context_chunks[0]['page_number']}**)*"""

    def generate_document_summary(self, filename: str, sample_chunks: List[Dict[str, Any]]) -> str:
        """
        Generates an executive summary and key takeaways for an entire document.
        """
        if not sample_chunks:
            return "No document text available to summarize."

        context_text = "\n\n---\n\n".join([
            f"[Page {c['page_number']}]\n{c['text']}"
            for c in sample_chunks[:8]
        ])

        prompt = f"""You are DocuMind AI. Provide a structured Executive Summary for the document '{filename}'.

Use the following format in clean Markdown:
### 📌 Executive Summary
A concise 2-3 paragraph high-level overview of the entire document.

### 🔑 Key Takeaways & Core Themes
- Bullet point key findings, decisions, or thesis points.

### 📊 Key Metrics, Dates & Figures (if applicable)
- Important data points, deadlines, financial numbers, or metrics mentioned.

### ⚠️ Risks, Limitations, or Action Items
- Any noted caveats, next steps, or risks.

DOCUMENT EXCERPTS:
{context_text}"""

        model, api_key = self._get_model()
        if api_key:
            default_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            candidate_models = [default_model] + [m for m in self.model_candidates if m != default_model]
            for m_name in candidate_models:
                try:
                    m = genai.GenerativeModel(m_name)
                    response = m.generate_content(prompt)
                    if response and response.text:
                        return response.text
                except Exception:
                    continue

        return f"### 📌 Executive Summary for {filename}\n\nDocument successfully processed and indexed into ChromaDB. Contains {len(sample_chunks)} primary text sections ready for semantic querying."

ai_service = AIService()
