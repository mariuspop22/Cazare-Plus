package com.stayease.facilities.controller;



import com.stayease.facilities.dto.CategoryWithFacilitiesDto;
import com.stayease.facilities.service.FacilityService; // Am pus .services la plural ca în modelul tău
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping("/grouped")
    public ResponseEntity<?> getGroupedFacilities() {
        try {
            List<CategoryWithFacilitiesDto> facilities = facilityService.getFacilitiesGroupedByCategory();
            return ResponseEntity.ok(facilities);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Eroare la preluarea facilităților: " + e.getMessage());
        }
    }
}
