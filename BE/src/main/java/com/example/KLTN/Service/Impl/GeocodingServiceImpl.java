package com.example.KLTN.Service.Impl;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Service.GeocodingService;
import com.example.KLTN.dto.Apireponsi;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.PlacesApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GeocodingServiceImpl implements GeocodingService {
    
    private final HttpResponseUtil httpResponseUtil;
    
    @Value("${google.maps.api.key:}")
    private String apiKey;
    
    private GeoApiContext getContext() {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("Google Maps API key is not configured");
        }
        return new GeoApiContext.Builder()
                .apiKey(apiKey)
                .build();
    }
    
    @Override
    public ResponseEntity<Apireponsi<GeocodeResult>> geocodeAddress(String address) {
        try {
            GeoApiContext context = getContext();
            GeocodingResult[] results = GeocodingApi.geocode(context, address).await();
            
            if (results != null && results.length > 0) {
                GeocodingResult result = results[0];
                LatLng location = result.geometry.location;
                
                GeocodeResult geocodeResult = new GeocodeResult();
                geocodeResult.setLat(location.lat);
                geocodeResult.setLng(location.lng);
                geocodeResult.setFormattedAddress(result.formattedAddress);
                geocodeResult.setStatus("OK");
                
                return httpResponseUtil.ok("Geocoding success", geocodeResult);
            } else {
                GeocodeResult geocodeResult = new GeocodeResult();
                geocodeResult.setLat(0.0);
                geocodeResult.setLng(0.0);
                geocodeResult.setFormattedAddress("");
                geocodeResult.setStatus("ZERO_RESULTS");
                geocodeResult.setError("No results found for address: " + address);
                
                return httpResponseUtil.ok("No results found", geocodeResult);
            }
        } catch (ApiException | InterruptedException | IOException e) {
            GeocodeResult geocodeResult = new GeocodeResult();
            geocodeResult.setLat(0.0);
            geocodeResult.setLng(0.0);
            geocodeResult.setFormattedAddress("");
            geocodeResult.setStatus("ERROR");
            geocodeResult.setError(e.getMessage());
            
            return httpResponseUtil.ok("Geocoding error: " + e.getMessage(), geocodeResult);
        } catch (Exception e) {
            GeocodeResult geocodeResult = new GeocodeResult();
            geocodeResult.setLat(0.0);
            geocodeResult.setLng(0.0);
            geocodeResult.setFormattedAddress("");
            geocodeResult.setStatus("ERROR");
            geocodeResult.setError(e.getMessage());
            
            return httpResponseUtil.error("Geocoding error: " + e.getMessage(), e);
        }
    }
    
    @Override
    public ResponseEntity<Apireponsi<PlaceAutocompleteResult>> getPlaceAutocomplete(String input) {
        try {
            GeoApiContext context = getContext();
            AutocompletePrediction[] predictions = PlacesApi.placeAutocomplete(context, input, null)
                    .components(ComponentFilter.country("VN"))
                    .await();
            
            PlaceAutocompleteResult result = new PlaceAutocompleteResult();
            List<Prediction> predictionList = new ArrayList<>();
            
            if (predictions != null && predictions.length > 0) {
                for (AutocompletePrediction prediction : predictions) {
                    Prediction pred = new Prediction();
                    pred.setPlaceId(prediction.placeId);
                    pred.setDescription(prediction.description);
                    
                    StructuredFormatting sf = new StructuredFormatting();
                    if (prediction.structuredFormatting != null) {
                        sf.setMainText(prediction.structuredFormatting.mainText);
                        sf.setSecondaryText(prediction.structuredFormatting.secondaryText);
                    }
                    pred.setStructuredFormatting(sf);
                    
                    List<String> types = new ArrayList<>();
                    if (prediction.types != null) {
                        for (String type : prediction.types) {
                            types.add(type);
                        }
                    }
                    pred.setTypes(types);
                    
                    predictionList.add(pred);
                }
                result.setPredictions(predictionList);
                result.setStatus("OK");
            } else {
                result.setPredictions(new ArrayList<>());
                result.setStatus("ZERO_RESULTS");
                result.setError("No predictions found for input: " + input);
            }
            
            return httpResponseUtil.ok("Place autocomplete success", result);
        } catch (ApiException | InterruptedException | IOException e) {
            PlaceAutocompleteResult result = new PlaceAutocompleteResult();
            result.setPredictions(new ArrayList<>());
            result.setStatus("ERROR");
            result.setError(e.getMessage());
            
            return httpResponseUtil.ok("Place autocomplete error: " + e.getMessage(), result);
        } catch (Exception e) {
            PlaceAutocompleteResult result = new PlaceAutocompleteResult();
            result.setPredictions(new ArrayList<>());
            result.setStatus("ERROR");
            result.setError(e.getMessage());
            
            return httpResponseUtil.error("Place autocomplete error: " + e.getMessage(), e);
        }
    }
    
    @Override
    public ResponseEntity<Apireponsi<PlaceDetailsResult>> getPlaceDetails(String placeId) {
        try {
            GeoApiContext context = getContext();
            PlaceDetails placeDetails = PlacesApi.placeDetails(context, placeId).await();
            
            PlaceDetailsResult result = new PlaceDetailsResult();
            result.setPlaceId(placeId);
            result.setFormattedAddress(placeDetails.formattedAddress);
            
            Geometry geometry = new Geometry();
            Location location = new Location();
            if (placeDetails.geometry != null && placeDetails.geometry.location != null) {
                location.setLat(placeDetails.geometry.location.lat);
                location.setLng(placeDetails.geometry.location.lng);
            }
            geometry.setLocation(location);
            result.setGeometry(geometry);
            
            List<AddressComponent> addressComponents = new ArrayList<>();
            if (placeDetails.addressComponents != null) {
                for (com.google.maps.model.AddressComponent ac : placeDetails.addressComponents) {
                    AddressComponent addressComponent = new AddressComponent();
                    addressComponent.setLongName(ac.longName);
                    addressComponent.setShortName(ac.shortName);
                    
                    List<String> types = new ArrayList<>();
                    if (ac.types != null) {
                        for (AddressComponentType type : ac.types) {
                            types.add(type.name());
                        }
                    }
                    addressComponent.setTypes(types);
                    
                    addressComponents.add(addressComponent);
                }
            }
            result.setAddressComponents(addressComponents);
            result.setStatus("OK");
            
            return httpResponseUtil.ok("Place details success", result);
        } catch (ApiException | InterruptedException | IOException e) {
            PlaceDetailsResult result = new PlaceDetailsResult();
            result.setPlaceId(placeId);
            result.setFormattedAddress("");
            result.setGeometry(new Geometry());
            result.getGeometry().setLocation(new Location());
            result.setAddressComponents(new ArrayList<>());
            result.setStatus("ERROR");
            result.setError(e.getMessage());
            
            return httpResponseUtil.ok("Place details error: " + e.getMessage(), result);
        } catch (Exception e) {
            PlaceDetailsResult result = new PlaceDetailsResult();
            result.setPlaceId(placeId);
            result.setFormattedAddress("");
            result.setGeometry(new Geometry());
            result.getGeometry().setLocation(new Location());
            result.setAddressComponents(new ArrayList<>());
            result.setStatus("ERROR");
            result.setError(e.getMessage());
            
            return httpResponseUtil.error("Place details error: " + e.getMessage(), e);
        }
    }
}

