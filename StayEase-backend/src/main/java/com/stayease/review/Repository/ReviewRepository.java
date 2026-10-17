package com.stayease.review.Repository;

import com.stayease.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    long countByPropertyId(Long propertyId);
}
