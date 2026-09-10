package com.gem.compliance.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentUploadResponse {
    private String documentId;
    private String filename;
    private String fileType;
    private Long fileSize;
    private String checksum;
    private String jobId;
    private String status;
    private String message;
}
