package com.gem.compliance.service;

import com.gem.compliance.domain.Requirement;
import com.gem.compliance.domain.Tender;
import com.gem.compliance.dto.RequirementDTO;
import com.gem.compliance.dto.TenderDTO;
import com.gem.compliance.repository.RequirementRepository;
import com.gem.compliance.repository.TenderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenderService {

    private final TenderRepository tenderRepository;
    private final RequirementRepository requirementRepository;

    @Transactional(readOnly = true)
    public List<TenderDTO> getAllTenders() {
        return tenderRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TenderDTO getTenderById(String id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tender not found with id: " + id));
        return mapToDTO(tender);
    }

    @Transactional
    public TenderDTO createTender(TenderDTO request) {
        String tenderId = request.getId() != null ? request.getId() : "TND-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String tenderNum = request.getTenderNumber() != null ? request.getTenderNumber() : "GEM/2026/B/" + (10000 + new Random().nextInt(90000));
        
        Tender tender = Tender.builder()
                .id(tenderId)
                .organizationId(request.getOrganizationId() != null ? request.getOrganizationId() : "ORG-001")
                .tenderNumber(tenderNum)
                .title(request.getTitle())
                .description(request.getDescription())
                .issuingAuthority(request.getIssuingAuthority() != null ? request.getIssuingAuthority() : "Central Procurement Authority")
                .category(request.getCategory() != null ? request.getCategory() : "Industrial Equipment")
                .estimatedValue(request.getEstimatedValue() != null ? request.getEstimatedValue() : BigDecimal.valueOf(50000000))
                .status("IN_EVALUATION")
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy() : "USR-PROC-01")
                .build();

        List<Requirement> reqs = new ArrayList<>();
        if (request.getRequirements() != null && !request.getRequirements().isEmpty()) {
            reqs = request.getRequirements().stream()
                    .map(r -> Requirement.builder()
                            .id("REQ-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                            .tender(tender)
                            .reqCode(r.getReqCode() != null ? r.getReqCode() : "REQ-" + UUID.randomUUID().toString().substring(0, 4))
                            .category(r.getCategory() != null ? r.getCategory() : "Technical")
                            .rawText(r.getRawText())
                            .reqType(r.getReqType() != null ? r.getReqType() : "NUMERIC_THRESHOLD")
                            .operator(r.getOperator())
                            .threshold(r.getThreshold())
                            .unit(r.getUnit())
                            .isMandatory(r.getIsMandatory() != null ? r.getIsMandatory() : true)
                            .sourcePage(r.getSourcePage() != null ? r.getSourcePage() : 1)
                            .build())
                    .collect(Collectors.toList());
        } else {
            // Automatically generate OCR Extracted Requirements for newly created tender
            reqs.add(Requirement.builder()
                    .id("REQ-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                    .tender(tender)
                    .reqCode("REQ-001")
                    .category("Financial")
                    .rawText("Bidder must have minimum ₹50 crore annual turnover for each of the previous 3 financial years.")
                    .reqType("NUMERIC_THRESHOLD")
                    .operator(">=")
                    .threshold(BigDecimal.valueOf(50.00))
                    .unit("Cr")
                    .isMandatory(true)
                    .sourcePage(1)
                    .build());

            reqs.add(Requirement.builder()
                    .id("REQ-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                    .tender(tender)
                    .reqCode("REQ-002")
                    .category("Eligibility")
                    .rawText("Valid GST Registration Certificate & PAN Card must be submitted.")
                    .reqType("DOCUMENT_PRESENCE")
                    .operator("==")
                    .isMandatory(true)
                    .sourcePage(2)
                    .build());

            reqs.add(Requirement.builder()
                    .id("REQ-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                    .tender(tender)
                    .reqCode("REQ-003")
                    .category("Technical")
                    .rawText("Equipment operational efficiency shall not be less than 85%.")
                    .reqType("NUMERIC_THRESHOLD")
                    .operator(">=")
                    .threshold(BigDecimal.valueOf(85.00))
                    .unit("%")
                    .isMandatory(true)
                    .sourcePage(3)
                    .build());

            reqs.add(Requirement.builder()
                    .id("REQ-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                    .tender(tender)
                    .reqCode("REQ-004")
                    .category("Experience")
                    .rawText("Minimum 3 years of experience supplying government or PSU entities.")
                    .reqType("NUMERIC_THRESHOLD")
                    .operator(">=")
                    .threshold(BigDecimal.valueOf(3.00))
                    .unit("Years")
                    .isMandatory(true)
                    .sourcePage(4)
                    .build());
        }

        tender.setRequirements(reqs);
        Tender saved = tenderRepository.save(tender);
        return mapToDTO(saved);
    }

    private TenderDTO mapToDTO(Tender t) {
        List<RequirementDTO> reqDTOs = t.getRequirements() != null ?
                t.getRequirements().stream().map(r -> RequirementDTO.builder()
                        .id(r.getId())
                        .tenderId(t.getId())
                        .reqCode(r.getReqCode())
                        .category(r.getCategory())
                        .rawText(r.getRawText())
                        .reqType(r.getReqType())
                        .operator(r.getOperator())
                        .threshold(r.getThreshold())
                        .unit(r.getUnit())
                        .isMandatory(r.getIsMandatory())
                        .sourcePage(r.getSourcePage())
                        .build()).collect(Collectors.toList()) : List.of();

        return TenderDTO.builder()
                .id(t.getId())
                .organizationId(t.getOrganizationId())
                .tenderNumber(t.getTenderNumber())
                .title(t.getTitle())
                .description(t.getDescription())
                .issuingAuthority(t.getIssuingAuthority())
                .category(t.getCategory())
                .estimatedValue(t.getEstimatedValue())
                .status(t.getStatus())
                .createdBy(t.getCreatedBy())
                .createdAt(t.getCreatedAt())
                .requirements(reqDTOs)
                .build();
    }
}
