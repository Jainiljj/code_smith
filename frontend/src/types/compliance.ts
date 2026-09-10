export type ComplianceStatus =
  | 'COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'NON_COMPLIANT'
  | 'UNVERIFIED'
  | 'NOT_APPLICABLE';

export type VerificationMethod = 'deterministic' | 'ai_language' | 'hybrid';

export interface Requirement {
  id: string;
  tenderId: string;
  reqCode: string;
  category: string;
  rawText: string;
  reqType: string;
  operator?: string;
  threshold?: number;
  unit?: string;
  isMandatory: boolean;
  sourcePage?: number;
}

export interface Tender {
  id: string;
  organizationId: string;
  tenderNumber: string;
  title: string;
  description: string;
  issuingAuthority: string;
  category: string;
  estimatedValue: number;
  status: string;
  createdBy: string;
  createdAt: string;
  requirements: Requirement[];
}

export interface ComplianceResult {
  id: string;
  requirementId: string;
  requirementCode: string;
  requirementText: string;
  category: string;
  bidId: string;
  status: ComplianceStatus;
  verificationMethod: VerificationMethod;
  reasoning: string;
  confidence: number;
  evidenceIds: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'OVERRIDDEN';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  organizationId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  details?: string;
}

export interface HumanReviewRequest {
  complianceResultId: string;
  reviewerId: string;
  finalStatus: ComplianceStatus;
  reviewerNote?: string;
}
