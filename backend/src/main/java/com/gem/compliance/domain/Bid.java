package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "bids")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bid {

    @Id
    private String id;

    @Column(name = "tender_id", nullable = false)
    private String tenderId;

    @Column(name = "bidder_id", nullable = false)
    private String bidderId;

    @Column(name = "bid_number", nullable = false, unique = true)
    private String bidNumber;

    @Column(name = "submission_date")
    private ZonedDateTime submissionDate;

    @Column(name = "overall_status")
    private String overallStatus;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
        if (submissionDate == null) submissionDate = ZonedDateTime.now();
    }
}
