package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "seller_risk_overrides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerRiskOverride {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @Column(name = "reviewer_id")
    private String reviewerId;

    @Column(name = "original_score", nullable = false)
    private BigDecimal originalScore;

    @Column(name = "override_decision", nullable = false)
    private String overrideDecision; // APPROVED_OVERRIDE, REJECTED_OVERRIDE

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
    }
}
