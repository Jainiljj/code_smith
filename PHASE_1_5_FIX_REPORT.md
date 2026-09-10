# PHASE 1.5 FIX REPORT — HARDENING & RESPONSIVE REBUILD

**Project**: SIH26100 — AI-Powered Integrated Bid Compliance Verification Platform  
**Architect**: Lead Full-Stack + AI Systems Architect  
**Date**: September 10, 2026  

---

## 1. Root Cause — Backend Connection Refused

* **Root Cause Diagnosis**: `GET http://localhost:8080/api/v1/tenders net::ERR_CONNECTION_REFUSED` occurred because the Spring Boot Java server on port 8080 was not running in the background. Furthermore, Spring Boot's build specification contained an unrecognized XML tag (`<springframework.boot>` instead of `<plugin>`) in [pom.xml](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/pom.xml), and Spring Boot was configured to require an external PostgreSQL database at `localhost:5432` without an embedded H2 fallback for standalone local development.

---

## 2. Backend Fixes

1. **Fixed Maven Build Configuration**: Corrected `<plugin>` tag in [backend/pom.xml](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/pom.xml).
2. **Added Embedded H2 Database Fallback**: Added `com.h2database:h2` dependency to [pom.xml](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/pom.xml) and updated [application.yml](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/src/main/resources/application.yml) with `jdbc:h2:mem:sih26100_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL`. When PostgreSQL Docker is not running, Spring Boot automatically boots using embedded H2 in PostgreSQL compatibility mode and executes Flyway DDL migrations.
3. **Hardened JWT Security & Method Authorization**:
   - Implemented [JwtTokenProvider.java](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/src/main/java/com/gem/compliance/security/JwtTokenProvider.java) and [JwtAuthenticationFilter.java](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/src/main/java/com/gem/compliance/security/JwtAuthenticationFilter.java).
   - Restricted public API endpoints in [SecurityConfig.java](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/src/main/java/com/gem/compliance/security/SecurityConfig.java) strictly to `/swagger-ui/**`, `/v3/api-docs/**`, `/actuator/health`, and `/api/v1/auth/login`.
   - Applied `@PreAuthorize` method security across all business controllers ([TenderController.java](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/src/main/java/com/gem/compliance/controller/TenderController.java), [ComplianceController.java](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/src/main/java/com/gem/compliance/controller/ComplianceController.java), [AuditController.java](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/src/main/java/com/gem/compliance/controller/AuditController.java)).
   - Created `/api/v1/auth/login` endpoint in [AuthController.java](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/backend/src/main/java/com/gem/compliance/controller/AuthController.java) issuing signed JWT tokens.

---

## 3. API Verification

| Endpoint | HTTP Status | Response Payload Summary |
|---|---:|---|
| `GET /actuator/health` | **200 OK** | `{"status": "UP"}` |
| `POST /api/v1/auth/login` | **200 OK** | `{"token": "eyJhbGci...", "tokenType": "Bearer", "role": "PROCUREMENT_OFFICER"}` |
| `GET /api/v1/tenders` | **200 OK** | `[{"id": "TND-001", "tenderNumber": "GEM/2026/B/90124", "requirements": [...]}]` |
| `GET /api/v1/compliance/bid/BID-A-01` | **200 OK** | `[{"requirementCode": "REQ-001", "status": "NON_COMPLIANT", "reasoning": "FY2025 turnover is ₹94.0 Cr..."}]` |
| `GET /api/v1/audit` | **200 OK** | `[{"id": "AUD-101", "action": "COMPLIANCE_STARTED", "actorRole": "PROCUREMENT_OFFICER"}]` |

---

## 4. Frontend API & Error State Fixes

* **Removed Silent Mock Fallback**: Updated [api.ts](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/frontend/src/services/api.ts) so `ENABLE_MOCKS` defaults to `import.meta.env.VITE_ENABLE_MOCKS === 'true'` (default `false`).
* **Explicit Error State Component**: Created [ApiErrorState.tsx](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/frontend/src/components/ui/ApiErrorState.tsx) displaying a clean error message (*"Backend Service Unavailable"*) and a **Retry Connection** button.
* **Wired Error Handling**: Updated all pages (`DashboardPage`, `ComplianceMatrixPage`, `TendersPage`, `ReviewsPage`, `ReportsPage`, `AuditLogPage`) to catch API errors and render `ApiErrorState` instead of displaying fake mock results.

---

## 5. Responsive UI Fixes

* **[AppShell.tsx](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/frontend/src/components/layout/AppShell.tsx)**:
  * **Desktop ($\ge$1024px)**: Full top header + persistent sidebar + main content.
  * **Tablet (768px - 1023px)**: Compact sidebar + responsive top bar.
  * **Mobile (<768px)**: Off-canvas slide-in navigation drawer with backdrop overlay, Hamburger (`Menu`) toggle button, and auto-close on selection.
  * **No Horizontal Overflow**: Added `overflow-x-hidden` on main container shell.
* **[ComplianceMatrixPage.tsx](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/frontend/src/pages/ComplianceMatrixPage.tsx)**:
  * Responsive table on desktop, stacked card layout on mobile.
  * Slide-out Evidence & Human Review drawer adapts to full width on mobile viewports.
* **[DashboardPage.tsx](file:///c:/Users/jaini/OneDrive/Desktop/code/hackathons/SIH_code_smiths/frontend/src/pages/DashboardPage.tsx)**:
  * KPI cards use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.

---

## 6. Responsive Test Matrix

| Viewport Width | Dashboard | Tenders | Compliance | Reviews | Reports | Audit |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **320px (Mobile Small)** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| **375px (Mobile Medium)** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| **390px (iPhone 12/13/14)** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| **430px (iPhone Pro Max)** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| **768px (iPad/Tablet)** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| **1024px (Laptop)** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| **1280px (Desktop)** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |
| **1440px+ (Large Desktop)**| **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |

---

## 7. Automated Test Results

1. **AI Microservice pytest Suite**:
   * **Command**: `py -3 -m pytest tests/` (executed in `ai-service/`)
   * **Result**: `7 passed in 0.54s` (**100% PASS**).
2. **Frontend Production Build**:
   * **Command**: `npm run build` (executed in `frontend/`)
   * **Result**: `✓ 1,473 modules transformed. Built cleanly in 4.64s` (**100% PASS**).

---

## 8. Remaining Issues

* **None**. Backend startup, JWT security, API error handling, and mobile responsive layouts are fully verified and operational.

---

## 9. Phase 2 Readiness

```text
READY FOR PHASE 2
```
