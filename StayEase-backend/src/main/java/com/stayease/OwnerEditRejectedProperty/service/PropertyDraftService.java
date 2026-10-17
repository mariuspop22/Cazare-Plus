package com.stayease.OwnerEditRejectedProperty.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayease.OwnerEditRejectedProperty.entity.OwnerEditRejectedPropertyDraft;
import com.stayease.OwnerEditRejectedProperty.repository.OwnerEditRejectedPropertyDraftRepository;
import com.stayease.PropertyEdit.enums.DraftStatus;
import com.stayease.property.Enums.PropertyStatus;
import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PropertyDraftService {

    private final OwnerEditRejectedPropertyDraftRepository draftRepository;
    private final ObjectMapper objectMapper;
    private final PropertyRepository propertyRepository;
    @Transactional
    public OwnerEditRejectedPropertyDraft saveOrUpdateDraft(Long propertyId, Map<String, Object> payload) {
        try {
            Property mainProperty = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Proprietatea principală nu a fost găsită!"));

            mainProperty.setStatus(PropertyStatus.PENDING);
            String rejectionReason = (String) payload.get("reasonOfRejection");
            String jsonDraftData = objectMapper.writeValueAsString(payload);
            OwnerEditRejectedPropertyDraft draft = draftRepository.findByPropertyId(propertyId)
                    .orElseGet(() -> OwnerEditRejectedPropertyDraft.builder()
                            .propertyId(propertyId)
                            .status(DraftStatus.PENDING)
                            .build());

            draft.setDraftData(jsonDraftData);
            draft.setRejectionReason(rejectionReason);
            draft.setStatus(DraftStatus.PENDING);
            return draftRepository.save(draft);

        } catch (Exception e) {
            throw new RuntimeException("Eroare la salvarea draft-ului: " + e.getMessage(), e);
        }
    }
    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> getDraftDataByPropertyId(Long propertyId) {
        return draftRepository.findByPropertyId(propertyId)
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
    @Transactional
    public void approveAndMergeRejectedProperty(Long propertyId, Map<String, Object> draft) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Proprietatea cu ID-ul " + propertyId + " nu a fost găsită."));



    }
}
