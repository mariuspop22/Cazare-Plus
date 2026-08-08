package com.stayease.property.repository;

import com.stayease.property.entity.Property;
import com.stayease.property.Enums.PropertyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    // Spring Boot va genera automat un SQL care aduce doar primele 4 proprietăți APPROVED
    List<Property> findTop3ByStatus(PropertyStatus status);
}