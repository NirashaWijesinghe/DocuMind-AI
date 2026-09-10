# LexiGuard AI ⚖️🛡️ | Enterprise Legal Contract Intelligence & Risk Auditor

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python 3.12](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![ChromaDB](https://img.shields.io/badge/Chroma_Vector_DB-FF6B6B?style=for-the-badge)](https://www.trychroma.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**LexiGuard AI** is an enterprise-grade Legal Tech SaaS platform for automated contract intelligence, legal due diligence, and risk redlining. Unlike generic LLM chat tools, LexiGuard AI executes structured compliance audits across legal agreements (NDAs, MSAs, Employment Contracts, Vendor SLAs), calculates an automated **Contract Risk Score (0-100)**, flags hazardous clauses (Unlimited Liability, Restrictive Non-Competes, Ambiguous Termination), detects missing protective terms (Negative RAG), and auto-drafts reciprocal counter-clauses with pinpoint page-level citations.

---

## 🌟 Key Enterprise Capabilities

- ⚖️ **Automated Contract Risk Scoring (0-100):** Instantly calculates risk severity (`CRITICAL`, `HIGH`, `MEDIUM`, `SAFE`) based on a standardized legal audit rubric.
- 🚨 **Clause Redline & Hazard Matrix:** Identifies risky clauses, provides plain-English legal risk explanations, and auto-drafts fair **AI Counter-Clauses** ready to copy.
- ⚠️ **Missing Clause Detection (Negative Pattern RAG):** Audits for omitted essential terms (e.g. Limitation of Liability Caps, Mutual Termination, GDPR Data Breach Notifications).
- 💬 **LexiGuard Legal Copilot:** Multi-turn legal assistant capable of drafting redlines, checking liability caps, and answering queries with exact page citations.
- 📋 **One-Click Due Diligence Report Export:** Generates executive Markdown and PDF audit reports ready for attorneys, executives, or clients.
- ⚡ **ChromaDB Clause Vector Store:** Persistent dense vector retrieval indexed page-by-page.
- 🎨 **Futuristic Enterprise Glassmorphism UI:** Built with **Next.js 15**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🏗️ System Architecture & Legal RAG Pipeline

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 15 + TypeScript)"]
        UI[Glassmorphic Legal Dashboard]
        Upload[Contract Drag & Drop Uploader]
        AuditMatrix[Risk & Redline Matrix View]
        Copilot[Legal Copilot Consultation]
    end

    subgraph Server ["Backend (Python FastAPI)"]
        API[FastAPI Endpoints]
        Parser[PyPDF Page-by-Page Extractor]
        Chunker[LangChain Semantic Splitter]
    end

    subgraph AI_Engine ["AI & Vector Store"]
        Chroma[(ChromaDB Vector Store)]
        Gemini[Google Gemini 1.5 Flash]
    end

    Upload -->|1. Upload Agreement PDF| API
    API -->|2. Extract text & page metadata| Parser
    Parser -->|3. Overlapping Legal Chunks| Chunker
    Chunker -->|4. Vector Embeddings| Chroma

    AuditMatrix -->|5. Trigger Due Diligence Audit| API
    API -->|6. Semantic Retrieval + Legal Rubric| Chroma
    Chroma -->|7. Retrieved Context| API
    API -->|8. Structured JSON Analysis| Gemini
    Gemini -->|9. Risk Score + Redlines + Counter-Clauses| AuditMatrix

    Copilot -->|10. Query Legal Terms / Redline| API
    API -->|11. Grounded Response + Page Citations| Copilot
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

