package com.stayease.property.controller;

import com.stayease.property.dto.PropertyRequestDto;
import com.stayease.property.dto.PropertyResponseDto;
import com.stayease.property.dto.PropertyDetailsDTO; // Să nu uiți acest import!
import com.stayease.property.entity.Property;
import com.stayease.property.service.PropertyService;
import com.stayease.property.service.PropertyDisplayService; // Și acest import!
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;
    private final PropertyDisplayService propertyDisplayService;

    @GetMapping("/featured")
    public ResponseEntity<List<PropertyResponseDto>> getFeaturedProperties() {
        List<PropertyResponseDto> featured = propertyService.getFeaturedProperties();
        return ResponseEntity.ok(featured);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProperty(
            @ModelAttribute PropertyRequestDto dto,
            Authentication authentication
    ) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body("Utilizatorul nu este autentificat!");
            }

            String ownerEmail = authentication.getName();
            Property savedProperty = propertyService.saveBasicProperty(dto, ownerEmail);

            return ResponseEntity.ok(savedProperty);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Eroare la salvarea datelor: " + e.getMessage());
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<PropertyDetailsDTO> getPropertyDetails(@PathVariable Long id) {
        PropertyDetailsDTO propertyDetails = propertyDisplayService.getPropertyDetails(id);
        return ResponseEntity.ok(propertyDetails);
    }

}