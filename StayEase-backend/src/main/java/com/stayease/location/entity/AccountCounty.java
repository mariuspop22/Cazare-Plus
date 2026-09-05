package com.stayease.location.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "account_county")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountCounty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 2)
    private String code;

    @Column(nullable = false, length = 64)
    private String name;

    // Relația către orașe. mappedBy trebuie să coincidă cu numele variabilei din clasa AccountCity
    @OneToMany(mappedBy = "county", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccountCity> cities;
}