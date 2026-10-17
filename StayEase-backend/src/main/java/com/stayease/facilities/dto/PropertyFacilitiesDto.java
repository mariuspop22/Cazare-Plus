package com.stayease.facilities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyFacilitiesDto {
    private String category;
    private String facility;
    private boolean is_custom_category;
    private boolean is_custom_facility;
    private boolean is_custom_category_and_custom_facility;
}
