# PHASE 1.5 — AUTHENTICATION & RBAC AUDIT REPORT

**Project:** SIH26100 — AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement  
**Audit Date:** September 10, 2026  
**Auditor:** Lead Full-Stack & AI Security Architect  

---

## 1. Executive Summary

This audit documents the hardening of the Authentication & Role-Based Access Control (RBAC) system for the SIH26100 platform. The previous implementation relied on synthetic hardcoded role returns in the `AuthController`. This phase replaces mock auth with a production-grade Spring Security + JWT authentication framework integrated with Flyway database seed migrations, BCrypt password hashing, object-level domain authorization, and React frontend route/component permission guards.

---

## 2. RBAC Model & Matrix Definition

The system defines 5 primary human user roles with granular permission mappings:

| Role Name | Description | Key Permissions | Target Persona |
| :--- | :--- | :--- | :--- |
| `SYSTEM_ADMIN` | Platform administrator | Full System Access, Manage Users, View Audit Logs, Global Override | Admin / IT Lead |
| `PROCUREMENT_OFFICER` | Primary GeM Procurement Officer | Create Tenders, Run Compliance Engine, Finalize Approvals, Override Risk Scores | GeM Officer (Rajesh Kumar) |
| `COMPLIANCE_REVIEWER` | Specialized Domain / Legal Reviewer | Review Compliance Results, Overrule AI Findings, Submit Review Notes | Reviewer (Anita Sharma) |
| `AUDITOR` / `VIEWER` | Read-only Oversight Officer | View Tenders, View Compliance & Audit Logs, Export Reports | Comptroller / Auditor General |
| `BIDDER` / `BIDDER_VENDOR` | External Seller / Vendor | Submit Bids, View Own Bids, Upload Documents (Restricted to own Org) | Vendor (Apex / Vortex) |

---

## 3. Security Architecture Gaps & Remediations

| Area | Audit Finding | Severity | Remediation Plan |
| :--- | :--- | :--- | :--- |
| **Authentication** | `AuthController.java` matched email substrings without password verification | **P0 (Critical)** | Wire `UserRepository` and Spring Security `BCryptPasswordEncoder` to validate hashed passwords from DB |
| **User Persistence** | User seed data had non-standard password hashes | **P0 (Critical)** | Create Flyway `V2__seed_rbac_demo_users.sql` migration with BCrypt hashed demo credentials |
| **Session Endpoints** | Missing `/auth/me`, `/auth/logout`, `/auth/refresh`, and `/users/me/permissions` | **P1 (High)** | Implement complete REST auth lifecycle endpoints in `AuthController` and `UserService` |
| **Object-Level Security** | Bidders could query any bid ID without ownership verification | **P0 (Critical)** | Add `@PreAuthorize` and ownership check logic in `TenderService` and `ComplianceService` |
| **Frontend Auth** | UI lacked persistent login session & permission wrappers | **P1 (High)** | Create `AuthProvider.tsx`, `LoginPage.tsx`, `ProtectedRoute.tsx`, and `<Can>` UI permission components |

---

## 4. Demo Accounts & Seed Credentials

The following demo accounts are seeded via Flyway migration `V2__seed_rbac_demo_users.sql` for instant test evaluation:

1. **System Administrator:** `admin.demo@gembid.local` / `Password123!` (Role: `SYSTEM_ADMIN`)
2. **Procurement Officer:** `procurement.demo@gembid.local` / `Password123!` (Role: `PROCUREMENT_OFFICER`)
3. **Compliance Reviewer:** `reviewer.demo@gembid.local` / `Password123!` (Role: `COMPLIANCE_REVIEWER`)
4. **Auditor / Viewer:** `auditor.demo@gembid.local` / `Password123!` (Role: `VIEWER`)
5. **Bidder / Vendor:** `bidder.demo@gembid.local` / `Password123!` (Role: `BIDDER_VENDOR`)

---

## 5. Verification & Compliance Checklist

- [x] Spring Security JWT Filter validates authorization bearer headers
- [x] DB user table populated with BCrypt-hashed credentials
- [x] REST auth endpoints `/api/v1/auth/login`, `/me`, `/logout`, `/refresh`, `/permissions` operational
- [x] Object-level data authorization enforced on backend services
- [x] React `AuthProvider`, `LoginPage`, `ProtectedRoute`, and `<Can>` guards implemented
- [x] Quick-login demo buttons provided on login screen for rapid role testing

---
