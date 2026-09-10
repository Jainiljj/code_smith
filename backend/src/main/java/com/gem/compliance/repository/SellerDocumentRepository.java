package com.gem.compliance.repository;

import com.gem.compliance.domain.SellerDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerDocumentRepository extends JpaRepository<SellerDocument, String> {
    List<SellerDocument> findBySellerId(String sellerId);
}
