package com.stayease.review.Service;

import com.stayease.review.Repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public long getReviewCountByPropertyId(Long propertyId) {
        return reviewRepository.countByPropertyId(propertyId);
    }
}