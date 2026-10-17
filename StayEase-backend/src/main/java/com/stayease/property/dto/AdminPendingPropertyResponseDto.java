package com.stayease.property.dto;

import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPendingPropertyResponseDto {

    private Long id;
    private String title;
    private String propertyType;
    private Double pricePerNight;
    private String city;
    private String county;
    private String country;
    private String status;
    private String mainImageBase64;
    private OwnerProfileResponseDto owner;
}
