package com.stayease.users.Owner.service;

import com.stayease.users.Owner.entity.Owner;
import com.stayease.users.Owner.repository.OwnerRepository;
import com.stayease.users.Acount.User;
import com.stayease.users.Acount.UserRepository;
import com.stayease.users.Owner.Dto.OwnerProfileResponseDto;
import com.stayease.users.Owner.Dto.OwnerProfileUpdateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class OwnerProfileService {

    private final OwnerRepository ownerRepository;
    private final UserRepository userRepository;

    public OwnerProfileResponseDto getProfile(String email) {
        Owner owner = ownerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        OwnerProfileResponseDto dto = new OwnerProfileResponseDto();
        dto.setFirstName(owner.getFirstName());
        dto.setLastName(owner.getLastName());
        dto.setEmail(owner.getUser().getEmail());
        dto.setTelephoneNumber(owner.getTelephoneNumber());
        dto.setAddress(owner.getAddress());
        dto.setBio(owner.getBio());
        dto.setProfileComplete(owner.isProfileComplete());

        if (owner.getProfilePicture() != null) {
            String base64 = Base64.getEncoder().encodeToString(owner.getProfilePicture());
            dto.setProfilePictureBase64("data:image/jpeg;base64," + base64);
        }

        return dto;
    }

    @Transactional
    public void updateProfile(String currentEmail, OwnerProfileUpdateDto dto) throws Exception {
        Owner owner = ownerRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        if (dto.getFirstName() != null) owner.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) owner.setLastName(dto.getLastName());
        if (dto.getTelephoneNumber() != null) owner.setTelephoneNumber(dto.getTelephoneNumber());
        if (dto.getAddress() != null) owner.setAddress(dto.getAddress());
        if (dto.getBio() != null) owner.setBio(dto.getBio());

        if (dto.getProfilePicture() != null && !dto.getProfilePicture().isEmpty()) {
            owner.setProfilePicture(dto.getProfilePicture().getBytes());
        }

        if (dto.getEmail() != null && !dto.getEmail().equals(currentEmail)) {
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new RuntimeException("Acest email este deja folosit de un alt cont!");
            }
            User user = owner.getUser();
            user.setEmail(dto.getEmail());
            userRepository.save(user);
        }

        ownerRepository.save(owner);
    }
}