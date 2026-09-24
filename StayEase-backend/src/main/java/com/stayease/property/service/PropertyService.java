package com.stayease.property.service;

import com.stayease.property.dto.ImageDTO;
import com.stayease.property.dto.PropertyDetailsDTO;
import org.springframework.data.domain.Pageable;
import java.util.Base64;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayease.facilities.entity.FacilityCategory;
import com.stayease.facilities.entity.PropertyFacility;
import com.stayease.facilities.entity.StandardFacility;
import com.stayease.facilities.repository.FacilityCategoryRepository;
import com.stayease.facilities.repository.StandardFacilityRepository;
import com.stayease.location.entity.AccountCity;
import com.stayease.location.entity.AccountCounty;
import com.stayease.location.Repository.AccountCityRepository;
import com.stayease.location.Repository.AccountCountyRepository;
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
import java.util.Base64;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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
    private AccountCityRepository accountCityRepository;

    @Autowired
    private AccountCountyRepository accountCountyRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public Property saveBasicProperty(PropertyRequestDto dto, String ownerEmail) throws IOException {
        Owner owner = ownerRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Proprietarul conectat nu a fost găsit!"));

        AccountCounty county = accountCountyRepository.findById(dto.getCountyId())
                .orElseThrow(() -> new RuntimeException("Județul specificat nu există."));

        AccountCity city = accountCityRepository.findById(dto.getCityId())
                .orElseThrow(() -> new RuntimeException("Orașul specificat nu există."));

        Property property = new Property();
        property.setOwner(owner);
        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setPricePerNight(dto.getPrice_per_night());
        property.setMaxGuests(dto.getMax_guests());
        property.setRooms(dto.getRooms() != null ? dto.getRooms() : 1);
        property.setBathrooms(dto.getBathrooms() != null ? dto.getBathrooms() : 1);
        property.setAddress(dto.getAddress());
        property.setCountry(dto.getCountry());

        // Setăm relațiile către noile entități
        property.setAccountCounty(county);
        property.setAccountCity(city);

        // Păstrăm și vechile câmpuri String populate pentru compatibilitatea căutărilor de top
        property.setCounty(county.getName());
        property.setCity(city.getName());

        property.setSiruta(dto.getSiruta());
        property.setLongitude(dto.getLongitude());
        property.setLatitude(dto.getLatitude());

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
            // Extragem orașul fie din relație, fie din vechiul string
            dto.setCity(prop.getAccountCity() != null ? prop.getAccountCity().getName() : prop.getCity());
            dto.setCounty(prop.getAccountCounty() != null ? prop.getAccountCounty().getName() : prop.getCounty());
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
            dto.setCity(property.getAccountCity() != null ? property.getAccountCity().getName() : property.getCity());
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
        dto.setCity(property.getAccountCity() != null ? property.getAccountCity().getName() : property.getCity());
        dto.setCounty(property.getAccountCounty() != null ? property.getAccountCounty().getName() : property.getCounty());
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

    public List<Property> getTopRatedPropertiesByDestination(String destinationName, int limit) {
        Pageable topN = PageRequest.of(0, limit);
        return propertyRepository.findByCityIgnoreCaseOrderByAverageRatingDesc(destinationName, topN);
    }
    @Transactional(readOnly = true)
    public List<PropertyDetailsDTO> getSimilarProperties(Long propertyId) {
        Property currentProperty = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Proprietatea nu a fost găsită"));

        int rooms = currentProperty.getRooms() != null ? currentProperty.getRooms() : 1;
        int guests = currentProperty.getMaxGuests() != null ? currentProperty.getMaxGuests() : 1;

        // Calculăm prețul exact și marja de -100 / +100 RON
        Double exactPrice = currentProperty.getPricePerNight() != null ? currentProperty.getPricePerNight() : 0.0;
        Double relaxedMinPrice = Math.max(0.0, exactPrice - 100.0);
        Double relaxedMaxPrice = exactPrice + 100.0;

        Integer cityId = currentProperty.getAccountCity() != null ? currentProperty.getAccountCity().getId() : null;
        String cityName = currentProperty.getCity();
        PropertyType type = currentProperty.getPropertyType();

        List<Property> results = new ArrayList<>();
        List<Long> excludedIds = new ArrayList<>();
        excludedIds.add(currentProperty.getId());

        // 1. CĂUTAREA 1: Exact în oraș (camere, oaspeți și preț exact)
        List<Property> step1Results = propertyRepository.findExactInSameCity(
                excludedIds, cityId, cityName, type, rooms, guests, exactPrice, exactPrice
        );
        addResultsAndExclude(step1Results, results, excludedIds);

        // 2. CĂUTAREA 2: Dacă nu avem 10, căutăm EXACT (camere/oaspeți) pe o rază de 15 km, dar cu marjă de preț (-100/+100)
        if (results.size() < 10 && currentProperty.getLatitude() != null && currentProperty.getLongitude() != null) {
            int needed = 10 - results.size();
            List<Property> step2Results = propertyRepository.findExactNearby(
                    excludedIds, currentProperty.getLatitude(), currentProperty.getLongitude(),
                    type, rooms, guests, relaxedMinPrice, relaxedMaxPrice, 15.0, needed
            );
            addResultsAndExclude(step2Results, results, excludedIds);
        }

        // 3. CĂUTAREA 3: Dacă tot nu avem 10, aplicăm marja la camere/persoane (+1 până la +3) și marja de preț
        if (results.size() < 10) {
            int maxRoomsWithMargin = rooms + 3;
            int maxGuestsWithMargin = guests + 3;

            // 3a. În oraș cu marjă la camere/oaspeți și preț
            List<Property> step3CityResults = propertyRepository.findRelaxedInSameCity(
                    excludedIds, cityId, cityName, type, rooms, maxRoomsWithMargin, guests, maxGuestsWithMargin,
                    relaxedMinPrice, relaxedMaxPrice
            );
            int needed = 10 - results.size();
            if (step3CityResults.size() > needed) {
                step3CityResults = step3CityResults.subList(0, needed);
            }
            addResultsAndExclude(step3CityResults, results, excludedIds);

            // 3b. În raza de 15 km cu marjă la camere/oaspeți și preț (dacă mai este nevoie)
            if (results.size() < 10 && currentProperty.getLatitude() != null && currentProperty.getLongitude() != null) {
                needed = 10 - results.size();
                List<Property> step3NearbyResults = propertyRepository.findRelaxedNearby(
                        excludedIds, currentProperty.getLatitude(), currentProperty.getLongitude(),
                        type, rooms, maxRoomsWithMargin, guests, maxGuestsWithMargin,
                        relaxedMinPrice, relaxedMaxPrice, 15.0, needed
                );
                addResultsAndExclude(step3NearbyResults, results, excludedIds);
            }
        }

        return results.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void addResultsAndExclude(List<Property> foundList, List<Property> resultsList, List<Long> excludedIds) {
        for (Property p : foundList) {
            resultsList.add(p);
            excludedIds.add(p.getId());
        }
    }

    private PropertyDetailsDTO convertToDTO(Property property) {
        PropertyDetailsDTO dto = new PropertyDetailsDTO();

        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setPropertyType(property.getPropertyType() != null ? property.getPropertyType().name() : null);
        dto.setDescription(property.getDescription());
        dto.setAddress(property.getAddress());
        dto.setCity(property.getAccountCity() != null ? property.getAccountCity().getName() : property.getCity());
        dto.setCounty(property.getAccountCounty() != null ? property.getAccountCounty().getName() : property.getCounty());
        dto.setCountry(property.getCountry());
        dto.setPricePerNight(property.getPricePerNight());
        dto.setMaxGuests(property.getMaxGuests());
        dto.setRooms(property.getRooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setStatus(property.getStatus() != null ? property.getStatus().name() : null);
        dto.setRating(property.getAverageRating());
        if (property.getImages() != null && !property.getImages().isEmpty()) {
            List<ImageDTO> imageDtos = property.getImages().stream()
                    .map(img -> {
                        ImageDTO imgDto = new ImageDTO();
                        imgDto.setId(img.getId());

                        if (img.getImageData() != null) {
                            String base64String = Base64.getEncoder().encodeToString(img.getImageData());
                            imgDto.setBase64Data(base64String);
                        }

                        imgDto.setMainImage(img.isMainImage());
                        return imgDto;
                    })
                    .collect(Collectors.toList());
            dto.setImages(imageDtos);
        }
        return dto;
    }
}