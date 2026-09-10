package com.gem.compliance.repository;

import com.gem.compliance.domain.SellerRiskOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerRiskOverrideRepository extends JpaRepository<SellerRiskOverride, String> {
    List<SellerRiskOverride> findBySellerId(String sellerId);
}
