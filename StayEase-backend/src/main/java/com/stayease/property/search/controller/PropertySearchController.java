package com.stayease.property.search.controller;

import com.stayease.property.entity.Property;
import com.stayease.property.search.dto.PropertyFilterDTO;
import com.stayease.property.search.dto.PropertySearchRequestDto;
import com.stayease.property.search.service.PropertySearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertySearchController {
    private final PropertySearchService propertySearchService;

    @PostMapping("/search/filters")
    public ResponseEntity<List<Property>> propertyfilter(
            @RequestBody PropertyFilterDTO filterProperties) {

        List<Property> properties =
                propertySearchService.filterProperties(filterProperties);

        return ResponseEntity.ok(properties);
    }



    @GetMapping("/search")
    public ResponseEntity<List<Property>> searchProperties(@ModelAttribute PropertySearchRequestDto request) {
        List<Property> properties = propertySearchService.searchProperties(request);
        return ResponseEntity.ok(properties);
    }
}
