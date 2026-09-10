from app.schemas.compliance import ExtractedRequirement, RequirementType
from app.retrieval.vector_store import VectorStoreIndex
from app.retrieval.evidence_retriever import HybridEvidenceRetriever
from app.workers.document_worker import DocumentJobWorker


def test_vector_store_search():
    index = VectorStoreIndex()
    index.add_chunk(
        chunk_id="CHK-001",
        document_id="DOC-01",
        document_name="Financial_Statements.pdf",
        page=37,
        text="Annual turnover for FY2025 was recorded at 94 crore INR.",
        extracted_value=94.0
    )
    index.add_chunk(
        chunk_id="CHK-002",
        document_id="DOC-02",
        document_name="Technical_Datasheet.pdf",
        page=5,
        text="Centrifugal pump operational efficiency rating is 88.4 percent.",
        extracted_value=88.4
    )

    results = index.search("turnover crore", top_k=2)
    assert len(results) >= 1
    assert results[0]["chunk"]["document_name"] == "Financial_Statements.pdf"
    assert results[0]["chunk"]["extracted_value"] == 94.0


def test_hybrid_evidence_retriever():
    index = VectorStoreIndex()
    index.add_chunk(
        chunk_id="CHK-101",
        document_id="DOC-07",
        document_name="Financial_Statements.pdf",
        page=37,
        text="Financial statement turnover FY2025: 94 Crore rupees.",
        extracted_value=94.0
    )

    req = ExtractedRequirement(
        requirement_id="REQ-001",
        tender_id="TND-001",
        category="Financial",
        text_raw="Bidder turnover shall be minimum 100 Crore",
        type=RequirementType.NUMERIC_THRESHOLD,
        threshold=100.0,
        unit="Cr"
    )

    candidates = HybridEvidenceRetriever.retrieve_candidates("BID-A-01", req, index)
    assert len(candidates) >= 1
    assert candidates[0].document_name == "Financial_Statements.pdf"
    assert candidates[0].extracted_value == 94.0


def test_document_worker_async_job():
    job_id = DocumentJobWorker.create_job("test_file.pdf", b"%PDF-1.4 sample content line with 100 crore turnover", "BID-A-01")
    status = DocumentJobWorker.get_job_status(job_id)
    assert status["status"] in ["COMPLETED", "PROCESSING"]
    assert status["progress_percent"] > 0
