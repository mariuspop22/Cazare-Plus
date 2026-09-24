package com.stayease.property.controller;

import com.stayease.property.dto.PropertyRequestDto;
import com.stayease.property.dto.PropertyResponseDto;
import com.stayease.property.dto.PropertyDetailsDTO;
import com.stayease.property.entity.Property;
import com.stayease.property.search.dto.PropertySearchRequestDto;
import com.stayease.property.search.service.PropertySearchService;
import com.stayease.property.service.PropertyService;
import com.stayease.property.service.PropertyDisplayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
// AICI ESTE REZOLVAREA PROBLEMEI:
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PropertyController {

    private final PropertyService propertyService;
    private final PropertyDisplayService propertyDisplayService;
    private final PropertySearchService propertySearchService;

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

    @GetMapping("/search")
    public ResponseEntity<List<Property>> searchProperties(@ModelAttribute PropertySearchRequestDto request) {
        List<Property> properties = propertySearchService.searchProperties(request);
        return ResponseEntity.ok(properties);
    }
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<PropertyDetailsDTO>> getSimilarProperties(@PathVariable Long id) {
        List<PropertyDetailsDTO> similarProperties = propertyService.getSimilarProperties(id);
        return ResponseEntity.ok(similarProperties);
    }
}