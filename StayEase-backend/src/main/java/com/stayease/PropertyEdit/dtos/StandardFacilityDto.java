package com.stayease.PropertyEdit.dtos;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class StandardFacilityDto {
    private String categoryName;

    @JsonProperty("facility")
    private String facility;

    @JsonProperty("_custom_category")
    private boolean customCategory;

    @JsonProperty("_custom_facility")
    private boolean customFacility;

    @JsonProperty("_custom_category_and_custom_facility")
    private boolean customCategoryAndCustomFacility;
}