package com.stayease.location.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "account_city")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountCity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "county_id", nullable = false)
    private AccountCounty county;

    @Column(nullable = false)
    private Long siruta;

    @Column(nullable = false, precision = 18, scale = 16)
    private BigDecimal longitude;

    @Column(nullable = false, precision = 18, scale = 16)
    private BigDecimal latitude;

    @Column(nullable = false, length = 64)
    private String name;

    @Column(nullable = false, length = 64)
    private String region;
}
