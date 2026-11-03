package com.stayease.PropertyEdit.Repository;


import com.stayease.PropertyEdit.entity.PropertyEditDraft;
import com.stayease.PropertyEdit.enums.DraftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyEditDraftRepository extends JpaRepository<PropertyEditDraft, Long> {

    Optional<PropertyEditDraft> findByPropertyIdAndStatus(Long propertyId, DraftStatus status);

    List<PropertyEditDraft> findByStatusOrderByCreatedAtDesc(DraftStatus status);

    Optional<PropertyEditDraft> findByPropertyId(Long propertyId);

    @Query("SELECT p.propertyId FROM PropertyEditDraft p WHERE p.status = :status")
    List<Long> findPropertyIdsByStatus(@Param("status") DraftStatus status);


    @Query("SELECT p FROM PropertyEditDraft p WHERE p.userId = :userId")
    List<PropertyEditDraft> findPropertiesDraftByUserId(
            @Param("userId") Long user_id
    );

}
