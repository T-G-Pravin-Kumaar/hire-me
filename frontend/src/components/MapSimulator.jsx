import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapSimulator = ({
  source,
  destination,
  driverHome,
  driverCurrentLocation,
  height = 300
}) => {
  const center = [
    source?.lat || 12.9779,
    source?.lng || 77.5707
  ];

  const route =
    source && destination
      ? [
        [source.lat, source.lng],
        [destination.lat, destination.lng]
      ]
      : [];

  return (
    <div
      style={{
        height: `${height}px`,
        width: "100%",
        overflow: "hidden",
        borderRadius: "12px"
      }}
    >
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {source && (
          <Marker position={[source.lat, source.lng]}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {driverHome && (
          <Marker position={[driverHome.lat, driverHome.lng]}>
            <Popup>Driver Home</Popup>
          </Marker>
        )}

        {driverCurrentLocation && (
          <Marker
            position={[
              driverCurrentLocation.lat,
              driverCurrentLocation.lng
            ]}
          >
            <Popup>Driver Current Location</Popup>
          </Marker>
        )}

        {route.length > 0 && (
          <Polyline positions={route} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapSimulator;