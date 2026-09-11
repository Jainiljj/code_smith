# Compliance & Review Queue Data Flow Audit Report

## 1. Executive Summary
This audit documents the root cause analysis of why the **Bid Compliance Matrix** (`ComplianceMatrixPage.tsx`) and **Procurement Officer Review Queue** (`ReviewsPage.tsx`) display "0 Items" / empty states when connected to the backend REST API.

---

## 2. Root Cause Analysis

### Root Cause 1: Missing DB Seed Data for `compliance_results` and `evidence`
* **Finding**: `V1__init_schema.sql` creates tables `tenders`, `requirements`, `bidders`, `bids`, `documents`, `compliance_results`, and `evidence`. However, while `tenders`, `requirements`, `bidders`, and `bids` were seeded with initial rows, **`compliance_results` and `evidence` tables contained 0 rows**.
* **Impact**: Querying `GET /api/v1/compliance/bid/{bidId}` returns an empty JSON array (`[]`), causing the UI to display 0 items.

### Root Cause 2: Hardcoded `BID-A-01` Bid ID in Frontend Pages
* **Finding**: `ComplianceMatrixPage.tsx` and `ReviewsPage.tsx` both hardcoded `apiService.getComplianceResults('BID-A-01')` without allowing officers to select or switch between different Tenders or Bids.
* **Impact**: If a user creates new tenders or checks other bids, the page remains pinned to `BID-A-01`, breaking per-tender scoping.

### Root Cause 3: Incomplete DTO Mapping for Evidence Citations & Contradiction Flags
* **Finding**: `ComplianceResultDTO.java` and `mapToDTO()` in `ComplianceService.java` omitted detailed evidence fields (document name, page number, expected vs actual values, contradiction flags, risk levels, and decision audit logs).
* **Impact**: The drawer panel could not display granular evidence comparisons (e.g. FY2023: ₹112 Cr, FY2024: ₹127 Cr, FY2025: ₹94 Cr vs Required >= ₹100 Cr threshold).

### Root Cause 4: Lack of Dedicated Prioritized Review Queue API Endpoint
* **Finding**: `ReviewsPage.tsx` was filtering client-side from compliance results rather than calling a dedicated, backend-prioritized review queue API (`GET /api/v1/reviews/queue`).
* **Impact**: Review queue lacked database-level prioritization sorting (HIGH risk -> critical contradictions -> missing mandatory evidence -> low confidence).

---

## 3. Affected Components & Files

| Layer | File / Component | Issue Description | Fix Required |
| :--- | :--- | :--- | :--- |
| **Database** | `V4__seed_compliance_and_evidence.sql` | Missing compliance results and evidence rows in PostgreSQL | Add Flyway V4 migration seeding canonical turnover criteria, eligibility, and technical evidence |
| **Backend Service** | `ComplianceService.java` | Missing evidence mapping, review queue prioritization & tender-wise retrieval | Expand DTO with evidence citations, expected vs actual values, and add `getReviewQueue()` |
| **Backend DTO** | `ComplianceResultDTO.java` | Missing evidence array, expectedValue, actualValue, sourceDocument, sourcePage | Update DTO to include complete evidence & audit metadata |
| **Backend REST API** | `ComplianceController.java` | Lacked endpoints for tender-wise compliance & prioritized review queue | Add `GET /api/v1/compliance/tender/{tenderId}` & `GET /api/v1/reviews/queue` |
| **Frontend API** | `services/api.ts` | Missing tender-wise compliance calls & review queue methods | Add `getComplianceByTender`, `getReviewQueue`, update types |
| **Frontend UI** | `ComplianceMatrixPage.tsx` | Hardcoded `BID-A-01` and flat view without tender selection | Add Tender Selector capsule dropdown, filter counts, and evidence comparison drawer |
| **Frontend UI** | `ReviewsPage.tsx` | Flat filtering without priority badges or full review drawer | Implement prioritized queue cards, review detail modal, and human override form |

---

## 4. Required Action Plan
1. **Migration V4**: Seed canonical worked demo evidence & compliance results for Tender `GEM/2026/B/90124` (`BID-A-01` and `BID-B-01`).
2. **Backend Hardening**: Update `ComplianceResultDTO`, `Evidence` domain entity, `ComplianceService`, and `ComplianceController` to return full evidence details, contradiction flags, and prioritized review queues with RBAC security `@PreAuthorize`.
3. **Frontend Redesign & Scoping**: Update `ComplianceMatrixPage.tsx` and `ReviewsPage.tsx` with Tender selector capsules, real filter counters, evidence drawers (Expected vs Actual comparison), and auditable human overrides.
4. **Remove Silent Mock Fallbacks**: Ensure production flow communicates strictly with backend REST endpoints.
5. **Testing**: Run automated build tests (`mvn compile`, `npm run build`), verify canonical turnover test case (`₹94 Cr < ₹100 Cr -> NON_COMPLIANT`), and generate implementation report.
