package com.stayease.PropertyEdit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayease.PropertyEdit.Repository.PropertyEditDraftRepository;
import com.stayease.PropertyEdit.dtos.PropertyDraftDataDto;
import com.stayease.PropertyEdit.entity.PropertyEditDraft;
import com.stayease.PropertyEdit.enums.DraftStatus;
import com.stayease.property.dto.AdminPendingPropertyResponseDto;
import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.Map;
import java.util.Optional;
@Service
@RequiredArgsConstructor
public class PropertyEditDraftService {

    private final PropertyEditDraftRepository draftRepository;
    private final ObjectMapper objectMapper;
    private final PropertyEditDraftRepository propertyEditDraftRepository;
    private final PropertyRepository propertyRepository;

    @Transactional
    public PropertyEditDraft saveOrUpdateDraft(Long propertyId, Long userId, PropertyDraftDataDto draftData) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(draftData);

            Optional<PropertyEditDraft> existingDraft = draftRepository
                    .findByPropertyIdAndStatus(propertyId, DraftStatus.PENDING);

            PropertyEditDraft draft;

            if (existingDraft.isPresent()) {
                draft = existingDraft.get();
                draft.setDraftData(jsonPayload);
                draft.setUserId(userId);
            } else {
                draft = PropertyEditDraft.builder()
                        .propertyId(propertyId)
                        .userId(userId)
                        .status(DraftStatus.PENDING)
                        .draftData(jsonPayload)
                        .build();
            }

            return draftRepository.save(draft);

        } catch (Exception e) {
            throw new RuntimeException("Eroare la salvarea solicitării de editare: " + e.getMessage(), e);
        }
    }

    public List<AdminPendingPropertyResponseDto> getPendingEdidedProperties() {
        List<AdminPendingPropertyResponseDto> pendingEdidedProperties = new ArrayList<AdminPendingPropertyResponseDto>();
        List<Long> Properties_Ids = propertyEditDraftRepository.findPropertyIdsByStatus(DraftStatus.PENDING);
        for (Long property_id : Properties_Ids) {
            Property property = propertyRepository.findById(property_id)
                    .orElseThrow(() -> new RuntimeException("Proprietatea cu ID-ul " + property_id + " nu a fost găsită"));
            AdminPendingPropertyResponseDto propertydto = new AdminPendingPropertyResponseDto();
            propertydto.setId(property.getId());
            propertydto.setTitle(property.getTitle());
            propertydto.setPropertyType(property.getPropertyType() != null ? property.getPropertyType().name() : null);
            propertydto.setPricePerNight(property.getPricePerNight());
            propertydto.setCity(property.getCity());
            propertydto.setCounty(property.getCounty());
            propertydto.setCountry(property.getCountry());
            propertydto.setStatus(property.getStatus() != null ? property.getStatus().name() : null);

            if (property.getImages() != null && !property.getImages().isEmpty()) {
                byte[] imageBytes = property.getImages().get(0).getImageData();
                if (imageBytes != null) {
                    propertydto.setMainImageBase64(Base64.getEncoder().encodeToString(imageBytes));
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

                propertydto.setOwner(ownerDto);
            }

            pendingEdidedProperties.add(propertydto);
        }

        return pendingEdidedProperties;
    }
    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> getDraftDataByPropertyId(Long propertyId) {
        return propertyEditDraftRepository.findByPropertyId(propertyId)
                .map(draft -> {
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> draftDataMap = objectMapper.readValue(draft.getDraftData(), Map.class);
                        return draftDataMap;
                    } catch (Exception e) {
                        throw new RuntimeException("Eroare la parsarea JSON-ului din draft: " + e.getMessage(), e);
                    }
                });
    }
}
