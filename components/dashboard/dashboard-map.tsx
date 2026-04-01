"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  komoditas?: string;
}

interface DashboardMapProps {
  markers: MapMarker[];
  onMarkerClick: (id: string) => void;
}

const customIcon = typeof window !== "undefined"
  ? L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  : undefined;

export default function DashboardMap({ markers, onMarkerClick }: DashboardMapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <MapContainer
      center={[-3.3971, 115.2668]}
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 10 }}
    >
      <TileLayer
        attribution="&copy; OSM"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.latitude, m.longitude]}
          icon={customIcon}
          eventHandlers={{ click: () => onMarkerClick(m.id) }}
        >
          <Popup className="custom-popup">
            <div className="p-1">
              <h3 className="font-bold text-[#0F172A] text-sm">{m.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-1 italic leading-tight">{m.address}</p>
              {m.komoditas && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Komoditas:</span>
                  <p className="text-[10px] font-medium text-[#0F172A]">{m.komoditas}</p>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
