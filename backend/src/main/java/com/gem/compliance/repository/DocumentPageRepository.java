package com.gem.compliance.repository;

import com.gem.compliance.domain.DocumentPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentPageRepository extends JpaRepository<DocumentPage, String> {
    List<DocumentPage> findByDocumentId(String documentId);
}
