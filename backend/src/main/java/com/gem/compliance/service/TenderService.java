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

import java.util.List;
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
        Tender tender = Tender.builder()
                .id(tenderId)
                .organizationId(request.getOrganizationId() != null ? request.getOrganizationId() : "ORG-001")
                .tenderNumber(request.getTenderNumber())
                .title(request.getTitle())
                .description(request.getDescription())
                .issuingAuthority(request.getIssuingAuthority())
                .category(request.getCategory())
                .estimatedValue(request.getEstimatedValue())
                .status("IN_EVALUATION")
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy() : "USR-PROC-01")
                .build();

        if (request.getRequirements() != null) {
            List<Requirement> reqs = request.getRequirements().stream()
                    .map(r -> Requirement.builder()
                            .id("REQ-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                            .tender(tender)
                            .reqCode(r.getReqCode() != null ? r.getReqCode() : "REQ-001")
                            .category(r.getCategory())
                            .rawText(r.getRawText())
                            .reqType(r.getReqType() != null ? r.getReqType() : "NUMERIC_THRESHOLD")
                            .operator(r.getOperator())
                            .threshold(r.getThreshold())
                            .unit(r.getUnit())
                            .isMandatory(r.getIsMandatory() != null ? r.getIsMandatory() : true)
                            .sourcePage(r.getSourcePage() != null ? r.getSourcePage() : 1)
                            .build())
                    .collect(Collectors.toList());
            tender.setRequirements(reqs);
        }

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
