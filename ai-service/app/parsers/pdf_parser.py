import hashlib
import fitz  # PyMuPDF
from typing import List, Dict, Any


class PDFParser:

    @staticmethod
    def extract_pages_from_bytes(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
        """
        Parses raw PDF file bytes using PyMuPDF and extracts page numbers, raw text, and page metadata.
        Falls back to UTF-8 text parsing if byte stream is non-standard PDF.
        """
        pages = []
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text") or ""
                page_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]
                pages.append({
                    "page_number": page_num + 1,
                    "raw_text": text.strip(),
                    "page_hash": page_hash,
                    "word_count": len(text.split()),
                    "filename": filename
                })
            doc.close()
        except Exception:
            # Fallback for plain text or simple bytes stream
            decoded_text = file_bytes.decode('utf-8', errors='ignore')
            page_hash = hashlib.sha256(decoded_text.encode('utf-8')).hexdigest()[:16]
            pages.append({
                "page_number": 1,
                "raw_text": decoded_text.strip(),
                "page_hash": page_hash,
                "word_count": len(decoded_text.split()),
                "filename": filename
            })

        return pages
