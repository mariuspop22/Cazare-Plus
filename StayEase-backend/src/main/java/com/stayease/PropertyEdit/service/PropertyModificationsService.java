package com.stayease.PropertyEdit.service;

import com.stayease.facilities.entity.FacilityCategory;
import com.stayease.facilities.entity.PropertyFacility;
import com.stayease.facilities.entity.StandardFacility;
import com.stayease.facilities.repository.FacilityCategoryRepository;
import com.stayease.facilities.repository.PropertyFacilityRepository;
import com.stayease.facilities.repository.StandardFacilityRepository;
import com.stayease.location.Repository.AccountCityRepository;
import com.stayease.location.Repository.AccountCountyRepository;
import com.stayease.location.entity.AccountCity;
import com.stayease.location.entity.AccountCounty;
import com.stayease.property.Enums.PropertyStatus;
import com.stayease.property.Enums.PropertyType;
import com.stayease.property.entity.Property;
import com.stayease.property.entity.PropertyImage;
import com.stayease.property.repository.PropertyImageRepository;
import com.stayease.property.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PropertyModificationsService {
    private final FacilityCategoryRepository facilityCategoryRepository;
    private final StandardFacilityRepository standardFacilityRepository;
    private final PropertyFacilityRepository propertyFacilityRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final PropertyRepository propertyRepository;
private final AccountCityRepository accountCityRepository;
private final AccountCountyRepository accountCountyRepository;


    public PropertyModificationsService(FacilityCategoryRepository facilityCategoryRepository,StandardFacilityRepository standardFacilityRepository,
                                        PropertyFacilityRepository propertyFacilityRepository,PropertyImageRepository propertyImageRepository,
                                        PropertyRepository propertyRepository,AccountCityRepository accountCityRepository,AccountCountyRepository accountCountyRepository){
        this.facilityCategoryRepository=facilityCategoryRepository;
        this.standardFacilityRepository=standardFacilityRepository;
        this.propertyFacilityRepository=propertyFacilityRepository;
        this.propertyImageRepository=propertyImageRepository;
        this.propertyRepository=propertyRepository;
        this.accountCityRepository=accountCityRepository;
        this.accountCountyRepository=accountCountyRepository;
    }


    @Transactional
    public void applyPartialModifications(Property property, Map<String, Object> payload) {
        if (payload.containsKey("title")) property.setTitle((String) payload.get("title"));
        if (payload.containsKey("description")) property.setDescription((String) payload.get("description"));
        if (payload.containsKey("propertyType"))
            property.setPropertyType(PropertyType.valueOf((String) payload.get("propertyType")));

        if (payload.containsKey("pricePerNight"))
            property.setPricePerNight(Double.valueOf(payload.get("pricePerNight").toString()));
        if (payload.containsKey("maxGuests"))
            property.setMaxGuests(Integer.valueOf(payload.get("maxGuests").toString()));
        if (payload.containsKey("rooms")) property.setRooms(Integer.valueOf(payload.get("rooms").toString()));
        if (payload.containsKey("bathrooms"))
            property.setBathrooms(Integer.valueOf(payload.get("bathrooms").toString()));

        if (payload.containsKey("address")) property.setAddress((String) payload.get("address"));
        if (payload.containsKey("city")) {
            String city = (String) payload.get("city");

            AccountCity accountCity = accountCityRepository.findByName(city)
                    .orElseThrow(() -> new RuntimeException("Orașul nu a fost găsit: " + city));

            property.setCity(city);
            property.setAccountCity(accountCity);
            property.setLatitude(accountCity.getLatitude());
            property.setLongitude(accountCity.getLongitude());
            property.setSiruta(accountCity.getSiruta());
        }

        if (payload.containsKey("county") ){  String county=(String) payload.get("county");
            AccountCounty accountCounty= accountCountyRepository.findByName(county)
                            .orElseThrow(() -> new RuntimeException("Judetul nu a fost găsit: " + county));
            property.setCounty((String) payload.get("county"));
            property.setCounty(county);
            property.setAccountCounty(accountCounty);

        }
        if (payload.containsKey("country")) property.setCountry((String) payload.get("country"));

        if (payload.containsKey("newFacilities")) {
            List<Map<String, Object>> newFacilities = (List<Map<String, Object>>) payload.get("newFacilities");

            for (Map<String, Object> facData : newFacilities) {
                PropertyFacility pf = new PropertyFacility();
                pf.setProperty(property);

                String categoryName = (String) facData.get("categoryName");
                String facilityName = (String) facData.get("facility");

                boolean isCustomCategory = (Boolean) facData.getOrDefault("_custom_category", false);
                boolean isCustomFacility = (Boolean) facData.getOrDefault("_custom_facility", false);
                boolean isCustomBoth = (Boolean) facData.getOrDefault("_custom_category_and_custom_facility", false);

                if(isCustomBoth){
                    pf.setCustomCategoryName(categoryName);
                    pf.setCustomName(facilityName);

                }else if(isCustomFacility){
                    FacilityCategory category = facilityCategoryRepository.findByName(categoryName)
                            .orElseThrow(() -> new RuntimeException("Categoria standard nu a fost găsită"));
                    pf.setCategory(category);
                    pf.setCustomName(facilityName);

                }
                else if(!isCustomCategory && !isCustomFacility && !isCustomBoth){
                    FacilityCategory category = facilityCategoryRepository.findByName(categoryName)
                            .orElseThrow(() -> new RuntimeException("Categoria standard nu a fost găsită"));
                    pf.setCategory(category);
                    StandardFacility standardFacility = standardFacilityRepository.findByName(facilityName)
                            .orElseThrow(() -> new RuntimeException("Facilitatea standard nu a fost găsită"));
                    pf.setStandardFacility(standardFacility);
                }

                propertyFacilityRepository.save(pf);
            }
        }
        if (payload.containsKey("newImages")) {
            List<Map<String, Object>> newImages = (List<Map<String, Object>>) payload.get("newImages");
            for (Map<String, Object> imgMap : newImages) {
                PropertyImage newImage = new PropertyImage();
                newImage.setProperty(property);
                String base64String = (String) imgMap.get("base64Data");
                if (base64String != null) {
                    if (base64String.contains(",")) {
                        base64String = base64String.split(",")[1];
                    }

                    byte[] decodedBytes = Base64.getDecoder().decode(base64String);
                    newImage.setImageData(decodedBytes);
                }
                newImage.setMainImage(false);
                propertyImageRepository.save(newImage);
            }
            property.setStatus(PropertyStatus.APPROVED);
            propertyRepository.save(property);
        }

    }
}
