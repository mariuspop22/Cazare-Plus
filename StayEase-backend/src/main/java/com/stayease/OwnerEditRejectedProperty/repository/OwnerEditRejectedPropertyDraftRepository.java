package com.stayease.OwnerEditRejectedProperty.repository;

import com.stayease.OwnerEditRejectedProperty.entity.OwnerEditRejectedPropertyDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerEditRejectedPropertyDraftRepository extends JpaRepository<OwnerEditRejectedPropertyDraft, Long> {
    Optional<OwnerEditRejectedPropertyDraft> findByPropertyId(Long propertyId);
}
