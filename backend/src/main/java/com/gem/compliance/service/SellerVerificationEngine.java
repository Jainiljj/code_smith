package com.gem.compliance.service;

import com.gem.compliance.domain.*;
import com.gem.compliance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SellerVerificationEngine {

    private final SellerRepository sellerRepository;
    private final SellerVerificationResultRepository verificationResultRepository;
    private final SellerRiskOverrideRepository overrideRepository;
    private final GovernmentVerificationService govConnectorService;

    public Seller verifyAndCalculateTrustScore(String sellerId) {
        Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
        if (sellerOpt.isEmpty()) {
            throw new IllegalArgumentException("Seller not found with ID: " + sellerId);
        }

        Seller seller = sellerOpt.get();

        // 1. Run Government Connectors
        String gstRes = govConnectorService.queryGstnConnector(seller.getGstin(), seller.getOrganizationName());
        saveResult(seller, "GSTN", gstRes.contains("\"matched\":true") ? "MATCHED" : "MISMATCHED", gstRes);

        String mcaRes = govConnectorService.queryMca21Connector(seller.getCinOrPan(), seller.getOrganizationName());
        saveResult(seller, "MCA21", mcaRes.contains("\"matched\":true") ? "MATCHED" : "MISMATCHED", mcaRes);

        if (seller.getUdyamRegistration() != null) {
            String udyamRes = govConnectorService.queryUdyamConnector(seller.getUdyamRegistration(), seller.getOrganizationName());
            saveResult(seller, "UDYAM", udyamRes.contains("\"matched\":true") ? "MATCHED" : "WARNING", udyamRes);
        }

        if (seller.getEpfoCode() != null) {
            String epfoRes = govConnectorService.queryEpfoConnector(seller.getEpfoCode());
            saveResult(seller, "EPFO", epfoRes.contains("\"matched\":true") ? "MATCHED" : "WARNING", epfoRes);
        }

        if (seller.getBisLicense() != null) {
            String bisRes = govConnectorService.queryBisConnector(seller.getBisLicense());
            saveResult(seller, "BIS", bisRes.contains("\"matched\":true") ? "MATCHED" : "NOT_FOUND", bisRes);
        }

        // 2. Calculate Trust Score Factors
        double govRegistryScore = 30.0; // max 30
        double statutoryTaxScore = 25.0; // max 25
        double entityConsistencyScore = 25.0; // max 25
        double existenceRiskScore = 20.0; // max 20

        // Debarred check
        if (Boolean.TRUE.equals(seller.getIsDebarred())) {
            existenceRiskScore = 0.0;
        }

        // Check GSTN status
        if (gstRes.contains("CANCELLED_TAX_DEFAULT")) {
            statutoryTaxScore = 5.0;
        }

        // Check shell indicators in address or name
        if (seller.getRegisteredAddress() != null && seller.getRegisteredAddress().toLowerCase().contains("virtual")) {
            existenceRiskScore = 5.0;
        }

        // Check name mismatch indicator
        if (seller.getOrganizationName().contains("Mismatch")) {
            entityConsistencyScore = 10.0;
        }

        double totalScore = govRegistryScore + statutoryTaxScore + entityConsistencyScore + existenceRiskScore;
        totalScore = Math.max(0.0, Math.min(100.0, totalScore));

        seller.setTrustScore(BigDecimal.valueOf(totalScore).setScale(2, RoundingMode.HALF_UP));

        if (totalScore >= 80.0) {
            seller.setVerificationStatus("VERIFIED");
        } else if (seller.getRegisteredAddress() != null && seller.getRegisteredAddress().toLowerCase().contains("virtual")) {
            seller.setVerificationStatus("SUSPECTED_SHELL");
        } else {
            seller.setVerificationStatus("HIGH_RISK");
        }

        seller.setUpdatedAt(ZonedDateTime.now());
        return sellerRepository.save(seller);
    }

    public Seller processRiskOverride(String sellerId, String reviewerId, String decision, String reason) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new IllegalArgumentException("Seller not found ID: " + sellerId));

        BigDecimal originalScore = seller.getTrustScore();

        SellerRiskOverride override = SellerRiskOverride.builder()
            .id("OVR-" + UUID.randomUUID().toString().substring(0, 8))
            .seller(seller)
            .reviewerId(reviewerId)
            .originalScore(originalScore != null ? originalScore : BigDecimal.ZERO)
            .overrideDecision(decision)
            .reason(reason)
            .build();

        overrideRepository.save(override);

        if ("APPROVED_OVERRIDE".equalsIgnoreCase(decision)) {
            seller.setVerificationStatus("HUMAN_OVERRIDDEN");
        } else if ("REJECTED_OVERRIDE".equalsIgnoreCase(decision)) {
            seller.setVerificationStatus("HIGH_RISK");
        }

        seller.setUpdatedAt(ZonedDateTime.now());
        return sellerRepository.save(seller);
    }

    private void saveResult(Seller seller, String connector, String status, String json) {
        SellerVerificationResult res = SellerVerificationResult.builder()
            .id("SVR-" + UUID.randomUUID().toString().substring(0, 8))
            .seller(seller)
            .connectorName(connector)
            .status(status)
            .responseJson(json)
            .build();
        verificationResultRepository.save(res);
    }
}
