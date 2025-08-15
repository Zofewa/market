import React, { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";

const MalawiLocationInput = ({ value, onChange, error }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value.location || "");

  // Fetch user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "User-Agent": "YourAppName/1.0 (your.email@example.com)" // Replace with your app name and contact
              }
            }
          )
            .then((response) => response.json())
            .then((data) => {
              if (data && data.display_name) {
                setInputValue(data.display_name);
                onChange({
                  location: data.display_name,
                  coordinates: { lat: latitude, lng: longitude }
                });
              }
            })
            .catch((error) => console.error("Error reverse geocoding:", error));
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation not supported");
    }
  }, [onChange]);

  // Debounced fetch for suggestions
  const fetchSuggestions = useCallback(
    debounce((query) => {
      if (query.length > 2) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            query
          )}&countrycodes=mw&limit=5`,
          {
            headers: {
              "User-Agent": "YourAppName/1.0 (your.email@example.com)" // Replace with your app name and contact
            }
          }
        )
          .then((response) => response.json())
          .then((data) => {
            setSuggestions(data || []);
          })
          .catch((error) => {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
          });
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onChange({ location: value, coordinates: { lat: null, lng: null } });
    fetchSuggestions(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.display_name);
    onChange({
      location: suggestion.display_name,
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon)
      }
    });
    setSuggestions([]);
  };

  // Auto-fetch user location on mount
  const getMyLocation = () =>{
    getUserLocation();
  }

  return (
    <div className="form-group location-input-group">
      <label>Location:</label>
      <button className="getlocate" onClick={getMyLocation}>Use my location</button>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="e.g., Blantyre, Malawi"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
      {error && <span className="error">{error}</span>}
    </div>
  );
};

export default MalawiLocationInput;