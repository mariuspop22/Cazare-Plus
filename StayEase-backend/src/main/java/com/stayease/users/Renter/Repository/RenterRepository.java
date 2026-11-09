package com.stayease.users.Renter.Repository;


import com.stayease.users.Owner.entity.Owner;
import com.stayease.users.Renter.entity.Renter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RenterRepository extends JpaRepository<Renter, Long> {

    Optional<Renter> findByUserId(Long userId);
}
