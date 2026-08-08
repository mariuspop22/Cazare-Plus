package com.stayease.facilities.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "facility_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FacilityCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}