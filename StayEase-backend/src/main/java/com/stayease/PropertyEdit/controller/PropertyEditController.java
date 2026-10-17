package com.stayease.PropertyEdit.controller;

import com.stayease.EmailService.EmailService;
import com.stayease.PropertyEdit.dtos.PropertyDraftDataDto;
import com.stayease.PropertyEdit.entity.PropertyEditDraft;
import com.stayease.PropertyEdit.service.PropertyEditDraftService;
import com.stayease.PropertyEdit.service.PropertyModificationsService;
import com.stayease.property.dto.AdminPendingPropertyResponseDto;
import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8000") // Permite apelurile din React
public class PropertyEditController {

    private final PropertyEditDraftService draftService;
    private final PropertyRepository propertyRepository;
    private final PropertyModificationsService propertyModificationsService;
    private final EmailService emailService;
    /**
     * Endpoint apelat din React când proprietarul apasă pe "Salvează Modificările"
     * URL exemplu: POST http://localhost:8080/api/properties/9/draft?userId=2
     */
    @PostMapping("/{id}/draft")
    public ResponseEntity<?> submitPropertyEditDraft(
            @PathVariable("id") Long propertyId,
            @RequestParam("userId") Long userId,
            @RequestBody PropertyDraftDataDto draftData) {

        PropertyEditDraft savedDraft = draftService.saveOrUpdateDraft(propertyId, userId, draftData);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Solicitarea ta de editare a fost salvată și trimisă spre verificare administratorului.",
                "draftId", savedDraft.getId(),
                "status", savedDraft.getStatus()
        ));
    }
    @GetMapping("/admin/get-pending-edited-properties")
    public ResponseEntity<List<AdminPendingPropertyResponseDto>> getPendingEditedProperties() {

        List<AdminPendingPropertyResponseDto> pendingEdidedProperties=draftService.getPendingEdidedProperties();
        return  ResponseEntity.ok(pendingEdidedProperties);
    }
    @GetMapping("/admin/get-property-modifications-details/{propertyId}")
    public ResponseEntity<Map<String, Object>> getPropertyModificationsDetails(@PathVariable Long propertyId) {
        return draftService.getDraftDataByPropertyId(propertyId)
                .map(draftData -> ResponseEntity.ok(draftData))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/admin/approve-property-modifications/{id}")
    public ResponseEntity<?> approvePropertyModifications(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Property> optionalProperty = propertyRepository.findById(id);
        if (optionalProperty.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Property property = optionalProperty.get();

        propertyModificationsService.applyPartialModifications(property, payload);

        if (property.getOwner() != null && property.getOwner().getUser().getEmail() != null) {
            String ownerEmail = property.getOwner().getUser().getEmail();
            String propertyTitle = property.getTitle();

            emailService.sendPropertyModificationsApprovalEmail(ownerEmail, propertyTitle);
        }

        return ResponseEntity.ok().body("Modificarile au fost aprobate cu succes, modificările au fost salvate și emailul a fost trimis.");
    }
}
