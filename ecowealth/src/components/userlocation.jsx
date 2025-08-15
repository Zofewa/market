import { useState, useEffect } from 'react';

const MalawiLocationInput = ({ onLocationSelect }) => {
  // Sample Malawi locations data (can be expanded)
  const malawiLocations = [
    { type: 'city', name: 'Lilongwe', district: 'Lilongwe' },
    { type: 'city', name: 'Blantyre', district: 'Blantyre' },
    { type: 'city', name: 'Mzuzu', district: 'Mzimba' },
    { type: 'city', name: 'Zomba', district: 'Zomba' },
    { type: 'district', name: 'Balaka', district: 'Balaka' },
    { type: 'district', name: 'Chikwawa', district: 'Chikwawa' },
    { type: 'district', name: 'Chiradzulu', district: 'Chiradzulu' },
    { type: 'district', name: 'Dedza', district: 'Dedza' },
    { type: 'district', name: 'Karonga', district: 'Karonga' },
    { type: 'district', name: 'Mangochi', district: 'Mangochi' },
    { type: 'district', name: 'Mulanje', district: 'Mulanje' },
    { type: 'district', name: 'Nkhata Bay', district: 'Nkhata Bay' },
    { type: 'district', name: 'Nkhotakota', district: 'Nkhotakota' },
    { type: 'district', name: 'Nsanje', district: 'Nsanje' },
    { type: 'district', name: 'Rumphi', district: 'Rumphi' },
    { type: 'district', name: 'Thyolo', district: 'Thyolo' },
  ];

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.length > 1) {
      const filtered = malawiLocations.filter(location =>
        location.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        location.district.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setSelectedLocation(null);
  };

  const handleSuggestionClick = (location) => {
    setInputValue(`${location.name}, ${location.district}`);
    setSelectedLocation(location);
    setShowSuggestions(false);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use OpenStreetMap Nominatim API for reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`
            );
            const data = await response.json();
            
            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village;
              const district = data.address.county || data.address.state;
              
              if (city && district) {
                setInputValue(`${city}, ${district}`);
                setSelectedLocation({
                  name: city,
                  district: district,
                  type: 'city'
                });
                if (onLocationSelect) {
                  onLocationSelect({
                    name: city,
                    district: district,
                    type: 'city',
                    coordinates: {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                    }
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error getting location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="location-input-container">
      <div className="location-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter city or district (e.g., Blantyre)"
          className="location-input"
          onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <button 
          type="button" 
          onClick={handleCurrentLocation}
          className="current-location-btn"
          title="Use my current location"
        >
          📍
        </button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((location, index) => (
            <li 
              key={`${location.name}-${index}`}
              onClick={() => handleSuggestionClick(location)}
              className="suggestion-item"
            >
              <strong>{location.name}</strong> ({location.district} {location.type === 'city' ? 'City' : 'District'})
            </li>
          ))}
        </ul>
      )}
      
      {selectedLocation && (
        <div className="selected-location">
          <small>Selected: {selectedLocation.name}, {selectedLocation.district}</small>
        </div>
      )}
    </div>
  );
};

export default MalawiLocationInput;