package com.stayease.PopularDestination.Controller;

import com.stayease.PopularDestination.Repository.PopularDestinationRepository;
import com.stayease.PopularDestination.entity.PopularDestination;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@CrossOrigin(origins = "*")
public class PopularDestinationController {

    @Autowired
    private PopularDestinationRepository destinationRepository;

    @GetMapping("/popular")
    public List<PopularDestination> getPopularDestinations() {
        return destinationRepository.findAll();
    }
}