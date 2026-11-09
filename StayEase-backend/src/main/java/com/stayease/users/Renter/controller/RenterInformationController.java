package com.stayease.users.Renter.controller;

import com.stayease.users.Renter.dto.RenterInformationDto;
import com.stayease.users.Renter.service.RenterInformationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/renter")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:8000", "http://localhost:5173"})
public class RenterInformationController {
    private final RenterInformationService renterInformationService;

    @GetMapping("/{id}/information")
    public ResponseEntity<RenterInformationDto> getRenterInformation(@PathVariable Long id) {
        RenterInformationDto renterInformationDto = renterInformationService.getRenterInformation(id);
        return ResponseEntity.ok(renterInformationDto);
    }
}
