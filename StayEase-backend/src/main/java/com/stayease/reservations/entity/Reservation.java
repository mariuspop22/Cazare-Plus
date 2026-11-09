package com.stayease.reservations.entity;

import com.stayease.reservations.enums.ReservationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "user_id", nullable = true)
    private Long userId;

    @Column(name = "checkIn",nullable = false)
    private LocalDateTime checkIn;

    @Column(name = "checkOut",nullable = false)
    private LocalDateTime checkOut;

    @Column(name="numberOfGuests")
    private Integer numberOfGuests;

    @Column(name = "total_price", nullable = false)
    private Double  totalPrice;

    @Column(name="renterName",nullable = true)
    private String renterName;

    @Column(name="renterLastName",nullable = true)
    private String renterLastName;

    @Column(name="renterEmail",nullable = true)
    private String renterEmail;

    @Column (name="renterTelephoneNumber",nullable = true)
    private String renterTelephoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReservationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "special_requests", length = 500)
    private String specialRequests;
}
