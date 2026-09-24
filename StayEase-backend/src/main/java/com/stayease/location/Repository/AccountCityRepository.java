package com.stayease.location.Repository;

import com.stayease.location.entity.AccountCity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

// AM SCHIMBAT AICI: de la Long la Integer
public interface AccountCityRepository extends JpaRepository<AccountCity, Integer> {

    @Query("SELECT c FROM AccountCity c WHERE " +
            "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(c.name), " +
            "'ă', 'a'), 'â', 'a'), 'î', 'i'), 'ș', 's'), 'ş', 's'), 'ț', 't'), 'ţ', 't') " +
            "LIKE CONCAT(:query, '%') " +
            "ORDER BY c.name ASC")
    List<AccountCity> searchWithoutDiacritics(@Param("query") String query, Pageable pageable);

    List<AccountCity> findByCountyIdOrderByNameAsc(Integer countyId);
}