package com.stayease.property.controller;


import com.stayease.EmailService.EmailService;
import com.stayease.property.Enums.PropertyStatus;
import com.stayease.property.dto.AdminPendingPropertyResponseDto;
import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import com.stayease.property.service.AdminPropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminPropertyController {

    private final AdminPropertyService adminPropertyService;
    private final PropertyRepository propertyRepository;
    private final EmailService emailService;

    @GetMapping("/pending")
    public ResponseEntity<List<AdminPendingPropertyResponseDto>> getPendingProperties() {
        List<AdminPendingPropertyResponseDto> pendingProperties = adminPropertyService.getPendingProperties();
        return ResponseEntity.ok(pendingProperties);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectProperty(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        Optional<Property> optionalProperty = propertyRepository.findById(id);
        if (optionalProperty.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String reason = payload.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Motivul respingerii este obligatoriu.");
        }

        Property property = optionalProperty.get();
        property.setStatus(PropertyStatus.REJECTED);
        property.setRejectionReason(reason);
        propertyRepository.save(property);

        if (property.getOwner() != null && property.getOwner().getUser().getEmail() != null) {
            String ownerEmail = property.getOwner().getUser().getEmail();
            String propertyTitle = property.getTitle();

            emailService.sendPropertyRejectionEmail(ownerEmail, propertyTitle, reason);
        }
        return ResponseEntity.ok().body("Proprietatea a fost respinsă cu succes și emailul a fost trimis.");
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveProperty(@PathVariable Long id) {
        Optional<Property> optionalProperty = propertyRepository.findById(id);
        if (optionalProperty.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Property property = optionalProperty.get();
        property.setStatus(PropertyStatus.APPROVED);
        propertyRepository.save(property);

        if (property.getOwner() != null && property.getOwner().getUser().getEmail() != null) {
            String ownerEmail = property.getOwner().getUser().getEmail();
            String propertyTitle = property.getTitle();

            emailService.sendPropertyApprovalEmail(ownerEmail, propertyTitle);
        }

        return ResponseEntity.ok().body("Proprietatea a fost aprobată cu succes și emailul a fost trimis.");
    }

    @PutMapping("/{id}/approve-rejected-property")
    public ResponseEntity<?> approveProperty(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Property> optionalProperty = propertyRepository.findById(id);
        if (optionalProperty.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Property property = optionalProperty.get();

        adminPropertyService.applyPartialUpdates(property, payload);

        if (property.getOwner() != null && property.getOwner().getUser().getEmail() != null) {
            String ownerEmail = property.getOwner().getUser().getEmail();
            String propertyTitle = property.getTitle();

            emailService.sendPropertyApprovalEmail(ownerEmail, propertyTitle);
        }

        return ResponseEntity.ok().body("Proprietatea a fost aprobată cu succes, modificările salvate și emailul a fost trimis.");
    }
}
