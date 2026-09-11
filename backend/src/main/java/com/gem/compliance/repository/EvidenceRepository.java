package com.gem.compliance.repository;

import com.gem.compliance.domain.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, String> {
    List<Evidence> findByRequirementId(String requirementId);
    List<Evidence> findByBidId(String bidId);
}
