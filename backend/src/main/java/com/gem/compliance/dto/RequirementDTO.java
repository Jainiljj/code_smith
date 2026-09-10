package com.gem.compliance.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequirementDTO {
    private String id;
    private String tenderId;
    private String reqCode;
    private String category;
    private String rawText;
    private String reqType;
    private String operator;
    private BigDecimal threshold;
    private String unit;
    private Boolean isMandatory;
    private Integer sourcePage;
}
