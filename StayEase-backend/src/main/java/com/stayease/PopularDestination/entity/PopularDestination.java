package com.stayease.PopularDestination.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "popular_destinations")
public class PopularDestination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "image_data", columnDefinition = "bytea")
    private byte[] imageData;
    public PopularDestination() {}

    public PopularDestination(String name, byte[] imageData) {
        this.name = name;
        this.imageData = imageData;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }
}
