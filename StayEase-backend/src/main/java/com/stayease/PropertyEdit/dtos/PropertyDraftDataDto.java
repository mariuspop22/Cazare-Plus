package com.stayease.PropertyEdit.dtos;

import lombok.Data;
import java.util.List;

@Data
public class PropertyDraftDataDto {
    private String title;
    private String propertyType;
    private String description;
    private Double pricePerNight;
    private Integer maxGuests;
    private Integer rooms;
    private Integer bathrooms;
    private String address;
    private String city;
    private String county;
    private String country;

    private List<StandardFacilityDto> selectedFacilities;
    private List<CustomFacilityDto> customFacilities;
    private List<ImageDraftDto> images;
}
