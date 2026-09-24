package com.stayease.location.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationSearchResultDto {
    private Integer id;
    private String name;
    private String type;
    private String context;
    private Long siruta;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
