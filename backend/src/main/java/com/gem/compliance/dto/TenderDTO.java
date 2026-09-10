package com.gem.compliance.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenderDTO {
    private String id;
    private String organizationId;
    private String tenderNumber;
    private String title;
    private String description;
    private String issuingAuthority;
    private String category;
    private BigDecimal estimatedValue;
    private String status;
    private String createdBy;
    private ZonedDateTime createdAt;
    private List<RequirementDTO> requirements;
}
