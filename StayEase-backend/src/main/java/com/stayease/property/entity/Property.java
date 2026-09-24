package com.stayease.property.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.stayease.FavoriteProperties.entity.Favorite;
import com.stayease.facilities.entity.PropertyFacility;
import com.stayease.location.entity.AccountCity;
import com.stayease.location.entity.AccountCounty;
import com.stayease.property.Enums.PropertyStatus;
import com.stayease.property.Enums.PropertyType;
import com.stayease.rating.entity.Rating;
import com.stayease.review.entity.Review;
import com.stayease.users.Owner.entity.Owner;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
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
    @JsonIgnore
    private Owner owner;

    @Enumerated(EnumType.STRING)
    private PropertyType propertyType;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String address;

    // Câmpurile vechi (String) păstrate pentru compatibilitatea căutărilor existente
    private String city;
    private String county;

    // Noile relații (Foreign Keys)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = true)
    private AccountCity accountCity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "county_id", nullable = true)
    private AccountCounty accountCounty;

    private String country;

    private Double pricePerNight;

    private Integer maxGuests;
    private Integer rooms;
    private Integer bathrooms;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PropertyFacility> propertyFacilities;

    @Enumerated(EnumType.STRING)
    private PropertyStatus status;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PropertyImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnavailablePeriod> unavailablePeriods = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Rating> ratings = new ArrayList<>();

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @Column(nullable = false)
    private Long siruta;

    @Column(precision = 18, scale = 16)
    private BigDecimal latitude;

    @Column(precision = 18, scale = 16)
    private BigDecimal longitude;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favoritedBy = new ArrayList<>();
}