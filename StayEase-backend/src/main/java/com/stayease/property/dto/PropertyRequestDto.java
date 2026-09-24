package com.stayease.property.dto;

import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class PropertyRequestDto {
    private String title;
    private String property_type;
    private String description;
    private Double price_per_night;
    private Integer max_guests;
    private Integer rooms;
    private Integer bathrooms;
    private String address;
    private String city;
    private String county;
    private String country;
    private String status;
    private List<MultipartFile> images;
    private String facilities;
    private String customFacilities;
    private OwnerProfileResponseDto owner;

    private Integer countyId;
    private Integer cityId;
    private Long siruta;
    private BigDecimal longitude;
    private BigDecimal latitude;
}