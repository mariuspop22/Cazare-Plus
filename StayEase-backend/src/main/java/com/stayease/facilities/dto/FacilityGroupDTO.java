package com.stayease.facilities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacilityGroupDTO {
    private String categoryName;
    private List<String> facilities;
}