import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import VerticalBar from "../components/vertbar";
import User from "../components/user";
import Menu from '../components/menu';
import AppName from '../components/appname';




const highVolumeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const mediumVolumeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447033.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const lowVolumeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447035.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const RouteOptimization = () => {
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [optimalRoute, setOptimalRoute] = useState([]);
  const [userLocation, setUserLocation] = useState(null); // Store user's location
  const [center, setCenter] = useState([-15.787, 35.005]); // Default Blantyre center
  const [zoom] = useState(13);
  const [totalDistance, setTotalDistance] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [locationError, setLocationError] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [materialFilter, setMaterialFilter] = useState("all");
  const [volumeFilter, setVolumeFilter] = useState("all");
  const [viewMap, setVisibility] = useState(false);
  const [loading, setLoading] = useState(true);


  const manageMap = () => {
    setVisibility(!viewMap);
  }

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]); // Center map on user's location
        },
        (error) => {
          setLocationError("Unable to retrieve your location. Using default center.");
          console.error(error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Fetch sellers from backend
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/sellers");
        const data = await res.json();
        setSellers(data);
      } catch (err) {
        setSellers([]);
      }finally{
          setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  // Filtering logic
  const filteredSellers = sellers.filter(seller => {
    const materialMatch =
      materialFilter === "all" ||
      seller.items.some(item => item.toLowerCase() === materialFilter.toLowerCase());
    const volumeMatch =
      volumeFilter === "all" ||
      seller.volume.toLowerCase() === volumeFilter.toLowerCase();
    return materialMatch && volumeMatch;
  });

  // Calculate optimal route using nearest neighbor algorithm
  const calculateOptimalRoute = () => {
    if (!userLocation || selectedSellers.length < 1) {
      setOptimalRoute([]);
      setTotalDistance(0);
      setEstimatedCost(0);
      return;
    }

    // Start from user's location
    const route = [userLocation];
    let remainingSellers = [...selectedSellers];
    let currentLocation = userLocation;
    let distance = 0;

    while (remainingSellers.length > 0) {
      // Find nearest seller
      let nearestIndex = 0;
      let minDistance = calculateDistance(currentLocation, remainingSellers[0].location);
      
      for (let i = 1; i < remainingSellers.length; i++) {
        const dist = calculateDistance(currentLocation, remainingSellers[i].location);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = i;
        }
      }

      // Add to route
      route.push(remainingSellers[nearestIndex].location);
      distance += minDistance;
      currentLocation = remainingSellers[nearestIndex].location;
      remainingSellers.splice(nearestIndex, 1);
    }

    // Return to user's location to complete the route
    distance += calculateDistance(currentLocation, userLocation);
    route.push(userLocation);

    setOptimalRoute(route);
    setTotalDistance(distance);
    setEstimatedCost(distance * 150); // Assuming MK150 per km
  };

  // Haversine distance calculation
  const calculateDistance = (coord1, coord2) => {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toggleSellerSelection = (seller) => {
    setSelectedSellers(prev => 
      prev.some(s => s.id === seller.id) 
        ? prev.filter(s => s.id !== seller.id)
        : [...prev, seller]
    );
  };

  useEffect(() => {
    calculateOptimalRoute();
  }, [selectedSellers, userLocation]);



  if (loading){
    return <div className="loading">
        <div className="container">
            <p className="loader-logo">♻</p>
            <p>Loading <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
        </div>
      </div>
  }

  return (
    <div className="view-container">
      <div className="market">
        <div className="header">
            <div>
                <div className="app-name"><AppName /></div>
                <p><Menu /></p>
            </div>
            <User />
        </div>
        <div className="market-body">
          <VerticalBar />
          <div className="k">
            <h3 className="page-name">Route Optimization</h3>
            {locationError && <p className="error">{locationError}</p>}
            <div className="routes-container">
              <div className="sellers-list-container">
                <h4>Available Sellers</h4>
                <div className="seller-filters">
                  <div className="filter-group">
                    <label>Material Type:</label>
                    <select value={materialFilter} onChange={e => setMaterialFilter(e.target.value)}>
                      <option value="all">All Materials</option>
                      <option value="plastic">Plastic</option>
                      <option value="ewaste">E-Waste</option>
                      <option value="metal">Metal</option>
                      <option value="paper">Paper</option>
                      <option value="glass">Glass</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Volume:</label>
                    <select value={volumeFilter} onChange={e => setVolumeFilter(e.target.value)}>
                      <option value="all">All Volumes</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                
                <div className="seller-cards">
                  {filteredSellers.map(seller => (
                    <div 
                      key={seller.id}
                      className={`seller-card ${selectedSellers.some(s => s.id === seller.id) ? 'selected' : ''}`}
                      onClick={() => toggleSellerSelection(seller)}
                    >
                      <div className="seller-info">
                        <h5>{seller.name}</h5>
                        <p><strong>Materials:</strong> {seller.items.join(", ")}</p>
                        <p><strong>Volume:</strong> {seller.volume}</p>
                        <p><strong>Contact:</strong> {seller.contact}</p>
                      </div>
                      <div className="seller-status">
                        {selectedSellers.some(s => s.id === seller.id) ? (
                          <span className="selected-badge">Selected</span>
                        ) : (
                          <span className="select-hint">Click to select</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="map-route-container">
                {viewMap? (<p className='toggle-map' onClick={manageMap}>Hide Map</p>): (<p className='toggle-map' onClick={manageMap}>View Map</p>)}
                {viewMap && (<div className="map-container">
                  <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} onClick={e => setUserLocation([e.latlng.lat, e.latlng.lng])}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {userLocation && (
                      <Marker 
                        position={userLocation}
                        icon={userLocationIcon}
                      >
                        <Popup>
                          <strong>Your Location</strong>
                        </Popup>
                      </Marker>
                    )}
                    
                    {sellers.map(seller => (
                      <Marker 
                        key={seller.id} 
                        position={seller.location}
                        icon={
                          seller.volume === "High" ? highVolumeIcon :
                          seller.volume === "Medium" ? mediumVolumeIcon : lowVolumeIcon
                        }
                      >
                        <Popup>
                          <strong>{seller.name}</strong><br />
                          Materials: {seller.items.join(", ")}<br />
                          Volume: {seller.volume}<br />
                          Contact: {seller.contact}
                        </Popup>
                      </Marker>
                    ))}
                    
                    {optimalRoute.length > 0 && (
                      <Polyline 
                        positions={optimalRoute} 
                        color="blue"
                        weight={4}
                        dashArray="5, 5"
                      />
                    )}
                  </MapContainer>
                </div>)}
                
                <div className="route-summary">
                  <h4>Optimization Summary</h4>
                  {userLocation && selectedSellers.length > 0 ? (
                    <>
                      <div className="summary-row">
                        <span>Sellers Selected:</span>
                        <span>{selectedSellers.length}</span>
                      </div>
                      <div className="summary-row">
                        <span>Total Distance:</span>
                        <span>{totalDistance.toFixed(1)} km</span>
                      </div>
                      <div className="summary-row">
                        <span>Estimated Cost:</span>
                        <span>MK{estimatedCost.toFixed(0)}</span>
                      </div>
                      <div className="route-sequence">
                        <h5>Optimal Route:</h5>
                        <ol>
                          <li>Start at Your Location</li>
                          {optimalRoute.slice(1, -1).map((_, index) => (
                            <li key={index}>
                              {selectedSellers[index]?.name || 'Unknown Seller'}
                            </li>
                          ))}
                          <li>Return to Your Location</li>
                        </ol>
                      </div>
                    </>
                  ) : (
                    <p className="no-route">
                      {userLocation 
                        ? "Select at least 1 seller to calculate optimal route"
                        : "Waiting for your location..."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimization;