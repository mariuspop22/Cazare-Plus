package com.stayease.location.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CountyDTO {
    private Integer id;
    private String name;
    private String code;
}