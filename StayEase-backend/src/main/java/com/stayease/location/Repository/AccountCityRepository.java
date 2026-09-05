package com.stayease.location.Repository;


import com.stayease.location.entity.AccountCity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountCityRepository extends JpaRepository<AccountCity, Integer> {
    List<AccountCity> findTop10ByNameContainingIgnoreCaseOrderByNameAsc(String name);
}
