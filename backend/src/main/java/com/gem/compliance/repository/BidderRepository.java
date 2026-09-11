package com.gem.compliance.repository;

import com.gem.compliance.domain.Bidder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BidderRepository extends JpaRepository<Bidder, String> {
}
