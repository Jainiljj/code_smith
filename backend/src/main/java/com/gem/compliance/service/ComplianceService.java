package com.gem.compliance.service;

import com.gem.compliance.domain.AuditLog;
import com.gem.compliance.domain.ComplianceResult;
import com.gem.compliance.domain.Requirement;
import com.gem.compliance.domain.Review;
import com.gem.compliance.dto.ComplianceResultDTO;
import com.gem.compliance.dto.HumanReviewRequest;
import com.gem.compliance.repository.AuditLogRepository;
import com.gem.compliance.repository.ComplianceResultRepository;
import com.gem.compliance.repository.RequirementRepository;
import com.gem.compliance.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplianceService {

    private final ComplianceResultRepository complianceResultRepository;
    private final RequirementRepository requirementRepository;
    private final ReviewRepository reviewRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public List<ComplianceResultDTO> getResultsByBidId(String bidId) {
        return complianceResultRepository.findByBidId(bidId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplianceResultDTO processHumanReview(HumanReviewRequest request) {
        ComplianceResult result = complianceResultRepository.findById(request.getComplianceResultId())
                .orElseThrow(() -> new RuntimeException("Compliance result not found: " + request.getComplianceResultId()));

        String originalStatus = result.getStatus();
        String finalStatus = request.getFinalStatus();

        // 1. Update compliance result state
        result.setStatus(finalStatus);
        result.setReviewStatus(originalStatus.equalsIgnoreCase(finalStatus) ? "APPROVED" : "OVERRIDDEN");
        complianceResultRepository.save(result);

        // 2. Create immutable Review record
        Review review = Review.builder()
                .id("REV-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .complianceResultId(result.getId())
                .reviewerId(request.getReviewerId())
                .originalStatus(originalStatus)
                .finalStatus(finalStatus)
                .reviewerNote(request.getReviewerNote())
                .build();
        reviewRepository.save(review);

        // 3. Create Audit Log record
        AuditLog audit = AuditLog.builder()
                .id("AUD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .actorId(request.getReviewerId())
                .actorRole("PROCUREMENT_OFFICER")
                .organizationId("ORG-001")
                .action("COMPLIANCE_OVERRIDDEN")
                .resourceType("COMPLIANCE_RESULT")
                .resourceId(result.getId())
                .details(String.format("Status changed from %s to %s. Note: %s", originalStatus, finalStatus, request.getReviewerNote()))
                .build();
        auditLogRepository.save(audit);

        return mapToDTO(result);
    }

    private ComplianceResultDTO mapToDTO(ComplianceResult cr) {
        String reqCode = "REQ-001";
        String reqText = "Requirement details";
        String category = "Technical";

        Requirement req = requirementRepository.findById(cr.getRequirementId()).orElse(null);
        if (req != null) {
            reqCode = req.getReqCode();
            reqText = req.getRawText();
            category = req.getCategory();
        }

        return ComplianceResultDTO.builder()
                .id(cr.getId())
                .requirementId(cr.getRequirementId())
                .requirementCode(reqCode)
                .requirementText(reqText)
                .category(category)
                .bidId(cr.getBidId())
                .status(cr.getStatus())
                .verificationMethod(cr.getVerificationMethod())
                .reasoning(cr.getReasoning())
                .confidence(cr.getConfidence())
                .evidenceIds(cr.getEvidenceIds())
                .reviewStatus(cr.getReviewStatus())
                .createdAt(cr.getCreatedAt())
                .build();
    }
}
