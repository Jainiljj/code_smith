package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "seller_verification_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerVerificationResult {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @Column(name = "connector_name", nullable = false)
    private String connectorName;

    @Column(nullable = false)
    private String status; // MATCHED, MISMATCHED, NOT_FOUND, WARNING

    @Column(name = "response_json", columnDefinition = "TEXT", nullable = false)
    private String responseJson;

    @Column(name = "verified_at")
    private ZonedDateTime verifiedAt;

    @PrePersist
    protected void onCreate() {
        if (verifiedAt == null) verifiedAt = ZonedDateTime.now();
    }
}
