# DocuMind AI 📄🧠 | Enterprise AI Document Intelligence & RAG SaaS Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python 3.12](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![ChromaDB](https://img.shields.io/badge/Chroma_Vector_DB-FF6B6B?style=for-the-badge)](https://www.trychroma.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**DocuMind AI** is an enterprise-grade, full-stack AI Document Intelligence SaaS application. It enables users to upload extensive PDF documents (financial statements, research papers, legal contracts), automatically parses & indexes them into semantic vector embeddings, and allows conversational question-answering with verifiable, page-level citations powered by **Retrieval-Augmented Generation (RAG)** and **Google Gemini LLM**.

---

## 🌟 Key Features

- 📑 **Intelligent PDF Chunking Engine:** Splits long documents into overlapping semantic chunks (`RecursiveCharacterTextSplitter`) while maintaining page-level metadata.
- ⚡ **High-Performance Vector Storage:** Persistent vector storage powered by **ChromaDB** with cosine similarity search.
- 🎯 **Verifiable Page Citations:** Every AI answer includes exact source document citations, page numbers, and matching text snippets.
- ⚡ **One-Click Auto-Summarization:** Instantly generate structured Executive Summaries, Key Metrics, and Action Items for any document.
- 📊 **Rich Markdown & Code Rendering:** Full support for bullet points, markdown tables, bold highlights, and syntax formatting.
- 📋 **Export & Copy Utility:** One-click markdown chat transcript export and response clipboard copy.
- 🔍 **Real-Time Document Search:** Instant document filter and multi-document query routing.
- 💬 **Targeted or Global Knowledge Querying:** Query a single isolated document or search across the entire multi-document knowledge base.
- 🎨 **Futuristic Glassmorphic Interface:** Sleek dark-mode dashboard built with **Next.js 15**, **Tailwind CSS**, and **Lucide Icons**.
- 🚀 **Asynchronous High-Throughput Backend:** Built with **Python 3.12** and **FastAPI** with automatic Swagger API documentation.

---

## 🏗️ System Architecture & RAG Pipeline

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 15 + TypeScript)"]
        UI[Glassmorphic UI]
        Upload[Drag & Drop Uploader]
        Chat[Chat Interface with Citations]
    end

    subgraph Server ["Backend (Python FastAPI)"]
        API[FastAPI Endpoints]
        Parser[PyPDF Text Extractor]
        Chunker[LangChain Semantic Splitter]
    end

    subgraph AI_Engine ["AI & Vector Store"]
        Chroma[(ChromaDB Vector Store)]
        LLM[Google Gemini 1.5 Flash]
    end

    Upload -->|1. Upload PDF| API
    API -->|2. Extract text page-by-page| Parser
    Parser -->|3. Overlapping Chunks| Chunker
    Chunker -->|4. Vector Embeddings| Chroma

    Chat -->|5. Ask Question| API
    API -->|6. Semantic Similarity Query| Chroma
    Chroma -->|7. Top-K Matching Paragraphs| API
    API -->|8. Grounded Prompt + Context| LLM
    LLM -->|9. Accurate Answer + Citations| Chat
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python:** v3.11 or v3.12
- **Node.js:** v18.0.0 or higher
- **Google AI API Key:** Free key from [Google AI Studio](https://aistudio.google.com/)

---

### 2. Backend Setup

```bash
cd backend

# 1. Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 2. Configure Environment Variables
# Edit backend/.env and add your GOOGLE_API_KEY
# GOOGLE_API_KEY=your_gemini_key_here

# 3. Start the FastAPI Server
python run.py
```
*API will run on `http://localhost:8000` (Interactive Docs: `http://localhost:8000/docs`).*

---

### 3. Frontend Setup

```bash
cd frontend

# 1. Run Development Server
npm run dev
```
*Frontend will run on `http://localhost:3000`.*

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
