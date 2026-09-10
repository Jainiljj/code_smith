package com.gem.compliance.repository;

import com.gem.compliance.domain.Tender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenderRepository extends JpaRepository<Tender, String> {
    Optional<Tender> findByTenderNumber(String tenderNumber);
}
