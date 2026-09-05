package com.stayease.review.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.stayease.property.entity.Property;
import com.stayease.users.Renter.Renter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @JsonIgnore
    private Property property;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    private Renter renter;


    @Column(nullable = false)
    private Integer rating;


    @Column(columnDefinition = "TEXT")
    private String comment;


    @CreationTimestamp
    private LocalDateTime createdAt;
}