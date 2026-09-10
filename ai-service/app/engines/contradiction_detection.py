import uuid
from typing import List, Optional
from app.schemas.compliance import ExtractedEvidence, ContradictionFlag, Citation


class ContradictionDetectionEngine:

    @staticmethod
    def detect_contradictions(bid_id: str, evidences: List[ExtractedEvidence], requirement_id: Optional[str] = None) -> List[ContradictionFlag]:
        """
        Scans extracted evidence snippets across multiple bidder documents to find conflicting facts or numbers.
        Returns contradiction flags for human review (never automatically accuses bidder of fraud).
        """
        flags = []
        if len(evidences) < 2:
            return flags

        for i in range(len(evidences)):
            for j in range(i + 1, len(evidences)):
                ev_a = evidences[i]
                ev_b = evidences[j]

                # Check if evidence comes from different documents and both have numeric values that conflict
                if (ev_a.document_id != ev_b.document_id and
                    ev_a.extracted_value is not None and
                    ev_b.extracted_value is not None and
                    ev_a.extracted_value != ev_b.extracted_value):

                    flag = ContradictionFlag(
                        flag_id=f"FLG-{uuid.uuid4().hex[:6].upper()}",
                        bid_id=bid_id,
                        requirement_id=requirement_id,
                        source_a=Citation(
                            document_id=ev_a.document_id,
                            document_name=ev_a.document_name,
                            page=ev_a.page,
                            evidence_id=ev_a.evidence_id,
                            snippet=ev_a.raw_snippet
                        ),
                        source_b=Citation(
                            document_id=ev_b.document_id,
                            document_name=ev_b.document_name,
                            page=ev_b.page,
                            evidence_id=ev_b.evidence_id,
                            snippet=ev_b.raw_snippet
                        ),
                        description=f"Conflicting values detected between '{ev_a.document_name}' (Value: {ev_a.extracted_value}) and '{ev_b.document_name}' (Value: {ev_b.extracted_value}). Requires human verification.",
                        severity="HIGH"
                    )
                    flags.append(flag)

        return flags
