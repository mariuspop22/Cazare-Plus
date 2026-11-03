package com.stayease.property.search.dto;

import com.stayease.property.Enums.PropertyType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class PropertyFilterDTO {

    private List<Long> propertiesSearchIds;
    private Integer minPrice;
    private Integer maxPrice;
    private List<PropertyType> propertyTypes;
    private List<PropertyFacilityDTO> facilities;

}
