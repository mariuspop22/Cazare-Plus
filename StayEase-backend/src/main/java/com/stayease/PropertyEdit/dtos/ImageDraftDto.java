package com.stayease.PropertyEdit.dtos;

import lombok.Data;

@Data
public  class ImageDraftDto {
    private Long id;
    private String base64Data;
    private Boolean mainImage;
    private Boolean isNew;
}
