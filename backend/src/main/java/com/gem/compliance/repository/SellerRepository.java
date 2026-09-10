package com.gem.compliance.repository;

import com.gem.compliance.domain.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, String> {
    List<Seller> findByVerificationStatus(String verificationStatus);
    Optional<Seller> findByGstin(String gstin);
    Optional<Seller> findByCinOrPan(String cinOrPan);
}
