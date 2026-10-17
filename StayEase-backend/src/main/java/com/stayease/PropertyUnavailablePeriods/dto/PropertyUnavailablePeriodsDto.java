package com.stayease.PropertyUnavailablePeriods.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PropertyUnavailablePeriodsDto {
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private String Reason;

}
