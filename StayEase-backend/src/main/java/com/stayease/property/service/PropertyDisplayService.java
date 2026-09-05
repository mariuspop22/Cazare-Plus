package com.stayease.property.service;
import com.stayease.facilities.dto.FacilityGroupDTO;
import com.stayease.property.dto.ImageDTO;
import com.stayease.property.dto.PropertyDetailsDTO;
import com.stayease.property.dto.UnavailablePeriodDto;
import com.stayease.property.entity.Property;
import com.stayease.property.entity.UnavailablePeriod;
import com.stayease.property.repository.PropertyRepository;
import com.stayease.property.repository.UnavailablePeriodRepository;
import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PropertyDisplayService {

    @Autowired
    private PropertyRepository propertyRepository;
    @Autowired
    private UnavailablePeriodRepository unavailablePeriodRepository;
    @Transactional(readOnly = true)
    public PropertyDetailsDTO getPropertyDetails(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proprietatea nu a fost găsită!"));

        return mapToDTO(property);
    }

    private PropertyDetailsDTO mapToDTO(Property property) {
        PropertyDetailsDTO dto = new PropertyDetailsDTO();

        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setPropertyType(property.getPropertyType().name());
        dto.setDescription(property.getDescription());
        dto.setAddress(property.getAddress());
        dto.setCity(property.getCity());
        dto.setCounty(property.getCounty());
        dto.setCountry(property.getCountry());
        dto.setPricePerNight(property.getPricePerNight());
        dto.setMaxGuests(property.getMaxGuests());
        dto.setRooms(property.getRooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setStatus(property.getStatus().name());

        List<ImageDTO> imageDTOs = property.getImages().stream().map(img -> {
            ImageDTO imgDto = new ImageDTO();
            imgDto.setId(img.getId());
            imgDto.setMainImage(img.isMainImage());
            if (img.getImageData() != null) {
                String base64 = Base64.getEncoder().encodeToString(img.getImageData());
                imgDto.setBase64Data("data:image/jpeg;base64," + base64);
            }
            return imgDto;
        }).collect(Collectors.toList());
        dto.setImages(imageDTOs);

        if (property.getPropertyFacilities() != null) {

            Map<String, List<String>> groupedFacilities = property.getPropertyFacilities().stream()
                    .collect(Collectors.groupingBy(

                            pf -> {
                                if (pf.getCustomCategoryName() != null && !pf.getCustomCategoryName().trim().isEmpty()) {
                                    return pf.getCustomCategoryName();
                                }

                                return pf.getCategory().getName();
                            },
                            Collectors.mapping(
                                    pf -> {
                                        if (pf.getStandardFacility() != null) {
                                            return pf.getStandardFacility().getName();
                                        }
                                        return pf.getCustomName();
                                    },
                                    Collectors.toList()
                            )
                    ));

            List<FacilityGroupDTO> facilityGroups = groupedFacilities.entrySet().stream()
                    .map(entry -> new FacilityGroupDTO(entry.getKey(), entry.getValue()))
                    .collect(Collectors.toList());

            dto.setFacilities(facilityGroups);
        }


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
        List<UnavailablePeriod> periods = unavailablePeriodRepository.findByPropertyId(property.getId());

        List<UnavailablePeriodDto> periodDtos = periods.stream().map(p -> {
            UnavailablePeriodDto pDto = new UnavailablePeriodDto();
            pDto.setStartDate(p.getStartDate());
            pDto.setEndDate(p.getEndDate());
            return pDto;
        }).toList();

        dto.setUnavailablePeriods(periodDtos);
        return dto;
    }
}