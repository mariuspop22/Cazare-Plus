package com.stayease.PropertyEdit.dtos;

import com.stayease.PropertyEdit.enums.DraftStatus;
import lombok.Data;

@Data
public class EditedPropertyDetailsDto {
    private Long id;
    private String title;
    private String mainImageBase64;
    private String rejection_reason;
    private DraftStatus draftStatus;
}
