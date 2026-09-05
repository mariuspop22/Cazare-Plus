package com.stayease.users.Owner.controller;

import org.springframework.security.core.Authentication;

import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;
import com.stayease.users.Owner.Dto.OwnerProfileUpdateDto;
import com.stayease.users.Owner.service.OwnerProfileService;

import com.stayease.property.service.PropertyService;
import com.stayease.property.dto.PropertyResponseDto;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/profile")
@RequiredArgsConstructor
public class OwnerProfileController {

    private final OwnerProfileService profileService;

    private final PropertyService propertyService;

    @GetMapping
    public ResponseEntity<OwnerProfileResponseDto> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(profileService.getProfile(email));
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMyProfile(
            @ModelAttribute OwnerProfileUpdateDto dto,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            profileService.updateProfile(email, dto);
            return ResponseEntity.ok("Profil actualizat cu succes!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Eroare: " + e.getMessage());
        }
    }

    @GetMapping("/properties")
    public ResponseEntity<List<PropertyResponseDto>> getMyProperties(Authentication authentication) {
        String email = authentication.getName();
        List<PropertyResponseDto> properties = propertyService.getPropertiesByOwnerEmail(email);
        return ResponseEntity.ok(properties);
    }
}