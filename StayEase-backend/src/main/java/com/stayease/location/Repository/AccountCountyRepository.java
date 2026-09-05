package com.stayease.location.Repository;

import com.stayease.location.entity.AccountCounty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountCountyRepository extends JpaRepository<AccountCounty, Integer> {
    List<AccountCounty> findTop5ByNameContainingIgnoreCaseOrderByNameAsc(String name);
}
