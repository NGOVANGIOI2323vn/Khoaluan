package com.example.KLTN.Controller.Geocoding;

import com.example.KLTN.Service.GeocodingService;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/geocoding")
@RequiredArgsConstructor
public class GeocodingController {
    
    private final GeocodingService geocodingService;
    
    @PostMapping("/geocode-address")
    public ResponseEntity<Apireponsi<GeocodingService.GeocodeResult>> geocodeAddress(
            @RequestParam String address) {
        return geocodingService.geocodeAddress(address);
    }
    
    @PostMapping("/place-autocomplete")
    public ResponseEntity<Apireponsi<GeocodingService.PlaceAutocompleteResult>> getPlaceAutocomplete(
            @RequestParam String input) {
        return geocodingService.getPlaceAutocomplete(input);
    }
    
    @PostMapping("/place-details")
    public ResponseEntity<Apireponsi<GeocodingService.PlaceDetailsResult>> getPlaceDetails(
            @RequestParam String placeId) {
        return geocodingService.getPlaceDetails(placeId);
    }
}

