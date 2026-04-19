import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: 'var(--radius-lg)'
};

// Dark mode styles for Google Maps
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const HospitalMap = ({ hospitals = [], userLocation, selectedId, onSelect }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY // Fallback - replace with actual key
  });

  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const center = userLocation
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : { lat: 40.7549, lng: -73.9769 }; // default: Midtown Manhattan

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Update map bounds when selectedId changes via props
  React.useEffect(() => {
    if (selectedId) {
        setActiveMarker(selectedId);
        const hospital = hospitals.find(h => h.id === selectedId);
        if(hospital && map) {
            map.panTo({lat: hospital.lat, lng: hospital.lng});
        }
    }
  }, [selectedId, hospitals, map]);


  const getMarkerIcon = (score) => {
    const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ff3b5c';
    return {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#ffffff',
      scale: 1.5,
      anchor: new window.google.maps.Point(12, 24)
    };
  };
  
  const userMarkerIcon = {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: '#3b82f6',
      fillOpacity: 1,
      strokeColor: 'white',
      strokeWeight: 2,
      scale: 8
  };

  if (!isLoaded) return <div className="map-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading Map...</div>;

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: false,
          zoomControl: true,
        }}
      >
        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker 
                position={{ lat: userLocation.lat, lng: userLocation.lng }} 
                icon={userMarkerIcon}
                title="Your Location"
            />
            <Circle 
                center={{ lat: userLocation.lat, lng: userLocation.lng }}
                radius={5000}
                options={{
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.8,
                    strokeWeight: 1
                }}
            />
          </>
        )}

        {/* Hospital Markers */}
        {hospitals.map((h) => (
          <Marker
            key={h.id}
            position={{ lat: h.lat, lng: h.lng }}
            icon={getMarkerIcon(h.aiScore)}
            onClick={() => {
              setActiveMarker(h.id);
              if(onSelect) onSelect(h.id);
            }}
          >
            {activeMarker === h.id && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ minWidth: '180px', color: '#333' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{h.name}</strong>
                  <br />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{h.address}</span>
                  <hr style={{ margin: '6px 0', border: '1px solid #e2e8f0' }} />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px' }}>🏥 ICU: <b>{h.beds?.icu?.available}/{h.beds?.icu?.total}</b></span>
                    <span style={{ fontSize: '11px' }}>🛏 General: <b>{h.beds?.general?.available}</b></span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '11px' }}>
                    📍 {h.distance?.km} km &nbsp;⏱ {h.averageWaitTime} mins
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600 }}
                    >
                      → Get Directions
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
};

export default HospitalMap;
