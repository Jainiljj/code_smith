package com.gem.compliance.controller;

import com.gem.compliance.dto.TenderDTO;
import com.gem.compliance.service.TenderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tenders")
@RequiredArgsConstructor
@Tag(name = "Tender Management", description = "Endpoints for creating, retrieving, and managing GeM procurement tenders")
public class TenderController {

    private final TenderService tenderService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_VIEWER')")
    @Operation(summary = "List all active tenders", description = "Retrieves all tenders with extracted compliance requirements.")
    public ResponseEntity<List<TenderDTO>> getAllTenders() {
        return ResponseEntity.ok(tenderService.getAllTenders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_VIEWER')")
    @Operation(summary = "Get tender by ID", description = "Retrieves tender details and requirement breakdown for a specific tender ID.")
    public ResponseEntity<TenderDTO> getTenderById(@PathVariable String id) {
        return ResponseEntity.ok(tenderService.getTenderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Create a new tender", description = "Creates a new tender and extracts initial requirement constraints.")
    public ResponseEntity<TenderDTO> createTender(@RequestBody TenderDTO tenderDTO) {
        TenderDTO created = tenderService.createTender(tenderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
