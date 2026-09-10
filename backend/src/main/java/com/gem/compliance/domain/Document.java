package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    private String id;

    @Column(name = "bid_id")
    private String bidId;

    @Column(name = "tender_id")
    private String tenderId;

    @Column(nullable = false)
    private String filename;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    private String checksum;

    @Column(name = "storage_path")
    private String storagePath;

    @Column(name = "page_count")
    @Builder.Default
    private Integer pageCount = 1;

    @Column(name = "processing_status")
    @Builder.Default
    private String processingStatus = "PENDING"; // PENDING, PROCESSING, PARSED, FAILED

    @Column(name = "uploaded_at")
    private ZonedDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) uploadedAt = ZonedDateTime.now();
    }
}
