package com.example.KLTN.Service;

import com.example.KLTN.dto.Apireponsi;
import org.springframework.http.ResponseEntity;

public interface GeocodingService {
    ResponseEntity<Apireponsi<GeocodeResult>> geocodeAddress(String address);
    ResponseEntity<Apireponsi<PlaceAutocompleteResult>> getPlaceAutocomplete(String input);
    ResponseEntity<Apireponsi<PlaceDetailsResult>> getPlaceDetails(String placeId);
    
    // Inner classes for response types
    class GeocodeResult {
        private Double lat;
        private Double lng;
        private String formattedAddress;
        private String status;
        private String error;

        public GeocodeResult() {}

        public GeocodeResult(Double lat, Double lng, String formattedAddress, String status) {
            this.lat = lat;
            this.lng = lng;
            this.formattedAddress = formattedAddress;
            this.status = status;
        }

        // Getters and setters
        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
        public String getFormattedAddress() { return formattedAddress; }
        public void setFormattedAddress(String formattedAddress) { this.formattedAddress = formattedAddress; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }

    class PlaceAutocompleteResult {
        private java.util.List<Prediction> predictions;
        private String status;
        private String error;

        public PlaceAutocompleteResult() {}

        // Getters and setters
        public java.util.List<Prediction> getPredictions() { return predictions; }
        public void setPredictions(java.util.List<Prediction> predictions) { this.predictions = predictions; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }

    class Prediction {
        private String placeId;
        private String description;
        private StructuredFormatting structuredFormatting;
        private java.util.List<String> types;

        public Prediction() {}

        // Getters and setters
        public String getPlaceId() { return placeId; }
        public void setPlaceId(String placeId) { this.placeId = placeId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public StructuredFormatting getStructuredFormatting() { return structuredFormatting; }
        public void setStructuredFormatting(StructuredFormatting structuredFormatting) { this.structuredFormatting = structuredFormatting; }
        public java.util.List<String> getTypes() { return types; }
        public void setTypes(java.util.List<String> types) { this.types = types; }
    }

    class StructuredFormatting {
        private String mainText;
        private String secondaryText;

        public StructuredFormatting() {}

        // Getters and setters
        public String getMainText() { return mainText; }
        public void setMainText(String mainText) { this.mainText = mainText; }
        public String getSecondaryText() { return secondaryText; }
        public void setSecondaryText(String secondaryText) { this.secondaryText = secondaryText; }
    }

    class PlaceDetailsResult {
        private String placeId;
        private String formattedAddress;
        private Geometry geometry;
        private java.util.List<AddressComponent> addressComponents;
        private String status;
        private String error;

        public PlaceDetailsResult() {}

        // Getters and setters
        public String getPlaceId() { return placeId; }
        public void setPlaceId(String placeId) { this.placeId = placeId; }
        public String getFormattedAddress() { return formattedAddress; }
        public void setFormattedAddress(String formattedAddress) { this.formattedAddress = formattedAddress; }
        public Geometry getGeometry() { return geometry; }
        public void setGeometry(Geometry geometry) { this.geometry = geometry; }
        public java.util.List<AddressComponent> getAddressComponents() { return addressComponents; }
        public void setAddressComponents(java.util.List<AddressComponent> addressComponents) { this.addressComponents = addressComponents; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }

    class Geometry {
        private Location location;

        public Geometry() {}

        // Getters and setters
        public Location getLocation() { return location; }
        public void setLocation(Location location) { this.location = location; }
    }

    class Location {
        private Double lat;
        private Double lng;

        public Location() {}

        // Getters and setters
        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
    }

    class AddressComponent {
        private String longName;
        private String shortName;
        private java.util.List<String> types;

        public AddressComponent() {}

        // Getters and setters
        public String getLongName() { return longName; }
        public void setLongName(String longName) { this.longName = longName; }
        public String getShortName() { return shortName; }
        public void setShortName(String shortName) { this.shortName = shortName; }
        public java.util.List<String> getTypes() { return types; }
        public void setTypes(java.util.List<String> types) { this.types = types; }
    }
}

