package com.stayease.OwnerEditRejectedProperty.controller;

import com.stayease.OwnerEditRejectedProperty.service.PropertyDraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyDraftController {

    private final PropertyDraftService propertyDraftService;

    @PutMapping("/edit-rejected-property/{id}")
    public ResponseEntity<?> saveRejectedPropertyDraft(
            @PathVariable("id") Long propertyId,
            @RequestBody Map<String, Object> payload) {

        propertyDraftService.saveOrUpdateDraft(propertyId, payload);

        return ResponseEntity.ok(Map.of(
                "message", "Draft-ul pentru proprietatea respinsă a fost salvat cu succes!"
        ));
    }
    @GetMapping("/pending-owner-update-rejected-property/{id}")
    public ResponseEntity<?> getRejectedPropertyDraft(@PathVariable("id") Long propertyId) {
        return propertyDraftService.getDraftDataByPropertyId(propertyId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}/approve-rejected-property")
    public ResponseEntity<?> approveRejectedProperty(
            @PathVariable Long id,
            @RequestBody Map<String, Object> draftPayload) {

        try {
            propertyDraftService.approveAndMergeRejectedProperty(id, draftPayload);

            return ResponseEntity.ok().body("Proprietatea a fost aprobată cu succes și datele au fost actualizate.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Eroare la aprobare: " + e.getMessage());
        }
    }

}
