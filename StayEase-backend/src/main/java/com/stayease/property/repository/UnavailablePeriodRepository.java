package com.stayease.property.repository;

import com.stayease.property.entity.UnavailablePeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnavailablePeriodRepository extends JpaRepository<UnavailablePeriod, Long> {
    List<UnavailablePeriod> findByPropertyId(Long propertyId);
}