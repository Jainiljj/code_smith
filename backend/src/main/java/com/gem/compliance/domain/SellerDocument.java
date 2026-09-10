package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "seller_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerDocument {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(nullable = false)
    private String filename;

    private String checksum;

    @Column(name = "parsed_data_json", columnDefinition = "TEXT")
    private String parsedDataJson;

    @Column(name = "verification_status")
    private String verificationStatus;

    @Column(name = "uploaded_at")
    private ZonedDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) uploadedAt = ZonedDateTime.now();
    }
}
