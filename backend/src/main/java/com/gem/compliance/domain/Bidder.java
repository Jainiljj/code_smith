package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "bidders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bidder {

    @Id
    private String id;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Column(name = "cin_or_pan")
    private String cinOrPan;

    @Column(name = "udyam_registration")
    private String udyamRegistration;

    @Column(name = "gstin")
    private String gstin;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "is_debarred")
    @Builder.Default
    private Boolean isDebarred = false;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
    }
}
