package com.gem.compliance.repository;

import com.gem.compliance.domain.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, String> {
    List<Bid> findByTenderId(String tenderId);
}
