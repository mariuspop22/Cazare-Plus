package com.stayease.property.repository;

import com.stayease.property.entity.Property;
import com.stayease.property.Enums.PropertyStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findTop3ByStatus(PropertyStatus status);

    @EntityGraph(attributePaths = {"images"})
    @Query("SELECT p FROM Property p WHERE p.owner.user.email = :email")
    List<Property> findByOwnerUserEmail(@Param("email") String email);

    @EntityGraph(attributePaths = {
            "images",
            "propertyFacilities",
            "propertyFacilities.category",
            "propertyFacilities.standardFacility"
    })
    Optional<Property> findById(Long id);
}