import { Tender, ComplianceResult, AuditLog, HumanReviewRequest } from '../types/compliance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Strict Security Rule: Default ENABLE_MOCKS is FALSE in production behavior
const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS === 'true';

// Auto-acquire JWT token for authenticated Spring Boot REST API calls
async function getAuthHeaders(): Promise<Record<string, string>> {
  let token = localStorage.getItem('gem_auth_token') || localStorage.getItem('sih_jwt_token');
  if (!token) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'officer@gem.gov.in', password: 'pass' })
      });
      if (res.ok) {
        const data = await res.json();
        token = data.token;
        if (token) {
          localStorage.setItem('sih_jwt_token', token);
          localStorage.setItem('gem_auth_token', token);
        }
      }
    } catch (e) {
      console.warn('Unable to auto-acquire JWT token:', e);
    }
  }
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Dev Mock Data (Isolated strictly behind VITE_ENABLE_MOCKS=true flag)
const MOCK_TENDERS: Tender[] = [
  {
    id: 'TND-001',
    organizationId: 'ORG-001',
    tenderNumber: 'GEM/2026/B/90124',
    title: 'Supply & Installation of High-Efficiency Water Pumps',
    description: 'Procurement of industrial-grade centrifugal pumps for public infrastructure.',
    issuingAuthority: 'Central Water Commission',
    category: 'Industrial Equipment',
    estimatedValue: 50000000.00,
    status: 'IN_EVALUATION',
    createdBy: 'USR-PROC-01',
    createdAt: '2026-09-10T10:00:00Z',
    requirements: [
      {
        id: 'REQ-001',
        tenderId: 'TND-001',
        reqCode: 'REQ-001',
        category: 'Financial',
        rawText: 'Bidder must have minimum ₹100 crore annual turnover for each of the previous 3 financial years.',
        reqType: 'NUMERIC_THRESHOLD',
        operator: '>=',
        threshold: 100,
        unit: 'Cr',
        isMandatory: true,
        sourcePage: 1
      },
      {
        id: 'REQ-002',
        tenderId: 'TND-001',
        reqCode: 'REQ-002',
        category: 'Eligibility',
        rawText: 'Valid GST Registration Certificate & PAN Card must be submitted.',
        reqType: 'DOCUMENT_PRESENCE',
        isMandatory: true,
        sourcePage: 2
      },
      {
        id: 'REQ-003',
        tenderId: 'TND-001',
        reqCode: 'REQ-003',
        category: 'Technical',
        rawText: 'Pump operational efficiency shall not be less than 85%.',
        reqType: 'NUMERIC_THRESHOLD',
        operator: '>=',
        threshold: 85,
        unit: '%',
        isMandatory: true,
        sourcePage: 3
      },
      {
        id: 'REQ-004',
        tenderId: 'TND-001',
        reqCode: 'REQ-004',
        category: 'Experience',
        rawText: 'Minimum 5 years of experience supplying government entities.',
        reqType: 'NUMERIC_THRESHOLD',
        operator: '>=',
        threshold: 5,
        unit: 'Years',
        isMandatory: true,
        sourcePage: 4
      }
    ]
  }
];

let MOCK_RESULTS: ComplianceResult[] = [
  {
    id: 'RES-001',
    requirementId: 'REQ-001',
    requirementCode: 'REQ-001',
    requirementText: 'Bidder must have minimum ₹100 crore annual turnover for each of the previous 3 financial years.',
    category: 'Financial',
    bidId: 'BID-A-01',
    tenderId: 'TND-001',
    tenderNumber: 'GEM/2026/B/90124',
    bidderName: 'Apex Pumps & Motors Pvt Ltd',
    isMandatory: true,
    reqType: 'NUMERIC_THRESHOLD',
    status: 'NON_COMPLIANT',
    verificationMethod: 'DETERMINISTIC',
    reasoning: 'FY2025 turnover is ₹94.0 Cr which is below the required ₹100.0 Cr threshold (FY2023: ₹112.0 Cr, FY2024: ₹127.5 Cr, FY2025: ₹94.0 Cr). Deterministic comparison: ₹94.0 Cr < ₹100.0 Cr.',
    confidence: 0.99,
    expectedValue: '>= 100.00 Cr',
    actualValue: '₹94.0 Cr (FY2025: ₹94.0 Cr < Required ₹100.0 Cr)',
    sourceDocument: 'Financial_Statements.pdf',
    sourcePage: 37,
    riskLevel: 'HIGH',
    contradictionFlag: false,
    evidenceIds: 'EVD-001',
    reviewStatus: 'PENDING',
    createdAt: '2026-09-10T10:15:00Z',
    evidenceList: [
      {
        id: 'EVD-001',
        documentName: 'Financial_Statements.pdf',
        pageNumber: 37,
        rawSnippet: 'Financial Audit Report Section 4.2: FY2023 Annual Turnover = ₹112.0 Cr, FY2024 Annual Turnover = ₹127.5 Cr, FY2025 Annual Turnover = ₹94.0 Cr.',
        extractedValue: 94,
        extractedUnit: 'Cr',
        confidence: 0.99
      }
    ]
  },
  {
    id: 'RES-002',
    requirementId: 'REQ-002',
    requirementCode: 'REQ-002',
    requirementText: 'Valid GST Registration Certificate & PAN Card must be submitted.',
    category: 'Eligibility',
    bidId: 'BID-A-01',
    tenderId: 'TND-001',
    tenderNumber: 'GEM/2026/B/90124',
    bidderName: 'Apex Pumps & Motors Pvt Ltd',
    isMandatory: true,
    reqType: 'DOCUMENT_PRESENCE',
    status: 'COMPLIANT',
    verificationMethod: 'DETERMINISTIC',
    reasoning: 'GST Registration Certificate (07AAAAA0000A1Z5) and PAN Card (AAACA1234F) are verified and active on GSTN tax portal.',
    confidence: 0.99,
    expectedValue: 'Document Submission Required',
    actualValue: 'GSTIN: 07AAAAA0000A1Z5, PAN: AAACA1234F verified',
    sourceDocument: 'GST_PAN_Certificates.pdf',
    sourcePage: 2,
    riskLevel: 'LOW',
    contradictionFlag: false,
    evidenceIds: 'EVD-002',
    reviewStatus: 'APPROVED',
    createdAt: '2026-09-10T10:15:00Z',
    evidenceList: [
      {
        id: 'EVD-002',
        documentName: 'GST_PAN_Certificates.pdf',
        pageNumber: 2,
        rawSnippet: 'GSTIN: 07AAAAA0000A1Z5 (Active - Registered in New Delhi), PAN: AAACA1234F (Verified Entity: Apex Pumps & Motors Pvt Ltd).',
        confidence: 0.99
      }
    ]
  },
  {
    id: 'RES-003',
    requirementId: 'REQ-003',
    requirementCode: 'REQ-003',
    requirementText: 'Pump operational efficiency shall not be less than 85%.',
    category: 'Technical',
    bidId: 'BID-A-01',
    tenderId: 'TND-001',
    tenderNumber: 'GEM/2026/B/90124',
    bidderName: 'Apex Pumps & Motors Pvt Ltd',
    isMandatory: true,
    reqType: 'NUMERIC_THRESHOLD',
    status: 'COMPLIANT',
    verificationMethod: 'DETERMINISTIC',
    reasoning: 'Extracted pump operational efficiency 88.4% >= required 85.0% threshold specification.',
    confidence: 0.98,
    expectedValue: '>= 85.00 %',
    actualValue: '88.4 %',
    sourceDocument: 'Technical_Pump_Catalog.pdf',
    sourcePage: 12,
    riskLevel: 'LOW',
    contradictionFlag: false,
    evidenceIds: 'EVD-003',
    reviewStatus: 'APPROVED',
    createdAt: '2026-09-10T10:15:00Z',
    evidenceList: [
      {
        id: 'EVD-003',
        documentName: 'Technical_Pump_Catalog.pdf',
        pageNumber: 12,
        rawSnippet: 'Pump Performance Test Matrix Page 12: Measured Operating Efficiency = 88.4% at rated 150 kW power load.',
        extractedValue: 88.4,
        extractedUnit: '%',
        confidence: 0.98
      }
    ]
  },
  {
    id: 'RES-004',
    requirementId: 'REQ-004',
    requirementCode: 'REQ-004',
    requirementText: 'Minimum 5 years of experience supplying government entities.',
    category: 'Experience',
    bidId: 'BID-A-01',
    tenderId: 'TND-001',
    tenderNumber: 'GEM/2026/B/90124',
    bidderName: 'Apex Pumps & Motors Pvt Ltd',
    isMandatory: true,
    reqType: 'NUMERIC_THRESHOLD',
    status: 'UNVERIFIED',
    verificationMethod: 'AI_LANGUAGE',
    reasoning: 'Only 3 past government purchase orders were located in submitted documents; 2 missing years to fulfill 5-year experience requirement.',
    confidence: 0.85,
    expectedValue: '>= 5.00 Years',
    actualValue: '3.0 Years (Missing 2 years)',
    sourceDocument: 'Past_Purchase_Orders.pdf',
    sourcePage: 5,
    riskLevel: 'MEDIUM',
    contradictionFlag: false,
    evidenceIds: 'EVD-004',
    reviewStatus: 'PENDING',
    createdAt: '2026-09-10T10:15:00Z',
    evidenceList: [
      {
        id: 'EVD-004',
        documentName: 'Past_Purchase_Orders.pdf',
        pageNumber: 5,
        rawSnippet: 'Government Supply History: Central Water Commission (2023), Jal Shakti Department (2024), NDMC Municipal Corp (2025). Missing 2 years for 5-year criteria.',
        extractedValue: 3,
        extractedUnit: 'Years',
        confidence: 0.85
      }
    ]
  }
];

let MOCK_AUDITS: AuditLog[] = [
  {
    id: 'AUD-101',
    actorId: 'USR-PROC-01',
    actorRole: 'PROCUREMENT_OFFICER',
    organizationId: 'ORG-001',
    action: 'COMPLIANCE_STARTED',
    resourceType: 'BID',
    resourceId: 'BID-A-01',
    timestamp: '2026-09-10T10:14:30Z',
    details: 'Automated compliance evaluation triggered for Apex Pumps bid.'
  },
  {
    id: 'AUD-100',
    actorId: 'USR-PROC-01',
    actorRole: 'PROCUREMENT_OFFICER',
    organizationId: 'ORG-001',
    action: 'TENDER_CREATED',
    resourceType: 'TENDER',
    resourceId: 'TND-001',
    timestamp: '2026-09-10T10:00:00Z',
    details: 'Created tender GEM/2026/B/90124.'
  }
];

export const apiService = {
  getTenders: async (): Promise<Tender[]> => {
    if (ENABLE_MOCKS) return MOCK_TENDERS;
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/tenders`, { headers: authHeaders });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  getTenderById: async (id: string): Promise<Tender> => {
    if (ENABLE_MOCKS) return MOCK_TENDERS.find(t => t.id === id) || MOCK_TENDERS[0];
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/tenders/${id}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  getComplianceResults: async (bidId: string): Promise<ComplianceResult[]> => {
    if (ENABLE_MOCKS) return MOCK_RESULTS;
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/compliance/bid/${bidId}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  getComplianceByTender: async (tenderId: string): Promise<ComplianceResult[]> => {
    if (ENABLE_MOCKS) return MOCK_RESULTS;
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/compliance/tender/${tenderId}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  getReviewQueue: async (tenderId?: string): Promise<ComplianceResult[]> => {
    if (ENABLE_MOCKS) {
      return MOCK_RESULTS.filter(r => r.reviewStatus === 'PENDING' || r.status === 'NON_COMPLIANT' || r.status === 'UNVERIFIED');
    }
    const authHeaders = await getAuthHeaders();
    const url = tenderId && tenderId !== 'ALL'
      ? `${API_BASE_URL}/reviews/queue?tenderId=${encodeURIComponent(tenderId)}`
      : `${API_BASE_URL}/reviews/queue`;
    const res = await fetch(url, { headers: authHeaders });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  submitHumanReview: async (review: HumanReviewRequest): Promise<ComplianceResult> => {
    if (ENABLE_MOCKS) {
      const idx = MOCK_RESULTS.findIndex(r => r.id === review.complianceResultId);
      if (idx !== -1) {
        MOCK_RESULTS[idx] = {
          ...MOCK_RESULTS[idx],
          status: review.finalStatus,
          reviewStatus: 'OVERRIDDEN'
        };
        MOCK_AUDITS.unshift({
          id: `AUD-${Date.now().toString().slice(-4)}`,
          actorId: review.reviewerId,
          actorRole: 'PROCUREMENT_OFFICER',
          organizationId: 'ORG-001',
          action: 'COMPLIANCE_OVERRIDDEN',
          resourceType: 'COMPLIANCE_RESULT',
          resourceId: review.complianceResultId,
          timestamp: new Date().toISOString(),
          details: `Human override: status set to ${review.finalStatus}. Note: ${review.reviewerNote || 'None'}`
        });
        return MOCK_RESULTS[idx];
      }
      throw new Error('Compliance result not found');
    }

    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/reviews/override`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    if (ENABLE_MOCKS) return MOCK_AUDITS;
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/audit`, { headers: authHeaders });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  }
};
