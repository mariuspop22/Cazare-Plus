package com.stayease.seeder;


import com.stayease.property.entity.Property;
import com.stayease.property.repository.PropertyRepository;
import com.stayease.rating.entity.Rating;
import com.stayease.Rating.Repository.RatingRepository;
import com.stayease.Rating.Service.RatingService;
import com.stayease.users.Renter.Renter;
import com.stayease.users.Renter.Repository.RenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final PropertyRepository propertyRepository;
    private final RenterRepository renterRepository;
    private final RatingRepository ratingRepository;
    private final RatingService ratingService;

    @Override
    public void run(String... args) throws Exception {
        if (ratingRepository.count() == 0) {

            Property property = propertyRepository.findById(9L).orElse(null);

            // 3. Găsim câțiva chiriași existenți (Căutăm ID-urile 1L și 2L)
            Renter renter1 = renterRepository.findById(1L).orElse(null);
            Renter renter2 = renterRepository.findById(2L).orElse(null);

            if (property != null && renter1 != null && renter2 != null) {

                Rating rating1 = new Rating();
                rating1.setRenter(renter1);
                rating1.setScore(5);
                ratingService.addRating(property.getId(), rating1);

                Rating rating2 = new Rating();
                rating2.setRenter(renter2);
                rating2.setScore(4);
                ratingService.addRating(property.getId(), rating2);

                System.out.println("✅ Datele de test pentru Rating au fost inserate! Media calculată trebuie să fie 4.5.");
            } else {
                System.out.println("⚠️ Nu am putut adăuga rating-uri. Adaugă manual în baza de date o Proprietate cu id=1 și doi Renters cu id=1 și 2.");
            }
        }
    }
}
