package com.stayease.Topproperties.controller;


import com.stayease.property.entity.Property;
import com.stayease.property.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationTopPropertiesController {

    private final PropertyService propertyService;

    /**
     * Endpoint: GET http://localhost:8080/api/destinations/{destinationName}/top-properties?limit=5
     */    @GetMapping("/{destinationName}/top-properties")
    public ResponseEntity<List<Property>> getTopPropertiesForDestination(
            @PathVariable String destinationName,
            @RequestParam(defaultValue = "5") int limit) {

        List<Property> topProperties = propertyService.getTopRatedPropertiesByDestination(destinationName, limit);
        return ResponseEntity.ok(topProperties);
    }
}