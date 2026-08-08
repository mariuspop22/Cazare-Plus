package com.stayease.register.controller;

import com.stayease.register.dto.RegisterOwnerDto;
import com.stayease.register.services.RegisterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/register")
@CrossOrigin(origins = "*") // La fel ca în PropertyController-ul tău
@RequiredArgsConstructor
public class RegisterController {

    private final RegisterService registerService;

    @PostMapping("/owner")
    public ResponseEntity<String> registerOwner(@RequestBody RegisterOwnerDto dto) {
        try {
            registerService.registerNewOwner(dto);
            return ResponseEntity.ok("Contul de gazdă a fost creat cu succes!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Eroare la crearea contului: " + e.getMessage());
        }
    }
}