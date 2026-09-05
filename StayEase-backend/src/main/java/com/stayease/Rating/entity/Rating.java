package com.stayease.rating.entity;

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
@Table(name = "ratings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @JsonIgnore // Previne buclele infinite la serializarea JSON
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    private Renter renter;

    // Nota de la 1 la 5
    @Column(nullable = false)
    private Integer score;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}