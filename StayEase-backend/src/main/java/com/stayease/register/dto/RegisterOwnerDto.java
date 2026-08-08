package com.stayease.register.dto;

import lombok.Data;

@Data // Adaugă automat Getters, Setters, toString etc. prin Lombok
public class RegisterOwnerDto {
    private String firstname;
    private String lastname;
    private String email;
    private String passwordhash;
}