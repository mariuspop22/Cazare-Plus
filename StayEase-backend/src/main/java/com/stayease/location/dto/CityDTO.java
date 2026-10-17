package com.stayease.location.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CityDTO {
    private Integer id;
    private String name;
    private Long siruta;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
