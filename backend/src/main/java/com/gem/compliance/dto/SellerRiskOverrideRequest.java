package com.gem.compliance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerRiskOverrideRequest {
    @NotBlank(message = "Decision is required (APPROVED_OVERRIDE or REJECTED_OVERRIDE)")
    private String overrideDecision;

    @NotBlank(message = "Reason/Rationale is required for human override")
    private String reason;
}
