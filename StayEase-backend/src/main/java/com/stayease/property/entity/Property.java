package com.stayease.property.entity;


import com.stayease.property.Enums.PropertyStatus;
import com.stayease.property.Enums.PropertyType;
import com.stayease.users.Owner.Owner;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @Enumerated(EnumType.STRING)
    private PropertyType propertyType;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String address;
    private String city;
    private String county;
    private String country;

    private Double pricePerNight;

    private Integer maxGuests;
    private Integer rooms;
    private Integer bathrooms;

    // Facilitățile salvate ca text simplu, conform deciziei tale
    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Enumerated(EnumType.STRING)
    private PropertyStatus status;

    // Legătura cu imaginile salvate în DB
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PropertyImage> images = new ArrayList<>();

    // Legătura cu perioadele blocate (Calendar)
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnavailablePeriod> unavailablePeriods = new ArrayList<>();
}