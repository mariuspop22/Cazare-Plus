package com.stayease.property.repository;

import com.stayease.property.Enums.PropertyType;
import com.stayease.property.entity.Property;
import com.stayease.property.Enums.PropertyStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findTop3ByStatus(PropertyStatus status);

    @EntityGraph(attributePaths = {"images"})
    @Query("SELECT p FROM Property p WHERE p.owner.user.email = :email")
    List<Property> findByOwnerUserEmail(@Param("email") String email);

    @EntityGraph(attributePaths = {
            "images",
            "propertyFacilities",
            "propertyFacilities.category",
            "propertyFacilities.standardFacility"
    })
    Optional<Property> findById(Long id);

    // Singura metodă necesară pentru extragerea topului pe baza câmpului String "city"
    @EntityGraph(attributePaths = {"images"})
    List<Property> findByCityIgnoreCaseOrderByAverageRatingDesc(String city, Pageable pageable);

    @EntityGraph(attributePaths = {"images"})
    @Query("SELECT DISTINCT p FROM Property p LEFT JOIN FETCH p.images " +
            "WHERE (:city IS NULL OR :city = '' OR LOWER(p.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
            "AND (:totalGuests IS NULL OR p.maxGuests >= :totalGuests) " +
            "AND (:rooms IS NULL OR p.rooms >= :rooms) " +
            "AND p.status = 'APPROVED' " +
            "AND (CAST(:checkIn AS date) IS NULL OR CAST(:checkOut AS date) IS NULL OR NOT EXISTS (" +
            "    SELECT up.id FROM UnavailablePeriod up " +
            "    WHERE up.property.id = p.id " +
            "    AND up.startDate < :checkOut " +
            "    AND up.endDate > :checkIn" +
            "))")
    List<Property> searchProperties(
            @Param("city") String city,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("totalGuests") Integer totalGuests,
            @Param("rooms") Integer rooms
    );

    // 1. Căutare EXACTĂ în oraș (locație, camere, persoane + preț)
    @Query("SELECT p FROM Property p WHERE p.id NOT IN :excludedIds " +
            "AND p.status = com.stayease.property.Enums.PropertyStatus.APPROVED " +
            "AND (p.accountCity.id = :cityId OR (p.accountCity IS NULL AND LOWER(p.city) = LOWER(:cityName))) " +
            "AND p.propertyType = :propertyType " +
            "AND p.rooms = :rooms " +
            "AND p.maxGuests = :guests " +
            "AND p.pricePerNight BETWEEN :minPrice AND :maxPrice " +
            "ORDER BY p.averageRating DESC")
    List<Property> findExactInSameCity(
            @Param("excludedIds") List<Long> excludedIds,
            @Param("cityId") Integer cityId,
            @Param("cityName") String cityName,
            @Param("propertyType") PropertyType propertyType,
            @Param("rooms") Integer rooms,
            @Param("guests") Integer guests,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice
    );

    // 2. Căutare EXACTĂ în raza de 15 km (+ marjă preț)
    @Query(value = "SELECT p.*, " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * " +
            "cos(radians(p.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
            "sin(radians(p.latitude)))) AS distance " +
            "FROM properties p " +
            "WHERE p.id NOT IN :excludedIds " +
            "AND p.status = 'APPROVED' " +
            "AND p.property_type = :#{#propertyType.name()} " +
            "AND p.rooms = :rooms " +
            "AND p.max_guests = :guests " +
            "AND p.price_per_night BETWEEN :minPrice AND :maxPrice " +
            "HAVING distance <= :radiusKm " +
            "ORDER BY distance ASC " +
            "LIMIT :limit", nativeQuery = true)
    List<Property> findExactNearby(
            @Param("excludedIds") List<Long> excludedIds,
            @Param("lat") BigDecimal lat,
            @Param("lng") BigDecimal lng,
            @Param("propertyType") PropertyType propertyType,
            @Param("rooms") Integer rooms,
            @Param("guests") Integer guests,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("radiusKm") double radiusKm,
            @Param("limit") int limit
    );

    // 3. Căutare CU MARJĂ (+1...+3 la camere/oaspeți + marjă preț) în oraș
    @Query("SELECT p FROM Property p WHERE p.id NOT IN :excludedIds " +
            "AND p.status = com.stayease.property.Enums.PropertyStatus.APPROVED " +
            "AND (p.accountCity.id = :cityId OR (p.accountCity IS NULL AND LOWER(p.city) = LOWER(:cityName))) " +
            "AND p.propertyType = :propertyType " +
            "AND p.rooms BETWEEN :rooms AND :maxRooms " +
            "AND p.maxGuests BETWEEN :guests AND :maxGuests " +
            "AND p.pricePerNight BETWEEN :minPrice AND :maxPrice " +
            "ORDER BY p.averageRating DESC")
    List<Property> findRelaxedInSameCity(
            @Param("excludedIds") List<Long> excludedIds,
            @Param("cityId") Integer cityId,
            @Param("cityName") String cityName,
            @Param("propertyType") PropertyType propertyType,
            @Param("rooms") Integer rooms,
            @Param("maxRooms") Integer maxRooms,
            @Param("guests") Integer guests,
            @Param("maxGuests") Integer maxGuests,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice
    );

    // 3b. Căutare CU MARJĂ (+1...+3 la camere/oaspeți + marjă preț) în raza de 15 km
    @Query(value = "SELECT p.*, " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * " +
            "cos(radians(p.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
            "sin(radians(p.latitude)))) AS distance " +
            "FROM properties p " +
            "WHERE p.id NOT IN :excludedIds " +
            "AND p.status = 'APPROVED' " +
            "AND p.property_type = :#{#propertyType.name()} " +
            "AND p.rooms BETWEEN :rooms AND :maxRooms " +
            "AND p.max_guests BETWEEN :guests AND :maxGuests " +
            "AND p.price_per_night BETWEEN :minPrice AND :maxPrice " +
            "HAVING distance <= :radiusKm " +
            "ORDER BY distance ASC " +
            "LIMIT :limit", nativeQuery = true)
    List<Property> findRelaxedNearby(
            @Param("excludedIds") List<Long> excludedIds,
            @Param("lat") BigDecimal lat,
            @Param("lng") BigDecimal lng,
            @Param("propertyType") PropertyType propertyType,
            @Param("rooms") Integer rooms,
            @Param("maxRooms") Integer maxRooms,
            @Param("guests") Integer guests,
            @Param("maxGuests") Integer maxGuests,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("radiusKm") double radiusKm,
            @Param("limit") int limit
    );

}