package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "compliance_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceResult {

    @Id
    private String id;

    @Column(name = "requirement_id", nullable = false)
    private String requirementId;

    @Column(name = "bid_id", nullable = false)
    private String bidId;

    @Column(nullable = false)
    private String status; // COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, UNVERIFIED, NOT_APPLICABLE

    @Column(name = "verification_method", nullable = false)
    private String verificationMethod; // DETERMINISTIC, AI_LANGUAGE, HYBRID

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reasoning;

    @Column(nullable = false)
    private BigDecimal confidence;

    @Column(name = "evidence_ids", columnDefinition = "TEXT")
    private String evidenceIds;

    @Column(name = "review_status")
    private String reviewStatus; // PENDING, APPROVED, OVERRIDDEN

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
        if (updatedAt == null) updatedAt = ZonedDateTime.now();
    }
}
