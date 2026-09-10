# RBAC TEST MATRIX REPORT

**Project:** SIH26100 — AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement  
**Verification Date:** September 10, 2026  
**Status:** PASS (100% End-to-End Verification across 5 Human Roles)  

---

## 1. Role Permission Matrix

| Role | Tenders & Requirements (`/tenders`) | Compliance Evaluation (`/compliance`) | Seller Verification Queue (`/sellers`) | Human Review & Overrides (`/reviews`) | Audit Trail Logs (`/audit`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`SYSTEM_ADMIN`** | ALLOWED (Full) | ALLOWED (Full) | ALLOWED (Full + Override) | ALLOWED (Full Override) | ALLOWED (View All) |
| **`PROCUREMENT_OFFICER`** | ALLOWED (Create/Edit) | ALLOWED (Run/Evaluate) | ALLOWED (Run/Override) | ALLOWED (Approve/Override) | ALLOWED (View All) |
| **`COMPLIANCE_REVIEWER`** | ALLOWED (Read Only) | ALLOWED (Run/Evaluate) | ALLOWED (Inspect Profile) | ALLOWED (Submit Notes) | ALLOWED (View All) |
| **`VIEWER` / `AUDITOR`** | ALLOWED (Read Only) | ALLOWED (Read Only) | ALLOWED (Read Only) | **DENIED (403)** | ALLOWED (Read Only) |
| **`BIDDER_VENDOR`** | ALLOWED (Read Own) | **DENIED (403)** | **DENIED (403)** | **DENIED (403)** | **DENIED (403)** |

---

## 2. API Endpoint Authorization Test Matrix

| API Endpoint | HTTP Method | `SYSTEM_ADMIN` | `PROCUREMENT_OFFICER` | `COMPLIANCE_REVIEWER` | `AUDITOR` | `BIDDER` | Result |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `/api/v1/auth/login` | `POST` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | **PASS** |
| `/api/v1/auth/me` | `GET` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | **PASS** |
| `/api/v1/tenders` | `GET` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | **PASS** |
| `/api/v1/compliance/bid/{id}` | `GET` | 200 OK | 200 OK | 200 OK | 200 OK | **403 FORBIDDEN** | **PASS** |
| `/api/v1/reviews/override` | `POST` | 200 OK | 200 OK | 200 OK | **403 FORBIDDEN** | **403 FORBIDDEN** | **PASS** |
| `/api/v1/sellers` | `GET` | 200 OK | 200 OK | 200 OK | 200 OK | **403 FORBIDDEN** | **PASS** |
| `/api/v1/sellers/{id}/verify` | `POST` | 200 OK | 200 OK | 200 OK | **403 FORBIDDEN** | **403 FORBIDDEN** | **PASS** |
| `/api/v1/sellers/{id}/override` | `POST` | 200 OK | 200 OK | **403 FORBIDDEN** | **403 FORBIDDEN** | **403 FORBIDDEN** | **PASS** |
| `/api/v1/audit` | `GET` | 200 OK | 200 OK | 200 OK | 200 OK | **403 FORBIDDEN** | **PASS** |

---

## 3. Empirical Test Execution Summary

- **Spring Security JWT Authentication:** Token issuance, bearer header parsing, session retrieval via `/api/v1/auth/me`, and stateless logout verified cleanly.
- **Frontend Route & Component Guards:** `AuthProvider`, `ProtectedRoute`, and `<Can>` permissions enforce UI visibility and client-side route protection.
- **Quick Login Demo Bar:** Built-in 1-click login buttons for all 5 demo accounts (`admin.demo@gembid.local`, `procurement.demo@gembid.local`, `reviewer.demo@gembid.local`, `auditor.demo@gembid.local`, `bidder.demo@gembid.local`) functional with password `Password123!`.
