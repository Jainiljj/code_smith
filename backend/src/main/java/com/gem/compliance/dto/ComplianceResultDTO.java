package com.gem.compliance.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceResultDTO {
    private String id;
    private String requirementId;
    private String requirementCode;
    private String requirementText;
    private String category;
    private String tenderId;
    private String tenderNumber;
    private String bidId;
    private String bidderName;
    private Boolean isMandatory;
    private String reqType;
    private String status; // COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, UNVERIFIED, NOT_APPLICABLE
    private String verificationMethod; // DETERMINISTIC, AI_LANGUAGE, HYBRID
    private String reasoning;
    private BigDecimal confidence;
    private String expectedValue;
    private String actualValue;
    private String sourceDocument;
    private Integer sourcePage;
    private String riskLevel; // HIGH, MEDIUM, LOW
    private Boolean contradictionFlag;
    private String evidenceIds;
    private String reviewStatus; // PENDING, APPROVED, OVERRIDDEN
    private ZonedDateTime createdAt;
    private List<EvidenceDTO> evidenceList;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EvidenceDTO {
        private String id;
        private String documentName;
        private Integer pageNumber;
        private String rawSnippet;
        private BigDecimal extractedValue;
        private String extractedUnit;
        private BigDecimal confidence;
    }
}
