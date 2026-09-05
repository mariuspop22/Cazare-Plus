package com.stayease.Rating.Service;


import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import com.stayease.rating.entity.Rating;
import com.stayease.Rating.Repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final PropertyRepository propertyRepository;

    public Double getPropertyAverageRating(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Proprietatea cu ID-ul " + propertyId + " nu a fost găsită!"));

        return property.getAverageRating();
    }
    public List<Rating> getAllRatingsForProperty(Long propertyId) {
        return ratingRepository.findByPropertyId(propertyId);
    }

    @Transactional
    public void addRating(Long propertyId, Rating newRating) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Proprietatea nu a fost găsită"));

        newRating.setProperty(property);
        ratingRepository.save(newRating);

        List<Rating> allRatings = ratingRepository.findByPropertyId(propertyId);

        double sum = 0;
        for (Rating r : allRatings) {
            sum += r.getScore();
        }

        double average = allRatings.isEmpty() ? 0.0 : sum / allRatings.size();

        double roundedAverage = Math.round(average * 100.0) / 100.0;

        property.setAverageRating(roundedAverage);
        property.setTotalReviews(allRatings.size());

        propertyRepository.save(property);
    }
}
