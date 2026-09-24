package com.stayease.location.Controller;


import com.stayease.location.dto.CityDTO;
import com.stayease.location.dto.CountyDTO;
import com.stayease.location.dto.LocationSearchResultDto;
import com.stayease.location.Service.LocationSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LocationController {

    private final LocationSearchService locationSearchService;

    @GetMapping("/search")
    public ResponseEntity<List<LocationSearchResultDto>> search(@RequestParam String query) {
        List<LocationSearchResultDto> results = locationSearchService.searchLocations(query);
        return ResponseEntity.ok(results);
    }
// get al counties
    @GetMapping("/counties")
    public ResponseEntity<List<CountyDTO>> getAllCounties() {
        return ResponseEntity.ok(locationSearchService.getAllCounties());
    }
// get all county from a specific county
    @GetMapping("/counties/{countyId}/cities")
    public ResponseEntity<List<CityDTO>> getCitiesByCounty(@PathVariable Integer countyId) {
        return ResponseEntity.ok(locationSearchService.getCitiesByCounty(countyId));
    }
}
