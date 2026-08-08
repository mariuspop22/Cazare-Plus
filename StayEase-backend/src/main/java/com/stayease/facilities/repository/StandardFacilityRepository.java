package com.stayease.facilities.repository;

import com.stayease.facilities.entity.StandardFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StandardFacilityRepository extends JpaRepository<StandardFacility, Long> {

    @Query("SELECT f FROM StandardFacility f JOIN FETCH f.category")
    List<StandardFacility> findAllWithCategory();
}
