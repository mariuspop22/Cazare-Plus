package com.stayease.facilities.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.stayease.property.entity.Property;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "property_facilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropertyFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @JsonIgnore
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private FacilityCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "standard_facility_id", nullable = true)
    private StandardFacility standardFacility;

    @Column(name = "custom_name", nullable = true)
    private String customName;
    @Column(name = "custom_category_name")
    private String customCategoryName;
}
