package com.stayease.users.Renter.service;

import com.stayease.users.Renter.Repository.RenterRepository;
import com.stayease.users.Renter.dto.RenterInformationDto;
import com.stayease.users.Renter.entity.Renter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RenterInformationService {

    private final RenterRepository renterRepository;

    public RenterInformationDto getRenterInformation(Long user_id){
        RenterInformationDto renterInformationDto=new RenterInformationDto();
        Renter renter= renterRepository.findByUserId(user_id)
                .orElseThrow(() -> new RuntimeException("Utilizatorul cu ID-ul " + user_id + " nu a fost găsită"));

        renterInformationDto.setEmail(renter.getUser().getEmail());
        renterInformationDto.setLastName(renter.getLastName());
        renterInformationDto.setFirstName(renter.getFirstName());
        renterInformationDto.setTelephoneNumber(renter.getTelephoneNumber());
        renterInformationDto.setUserId(renter.getUser().getId());


        return renterInformationDto;

    }
}
