package com.stayease.location.Controller;


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
}
