package com.stayease.property.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "unavailable_periods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UnavailablePeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    private LocalDate startDate;
    private LocalDate endDate;

    // Ex: "RESERVED", "MAINTENANCE", etc.
    private String reason;
}
