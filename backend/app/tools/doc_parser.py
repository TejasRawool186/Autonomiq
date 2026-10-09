"""Document Parser Tool for Autonomiq.
Extracts and sanitizes text from PDF, TXT, and Markdown files.
"""

from pathlib import Path
from typing import Dict, Any, Optional


class DocumentParser:
    @staticmethod
    def parse_file(file_path: Path) -> Dict[str, Any]:
        """Parse document and return title, text, character count, and metadata."""
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        suffix = file_path.suffix.lower()
        if suffix in [".txt", ".text"]:
            return DocumentParser._parse_txt(file_path)
        elif suffix in [".md", ".markdown"]:
            return DocumentParser._parse_md(file_path)
        elif suffix == ".pdf":
            return DocumentParser._parse_pdf(file_path)
        else:
            raise ValueError(f"Unsupported document format: {suffix}. Supported: .pdf, .txt, .md")

    @staticmethod
    def _parse_txt(file_path: Path) -> Dict[str, Any]:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        return {
            "title": file_path.stem,
            "content": content.strip(),
            "format": "txt",
            "char_count": len(content),
            "metadata": {"filename": file_path.name},
        }

    @staticmethod
    def _parse_md(file_path: Path) -> Dict[str, Any]:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        
        # Simple heading 1 extraction for title
        title = file_path.stem
        for line in content.splitlines():
            line_s = line.strip()
            if line_s.startswith("# "):
                title = line_s.replace("# ", "").strip()
                break

        return {
            "title": title,
            "content": content.strip(),
            "format": "md",
            "char_count": len(content),
            "metadata": {"filename": file_path.name},
        }

    @staticmethod
    def _parse_pdf(file_path: Path) -> Dict[str, Any]:
        extracted_text = []
        metadata = {}
        try:
            import pypdf
            reader = pypdf.PdfReader(str(file_path))
            metadata = {k: str(v) for k, v in (reader.metadata or {}).items()}
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    extracted_text.append(f"--- Page {page_num + 1} ---\n" + page_text)
            content = "\n\n".join(extracted_text)
        except ImportError:
            # Fallback if pypdf is not installed yet
            content = f"[PDF file: {file_path.name} (install pypdf to view full contents)]"

        return {
            "title": metadata.get("/Title") or file_path.stem,
            "content": content.strip(),
            "format": "pdf",
            "char_count": len(content),
            "metadata": metadata,
        }
