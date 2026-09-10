import re
from typing import List
from app.schemas.compliance import ExtractedRequirement, RequirementType


class TenderUnderstandingEngine:

    @staticmethod
    def extract_requirements(tender_id: str, raw_text: str) -> List[ExtractedRequirement]:
        """
        Parses tender document text and extracts structured requirements.
        Uses deterministic pattern parsing with fallback to qualitative text requirements.
        """
        requirements = []
        lines = [line.strip() for line in raw_text.split('\n') if line.strip()]

        req_counter = 1
        for line in lines:
            # Check for numeric turnover requirement (e.g. minimum 100 crore annual turnover OR turnover of at least 100 crore)
            turnover_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lakhs)\b.*?\bturnover\b|\bturnover\b.*?\b(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lakhs)?\b', line, re.IGNORECASE)
            if turnover_match:
                val = float(turnover_match.group(1) or turnover_match.group(3))
                unit = turnover_match.group(2) or turnover_match.group(4) or "Cr"
                requirements.append(ExtractedRequirement(
                    requirement_id=f"REQ-{req_counter:03d}",
                    tender_id=tender_id,
                    category="Financial",
                    text_raw=line,
                    type=RequirementType.NUMERIC_THRESHOLD,
                    operator=">=",
                    threshold=val,
                    unit=unit.strip().capitalize(),
                    mandatory=True,
                    source_page=1
                ))
                req_counter += 1
                continue

            # Check for experience requirement (e.g. minimum 5 years experience)
            exp_match = re.search(r'(\d+)\s*years?\s*(?:of\s*)?experience', line, re.IGNORECASE)
            if exp_match:
                val = float(exp_match.group(1))
                requirements.append(ExtractedRequirement(
                    requirement_id=f"REQ-{req_counter:03d}",
                    tender_id=tender_id,
                    category="Experience",
                    text_raw=line,
                    type=RequirementType.NUMERIC_THRESHOLD,
                    operator=">=",
                    threshold=val,
                    unit="Years",
                    mandatory=True,
                    source_page=1
                ))
                req_counter += 1
                continue

            # Check for document presence (e.g. GST certificate, PAN card, ISO 9001)
            doc_match = re.search(r'(GST\s*Certificate|PAN\s*Card|Udyam\s*Registration|ISO\s*9001|EPFO\s*Registration)', line, re.IGNORECASE)
            if doc_match:
                requirements.append(ExtractedRequirement(
                    requirement_id=f"REQ-{req_counter:03d}",
                    tender_id=tender_id,
                    category="Eligibility",
                    text_raw=line,
                    type=RequirementType.DOCUMENT_PRESENCE,
                    operator="==",
                    threshold=None,
                    unit=None,
                    mandatory=True,
                    source_page=1
                ))
                req_counter += 1
                continue

            # Default generic requirement if line starts with requirement keywords
            if re.match(r'^(bidder|vendor|supplier|contractor|shall|must|required)\b', line, re.IGNORECASE):
                requirements.append(ExtractedRequirement(
                    requirement_id=f"REQ-{req_counter:03d}",
                    tender_id=tender_id,
                    category="Technical",
                    text_raw=line,
                    type=RequirementType.TEXT_QUALITATIVE,
                    operator=None,
                    threshold=None,
                    unit=None,
                    mandatory=True,
                    source_page=1
                ))
                req_counter += 1

        # Fallback if no requirements extracted
        if not requirements:
            requirements.append(ExtractedRequirement(
                requirement_id=f"REQ-001",
                tender_id=tender_id,
                category="General",
                text_raw=raw_text[:200] if raw_text else "General compliance requirement",
                type=RequirementType.TEXT_QUALITATIVE,
                mandatory=True,
                source_page=1
            ))

        return requirements
