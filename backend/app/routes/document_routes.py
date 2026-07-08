import shutil
import json
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.config import settings
from app.services.pdf_service import pdf_service
from app.services.vector_service import vector_service
from app.services.ai_service import ai_service
from app.models.schemas import UploadResponse, DocumentMetadata, DocumentListResponse

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# Metadata storage file
META_FILE = settings.UPLOAD_PATH / "documents_meta.json"

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

@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF document, extract pages, chunk content, and index into ChromaDB.
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
            "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        all_meta = _load_meta()
        all_meta[doc_id] = doc_meta
        _save_meta(all_meta)

        return UploadResponse(
            success=True,
            message=f"Document '{file.filename}' processed successfully ({total_pages} pages, {len(chunks)} chunks indexed).",
            document=DocumentMetadata(**doc_meta)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.get("", response_model=DocumentListResponse)
async def list_documents():
    """
    Returns list of all uploaded and indexed documents.
    """
    meta_dict = _load_meta()
    docs = [DocumentMetadata(**data) for data in meta_dict.values()]
    return DocumentListResponse(documents=docs, total_count=len(docs))

@router.post("/{doc_id}/summarize")
async def summarize_document(doc_id: str):
    """
    Generates an executive summary and key takeaways for a specific document.
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

    # Delete file from disk if exists
    doc_info = meta_dict.pop(doc_id)
    file_path = settings.UPLOAD_PATH / doc_info["filename"]
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception:
            pass

    _save_meta(meta_dict)
    return {"success": True, "message": f"Document '{doc_info['filename']}' deleted successfully."}
