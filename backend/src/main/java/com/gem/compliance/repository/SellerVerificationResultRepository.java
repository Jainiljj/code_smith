package com.gem.compliance.repository;

import com.gem.compliance.domain.SellerVerificationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerVerificationResultRepository extends JpaRepository<SellerVerificationResult, String> {
    List<SellerVerificationResult> findBySellerId(String sellerId);
}
