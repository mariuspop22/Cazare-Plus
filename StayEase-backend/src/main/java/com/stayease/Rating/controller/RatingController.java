package com.stayease.Rating.controller;


import com.stayease.Rating.dto.RatingResponseDto;
import com.stayease.rating.entity.Rating;
import com.stayease.Rating.Service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    /**
     * Endpoint: GET http://localhost:8080/api/properties/1/average-rating
     * Frontend-ul va apela asta ca să pună "4.99" pe card.
     */
    @GetMapping("/{propertyId}/average-rating")
    public ResponseEntity<?> getAverageRating(@PathVariable Long propertyId) {
        Double average = ratingService.getPropertyAverageRating(propertyId);

        // REZOLVAREA EROLII: Evităm NullPointerException oferind 0.0 ca valoare de rezervă
        return ResponseEntity.ok(Map.of("rating", average != null ? average : 0.0));
    }

    /**
     * Endpoint: GET http://localhost:8080/api/properties/1/ratings
     * Frontend-ul va apela asta dacă vrei să afișezi lista cu cine a dat note.
     */
    @GetMapping("/{propertyId}/ratings")
    public ResponseEntity<List<Rating>> getPropertyRatings(@PathVariable Long propertyId) {
        List<Rating> ratings = ratingService.getAllRatingsForProperty(propertyId);
        return ResponseEntity.ok(ratings);
    }
    /**
     * Endpoint NOU: GET http://localhost:8080/api/properties/1/reviews
     * Returnează review-urile împreună cu datele chiriașilor (nume, prenume, poză profil)
     */
    @GetMapping("/{propertyId}/reviews")
    public ResponseEntity<List<RatingResponseDto>> getPropertyReviews(@PathVariable Long propertyId) {
        List<RatingResponseDto> reviews = ratingService.getReviewsForProperty(propertyId);
        return ResponseEntity.ok(reviews);
    }
}