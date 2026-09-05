package com.stayease.property.dto;


import lombok.Data;

@Data
public class ImageDTO {
    private Long id;
    private String base64Data; // Va conține string-ul gata de pus în 'src'
    private boolean isMainImage;
}
