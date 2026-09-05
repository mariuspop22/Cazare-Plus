package com.stayease.users.Owner.Dto;

import lombok.Data;

@Data
public class OwnerProfileResponseDto {
    private String firstName;
    private String lastName;
    private String email;
    private String telephoneNumber;
    private String address;
    private String bio;
    private String profilePictureBase64;
    private boolean isProfileComplete;
}