"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

interface MapProps {
  coordinates: [number, number];
  hotelName: string;
}

const HotelMap: React.FC<MapProps> = ({ coordinates, hotelName }) => {
  return (
    <MapContainer
      center={coordinates}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={coordinates}
        icon={
          new Icon({
            iconUrl: markerIcon.src,
            iconRetinaUrl: markerIcon2x.src,
            shadowUrl: markerShadow.src,
            shadowSize: [41, 41],
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })
        }
      >
        <Popup>{hotelName}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default HotelMap;
