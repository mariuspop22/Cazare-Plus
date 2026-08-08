package com.stayease.facilities.dto;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryWithFacilitiesDto {
    private Long categoryId;
    private String categoryName;
    private List<StandardFacilityDto> facilities;
}
