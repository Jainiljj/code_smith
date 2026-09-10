package com.gem.compliance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GovernmentVerificationService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String queryGstnConnector(String gstin, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("disclaimer", "SIMULATED GOVERNMENT RESPONSE");
        resp.put("connector", "GSTN_PORTAL");
        resp.put("gstin", gstin);
        
        if (gstin != null && gstin.startsWith("07AAAAA")) {
            resp.put("status", "ACTIVE");
            resp.put("tradeName", "Apex Pumps & Motors Pvt Ltd");
            resp.put("taxpayerType", "Regular");
            resp.put("registrationDate", "2017-07-01");
            resp.put("lastReturnFiledDate", "2026-08-20");
            resp.put("complianceScore", 98.5);
            resp.put("matched", true);
        } else if (gstin != null && gstin.startsWith("07AAACX")) {
            resp.put("status", "ACTIVE");
            resp.put("tradeName", "XYZ Infrastructure Pvt Ltd");
            resp.put("taxpayerType", "Regular");
            resp.put("registrationDate", "2015-04-12");
            resp.put("lastReturnFiledDate", "2026-08-25");
            resp.put("complianceScore", 99.0);
            resp.put("matched", true);
        } else if (gstin != null && gstin.startsWith("27DDDDD")) {
            resp.put("status", "CANCELLED_TAX_DEFAULT");
            resp.put("tradeName", "Vortex Corp");
            resp.put("taxpayerType", "Regular");
            resp.put("cancellationDate", "2026-01-15");
            resp.put("complianceScore", 30.0);
            resp.put("matched", false);
        } else {
            resp.put("status", "ACTIVE");
            resp.put("tradeName", legalName != null ? legalName : "Registered Entity");
            resp.put("taxpayerType", "Regular");
            resp.put("complianceScore", 85.0);
            resp.put("matched", true);
        }
        return toJson(resp);
    }

    public String queryMca21Connector(String cin, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("disclaimer", "SIMULATED GOVERNMENT RESPONSE");
        resp.put("connector", "MCA21_CORPORATE_REGISTRY");
        resp.put("cin", cin);
        resp.put("companyStatus", "ACTIVE");
        resp.put("classOfCompany", "Private");
        resp.put("incorporationDate", "2015-03-22");
        resp.put("authorizedCapital", 100000000);
        resp.put("paidUpCapital", 50000000);
        resp.put("activeDirectorsCount", 3);
        resp.put("lastAgmDate", "2025-09-30");
        resp.put("matched", true);
        return toJson(resp);
    }

    public String queryUdyamConnector(String udyamNo, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("disclaimer", "SIMULATED GOVERNMENT RESPONSE");
        resp.put("connector", "UDYAM_MSME_PORTAL");
        resp.put("udyamRegistrationNumber", udyamNo);
        resp.put("enterpriseType", udyamNo != null && udyamNo.contains("04") ? "MICRO" : "MEDIUM");
        resp.put("majorActivity", "MANUFACTURING");
        resp.put("socialCategory", "GENERAL");
        resp.put("validUntil", "LIFETIME");
        resp.put("matched", udyamNo != null);
        return toJson(resp);
    }

    public String queryDpiitConnector(String dpiitNo) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("disclaimer", "SIMULATED GOVERNMENT RESPONSE");
        resp.put("connector", "DPIIT_STARTUP_INDIA");
        resp.put("dpiitRegistrationNumber", dpiitNo);
        resp.put("startupRecognized", dpiitNo != null);
        resp.put("taxExemptionStatus", dpiitNo != null ? "GRANTED" : "NOT_APPLICABLE");
        resp.put("matched", dpiitNo != null);
        return toJson(resp);
    }

    public String queryBisConnector(String bisLicense) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("disclaimer", "SIMULATED GOVERNMENT RESPONSE");
        resp.put("connector", "BIS_STANDARD_MARK");
        resp.put("bisLicenseNumber", bisLicense);
        resp.put("standardNumber", "IS 1520:2002");
        resp.put("validityStatus", bisLicense != null ? "VALID" : "NOT_FOUND");
        resp.put("matched", bisLicense != null);
        return toJson(resp);
    }

    public String queryEpfoConnector(String epfoCode) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("disclaimer", "SIMULATED GOVERNMENT RESPONSE");
        resp.put("connector", "EPFO_COMPLIANCE_PORTAL");
        resp.put("establishmentCode", epfoCode);
        resp.put("activeWorkersCount", epfoCode != null ? 142 : 0);
        resp.put("lastEcrReturnMonth", "2026-08");
        resp.put("complianceStatus", epfoCode != null ? "COMPLIANT" : "NON_COMPLIANT");
        resp.put("matched", epfoCode != null);
        return toJson(resp);
    }

    public String queryDigiLockerConnector(String docChecksum) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("disclaimer", "SIMULATED GOVERNMENT RESPONSE");
        resp.put("connector", "DIGILOCKER_VERIFIABLE_CREDENTIALS");
        resp.put("credentialHash", docChecksum);
        resp.put("digitalSignatureValid", true);
        resp.put("issuerAuthority", "Controller of Certifying Authorities (CCA)");
        resp.put("matched", true);
        return toJson(resp);
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{\"disclaimer\":\"SIMULATED GOVERNMENT RESPONSE\",\"error\":\"JSON serialization failed\"}";
        }
    }
}
