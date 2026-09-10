from enum import Enum
from typing import List, Optional, Any
from pydantic import BaseModel, Field


class ComplianceStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    UNVERIFIED = "UNVERIFIED"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class VerificationMethod(str, Enum):
    DETERMINISTIC = "deterministic"
    AI_LANGUAGE = "ai_language"
    HYBRID = "hybrid"


class RequirementType(str, Enum):
    NUMERIC_THRESHOLD = "numeric_threshold"
    DATE_EXPIRY = "date_expiry"
    DOCUMENT_PRESENCE = "document_presence"
    TEXT_QUALITATIVE = "text_qualitative"


class RequirementParseRequest(BaseModel):
    tender_id: str
    raw_text: str


class ExtractedRequirement(BaseModel):
    requirement_id: str
    tender_id: str
    category: str = Field(description="Category: Technical, Financial, Eligibility, Legal, etc.")
    text_raw: str
    type: RequirementType
    operator: Optional[str] = Field(default=None, description="Operators: >=, <=, ==, contains")
    threshold: Optional[float] = Field(default=None, description="Numeric threshold value if applicable")
    unit: Optional[str] = Field(default=None, description="Unit: Cr, Lakh, %, Years, units/day, etc.")
    mandatory: bool = True
    source_page: int = 1


class DocumentParseRequest(BaseModel):
    document_id: str
    filename: str
    content_text: Optional[str] = None


class ExtractedEvidence(BaseModel):
    evidence_id: str
    bid_id: str
    document_id: str
    document_name: str
    page: int
    extracted_value: Optional[Any] = None
    extracted_unit: Optional[str] = None
    raw_snippet: str
    extraction_confidence: float = Field(ge=0.0, le=1.0)


class ComplianceEvaluateRequest(BaseModel):
    requirement: ExtractedRequirement
    evidences: List[ExtractedEvidence]


class Citation(BaseModel):
    document_id: str
    document_name: str
    page: int
    evidence_id: str
    snippet: str


class ComplianceEvaluateResponse(BaseModel):
    result_id: str
    requirement_id: str
    bid_id: str
    status: ComplianceStatus
    verification_method: VerificationMethod
    reasoning: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence_ids: List[str]
    citations: List[Citation]


class ContradictionFlag(BaseModel):
    flag_id: str
    bid_id: str
    requirement_id: Optional[str] = None
    source_a: Citation
    source_b: Citation
    description: str
    severity: str = "HIGH"
