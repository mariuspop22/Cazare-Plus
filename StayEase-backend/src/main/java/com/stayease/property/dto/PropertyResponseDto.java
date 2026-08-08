package com.stayease.property.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PropertyResponseDto {
    private Long id;
    private String title;

    private String city;
    private String county;
    private String address;
    private Double pricePerNight;
    private String description;

    // Aici vom trimite imaginea convertită în text Base64 pentru frontend
    private String mainImageBase64;
}