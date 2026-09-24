package com.stayease.property.dto;

import com.stayease.facilities.dto.FacilityGroupDTO;
import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;
import lombok.Data;
import java.util.List;

@Data
public class PropertyDetailsDTO {
    private Long id;
    private String title;
    private String propertyType;
    private String description;
    private String address;
    private String city;
    private String county;
    private String country;
    private Double pricePerNight;
    private Integer maxGuests;
    private Integer rooms;
    private Integer bathrooms;
    private String status;
    private Double rating;
    private List<ImageDTO> images;
    private List<FacilityGroupDTO> facilities;
    private OwnerProfileResponseDto owner;
    private List<UnavailablePeriodDto> unavailablePeriods;
}