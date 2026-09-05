package com.stayease.users.Owner.Dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class OwnerProfileUpdateDto {
    private String firstName;
    private String lastName;
    private String email;
    private String telephoneNumber;
    private String address;
    private String bio;
    private MultipartFile profilePicture;
}