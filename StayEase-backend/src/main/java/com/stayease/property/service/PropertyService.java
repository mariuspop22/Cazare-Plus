package com.stayease.property.service;

import java.util.Base64;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayease.facilities.entity.FacilityCategory;
import com.stayease.facilities.entity.PropertyFacility;
import com.stayease.facilities.entity.StandardFacility;
import com.stayease.facilities.repository.FacilityCategoryRepository;
import com.stayease.facilities.repository.StandardFacilityRepository;
import com.stayease.property.dto.PropertyRequestDto;
import com.stayease.property.dto.PropertyResponseDto;
import com.stayease.property.entity.Property;
import com.stayease.property.entity.PropertyImage;
import com.stayease.property.Enums.PropertyStatus;
import com.stayease.property.Enums.PropertyType;
import com.stayease.property.repository.PropertyRepository;
import com.stayease.users.Owner.entity.Owner;
import com.stayease.users.Owner.repository.OwnerRepository;
import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private StandardFacilityRepository standardFacilityRepository;

    @Autowired
    private FacilityCategoryRepository facilityCategoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public Property saveBasicProperty(PropertyRequestDto dto, String ownerEmail) throws IOException {
        Owner owner = ownerRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Proprietarul conectat nu a fost găsit!"));

        Property property = new Property();
        property.setOwner(owner);
        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setPricePerNight(dto.getPrice_per_night());
        property.setMaxGuests(dto.getMax_guests());
        property.setRooms(dto.getRooms() != null ? dto.getRooms() : 1);
        property.setBathrooms(dto.getBathrooms() != null ? dto.getBathrooms() : 1);
        property.setAddress(dto.getAddress());
        property.setCity(dto.getCity());
        property.setCounty(dto.getCounty());
        property.setCountry(dto.getCountry());
        property.setPropertyType(mapPropertyType(dto.getProperty_type()));
        property.setStatus(dto.getStatus() != null
                ? PropertyStatus.valueOf(dto.getStatus().toUpperCase())
                : PropertyStatus.PENDING);

        List<PropertyImage> imageEntities = new ArrayList<>();
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            boolean isFirst = true;
            for (MultipartFile file : dto.getImages()) {
                if (!file.isEmpty()) {
                    PropertyImage image = new PropertyImage();
                    image.setProperty(property);
                    image.setImageData(file.getBytes());
                    image.setMainImage(isFirst);
                    imageEntities.add(image);
                    isFirst = false;
                }
            }
        }
        property.setImages(imageEntities);

        List<PropertyFacility> facilityEntities = new ArrayList<>();
        if (dto.getFacilities() != null && !dto.getFacilities().trim().isEmpty()) {
            List<Long> standardIds = objectMapper.readValue(dto.getFacilities(), new TypeReference<List<Long>>() {});
            for (Long stdId : standardIds) {
                StandardFacility stdFac = standardFacilityRepository.findById(stdId).orElse(null);
                if (stdFac != null) {
                    PropertyFacility pf = new PropertyFacility();
                    pf.setProperty(property);
                    pf.setStandardFacility(stdFac);
                    pf.setCategory(stdFac.getCategory());
                    facilityEntities.add(pf);
                }
            }
        }
        if (dto.getCustomFacilities() != null && !dto.getCustomFacilities().trim().isEmpty()) {
            List<CustomFacilityInput> customList = objectMapper.readValue(
                    dto.getCustomFacilities(),
                    new TypeReference<List<CustomFacilityInput>>() {}
            );
            for (CustomFacilityInput custom : customList) {
                PropertyFacility pf = new PropertyFacility();
                pf.setProperty(property);
                pf.setCustomName(custom.getName());

                if (custom.getCategoryId() != null) {
                    FacilityCategory cat = facilityCategoryRepository.findById(custom.getCategoryId()).orElse(null);
                    pf.setCategory(cat);
                } else {
                    pf.setCustomCategoryName(custom.getCategoryName());
                }
                facilityEntities.add(pf);
            }
        }
        property.setPropertyFacilities(facilityEntities);
        return propertyRepository.save(property);
    }

    private PropertyType mapPropertyType(String typeStr) {
        if (typeStr == null) return PropertyType.APARTMENT;
        switch (typeStr.toLowerCase()) {
            case "cabană":
            case "cabana": return PropertyType.CABIN;
            case "cameră":
            case "camera": return PropertyType.ROOM;
            default: return PropertyType.APARTMENT;
        }
    }

    @Getter
    @Setter
    private static class CustomFacilityInput {
        private Long categoryId;
        private String categoryName;
        private String name;
    }

    public List<PropertyResponseDto> getFeaturedProperties() {
        List<Property> properties = propertyRepository.findTop3ByStatus(PropertyStatus.APPROVED);
        return properties.stream().map(prop -> {
            PropertyResponseDto dto = new PropertyResponseDto();
            dto.setId(prop.getId());
            dto.setTitle(prop.getTitle());
            dto.setPricePerNight(prop.getPricePerNight());
            dto.setCity(prop.getCity());
            dto.setCounty(prop.getCounty());
            dto.setAddress(prop.getAddress());
            dto.setDescription(prop.getDescription());
            if (prop.getImages() != null && !prop.getImages().isEmpty()) {
                byte[] imageData = prop.getImages().get(0).getImageData();
                if (imageData != null) {
                    String base64String = Base64.getEncoder().encodeToString(imageData);
                    dto.setMainImageBase64(base64String);
                }
            }
            return dto;
        }).toList();
    }

    public List<PropertyResponseDto> getPropertiesByOwnerEmail(String email) {
        List<Property> properties = propertyRepository.findByOwnerUserEmail(email);

        return properties.stream().map(property -> {
            PropertyResponseDto dto = new PropertyResponseDto();
            dto.setId(property.getId());
            dto.setTitle(property.getTitle());
            dto.setCity(property.getCity());
            dto.setAddress(property.getAddress());
            dto.setPricePerNight(property.getPricePerNight());

            if (property.getImages() != null && !property.getImages().isEmpty()) {
                byte[] imageData = property.getImages().get(0).getImageData();
                if (imageData != null) {
                    String base64String = Base64.getEncoder().encodeToString(imageData);
                    dto.setMainImageBase64("data:image/jpeg;base64," + base64String);
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public PropertyResponseDto getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proprietatea nu a fost găsită!"));

        PropertyResponseDto dto = new PropertyResponseDto();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setPricePerNight(property.getPricePerNight());
        dto.setCity(property.getCity());
        dto.setCounty(property.getCounty());
        dto.setAddress(property.getAddress());
        dto.setMaxGuests(property.getMaxGuests());
        dto.setRooms(property.getRooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setPropertyType(property.getPropertyType() != null ? property.getPropertyType().name() : "APARTMENT");



        if (property.getOwner() != null) {
            OwnerProfileResponseDto ownerDto = new OwnerProfileResponseDto();

            ownerDto.setFirstName(property.getOwner().getFirstName());
            ownerDto.setLastName(property.getOwner().getLastName());
            ownerDto.setTelephoneNumber(property.getOwner().getTelephoneNumber());

            byte[] profilePic = property.getOwner().getProfilePicture();
            if (profilePic != null) {
                String base64Pic = Base64.getEncoder().encodeToString(profilePic);
                ownerDto.setProfilePictureBase64("data:image/jpeg;base64," + base64Pic);
            }


            dto.setOwner(ownerDto);
        }

        return dto;
    }
}