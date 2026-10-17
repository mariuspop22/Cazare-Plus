package com.stayease.review.Controller;

import com.stayease.review.Service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/property/{propertyId}/count")
    public ResponseEntity<Long> getReviewCountForProperty(@PathVariable Long propertyId) {
        long count = reviewService.getReviewCountByPropertyId(propertyId);
        return ResponseEntity.ok(count);
    }
}
