package com.gem.compliance.controller;

import com.gem.compliance.domain.Seller;
import com.gem.compliance.dto.SellerDTO;
import com.gem.compliance.dto.SellerRiskOverrideRequest;
import com.gem.compliance.repository.SellerRepository;
import com.gem.compliance.service.SellerVerificationEngine;
import com.gem.compliance.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sellers")
@RequiredArgsConstructor
@Tag(name = "Seller Verification & Risk Engine", description = "Endpoints for seller trust scoring, government connectors, and human risk overrides")
public class SellerController {

    private final SellerRepository sellerRepository;
    private final SellerVerificationEngine verificationEngine;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_VIEWER')")
    @Operation(summary = "Get Seller Verification Queue", description = "Returns list of all sellers with trust scores and verification statuses.")
    public ResponseEntity<List<SellerDTO>> getAllSellers() {
        List<Seller> sellers = sellerRepository.findAll();
        List<SellerDTO> dtos = sellers.stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_VIEWER')")
    @Operation(summary = "Get Seller Profile & Verification Detail", description = "Retrieves full seller details including government connector verification results.")
    public ResponseEntity<SellerDTO> getSellerById(@PathVariable String id) {
        Seller seller = sellerRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Seller not found ID: " + id));
        return ResponseEntity.ok(mapToDTO(seller));
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Execute AI & Deterministic Seller Verification Pipeline", description = "Queries government connectors (GST, MCA, Udyam, DPIIT, BIS, EPFO) and updates Trust Score.")
    public ResponseEntity<SellerDTO> verifySeller(@PathVariable String id) {
        Seller updated = verificationEngine.verifyAndCalculateTrustScore(id);
        return ResponseEntity.ok(mapToDTO(updated));
    }

    @PostMapping("/{id}/override")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Submit Human Procurement Risk Override", description = "Allows Procurement Officer to override AI seller risk score with auditable rationale.")
    public ResponseEntity<SellerDTO> overrideSellerRisk(
        @PathVariable String id,
        @Valid @RequestBody SellerRiskOverrideRequest request
    ) {
        String reviewerId = userService.getCurrentUser().map(u -> u.getId()).orElse("USR-DEMO-PROC");
        Seller updated = verificationEngine.processRiskOverride(id, reviewerId, request.getOverrideDecision(), request.getReason());
        return ResponseEntity.ok(mapToDTO(updated));
    }

    private SellerDTO mapToDTO(Seller s) {
        List<SellerDTO.VerificationResultDTO> results = null;
        if (s.getVerificationResults() != null) {
            results = s.getVerificationResults().stream().map(vr ->
                SellerDTO.VerificationResultDTO.builder()
                    .connectorName(vr.getConnectorName())
                    .status(vr.getStatus())
                    .responseJson(vr.getResponseJson())
                    .verifiedAt(vr.getVerifiedAt())
                    .build()
            ).collect(Collectors.toList());
        }

        return SellerDTO.builder()
            .id(s.getId())
            .organizationName(s.getOrganizationName())
            .cinOrPan(s.getCinOrPan())
            .gstin(s.getGstin())
            .udyamRegistration(s.getUdyamRegistration())
            .dpiitNumber(s.getDpiitNumber())
            .bisLicense(s.getBisLicense())
            .epfoCode(s.getEpfoCode())
            .registeredAddress(s.getRegisteredAddress())
            .category(s.getCategory())
            .isDebarred(s.getIsDebarred())
            .trustScore(s.getTrustScore())
            .verificationStatus(s.getVerificationStatus())
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .verificationResults(results)
            .build();
    }
}
