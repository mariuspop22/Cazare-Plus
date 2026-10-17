package com.stayease.PropertyUnavailablePeriods.Service;

import com.stayease.PropertyUnavailablePeriods.Repository.UnavailablePeriodRepository;
import com.stayease.PropertyUnavailablePeriods.entity.UnavailablePeriod;
import com.stayease.PropertyUnavailablePeriods.dto.PropertyUnavailablePeriodsDto;
import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PropertyUnavailablePeriodsService {

    private final UnavailablePeriodRepository unavailablePeriodRepository;
    private final PropertyRepository propertyRepository;

    public PropertyUnavailablePeriodsService(UnavailablePeriodRepository unavailablePeriodRepository,
                                             PropertyRepository propertyRepository) {
        this.unavailablePeriodRepository = unavailablePeriodRepository;
        this.propertyRepository = propertyRepository;
    }

    public List<PropertyUnavailablePeriodsDto> getPropertieUnavailablePeriods(Long propertyId) {
        List<PropertyUnavailablePeriodsDto> unavailablePeriodDtoList = new ArrayList<>();
        List<UnavailablePeriod> unavailablePeriods = unavailablePeriodRepository.findByPropertyId(propertyId);

        for (UnavailablePeriod u : unavailablePeriods) {
            PropertyUnavailablePeriodsDto dto = new PropertyUnavailablePeriodsDto();
            dto.setId(u.getId());
            dto.setEndDate(u.getEndDate());
            dto.setStartDate(u.getStartDate());
            dto.setReason(u.getReason());
            unavailablePeriodDtoList.add(dto);
        }

        return unavailablePeriodDtoList;
    }

    @Transactional
    public PropertyUnavailablePeriodsDto addUnavailablePeriod(Long propertyId, PropertyUnavailablePeriodsDto dto) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Proprietatea cu ID-ul " + propertyId + " nu a fost găsită."));

        UnavailablePeriod period = new UnavailablePeriod();
        period.setProperty(property);
        period.setStartDate(dto.getStartDate());
        period.setEndDate(dto.getEndDate());
        period.setReason(dto.getReason() != null ? dto.getReason() : "BLOCKED_BY_OWNER");

        UnavailablePeriod savedPeriod = unavailablePeriodRepository.save(period);

        PropertyUnavailablePeriodsDto resultDto = new PropertyUnavailablePeriodsDto();
        resultDto.setId(savedPeriod.getId());
        resultDto.setStartDate(savedPeriod.getStartDate());
        resultDto.setEndDate(savedPeriod.getEndDate());
        resultDto.setReason(savedPeriod.getReason());

        return resultDto;
    }
}