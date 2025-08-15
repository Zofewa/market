import React, { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import User from "../src/components/user";
import VerticalBar from "../src/components/vertbar";

const Listing = () => {
  // ... existing state declarations ...

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([-15.7861, 35.0058]); // Default to Malawi coordinates
  const [showMap, setShowMap] = useState(false);
  const provider = new OpenStreetMapProvider();

  // Function to fetch location suggestions
  const fetchLocationSuggestions = async (query) => {
    const results = await provider.search({ query });
    setLocationSuggestions(results);
  };

  // Handle location input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newProduct.location.length > 2) {
        fetchLocationSuggestions(newProduct.location);
      } else {
        setLocationSuggestions([]);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [newProduct.location]);

  // Handle location selection
  const handleLocationSelect = (suggestion) => {
    const { x: lng, y: lat, label } = suggestion;
    setSelectedLocation({ lat, lng });
    setMapCenter([lat, lng]);
    
    // Update the form with the selected location
    setNewProduct({
      ...newProduct,
      location: label,
      coordinates: { lat, lng } // Store coordinates for backend
    });
    
    setLocationSuggestions([]);
  };

  // Update the location input field in the form
  const handleLocationChange = (e) => {
    setNewProduct({
      ...newProduct,
      location: e.target.value,
      coordinates: null // Reset coordinates when typing
    });
    setSelectedLocation(null);
  };

  // ... rest of your existing code ...

  // Update the location form group in the add product form
  return (
    <div className="view-container">
      <VerticalBar />
      <div className="market">
        {/* ... existing header and controls ... */}
        
        {showAddForm && (
          <div className="add-product-form">
            <div className="container">
              {/* ... other form groups ... */}
              
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={newProduct.location}
                  onChange={handleLocationChange}
                  onFocus={() => setShowMap(true)}
                />
                {errors.location && <span className="error">{errors.location}</span>}
                
                {/* Location suggestions dropdown */}
                {locationSuggestions.length > 0 && (
                  <ul className="location-suggestions">
                    {locationSuggestions.map((suggestion, index) => (
                      <li 
                        key={index} 
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        {suggestion.label}
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* Map display */}
                {showMap && (
                  <div className="location-map">
                    <button 
                      type="button" 
                      className="close-map"
                      onClick={() => setShowMap(false)}
                    >
                      ×
                    </button>
                    <MapContainer 
                      center={mapCenter} 
                      zoom={13} 
                      style={{ height: '300px', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {selectedLocation && (
                        <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                          <Popup>Selected Location</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                    <p>Click on the map to select a location or search above</p>
                  </div>
                )}
              </div>
              
              {/* ... rest of the form ... */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listing;