-- SIH26100 Flyway Migration V4: Seed Compliance Evaluation Matrix, Evidence, Documents and Reviews

-- 1. Documents for BID-A-01 (Apex Pumps & Motors Pvt Ltd)
INSERT INTO documents (id, bid_id, filename, file_type, file_size_bytes, checksum, storage_path, page_count, processing_status, uploaded_at) VALUES
('DOC-FIN-01', 'BID-A-01', 'Financial_Statements.pdf', 'pdf', 2458900, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '/storage/uploads/Financial_Statements.pdf', 45, 'PARSED', CURRENT_TIMESTAMP),
('DOC-LEG-01', 'BID-A-01', 'GST_PAN_Certificates.pdf', 'pdf', 1120400, 'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2', '/storage/uploads/GST_PAN_Certificates.pdf', 3, 'PARSED', CURRENT_TIMESTAMP),
('DOC-TECH-01', 'BID-A-01', 'Technical_Pump_Catalog.pdf', 'pdf', 5890100, '388c2c63a358b45a3ac21703ab0e9a5a54b38d3e236544974f8ff16f9f59f635', '/storage/uploads/Technical_Pump_Catalog.pdf', 20, 'PARSED', CURRENT_TIMESTAMP),
('DOC-EXP-01', 'BID-A-01', 'Past_Purchase_Orders.pdf', 'pdf', 3410200, '256e297a7e1262d10339d2c943801f9d45e54d3e528d2d6c703b41d2f9d519a4', '/storage/uploads/Past_Purchase_Orders.pdf', 8, 'PARSED', CURRENT_TIMESTAMP);

-- 2. Evidence Records linked to Requirements & Documents
INSERT INTO evidence (id, bid_id, document_id, requirement_id, page_number, extracted_value, extracted_unit, raw_snippet, confidence, created_at) VALUES
('EVD-001', 'BID-A-01', 'DOC-FIN-01', 'REQ-001', 37, 94.00, 'Cr', 'Financial Audit Report Section 4.2: FY2023 Annual Turnover = ₹112.0 Cr, FY2024 Annual Turnover = ₹127.5 Cr, FY2025 Annual Turnover = ₹94.0 Cr.', 0.9900, CURRENT_TIMESTAMP),
('EVD-002', 'BID-A-01', 'DOC-LEG-01', 'REQ-002', 2, NULL, NULL, 'GSTIN: 07AAAAA0000A1Z5 (Active - Registered in New Delhi), PAN: AAACA1234F (Verified Entity: Apex Pumps & Motors Pvt Ltd).', 0.9900, CURRENT_TIMESTAMP),
('EVD-003', 'BID-A-01', 'DOC-TECH-01', 'REQ-003', 12, 88.40, '%', 'Pump Performance Test Matrix Page 12: Measured Operating Efficiency = 88.4% at rated 150 kW power load.', 0.9800, CURRENT_TIMESTAMP),
('EVD-004', 'BID-A-01', 'DOC-EXP-01', 'REQ-004', 5, 3.00, 'Years', 'Government Supply History: Central Water Commission (2023), Jal Shakti Department (2024), NDMC Municipal Corp (2025). Missing 2 years for 5-year criteria.', 0.8500, CURRENT_TIMESTAMP);

-- 3. Compliance Evaluation Matrix Results for BID-A-01 (Apex Pumps)
INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status, created_at, updated_at) VALUES
('RES-001', 'REQ-001', 'BID-A-01', 'NON_COMPLIANT', 'DETERMINISTIC', 'FY2025 turnover is ₹94.0 Cr which is below the required ₹100.0 Cr threshold (FY2023: ₹112.0 Cr, FY2024: ₹127.5 Cr, FY2025: ₹94.0 Cr). Deterministic comparison: ₹94.0 Cr < ₹100.0 Cr.', 0.9900, 'EVD-001', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('RES-002', 'REQ-002', 'BID-A-01', 'COMPLIANT', 'DETERMINISTIC', 'GST Registration Certificate (07AAAAA0000A1Z5) and PAN Card (AAACA1234F) are verified and active on GSTN tax portal.', 0.9900, 'EVD-002', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('RES-003', 'REQ-003', 'BID-A-01', 'COMPLIANT', 'DETERMINISTIC', 'Extracted pump operational efficiency 88.4% >= required 85.0% threshold specification.', 0.9800, 'EVD-003', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('RES-004', 'REQ-004', 'BID-A-01', 'UNVERIFIED', 'AI_LANGUAGE', 'Only 3 past government purchase orders were located in submitted documents; 2 missing years to fulfill 5-year experience requirement.', 0.8500, 'EVD-004', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Compliance Evaluation Matrix Results for BID-B-01 (Vortex Corp)
INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status, created_at, updated_at) VALUES
('RES-005', 'REQ-001', 'BID-B-01', 'COMPLIANT', 'DETERMINISTIC', 'Audited annual turnover average ₹145.0 Cr >= required ₹100.0 Cr threshold.', 0.9900, NULL, 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('RES-006', 'REQ-002', 'BID-B-01', 'NON_COMPLIANT', 'DETERMINISTIC', 'Contradiction Flag: GSTIN tax registration name mismatch detected against MCA corporate registry.', 0.9500, NULL, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
