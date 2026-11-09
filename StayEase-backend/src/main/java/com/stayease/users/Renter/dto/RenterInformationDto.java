package com.stayease.users.Renter.dto;

import lombok.Data;

@Data
public class RenterInformationDto {

    private Long userId;
    private String email;
    private String LastName;
    private String FirstName;
    private String TelephoneNumber;

}
