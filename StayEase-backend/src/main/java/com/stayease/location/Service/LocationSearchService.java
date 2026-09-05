package com.stayease.location.Service;


import com.stayease.location.Repository.AccountCityRepository;
import com.stayease.location.Repository.AccountCountyRepository;
import com.stayease.location.dto.LocationSearchResultDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationSearchService {

    private final AccountCountyRepository countyRepository;
    private final AccountCityRepository cityRepository;

    public List<LocationSearchResultDto> searchLocations(String query) {
        List<LocationSearchResultDto> results = new ArrayList<>();

        if (query == null || query.trim().length() < 2) {
            return results;
        }

        results.addAll(countyRepository.findTop5ByNameContainingIgnoreCaseOrderByNameAsc(query)
                .stream()
                .map(county -> new LocationSearchResultDto(
                        county.getId(),
                        county.getName(),
                        "COUNTY",
                        "Județ"
                ))
                .collect(Collectors.toList()));

        results.addAll(cityRepository.findTop10ByNameContainingIgnoreCaseOrderByNameAsc(query)
                .stream()
                .map(city -> new LocationSearchResultDto(
                        city.getId(),
                        city.getName(),
                        "CITY",
                        "Jud. " + city.getCounty().getName()
                ))
                .collect(Collectors.toList()));

        return results;
    }
}