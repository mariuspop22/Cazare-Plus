package com.stayease.Rating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponseDto {
    private Long id;
    private Integer score;
    private String comment;
    private LocalDateTime createdAt;

    private Long renterId;
    private String renterFirstName;
    private String renterLastName;
    private String renterProfilePicture;
}

