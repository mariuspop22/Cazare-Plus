package com.stayease.FavoriteProperties.Service;

import com.stayease.FavoriteProperties.entity.Favorite;
import com.stayease.FavoriteProperties.Repository.FavoriteRepository;
import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import com.stayease.users.Acount.User;
import com.stayease.users.Acount.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    @Transactional
    public boolean toggleFavorite(String userEmail, Long propertyId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Favorite> existingFavorite = favoriteRepository.findByUserIdAndPropertyId(user.getId(), propertyId);

        if (existingFavorite.isPresent()) {
            favoriteRepository.delete(existingFavorite.get());
            return false;
        } else {
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found"));
            Favorite newFavorite = new Favorite(null, user, property, LocalDateTime.now());
            favoriteRepository.save(newFavorite);
            return true;
        }
    }

    public List<Long> getUserFavoritePropertyIds(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(fav -> fav.getProperty().getId())
                .collect(Collectors.toList());
    }
    public boolean isPropertyFavorite(String email, Long propertyId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.existsByUserIdAndPropertyId(user.getId(), propertyId);
    }
}
