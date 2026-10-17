package com.stayease.PropertyUnavailablePeriods.controller;

import com.stayease.PropertyUnavailablePeriods.Service.PropertyUnavailablePeriodsService;
import com.stayease.PropertyUnavailablePeriods.dto.PropertyUnavailablePeriodsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:8000", "http://localhost:5173"})
public class PropertyUnavailablePeriodsController {

    private final PropertyUnavailablePeriodsService propertyUnavailablePeriodsService;

    @GetMapping("/{id}/UnavailablePeriods")
    public ResponseEntity<List<PropertyUnavailablePeriodsDto>> getPropertyUnavailablePeriods(@PathVariable Long id) {
        List<PropertyUnavailablePeriodsDto> propertieUnavailablePeriods =
                propertyUnavailablePeriodsService.getPropertieUnavailablePeriods(id);

        return ResponseEntity.ok(propertieUnavailablePeriods);
    }

    @PostMapping("/{id}/UnavailablePeriods")
    public ResponseEntity<PropertyUnavailablePeriodsDto> addPropertyUnavailablePeriod(
            @PathVariable Long id,
            @RequestBody PropertyUnavailablePeriodsDto dto) {

        PropertyUnavailablePeriodsDto createdPeriod =
                propertyUnavailablePeriodsService.addUnavailablePeriod(id, dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdPeriod);
    }
}