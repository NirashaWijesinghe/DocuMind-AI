import uuid
from pathlib import Path
from typing import List, Dict, Any, Tuple
import pymupdf  # High-performance PyMuPDF
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

class PDFService:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )

    def process_pdf(self, file_path: Path, filename: str) -> Tuple[List[Dict[str, Any]], int, str]:
        """
        Reads a PDF file page by page using PyMuPDF (with pypdf fallback),
        extracts text, and chunks it while preserving page numbers.
        Returns (list_of_chunks_with_metadata, total_pages, doc_id).
        """
        chunks: List[Dict[str, Any]] = []
        doc_id = str(uuid.uuid4())
        total_pages = 0

        # 1. Primary extractor: PyMuPDF (fast & robust for complex fonts/layouts)
        try:
            doc = pymupdf.open(str(file_path))
            total_pages = len(doc)

            for page_idx in range(total_pages):
                page = doc[page_idx]
                text = page.get_text("text") or ""
                
                # If standard text mode was empty, try extracting text blocks
                if not text.strip():
                    blocks = page.get_text("blocks")
                    if blocks:
                        text = "\n".join([b[4] for b in blocks if len(b) > 4 and isinstance(b[4], str)])

                if not text.strip():
                    continue

                page_number = page_idx + 1
                page_chunks = self.splitter.split_text(text)

                for chunk_idx, chunk_text in enumerate(page_chunks):
                    chunks.append({
                        "chunk_id": f"{doc_id}_p{page_number}_c{chunk_idx}",
                        "doc_id": doc_id,
                        "filename": filename,
                        "page_number": page_number,
                        "text": chunk_text
                    })
            doc.close()
        except Exception as e:
            print(f"PyMuPDF error: {e}, falling back to pypdf...")

        # 2. Fallback extractor: pypdf (if PyMuPDF found 0 chunks)
        if not chunks:
            try:
                reader = PdfReader(str(file_path))
                total_pages = len(reader.pages)
                for page_idx, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    if not text.strip():
                        continue

                    page_number = page_idx + 1
                    page_chunks = self.splitter.split_text(text)

                    for chunk_idx, chunk_text in enumerate(page_chunks):
                        chunks.append({
                            "chunk_id": f"{doc_id}_p{page_number}_c{chunk_idx}",
                            "doc_id": doc_id,
                            "filename": filename,
                            "page_number": page_number,
                            "text": chunk_text
                        })
            except Exception as e:
                print(f"pypdf fallback error: {e}")

        return chunks, total_pages, doc_id

pdf_service = PDFService()

