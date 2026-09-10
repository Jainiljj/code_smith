import uuid
from typing import List, Optional
from app.schemas.compliance import ExtractedEvidence, ExtractedRequirement


class DocumentIntelligenceEngine:

    @staticmethod
    def extract_evidence_from_text(
        bid_id: str,
        document_id: str,
        document_name: str,
        content_text: str,
        requirement: Optional[ExtractedRequirement] = None
    ) -> List[ExtractedEvidence]:
        """
        Parses document pages/content and extracts structured evidence candidates matching a requirement.
        """
        evidences = []
        pages = content_text.split("\n--- PAGE ") if content_text else [""]

        for page_idx, page_content in enumerate(pages, start=1):
            lines = [l.strip() for l in page_content.split('\n') if l.strip()]

            for line in lines:
                # Check for financial turnover patterns
                if "turnover" in line.lower() or "financial" in line.lower() or "fy" in line.lower() or "₹" in line or "crore" in line.lower() or "cr" in line.lower():
                    import re
                    num_match = re.search(r'₹?\s*(\d+(?:\.\d+)?)', line)
                    extracted_val = float(num_match.group(1)) if num_match else None
                    unit = "Cr" if ("cr" in line.lower() or "crore" in line.lower()) else ("%" if "%" in line else None)

                    evidences.append(ExtractedEvidence(
                        evidence_id=f"EVD-{uuid.uuid4().hex[:6].upper()}",
                        bid_id=bid_id,
                        document_id=document_id,
                        document_name=document_name,
                        page=page_idx,
                        extracted_value=extracted_val,
                        extracted_unit=unit,
                        raw_snippet=line,
                        extraction_confidence=0.94
                    ))
                # Check for experience or general datasheet specs
                elif requirement and (requirement.category.lower() in line.lower() or requirement.type.value in line.lower()):
                    evidences.append(ExtractedEvidence(
                        evidence_id=f"EVD-{uuid.uuid4().hex[:6].upper()}",
                        bid_id=bid_id,
                        document_id=document_id,
                        document_name=document_name,
                        page=page_idx,
                        extracted_value=None,
                        extracted_unit=None,
                        raw_snippet=line,
                        extraction_confidence=0.89
                    ))

        # Fallback if no specific keyword line was matched but content exists
        if not evidences and content_text:
            evidences.append(ExtractedEvidence(
                evidence_id=f"EVD-{uuid.uuid4().hex[:6].upper()}",
                bid_id=bid_id,
                document_id=document_id,
                document_name=document_name,
                page=1,
                extracted_value=None,
                extracted_unit=None,
                raw_snippet=content_text[:300],
                extraction_confidence=0.75
            ))

        return evidences
