package com.stayease.location.Repository;

import com.stayease.location.entity.AccountCounty;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccountCountyRepository extends JpaRepository<AccountCounty, Integer> {

    @Query("SELECT c FROM AccountCounty c WHERE " +
            "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(c.name), " +
            "'ă', 'a'), 'â', 'a'), 'î', 'i'), 'ș', 's'), 'ş', 's'), 'ț', 't'), 'ţ', 't') " +
            "LIKE CONCAT(:query, '%') " +
            "ORDER BY c.name ASC")
    List<AccountCounty> searchWithoutDiacritics(@Param("query") String query, Pageable pageable);

    List<AccountCounty> findAllByOrderByNameAsc();
}