package com.stayease.facilities.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "standard_facilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StandardFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private FacilityCategory category;


}
