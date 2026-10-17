package com.stayease.facilities.repository;

import com.stayease.facilities.entity.FacilityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacilityCategoryRepository extends JpaRepository<FacilityCategory, Long> {
    Optional<FacilityCategory> findByName(String name);
}