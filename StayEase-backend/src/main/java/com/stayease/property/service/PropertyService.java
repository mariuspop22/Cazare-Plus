package com.stayease.property.service;

import com.stayease.property.entity.Property;
import com.stayease.property.entity.PropertyImage;
import com.stayease.property.dto.PropertyResponseDto;
import com.stayease.property.Enums.PropertyStatus;
import com.stayease.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;

    @Transactional(readOnly = true)
    public List<PropertyResponseDto> getFeaturedProperties() {
        // 1. Luăm cele 3 proprietăți aprobate din DB
        List<Property> properties = propertyRepository.findTop3ByStatus(PropertyStatus.APPROVED);

        // 2. Le mapăm (transformăm) în DTO-uri pentru frontend
        return properties.stream().map(property -> {
            PropertyResponseDto dto = new PropertyResponseDto();
            dto.setId(property.getId());
            dto.setTitle(property.getTitle());
            dto.setCity(property.getCity());
            dto.setCounty(property.getCounty());
            dto.setPricePerNight(property.getPricePerNight());
            dto.setDescription(property.getDescription());

            // Căutăm imaginea principală din listă
            String base64Image = property.getImages().stream()
                    .filter(PropertyImage::isMainImage)
                    .findFirst()
                    .map(img -> Base64.getEncoder().encodeToString(img.getImageData()))
                    .orElse(null); // Dacă nu are poză, punem null

            dto.setMainImageBase64(base64Image);
            return dto;
        }).collect(Collectors.toList());
    }
}