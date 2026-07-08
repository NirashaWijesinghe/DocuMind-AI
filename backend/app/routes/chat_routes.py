from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse, SourceCitation
from app.services.vector_service import vector_service
from app.services.ai_service import ai_service
from app.config import settings

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def chat_with_documents(request: ChatRequest):
    """
    RAG Chat endpoint:
    1. Queries ChromaDB for top relevant context chunks.
    2. Constructs prompt with retrieved context.
    3. Calls LLM (Gemini) to generate grounded response.
    4. Returns answer along with source citations.
    """
    query = request.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Semantic search in Vector Database
    context_chunks = vector_service.query_relevant_chunks(
        query=query, 
        top_k=4, 
        doc_id=request.doc_id
    )

    # 2. Synthesize AI Response via Gemini
    ai_answer = ai_service.generate_rag_response(
        query=query,
        context_chunks=context_chunks,
        history=request.history
    )

    # 3. Format citations
    citations = [
        SourceCitation(
            page_number=c["page_number"],
            content=c["text"][:280] + "..." if len(c["text"]) > 280 else c["text"],
            doc_id=c["doc_id"],
            filename=c["filename"],
            score=c.get("score")
        )
        for c in context_chunks
    ]

    return ChatResponse(
        answer=ai_answer,
        sources=citations,
        doc_id=request.doc_id,
        model_used=settings.GEMINI_MODEL
    )
