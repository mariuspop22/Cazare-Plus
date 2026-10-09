package com.stayease.PropertyUnavailablePeriods.Repository;

import com.stayease.PropertyUnavailablePeriods.entity.UnavailablePeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnavailablePeriodRepository extends JpaRepository<UnavailablePeriod, Long> {
    List<UnavailablePeriod> findByPropertyId(Long propertyId);
}