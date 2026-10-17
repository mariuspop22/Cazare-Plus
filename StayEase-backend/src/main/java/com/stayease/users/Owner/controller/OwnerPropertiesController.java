package com.stayease.users.Owner.controller;

import com.stayease.property.dto.PropertyResponseDto;
import com.stayease.property.repository.PropertyRepository;
import com.stayease.property.service.PropertyService;
import com.stayease.users.Owner.OwnerStatsProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/owner/")
@RequiredArgsConstructor
public class OwnerPropertiesController {
    private final PropertyService propertyService;
    private final PropertyRepository propertyRepository;
    @GetMapping("{id}/properties")
    public ResponseEntity<List<PropertyResponseDto>> getOwnerProperties(@PathVariable("id")Long id) {

        List<PropertyResponseDto> properties = propertyService.getOwnerProperties(id);
        return ResponseEntity.ok(properties);
    }
    @GetMapping("{ownerId}/stats")
    public ResponseEntity<OwnerStatsProjection> getOwnerStats(@PathVariable Long ownerId) {
        OwnerStatsProjection stats = propertyRepository.getOwnerStatsByOwnerId(ownerId);
        return ResponseEntity.ok(stats);
    }
}

