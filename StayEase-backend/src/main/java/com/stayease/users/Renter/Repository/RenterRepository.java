package com.stayease.users.Renter.Repository;


import com.stayease.users.Renter.Renter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RenterRepository extends JpaRepository<Renter, Long> {

    // JpaRepository îți oferă automat metode precum:
    // save(), findById(), findAll(), deleteById(), etc.

    // Dacă ai nevoie pe viitor de căutări personalizate, le poți defini aici.
    // Exemplu:
    // Optional<Renter> findByTelephoneNumber(String telephoneNumber);
}
