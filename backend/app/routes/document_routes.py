import shutil
import json
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.config import settings
from app.services.pdf_service import pdf_service
from app.services.vector_service import vector_service
from app.services.ai_service import ai_service
from app.models.schemas import (
    UploadResponse, 
    DocumentMetadata, 
    DocumentListResponse, 
    BatchUploadResponse,
    ContractAuditReport
)

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# Metadata storage file
META_FILE = settings.UPLOAD_PATH / "documents_meta.json"
AUDIT_FILE = settings.UPLOAD_PATH / "contracts_audit.json"

def _load_meta() -> dict:
    if META_FILE.exists():
        try:
            with open(META_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _save_meta(data: dict):
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def _load_audits() -> dict:
    if AUDIT_FILE.exists():
        try:
            with open(AUDIT_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _save_audits(data: dict):
    with open(AUDIT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a Legal Contract PDF, extract pages, chunk content, and index into ChromaDB.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported at this time."
        )

    # Save PDF locally
    file_path = settings.UPLOAD_PATH / file.filename
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    # Extract & Chunk text
    try:
        chunks, total_pages, doc_id = pdf_service.process_pdf(file_path, file.filename)
        
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this PDF. It might be scanned or image-only."
            )

        # Index chunks into Vector Database
        vector_service.add_chunks(chunks)

        # Store metadata
        file_size_kb = round(file_path.stat().st_size / 1024, 2)
        doc_meta = {
            "doc_id": doc_id,
            "filename": file.filename,
            "file_size_kb": file_size_kb,
            "total_pages": total_pages,
            "total_chunks": len(chunks),
            "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "risk_score": None,
            "risk_level": None
        }

        all_meta = _load_meta()
        all_meta[doc_id] = doc_meta
        _save_meta(all_meta)

        return UploadResponse(
            success=True,
            message=f"Contract '{file.filename}' processed & indexed ({total_pages} pages, {len(chunks)} clauses).",
            document=DocumentMetadata(**doc_meta)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.post("/upload-batch", response_model=BatchUploadResponse)
async def upload_multiple_documents(files: list[UploadFile] = File(...)):
    """
    Upload multiple PDF documents in one request, extract, chunk, and index into ChromaDB.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    successful_docs: list[DocumentMetadata] = []
    failed_files: list[dict] = []
    all_meta = _load_meta()

    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            failed_files.append({"filename": file.filename, "reason": "Only PDF files are supported."})
            continue

        file_path = settings.UPLOAD_PATH / file.filename
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            chunks, total_pages, doc_id = pdf_service.process_pdf(file_path, file.filename)
            if not chunks:
                failed_files.append({"filename": file.filename, "reason": "No text extracted (scanned/empty)."})
                continue

            vector_service.add_chunks(chunks)

            file_size_kb = round(file_path.stat().st_size / 1024, 2)
            doc_meta = {
                "doc_id": doc_id,
                "filename": file.filename,
                "file_size_kb": file_size_kb,
                "total_pages": total_pages,
                "total_chunks": len(chunks),
                "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "risk_score": None,
                "risk_level": None
            }
            all_meta[doc_id] = doc_meta
            successful_docs.append(DocumentMetadata(**doc_meta))
        except Exception as err:
            failed_files.append({"filename": file.filename, "reason": str(err)})

    _save_meta(all_meta)

    return BatchUploadResponse(
        success=len(successful_docs) > 0,
        message=f"Successfully indexed {len(successful_docs)} of {len(files)} document(s).",
        total_uploaded=len(successful_docs),
        successful_documents=successful_docs,
        failed_files=failed_files
    )

@router.get("", response_model=DocumentListResponse)
async def list_documents():
    """
    Returns list of all uploaded and indexed contracts.
    """
    meta_dict = _load_meta()
    audits_dict = _load_audits()
    
    docs = []
    for doc_id, data in meta_dict.items():
        doc_data = dict(data)
        if doc_id in audits_dict:
            audit = audits_dict[doc_id]
            doc_data["risk_score"] = audit.get("overall_risk_score")
            doc_data["risk_level"] = audit.get("risk_level")
            doc_data["is_legal_contract"] = audit.get("is_legal_contract", True)
            doc_data["document_category"] = audit.get("document_category", "Legal Agreement")
        docs.append(DocumentMetadata(**doc_data))
        
    return DocumentListResponse(documents=docs, total_count=len(docs))

@router.post("/{doc_id}/audit", response_model=ContractAuditReport)
async def perform_contract_audit(doc_id: str):
    """
    Performs a deep document intelligence / legal risk audit on the document.
    """
    meta_dict = _load_meta()
    if doc_id not in meta_dict:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_info = meta_dict[doc_id]
    chunks = vector_service.get_document_chunks(doc_id, limit=20)
    if not chunks:
        raise HTTPException(status_code=400, detail="No indexed clauses available for this contract.")

    # Run AI audit
    audit_report = ai_service.audit_contract(doc_id, doc_info["filename"], chunks)

    # Save to cached audits
    audits_dict = _load_audits()
    audits_dict[doc_id] = audit_report.model_dump()
    _save_audits(audits_dict)

    # Update metadata with risk score & classification
    meta_dict[doc_id]["risk_score"] = audit_report.overall_risk_score
    meta_dict[doc_id]["risk_level"] = audit_report.risk_level
    meta_dict[doc_id]["is_legal_contract"] = audit_report.is_legal_contract
    meta_dict[doc_id]["document_category"] = audit_report.document_category
    _save_meta(meta_dict)

    return audit_report

@router.get("/{doc_id}/audit", response_model=ContractAuditReport)
async def get_contract_audit(doc_id: str):
    """
    Retrieves the existing audit report or generates a new one if not yet audited.
    """
    audits_dict = _load_audits()
    if doc_id in audits_dict:
        return ContractAuditReport(**audits_dict[doc_id])

    # If not yet audited, run audit
    return await perform_contract_audit(doc_id)

@router.get("/{doc_id}/export-audit")
async def export_audit_markdown(doc_id: str):
    """
    Generates an executive-ready Markdown Due Diligence or Document Intelligence report for export.
    """
    meta_dict = _load_meta()
    if doc_id not in meta_dict:
        raise HTTPException(status_code=404, detail="Document not found")

    audits_dict = _load_audits()
    if doc_id not in audits_dict:
        # Run audit first
        audit_report = await perform_contract_audit(doc_id)
        audit_data = audit_report.model_dump()
    else:
        audit_data = audits_dict[doc_id]

    filename = audit_data.get("filename", "Document")
    timestamp = audit_data.get("audit_timestamp", "")
    summary = audit_data.get("executive_summary", "")
    parties = ", ".join(audit_data.get("key_parties", [])) or "Unspecified"
    doc_category = audit_data.get("document_category", "Legal Agreement")
    is_contract = audit_data.get("is_legal_contract", True)

    if not is_contract or audit_data.get("risk_level") == "NON_CONTRACT":
        full_report = f"""# 📄 LexiGuard AI Document Intelligence & Summary Report
**Document Title:** `{filename}`  
**Analyzed Date:** {timestamp}  
**Classification:** {doc_category} (Non-Contract Document)  
**Key Authors / Entities:** {parties}  
**Status:** Validated Non-Contract Document  

---

## 📌 Executive Summary
{summary}

---

## ℹ️ Notice Regarding Contract Audits
This document was verified as a **{doc_category}** rather than an executable commercial legal contract (e.g. NDA, MSA, SLA). Standard commercial contract risk audits, liability caps, and missing clause warnings are not applicable.

---
*Report generated automatically by LexiGuard AI Document Intelligence System.*
"""
        return {
            "doc_id": doc_id,
            "filename": filename,
            "markdown_report": full_report
        }

    # Format Contract Markdown Report
    score = audit_data.get("overall_risk_score", 0)
    level = audit_data.get("risk_level", "UNKNOWN")
    law = audit_data.get("governing_law", "Unspecified")
    term = audit_data.get("effective_dates_or_term", "Unspecified")

    risks_md = ""
    for idx, r in enumerate(audit_data.get("identified_risks", []), 1):
        risks_md += f"""
### {idx}. [{r.get('severity')}] {r.get('clause_title')} (Page {r.get('page_number')})
- **Category:** {r.get('category')}
- **Original Clause:** *"{r.get('original_text')}"*
- **Legal Risk Hazard:** {r.get('risk_explanation')}
- **AI Recommended Counter-Clause:**
```
{r.get('recommended_revision')}
```
"""

    missing_md = ""
    for idx, m in enumerate(audit_data.get("missing_clauses", []), 1):
        missing_md += f"""
### {idx}. [{m.get('importance')}] {m.get('clause_name')}
- **Reason Omission is Risky:** {m.get('reason')}
- **Recommended Clause to Insert:**
```
{m.get('suggested_language')}
```
"""

    full_report = f"""# ⚖️ LexiGuard AI Due Diligence & Contract Risk Audit Report
**Target Agreement:** `{filename}`  
**Audit Date:** {timestamp}  
**Contract Type:** {audit_data.get('contract_type')}  
**Overall Risk Assessment:** **{score}/100 ({level} RISK)**  
**Identified Parties:** {parties}  
**Governing Jurisdiction:** {law}  
**Effective Term:** {term}  

---

## 📌 Executive Summary
{summary}

---

## 🚨 Identified Hazardous Clauses & Redline Recommendations
{risks_md if risks_md else "No critical hazardous clauses identified."}

---

## ⚠️ Missing Standard Protective Terms (Negative Pattern Audit)
{missing_md if missing_md else "All standard protective terms are present."}

---
*Report generated automatically by LexiGuard AI Enterprise Legal Intelligence System.*
"""
    return {
        "doc_id": doc_id,
        "filename": filename,
        "markdown_report": full_report
    }

@router.post("/{doc_id}/summarize")
async def summarize_document(doc_id: str):
    """
    Generates an executive legal summary and key takeaways for a specific document.
    """
    meta_dict = _load_meta()
    if doc_id not in meta_dict:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_info = meta_dict[doc_id]
    chunks = vector_service.get_document_chunks(doc_id, limit=8)
    if not chunks:
        raise HTTPException(status_code=400, detail="No indexed chunks available for this document.")

    summary = ai_service.generate_document_summary(doc_info["filename"], chunks)
    return {
        "doc_id": doc_id,
        "filename": doc_info["filename"],
        "summary": summary
    }

@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    """
    Deletes a document from the vector store and disk.
    """
    meta_dict = _load_meta()
    if doc_id not in meta_dict:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from ChromaDB
    vector_service.delete_document(doc_id)

    # Delete from audits if present
    audits_dict = _load_audits()
    if doc_id in audits_dict:
        audits_dict.pop(doc_id, None)
        _save_audits(audits_dict)

    # Delete file from disk if exists
    doc_info = meta_dict.pop(doc_id)
    file_path = settings.UPLOAD_PATH / doc_info["filename"]
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception:
            pass

    _save_meta(meta_dict)
    return {"success": True, "message": f"Contract '{doc_info['filename']}' deleted successfully."}

