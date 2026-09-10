package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sellers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {

    @Id
    private String id;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Column(name = "cin_or_pan")
    private String cinOrPan;

    @Column(name = "gstin")
    private String gstin;

    @Column(name = "udyam_registration")
    private String udyamRegistration;

    @Column(name = "dpiit_number")
    private String dpiitNumber;

    @Column(name = "bis_license")
    private String bisLicense;

    @Column(name = "epfo_code")
    private String epfoCode;

    @Column(name = "registered_address", columnDefinition = "TEXT")
    private String registeredAddress;

    private String category;

    @Column(name = "is_debarred")
    @Builder.Default
    private Boolean isDebarred = false;

    @Column(name = "trust_score")
    private BigDecimal trustScore;

    @Column(name = "verification_status")
    private String verificationStatus; // VERIFIED, HIGH_RISK, SUSPECTED_SHELL, PENDING_VERIFICATION, HUMAN_OVERRIDDEN

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SellerDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SellerVerificationResult> verificationResults = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
        if (updatedAt == null) updatedAt = ZonedDateTime.now();
    }
}
