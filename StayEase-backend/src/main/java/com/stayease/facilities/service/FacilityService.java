package com.stayease.facilities.service;

import com.stayease.facilities.dto.CategoryWithFacilitiesDto;
import com.stayease.facilities.dto.PropertyFacilitiesDto;
import com.stayease.facilities.dto.StandardFacilityDto;
import com.stayease.facilities.entity.FacilityCategory;
import com.stayease.facilities.entity.PropertyFacility;
import com.stayease.facilities.entity.StandardFacility;
import com.stayease.facilities.repository.PropertyFacilityRepository;
import com.stayease.facilities.repository.StandardFacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final StandardFacilityRepository facilityRepository;
    private final PropertyFacilityRepository propertyFacitityRepository;

    public List<CategoryWithFacilitiesDto> getFacilitiesGroupedByCategory() {
        // 1. Luăm toate facilitățile din baza de date
        List<StandardFacility> allFacilities = facilityRepository.findAllWithCategory();

        Map<FacilityCategory, List<StandardFacility>> groupedFacilities = allFacilities.stream()
                .collect(Collectors.groupingBy(StandardFacility::getCategory));

        return groupedFacilities.entrySet().stream()
                .map(entry -> {
                    FacilityCategory category = entry.getKey();
                    List<StandardFacility> facilitiesInThisCategory = entry.getValue();

                    List<StandardFacilityDto> facilityDtos = facilitiesInThisCategory.stream()
                            .map(f -> new StandardFacilityDto(f.getId(), f.getName()))
                            .collect(Collectors.toList());

                    return new CategoryWithFacilitiesDto(
                            category.getId(),
                            category.getName(),
                            facilityDtos
                    );
                })
                .collect(Collectors.toList());
    }
    public List<PropertyFacilitiesDto> getPropertyFacilities(Long id) {
        List<PropertyFacilitiesDto> facilities = new ArrayList<>();
        List<PropertyFacility> list = propertyFacitityRepository.findByPropertyId(id);

        for (PropertyFacility f : list) {
            PropertyFacilitiesDto dto = new PropertyFacilitiesDto();

            if (f.getCustomCategoryName() == null && f.getCustomName() == null) {

                dto.setCategory(f.getCategory().getName());
                dto.setFacility(f.getStandardFacility().getName());

                dto.set_custom_facility(false);
                dto.set_custom_category(false);
                dto.set_custom_category_and_custom_facility(false);

            } else if (f.getCustomCategoryName() == null && f.getCustomName() != null) {

                dto.setCategory(f.getCategory().getName());
                dto.setFacility(f.getCustomName());

                dto.set_custom_facility(true);
                dto.set_custom_category(false);
                dto.set_custom_category_and_custom_facility(false);

            } else if (f.getCustomCategoryName() != null && f.getCustomName() != null) {

                dto.setCategory(f.getCustomCategoryName());
                dto.setFacility(f.getCustomName());

                dto.set_custom_facility(false);
                dto.set_custom_category(true);
                dto.set_custom_category_and_custom_facility(true);
            }

            facilities.add(dto);
        }

        return facilities;
    }
}
