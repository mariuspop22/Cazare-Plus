package com.stayease.location.Service;

import com.stayease.location.Repository.AccountCityRepository;
import com.stayease.location.Repository.AccountCountyRepository;
import com.stayease.location.dto.CityDTO;
import com.stayease.location.dto.CountyDTO;
import com.stayease.location.dto.LocationSearchResultDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
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

        String cleanQuery = removeDiacritics(query.trim());

        if (cleanQuery.length() < 2) {
            return results;
        }

        // Pentru județe punem null la siruta, latitudine și longitudine
        results.addAll(countyRepository.searchWithoutDiacritics(cleanQuery, PageRequest.of(0, 5))
                .stream()
                .map(county -> new LocationSearchResultDto(
                        county.getId(),
                        county.getName(),
                        "COUNTY",
                        "Județ",
                        null, // siruta
                        null, // latitude
                        null  // longitude
                ))
                .collect(Collectors.toList()));

        // Pentru orașe extragem valorile din obiectul city (AccountCity)
        results.addAll(cityRepository.searchWithoutDiacritics(cleanQuery, PageRequest.of(0, 10))
                .stream()
                .map(city -> new LocationSearchResultDto(
                        city.getId(),
                        city.getName(),
                        "CITY",
                        "Jud. " + city.getCounty().getName(),
                        city.getSiruta(),
                        city.getLatitude(),
                        city.getLongitude()
                ))
                .collect(Collectors.toList()));

        return results;
    }

    private String removeDiacritics(String str) {
        if (str == null) {
            return "";
        }
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").toLowerCase();
    }

    public List<CountyDTO> getAllCounties() {
        return countyRepository.findAllByOrderByNameAsc().stream()
                .map(c -> new CountyDTO(c.getId(), c.getName(), c.getCode()))
                .collect(Collectors.toList());
    }

    public List<CityDTO> getCitiesByCounty(Integer countyId) {
        return cityRepository.findByCountyIdOrderByNameAsc(countyId).stream()
                .map(city -> new CityDTO(
                        city.getId(),
                        city.getName(),
                        city.getSiruta(),
                        city.getLatitude(),
                        city.getLongitude()
                ))
                .collect(Collectors.toList());
    }
}