package com.stayease.location.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationSearchResultDto {
    private Integer id;
    private String name;
    private String type;
    private String context;
}
