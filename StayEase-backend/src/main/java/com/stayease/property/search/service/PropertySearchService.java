package com.stayease.property.search.service;


import com.stayease.facilities.entity.PropertyFacility;
import com.stayease.property.Enums.PropertyType;
import com.stayease.property.search.dto.PropertyFacilityDTO;
import com.stayease.property.search.dto.PropertyFilterDTO;
import com.stayease.property.search.dto.PropertySearchRequestDto;
import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertySearchService {

    private final PropertyRepository propertyRepository;

    public List<Property> searchProperties(PropertySearchRequestDto request) {
        String cleanCity = "";

        if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
            cleanCity = request.getCity().trim();
        }

        // Apelăm query-ul din Repository
        return propertyRepository.searchProperties(
                cleanCity,
                request.getCheckIn(),
                request.getCheckOut(),
                request.getGuests(),
                request.getRooms()
        );
    }

    private String removeDiacritics(String str) {
        if (str == null) return "";
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").toLowerCase();
    }

    public List<Property> filterProperties(PropertyFilterDTO propertyFilterDTO) {

        List<Property> properties = new ArrayList<>();

        List<Long> propertiesSearchIds = propertyFilterDTO.getPropertiesSearchIds();

        for (Long id : propertiesSearchIds) {
            Property property = propertyRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException(
                            "Proprietatea cu id-ul " + id + " nu exista!"));

            properties.add(property);
        }

        List<PropertyType> propertyTypes = propertyFilterDTO.getPropertyTypes();
        Integer minPrice = propertyFilterDTO.getMinPrice();
        Integer maxPrice = propertyFilterDTO.getMaxPrice();
        List<PropertyFacilityDTO> facilities = propertyFilterDTO.getFacilities();

        properties = filterbyPropertyType(properties, propertyTypes);
        properties = filterByPrice(properties, minPrice, maxPrice);
        properties = filterByFacilities(properties, facilities);

        return properties;
    }

    public List<Property> filterbyPropertyType(List<Property> properties,List<PropertyType> propertiesTypes){
        List<Property> properties_after_filter= new ArrayList<>();
        for ( Property propery : properties){
            if (propertiesTypes.contains(propery.getPropertyType())) {
                properties_after_filter.add(propery);
            }
        }
        return  properties_after_filter;
    }
    public List<Property> filterByPrice(List<Property> properties, Integer minPrice,Integer maxPrice){
        List<Property> properties_after_filter= new ArrayList<>();
        for (Property property: properties){
            if( property.getPricePerNight()>=minPrice && property.getPricePerNight()<=maxPrice){
                properties_after_filter.add(property);
            }
        }
return properties_after_filter;
    }

    public List<Property> filterByFacilities(
            List<Property> properties,
            List<PropertyFacilityDTO> propertyFacilityDTOS) {

        List<Property> propertiesAfterFilter = new ArrayList<>();

        if (propertyFacilityDTOS == null || propertyFacilityDTOS.isEmpty()) {
            return properties;
        }
        for (Property property : properties) {
            List<PropertyFacility> facilities = property.getPropertyFacilities();
            boolean containsAllFacilities = true;

            for (PropertyFacilityDTO facilityDTO : propertyFacilityDTOS) {
                boolean found = false;
                for (PropertyFacility facility : facilities) {
                    if (facility.getCategory() != null
                            && facility.getStandardFacility() != null
                            && facility.getCategory().getId().equals(facilityDTO.getCategoryId())
                            && facility.getStandardFacility().getId().equals(facilityDTO.getFacilityId())) {

                        found = true;
                        break;
                    }
                }
                if (!found) {
                    containsAllFacilities = false;
                    break;
                }
            }
            if (containsAllFacilities) {
                propertiesAfterFilter.add(property);
            }
        }

        return propertiesAfterFilter;
    }


}
