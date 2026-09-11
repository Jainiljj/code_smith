package com.gem.compliance.repository;

import com.gem.compliance.domain.ComplianceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceResultRepository extends JpaRepository<ComplianceResult, String> {
    List<ComplianceResult> findByBidId(String bidId);
    List<ComplianceResult> findByBidIdIn(List<String> bidIds);
    Optional<ComplianceResult> findByRequirementIdAndBidId(String requirementId, String bidId);

    @Query("SELECT cr FROM ComplianceResult cr WHERE cr.bidId IN (SELECT b.id FROM Bid b WHERE b.tenderId = :tenderId)")
    List<ComplianceResult> findByTenderId(@Param("tenderId") String tenderId);
}
