package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    private String id;

    @Column(name = "compliance_result_id", nullable = false)
    private String complianceResultId;

    @Column(name = "reviewer_id")
    private String reviewerId;

    @Column(name = "original_status", nullable = false)
    private String originalStatus;

    @Column(name = "final_status", nullable = false)
    private String finalStatus;

    @Column(name = "reviewer_note", columnDefinition = "TEXT")
    private String reviewerNote;

    @Column(name = "reviewed_at")
    private ZonedDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        if (reviewedAt == null) reviewedAt = ZonedDateTime.now();
    }
}
