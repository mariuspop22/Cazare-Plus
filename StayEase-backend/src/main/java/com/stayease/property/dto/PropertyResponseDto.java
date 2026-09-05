package com.stayease.property.dto;

import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;
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
    private Integer maxGuests;
    private Integer rooms;
    private Integer bathrooms;
    private String propertyType;
    private String mainImageBase64;
    private OwnerProfileResponseDto owner;
}