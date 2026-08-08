package com.stayease.register.services;

import com.stayease.register.dto.RegisterOwnerDto;
import com.stayease.users.Enums.UserStatus;
import com.stayease.users.Acount.User;
import com.stayease.users.Acount.UserRepository;
import com.stayease.users.Owner.Owner;
import com.stayease.users.Owner.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegisterService {

    // Aici aducem cei doi "magazioneri" pentru a-i putea folosi
    private final UserRepository userRepository;
    private final OwnerRepository ownerRepository;

    public void registerNewOwner(RegisterOwnerDto dto) {

        // 1. Pregătim instrumentul care va cripta parola
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        // 2. Creăm un User nou cu datele din DTO (cutia de la frontend)
        User newUser = new User();
        newUser.setEmail(dto.getEmail());
        // Criptăm parola înainte să o punem în User
        newUser.setStatus(UserStatus.ACTIVE);
        newUser.setPasswordHash(passwordEncoder.encode(dto.getPasswordhash()));

        // Îi spunem magazionerului să salveze User-ul
        User savedUser = userRepository.save(newUser);

        // 3. Creăm un Owner nou
        Owner newOwner = new Owner();
        newOwner.setFirstName(dto.getFirstname());
        newOwner.setLastName(dto.getLastname());
        newOwner.setUser(savedUser); // Facem legătura între Owner și User-ul proaspăt salvat

        // Îi spunem celuilalt magazioner să salveze Owner-ul
        ownerRepository.save(newOwner);
    }
}