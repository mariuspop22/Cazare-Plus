package com.stayease.facilities.service;

import com.stayease.facilities.dto.CategoryWithFacilitiesDto;
import com.stayease.facilities.dto.StandardFacilityDto;
import com.stayease.facilities.entity.FacilityCategory;
import com.stayease.facilities.entity.StandardFacility;
import com.stayease.facilities.repository.StandardFacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final StandardFacilityRepository facilityRepository;

    public List<CategoryWithFacilitiesDto> getFacilitiesGroupedByCategory() {
        // 1. Luăm toate facilitățile din baza de date
        List<StandardFacility> allFacilities = facilityRepository.findAllWithCategory();

        // 2. Le grupăm după obiectul FacilityCategory folosind Streams
        Map<FacilityCategory, List<StandardFacility>> groupedFacilities = allFacilities.stream()
                .collect(Collectors.groupingBy(StandardFacility::getCategory));

        // 3. Transformăm Map-ul rezultat în lista noastră de DTO-uri
        return groupedFacilities.entrySet().stream()
                .map(entry -> {
                    FacilityCategory category = entry.getKey();
                    List<StandardFacility> facilitiesInThisCategory = entry.getValue();

                    // Transformăm entitățile StandardFacility în StandardFacilityDto
                    List<StandardFacilityDto> facilityDtos = facilitiesInThisCategory.stream()
                            .map(f -> new StandardFacilityDto(f.getId(), f.getName()))
                            .collect(Collectors.toList());

                    // Creăm DTO-ul final pentru categoria curentă
                    return new CategoryWithFacilitiesDto(
                            category.getId(),
                            category.getName(),
                            facilityDtos
                    );
                })
                .collect(Collectors.toList());
    }
}
