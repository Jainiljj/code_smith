package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evidence {

    @Id
    private String id;

    @Column(name = "bid_id")
    private String bidId;

    @Column(name = "document_id")
    private String documentId;

    @Column(name = "requirement_id")
    private String requirementId;

    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @Column(name = "extracted_value")
    private BigDecimal extractedValue;

    @Column(name = "extracted_unit")
    private String extractedUnit;

    @Column(name = "raw_snippet", nullable = false, columnDefinition = "TEXT")
    private String rawSnippet;

    @Column(nullable = false)
    private BigDecimal confidence;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
    }
}
