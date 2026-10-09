"""Documents Upload API router.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.storage.file_manager import FileManager
from backend.app.tools.doc_parser import DocumentParser

router = APIRouter(tags=["Documents"])


@router.post("/documents")
async def upload_document(file: UploadFile = File(...)):
    """Upload PDF, TXT, or Markdown document for RAG ingestion."""
    content_bytes = await file.read()
    if not content_bytes:
        raise HTTPException(status_code=400, detail="File is empty")

    path, checksum, size = FileManager.save_upload(content_bytes, file.filename)
    try:
        parsed = DocumentParser.parse_file(path)
    except Exception as e:
        path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "status": "uploaded",
        "filename": file.filename,
        "path": str(path),
        "size_bytes": size,
        "checksum": checksum,
        "title": parsed.get("title"),
        "format": parsed.get("format"),
        "char_count": parsed.get("char_count"),
    }
