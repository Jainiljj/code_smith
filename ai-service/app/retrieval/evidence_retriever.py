import uuid
from typing import List
from app.schemas.compliance import ExtractedEvidence, ExtractedRequirement
from app.retrieval.vector_store import VectorStoreIndex


class HybridEvidenceRetriever:

    @staticmethod
    def retrieve_candidates(
        bid_id: str,
        requirement: ExtractedRequirement,
        vector_index: VectorStoreIndex
    ) -> List[ExtractedEvidence]:
        """
        Retrieves evidence candidates matching a requirement using Hybrid Search (Vector Cosine Similarity + Keyword Match).
        """
        query = f"{requirement.category} {requirement.text_raw} {requirement.threshold or ''} {requirement.unit or ''}"
        search_results = vector_index.search(query, top_k=5)

        evidences = []
        for res in search_results:
            chunk = res["chunk"]
            score = float(res["score"])
            
            # Bound confidence between 0.70 and 0.99
            confidence = min(0.99, max(0.70, round(score * 1.2, 2)))

            ev = ExtractedEvidence(
                evidence_id=f"EVD-{uuid.uuid4().hex[:6].upper()}",
                bid_id=bid_id,
                document_id=chunk["document_id"],
                document_name=chunk["document_name"],
                page=chunk["page"],
                extracted_value=chunk.get("extracted_value"),
                extracted_unit=requirement.unit,
                raw_snippet=chunk["text"],
                extraction_confidence=confidence
            )
            evidences.append(ev)

        return evidences
