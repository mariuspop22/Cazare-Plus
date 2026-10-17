package com.stayease.property.search.service;


import com.stayease.property.search.dto.PropertySearchRequestDto;
import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertySearchService {

    private final PropertyRepository propertyRepository;

    public List<Property> searchProperties(PropertySearchRequestDto request) {
        String cleanCity = "";

        if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
            cleanCity = removeDiacritics(request.getCity().trim());
        }

        // Apelăm query-ul din Repository
        return propertyRepository.searchProperties(
                cleanCity,
                request.getCheckIn(),
                request.getCheckOut(),
                request.getGuests(),
                request.getRooms()
        );
    }

    private String removeDiacritics(String str) {
        if (str == null) return "";
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").toLowerCase();
    }
}
