from app.schemas.compliance import (
    ExtractedRequirement,
    RequirementType,
    ExtractedEvidence,
    ComplianceStatus,
    VerificationMethod
)
from app.engines.tender_understanding import TenderUnderstandingEngine
from app.engines.compliance_reasoning import ComplianceReasoningEngine
from app.engines.contradiction_detection import ContradictionDetectionEngine


def test_tender_understanding_turnover():
    text = "Requirement 1: Bidder must have minimum 100 crore annual turnover for each of the previous 3 financial years."
    reqs = TenderUnderstandingEngine.extract_requirements("TND-001", text)
    assert len(reqs) >= 1
    req = reqs[0]
    assert req.category == "Financial"
    assert req.type == RequirementType.NUMERIC_THRESHOLD
    assert req.threshold == 100.0
    assert req.operator == ">="


def test_compliance_reasoning_non_compliant_turnover():
    # Canonical worked demo case from README.md Section 12:
    # Requirement: >= 100 Cr turnover
    # Evidence: 94 Cr in FY25
    req = ExtractedRequirement(
        requirement_id="REQ-014",
        tender_id="TND-001",
        category="Financial",
        text_raw="Pump efficiency / Turnover shall not be less than 100 Crore",
        type=RequirementType.NUMERIC_THRESHOLD,
        operator=">=",
        threshold=100.0,
        unit="Cr",
        mandatory=True,
        source_page=22
    )

    evidences = [
        ExtractedEvidence(
            evidence_id="EVD-091",
            bid_id="BID-A-01",
            document_id="DOC-07",
            document_name="Financial_Statements.pdf",
            page=37,
            extracted_value=94.0,
            extracted_unit="Cr",
            raw_snippet="FY2025 Turnover: ₹94 Crore",
            extraction_confidence=0.99
        )
    ]

    res = ComplianceReasoningEngine.evaluate(req, evidences, "BID-A-01")
    assert res.status == ComplianceStatus.NON_COMPLIANT
    assert res.verification_method == VerificationMethod.DETERMINISTIC
    assert "94.0" in res.reasoning
    assert res.confidence >= 0.95
    assert len(res.citations) == 1
    assert res.citations[0].document_name == "Financial_Statements.pdf"


def test_compliance_reasoning_unverified_when_no_evidence():
    req = ExtractedRequirement(
        requirement_id="REQ-002",
        tender_id="TND-001",
        category="Eligibility",
        text_raw="ISO 9001 Certification required",
        type=RequirementType.DOCUMENT_PRESENCE,
        mandatory=True,
        source_page=1
    )

    res = ComplianceReasoningEngine.evaluate(req, [], "BID-A-01")
    assert res.status == ComplianceStatus.UNVERIFIED
    assert len(res.citations) == 0


def test_contradiction_detection():
    ev1 = ExtractedEvidence(
        evidence_id="EVD-001",
        bid_id="BID-01",
        document_id="DOC-A",
        document_name="Technical_Datasheet.pdf",
        page=5,
        extracted_value=800.0,
        extracted_unit="units/day",
        raw_snippet="Production capacity: 800 units/day",
        extraction_confidence=0.95
    )

    ev2 = ExtractedEvidence(
        evidence_id="EVD-002",
        bid_id="BID-01",
        document_id="DOC-B",
        document_name="Product_Brochure.pdf",
        page=2,
        extracted_value=500.0,
        extracted_unit="units/day",
        raw_snippet="Rated output: 500 units/day",
        extraction_confidence=0.90
    )

    flags = ContradictionDetectionEngine.detect_contradictions("BID-01", [ev1, ev2])
    assert len(flags) == 1
    assert flags[0].severity == "HIGH"
    assert "800.0" in flags[0].description and "500.0" in flags[0].description
