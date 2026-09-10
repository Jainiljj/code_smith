# PHASE 2.5 — SELLER VERIFICATION & RISK ENGINE REPORT

**Project:** SIH26100 — AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement  
**Release Phase:** Phase 2.5 Seller Verification Pipeline  
**Completion Date:** September 10, 2026  

---

## 1. Architecture & Engine Overview

Phase 2.5 delivers an **evidence-first Seller Verification & Risk Engine** designed to prevent fraud, misrepresentation, and shell-company participation in GeM procurement tenders.

The engine combines:
1. **Simulated Government Connectors**: Real-time cross-queries across GSTN, MCA21, Udyam MSME, DPIIT Startup India, BIS Certification, EPFO Statutory Returns, and DigiLocker Verifiable Credentials. All connector responses strictly include `disclaimer: "SIMULATED GOVERNMENT RESPONSE"`.
2. **AI & Deterministic Verification Engines**:
   - `EntityResolutionEngine`: Matches company legal name, trade name, and CIN/PAN across documents.
   - `CrossDocumentConsistencyEngine`: Compares turnover reported in audited balance sheets vs GSTR-3B filings vs Udyam classification.
   - `SellerExistenceRiskEngine`: Detects virtual addresses, shell company patterns, and sudden corporate restructures.
3. **Deterministic 0–100 Seller Trust Score**:
   - Government Registry Authenticity (30%)
   - Tax & Statutory EPFO Compliance (25%)
   - Cross-Document Entity Resolution (25%)
   - Blacklist & Shell Existence Risk (20%)
4. **Human Officer Risk Override**: Procurement officers can submit an auditable risk override rationale with logged decisions (`APPROVED_OVERRIDE` or `REJECTED_OVERRIDE`).

---

## 2. Synthetic Dataset Catalog (Datasets A – G)

| Dataset ID | Seller Organization Name | Trust Score | Status | Key Characteristics / Risk Flag |
| :--- | :--- | :---: | :---: | :--- |
| **`SLR-DS-A`** | **XYZ Infrastructure Pvt Ltd** (Canonical Demo) | **96.5%** | `VERIFIED` | Clean GSTN return, active MCA directors, valid BIS & EPFO filings. |
| **`SLR-DS-B`** | **ABC Infra Pvt Ltd** | **68.0%** | `HIGH_RISK` | Registered name variation mismatch between GSTN and submitted bid. |
| **`SLR-DS-C`** | **Apex Global Holdings** | **32.0%** | `SUSPECTED_SHELL` | Registered at virtual office address; zero active EPFO worker filings. |
| **`SLR-DS-D`** | **Vortex Corp** | **45.0%** | `HIGH_RISK` | GSTIN cancelled due to tax default; pending tax liability. |
| **`SLR-DS-E`** | **MicroTech Supplies** | **58.5%** | `HIGH_RISK` | Udyam MSME micro-enterprise benefit claim despite annual turnover > 50 Cr. |
| **`SLR-DS-F`** | **Zenith Enterprises** | **62.0%** | `HIGH_RISK` | Inconsistent financial audit figures vs GST tax returns. |
| **`SLR-DS-G`** | **Bharat Heavy Pumps Ltd** | **84.0%** | `PENDING_VERIFICATION` | Under periodic statutory audit review. |

---

## 3. Verification & Compliance Status

- [x] Database migration `V3__seller_verification.sql` executed with 4 tables and Datasets A–G
- [x] Backend services (`GovernmentVerificationService`, `SellerVerificationEngine`, `SellerController`) implemented
- [x] FastAPI AI microservice `/api/v1/ai/sellers/verify` endpoint operational
- [x] React `/sellers` and `/sellers/:sellerId` pages rendered with Trust Score progress dials and connector cards
- [x] Human Procurement Risk Override modal enabled for authorized roles
- [x] All 9/9 pytest unit tests, 43 Java source files, and 1,479 Vite modules compiled cleanly with 0 errors
