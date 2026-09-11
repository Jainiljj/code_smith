package com.gem.compliance.repository;

import com.gem.compliance.domain.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, String> {
    List<Seller> findByVerificationStatus(String verificationStatus);
    Optional<Seller> findByGstin(String gstin);

    @Query("SELECT s FROM Seller s WHERE s.cinOrPan = :cinOrPan")
    Optional<Seller> findByCinOrPan(@Param("cinOrPan") String cinOrPan);
}
