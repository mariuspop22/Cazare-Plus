package com.stayease.FavoriteProperties.Controller;

import com.stayease.FavoriteProperties.Service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;


    @PostMapping("/toggle/{propertyId}")
    public ResponseEntity<Boolean> toggleFavorite(@PathVariable Long propertyId, Authentication authentication) {
        String email = authentication.getName();
        boolean isFavorite = favoriteService.toggleFavorite(email, propertyId);
        return ResponseEntity.ok(isFavorite);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Long>> getMyFavorites(Authentication authentication) {
        String email = authentication.getName();
        List<Long> favoriteIds = favoriteService.getUserFavoritePropertyIds(email);
        return ResponseEntity.ok(favoriteIds);
    }
    @GetMapping("/check/{propertyId}")
    public ResponseEntity<Boolean> checkFavorite(@PathVariable Long propertyId, Authentication authentication) {
        String email = authentication.getName();
        boolean isFavorite = favoriteService.isPropertyFavorite(email, propertyId);

        return ResponseEntity.ok(isFavorite);
    }
}
