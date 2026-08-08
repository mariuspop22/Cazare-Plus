package com.stayease.property.controller;

import com.stayease.property.dto.PropertyResponseDto;
import com.stayease.property.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*") // Permite frontend-ului tău să comunice cu backend-ul fără blocaje de securitate CORS
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    // Acest endpoint va fi disponibil la: http://localhost:8080/api/properties/featured
    @GetMapping("/featured")
    public ResponseEntity<List<PropertyResponseDto>> getFeaturedProperties() {
        List<PropertyResponseDto> featured = propertyService.getFeaturedProperties();
        return ResponseEntity.ok(featured);
    }
}