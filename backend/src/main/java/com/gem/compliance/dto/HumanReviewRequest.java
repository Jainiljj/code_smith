package com.gem.compliance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HumanReviewRequest {
    @NotBlank
    private String complianceResultId;

    @NotBlank
    private String reviewerId;

    @NotBlank
    private String finalStatus; // COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, UNVERIFIED, NOT_APPLICABLE

    private String reviewerNote;
}
