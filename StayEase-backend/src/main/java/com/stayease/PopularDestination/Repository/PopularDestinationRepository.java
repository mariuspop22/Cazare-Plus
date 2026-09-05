package com.stayease.PopularDestination.Repository;

import com.stayease.PopularDestination.entity.PopularDestination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PopularDestinationRepository extends JpaRepository<PopularDestination, Long> {
    // JpaRepository ne oferă automat metoda findAll() de care avem nevoie
}
