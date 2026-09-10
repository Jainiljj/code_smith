package com.gem.compliance.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "requirements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Requirement {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_id", nullable = false)
    @JsonIgnore
    private Tender tender;

    @Column(name = "req_code", nullable = false)
    private String reqCode;

    @Column(nullable = false)
    private String category; // Technical, Financial, Eligibility, Experience, Legal

    @Column(name = "raw_text", nullable = false, columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "req_type", nullable = false)
    private String reqType; // NUMERIC_THRESHOLD, DATE_EXPIRY, DOCUMENT_PRESENCE, TEXT_QUALITATIVE

    private String operator; // >=, <=, ==, contains

    private BigDecimal threshold;

    private String unit;

    @Column(name = "is_mandatory")
    private Boolean isMandatory;

    @Column(name = "source_page")
    private Integer sourcePage;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
    }
}
