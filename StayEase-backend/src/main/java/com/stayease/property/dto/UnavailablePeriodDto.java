package com.stayease.property.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class UnavailablePeriodDto {
    private LocalDate startDate;
    private LocalDate endDate;
}