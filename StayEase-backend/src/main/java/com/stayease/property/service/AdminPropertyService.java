package com.stayease.property.service;

import com.stayease.facilities.entity.FacilityCategory;
import com.stayease.facilities.entity.PropertyFacility;
import com.stayease.facilities.entity.StandardFacility;
import com.stayease.facilities.repository.FacilityCategoryRepository;
import com.stayease.facilities.repository.PropertyFacilityRepository;
import com.stayease.facilities.repository.StandardFacilityRepository;
import com.stayease.property.Enums.PropertyType;
import com.stayease.property.dto.AdminPendingPropertyResponseDto;
import com.stayease.property.entity.Property;
import com.stayease.property.Enums.PropertyStatus;
import com.stayease.property.entity.PropertyImage;
import com.stayease.property.repository.PropertyImageRepository;
import com.stayease.property.repository.PropertyRepository;
import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminPropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyFacilityRepository propertyFacilityRepository;
    private final FacilityCategoryRepository facilityCategoryRepository; // Necesar pentru facilități standard
    private final StandardFacilityRepository standardFacilityRepository;
    private final PropertyImageRepository propertyImageRepository;

    public AdminPropertyService(PropertyRepository propertyRepository, PropertyFacilityRepository propertyFacilityRepository
            , FacilityCategoryRepository facilityCategoryRepository, StandardFacilityRepository standardFacilityRepository, PropertyImageRepository
                                        propertyImageRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyFacilityRepository = propertyFacilityRepository;
        this.facilityCategoryRepository = facilityCategoryRepository;
        this.standardFacilityRepository = standardFacilityRepository;
        this.propertyImageRepository = propertyImageRepository;

    }

    @Transactional(readOnly = true)
    public List<AdminPendingPropertyResponseDto> getPendingProperties() {
        List<Property> properties = propertyRepository.findByStatus(PropertyStatus.PENDING);

        return properties.stream().map(property -> {
            AdminPendingPropertyResponseDto dto = new AdminPendingPropertyResponseDto();

            dto.setId(property.getId());
            dto.setTitle(property.getTitle());
            dto.setPropertyType(property.getPropertyType() != null ? property.getPropertyType().name() : null);
            dto.setPricePerNight(property.getPricePerNight());
            dto.setCity(property.getCity());
            dto.setCounty(property.getCounty());
            dto.setCountry(property.getCountry());
            dto.setStatus(property.getStatus() != null ? property.getStatus().name() : null);

            if (property.getImages() != null && !property.getImages().isEmpty()) {
                byte[] imageBytes = property.getImages().get(0).getImageData();
                if (imageBytes != null) {
                    dto.setMainImageBase64(Base64.getEncoder().encodeToString(imageBytes));
                }
            }

            if (property.getOwner() != null) {
                OwnerProfileResponseDto ownerDto = new OwnerProfileResponseDto();

                ownerDto.setFirstName(property.getOwner().getFirstName());
                ownerDto.setLastName(property.getOwner().getLastName());
                ownerDto.setTelephoneNumber(property.getOwner().getTelephoneNumber());
                ownerDto.setAddress(property.getOwner().getAddress());
                ownerDto.setBio(property.getOwner().getBio());
                ownerDto.setProfileComplete(property.getOwner().isProfileComplete());

                if (property.getOwner().getUser() != null) {
                    ownerDto.setEmail(property.getOwner().getUser().getEmail());
                }

                if (property.getOwner().getProfilePicture() != null) {
                    String base64ProfilePic = Base64.getEncoder().encodeToString(property.getOwner().getProfilePicture());
                    ownerDto.setProfilePictureBase64(base64ProfilePic);
                }

                dto.setOwner(ownerDto);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void approveProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Proprietatea cu ID-ul " + propertyId + " nu a fost găsită"));

        property.setStatus(PropertyStatus.APPROVED);
        propertyRepository.save(property);
    }

    @Transactional
    public void rejectProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Proprietatea cu ID-ul " + propertyId + " nu a fost găsită"));

        property.setStatus(PropertyStatus.REJECTED);
        propertyRepository.save(property);
    }

    @Transactional
    public void applyPartialUpdates(Property property, Map<String, Object> payload) {
        if (payload.containsKey("title")) property.setTitle((String) payload.get("title"));
        if (payload.containsKey("description")) property.setDescription((String) payload.get("description"));
        if (payload.containsKey("propertyType"))
            property.setPropertyType(PropertyType.valueOf((String) payload.get("propertyType")));

        if (payload.containsKey("pricePerNight"))
            property.setPricePerNight(Double.valueOf(payload.get("pricePerNight").toString()));
        if (payload.containsKey("maxGuests"))
            property.setMaxGuests(Integer.valueOf(payload.get("maxGuests").toString()));
        if (payload.containsKey("rooms")) property.setRooms(Integer.valueOf(payload.get("rooms").toString()));
        if (payload.containsKey("bathrooms"))
            property.setBathrooms(Integer.valueOf(payload.get("bathrooms").toString()));

        if (payload.containsKey("address")) property.setAddress((String) payload.get("address"));
        if (payload.containsKey("city")) property.setCity((String) payload.get("city"));
        if (payload.containsKey("county")) property.setCounty((String) payload.get("county"));
        if (payload.containsKey("country")) property.setCountry((String) payload.get("country"));

        if (payload.containsKey("newFacilities")) {
            List<Map<String, Object>> newFacilities = (List<Map<String, Object>>) payload.get("newFacilities");

            for (Map<String, Object> facData : newFacilities) {
                PropertyFacility pf = new PropertyFacility();
                pf.setProperty(property);

                String categoryName = (String) facData.get("categoryName");
                String facilityName = (String) facData.get("facility");

                boolean isCustomCategory = (Boolean) facData.getOrDefault("_custom_category", false);
                boolean isCustomFacility = (Boolean) facData.getOrDefault("_custom_facility", false);
                boolean isCustomBoth = (Boolean) facData.getOrDefault("_custom_category_and_custom_facility", false);

                if(isCustomBoth){
                    pf.setCustomCategoryName(categoryName);
                    pf.setCustomName(facilityName);

                }else if(isCustomFacility){
                    FacilityCategory category = facilityCategoryRepository.findByName(categoryName)
                            .orElseThrow(() -> new RuntimeException("Categoria standard nu a fost găsită"));
                    pf.setCategory(category);
                    pf.setCustomName(facilityName);

                }
                else if(!isCustomCategory && !isCustomFacility && !isCustomBoth){
                    FacilityCategory category = facilityCategoryRepository.findByName(categoryName)
                            .orElseThrow(() -> new RuntimeException("Categoria standard nu a fost găsită"));
                    pf.setCategory(category);
                    StandardFacility standardFacility = standardFacilityRepository.findByName(facilityName)
                            .orElseThrow(() -> new RuntimeException("Facilitatea standard nu a fost găsită"));
                    pf.setStandardFacility(standardFacility);
                }

                propertyFacilityRepository.save(pf);
            }
        }
        if (payload.containsKey("newImages")) {
            List<Map<String, Object>> newImages = (List<Map<String, Object>>) payload.get("newImages");
            for (Map<String, Object> imgMap : newImages) {
                PropertyImage newImage = new PropertyImage();
                newImage.setProperty(property);
                String base64String = (String) imgMap.get("base64Data");
                if (base64String != null) {
                    if (base64String.contains(",")) {
                        base64String = base64String.split(",")[1];
                    }

                    byte[] decodedBytes = Base64.getDecoder().decode(base64String);
                    newImage.setImageData(decodedBytes);
                }
                newImage.setMainImage(false);
                propertyImageRepository.save(newImage);
            }
            property.setStatus(PropertyStatus.APPROVED);
            propertyRepository.save(property);
        }

    }
}
