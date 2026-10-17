package com.stayease.facilities.repository;
import com.stayease.facilities.entity.PropertyFacility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyFacilityRepository extends JpaRepository<PropertyFacility, Long> {

    List<PropertyFacility> findByPropertyId(Long propertyId);

}