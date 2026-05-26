import uuid
from pathlib import Path
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

class PDFService:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )

    def process_pdf(self, file_path: Path, filename: str) -> Tuple[List[Dict[str, Any]], int]:
        """
        Reads a PDF file page by page, extracts text, and chunks it while preserving page numbers.
        Returns (list_of_chunks_with_metadata, total_pages).
        """
        reader = PdfReader(str(file_path))
        total_pages = len(reader.pages)
        chunks: List[Dict[str, Any]] = []

        doc_id = str(uuid.uuid4())

        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if not text.strip():
                continue
            
            page_number = page_idx + 1
            # Split text on this specific page
            page_chunks = self.splitter.split_text(text)
            
            for chunk_idx, chunk_text in enumerate(page_chunks):
                chunks.append({
                    "chunk_id": f"{doc_id}_p{page_number}_c{chunk_idx}",
                    "doc_id": doc_id,
                    "filename": filename,
                    "page_number": page_number,
                    "text": chunk_text
                })

        return chunks, total_pages, doc_id

pdf_service = PDFService()
